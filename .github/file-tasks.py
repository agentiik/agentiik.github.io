"""Files the tasks of one roadmap group as sub-issues of its group issue.

Starting a group is what turns a paragraph of the plan into issues, and the roadmap says why
it happens then rather than at the start: "the plan changes by rewriting, and rewriting a
paragraph costs nothing while rewriting fifty open issues costs an afternoon". So this runs
once per group, by hand, on the day the group starts.

    python3 .github/file-tasks.py "One decider, and only one at a time" 6 agentiik
    python3 .github/file-tasks.py "One decider, and only one at a time" 6 agentiik --file

Without --file it prints what it would file and writes nothing. The plan comes from plan.py,
which reads the page, so the tasks filed are the tasks the roadmap shows and not a copy of
them taken at some earlier date.

Everything else is the shape the issues already filed carry, read back from GitHub rather
than invented: type Task, the milestone of the release, a body naming the sections that
specify the task, a sub-issue link to the group, and a project row carrying Release, Spec and
Section. A title is the task cut at 103 characters, never mid-word.

It needs a token that can write issues and the organisation project, which the default
GITHUB_TOKEN of a workflow is not, and that is the same reason the roadmap marker runs on
demand: a script that reaches across repositories cannot use a token that reaches one.

Running it twice is safe. A task whose title is already filed is skipped, so a run that
stopped halfway is finished by running it again.
"""

import json
import subprocess
import sys

OWNER = "agentiik"
PROJECT_NUMBER = "1"


def run(args):
    out = subprocess.run(args, capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit(f"{' '.join(args)}\n{out.stderr}")
    return out.stdout.strip()


def graphql(query, numbers=(), **variables):
    """gh sends -f values as strings and an Int! variable refuses one, so a variable that is
    genuinely a number is named rather than guessed at: a single-select option id is eight
    digits and is a String all the same."""
    args = ["gh", "api", "graphql", "-f", f"query={query}"]
    for key, value in variables.items():
        args += ["-F" if key in numbers else "-f", f"{key}={value}"]
    return json.loads(run(args))


def title_of(task):
    """The task, cut at 103 characters and never mid-word, with the trailing full stop
    dropped where the whole thing fits. It is the rule the issues already filed follow."""
    stripped = task.rstrip(".")
    if len(stripped) <= 105:
        return stripped
    cut = stripped[:103]
    if not stripped[103:104].isspace() and " " in cut:
        cut = cut[: cut.rfind(" ")]
    return cut.rstrip() + "..."


def body_of(task, refs, group):
    """A task says what specifies it, because a task with no section behind it means either
    the documentation is missing a page or the task is not needed, and both are worth
    raising rather than guessing."""
    if refs == ["implied"]:
        says = "Implied by the documentation rather than specified in it."
    else:
        links = ", ".join(f"[{r}](https://agentiik.github.io/docs/#{r})" for r in refs)
        says = f"Specified by {links}."
    return f"{task}\n\n{says}\n\nPart of #{group}."


class Project:
    """The organisation project, with its fields looked up rather than written down. An
    identifier pasted into a script is an identifier nobody can check."""

    def __init__(self):
        self.id = json.loads(run([
            "gh", "project", "view", PROJECT_NUMBER, "--owner", OWNER, "--format", "json",
        ]))["id"]
        self.fields = {
            f["name"]: f
            for f in json.loads(run([
                "gh", "project", "field-list", PROJECT_NUMBER, "--owner", OWNER,
                "--format", "json", "--limit", "50",
            ]))["fields"]
        }

    def add(self, content_id):
        return graphql(
            "mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c})"
            "{item{id}}}",
            p=self.id, c=content_id,
        )["data"]["addProjectV2ItemById"]["item"]["id"]

    def set(self, item, name, value):
        field = self.fields.get(name)
        if field is None:
            raise SystemExit(f"the project has no field called {name!r}")
        if field["type"] == "ProjectV2SingleSelectField":
            for option in field["options"]:
                if option["name"] == value:
                    chosen = ["--single-select-option-id", option["id"]]
                    break
            else:
                raise SystemExit(f"the field {name} has no option {value!r}")
        else:
            chosen = ["--text", value]
        run(["gh", "project", "item-edit", "--id", item, "--project-id", self.id,
             "--field-id", field["id"], *chosen])


def issue_type(repo, name):
    """The type identifier of Task, read from the repository rather than pasted in."""
    types = graphql(
        'query{repository(owner:"%s",name:"%s"){issueTypes(first:20){nodes{id name}}}}'
        % (OWNER, repo)
    )["data"]["repository"]["issueTypes"]["nodes"]
    for t in types:
        if t["name"] == name:
            return t["id"]
    raise SystemExit(f"{repo} has no issue type called {name!r}: it has {[t['name'] for t in types]}")


def node_of(repo, number):
    return graphql(
        'query($n:Int!){repository(owner:"%s",name:"%s"){issue(number:$n){id}}}' % (OWNER, repo),
        numbers=("n",), n=str(number),
    )["data"]["repository"]["issue"]["id"]


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    group_title, group_number, repo = sys.argv[1], sys.argv[2], sys.argv[3]
    writing = "--file" in sys.argv

    here = sys.path[0] or "."
    plan = json.loads(run(["python3", f"{here}/plan.py"]))
    groups = [g for g in plan if g["title"] == group_title]
    if len(groups) != 1:
        raise SystemExit(f"the roadmap has {len(groups)} groups called {group_title!r}")
    group = groups[0]

    filed = {
        i["title"]
        for i in json.loads(run([
            "gh", "issue", "list", "--repo", f"{OWNER}/{repo}", "--state", "all",
            "--limit", "500", "--json", "title",
        ]))
    }

    if not writing:
        for i, t in enumerate(group["tasks"], 1):
            mark = "already filed" if title_of(t["task"]) in filed else "would file"
            print(f"{i:2}. [{mark}] {title_of(t['task'])}")
        print(f"\n{len(group['tasks'])} tasks of {group['title']}, release {group['release']},"
              f" into {OWNER}/{repo} under #{group_number}. Add --file to write them.")
        return

    project = Project()
    task_type = issue_type(repo, "Task")
    parent = node_of(repo, group_number)

    for t in group["tasks"]:
        title = title_of(t["task"])
        if title in filed:
            print(f"   already filed: {title}")
            continue

        url = run([
            "gh", "issue", "create", "--repo", f"{OWNER}/{repo}", "--title", title,
            "--body", body_of(t["task"], t["refs"], group_number),
            "--milestone", group["release"],
        ])
        number = url.rsplit("/", 1)[-1]
        node = node_of(repo, number)

        graphql("mutation($i:ID!,$t:ID!){updateIssue(input:{id:$i,issueTypeId:$t})"
                "{issue{number}}}", i=node, t=task_type)
        graphql("mutation($p:ID!,$c:ID!){addSubIssue(input:{issueId:$p,subIssueId:$c})"
                "{issue{number}}}", p=parent, c=node)

        item = project.add(node)
        project.set(item, "Status", "Not started")
        project.set(item, "Release", group["release"])
        project.set(item, "Spec", "Implied" if t["refs"] == ["implied"] else "Specified")
        project.set(item, "Section", ", ".join(t["refs"]))
        print(f"#{number} {title}")


main()
