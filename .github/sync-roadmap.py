#!/usr/bin/env python3
"""Mark the roadmap with what is actually done, read from GitHub.

The roadmap is the plan and GitHub is the record; this makes the plan show the
record without either becoming the other. A task whose issue is closed is struck
through, a group whose issues are all closed is marked, and each milestone gains
a count. Nothing here decides anything: run it again after a merge and the page
tells the truth again.

Idempotent: marks are removed and rewritten from scratch on every run, so the
file never accumulates state.
"""

import html
import json
import re
import subprocess
import sys

ROADMAP = "docs/roadmap/index.html"
REPOS = ["agentiik", "schemas", "bricks", "brick-sdk", "design", "console", "ios",
         "android", "deploy", "terraform-provider-agentiik", "agentiik.github.io", ".github",
         "homebrew-tap"]


def issue_state():
    """Every issue in the organisation, by title, with whether it is closed.

    Refuses to return a partial picture. A token that cannot read one of the
    repositories would otherwise make this script strike nothing through and
    commit that as the truth, which is how the roadmap lost its marks once.
    """
    state = {}
    unreadable = []
    for repo in REPOS:
        r = subprocess.run(
            ["gh", "issue", "list", "--repo", f"agentiik/{repo}", "--state", "all",
             "--limit", "500", "--json", "title,state"],
            capture_output=True, text=True)
        if r.returncode != 0 or not r.stdout.strip():
            unreadable.append(repo)
            continue
        for issue in json.loads(r.stdout):
            state[issue["title"].strip()] = issue["state"] == "CLOSED"

    if unreadable:
        raise SystemExit(
            "refusing to mark anything: cannot read issues in "
            + ", ".join(unreadable)
            + ".\nThe default GITHUB_TOKEN only reaches its own repository, so this needs a"
            " token that can read issues across the organisation."
        )
    if not state:
        raise SystemExit("refusing to mark anything: no issues found in any repository")
    return state


def task_title(task_text):
    """The title expand_group.py gives a task: its first sentence, trimmed.

    A sentence ends at a full stop followed by a space and a capital, which is
    what keeps an ellipsis inside ${{ ... }} from cutting the title in half.
    """
    parts = re.split(r"(?<=[a-z0-9)\]])\. (?=[A-Z])", task_text, maxsplit=1)
    t = parts[0].rstrip(".")
    return t if len(t) <= 110 else t[:107].rsplit(" ", 1)[0] + "..."


def filed_title(task_text):
    """The title file-tasks.py gives a task: the whole task, cut at 103 characters.

    v0.1.0 was filed by expand_group.py and everything since by file-tasks.py, so both kinds
    of title exist and keep existing. A task is matched by either, or a task filed the second
    way is never marked however long ago its issue closed.
    """
    stripped = task_text.rstrip(".")
    if len(stripped) <= 105:
        return stripped
    cut = stripped[:103]
    if not stripped[103:104].isspace() and " " in cut:
        cut = cut[: cut.rfind(" ")]
    return cut.rstrip() + "..."


def strip_marks(s):
    """Remove every mark a previous run left, so this one starts from clean text."""
    s = s.replace('<li class="done">', "<li>")
    s = re.sub(r'\s*<span class="tick">[^<]*</span>', "", s)
    s = re.sub(r'\s*<span class="tally">[^<]*</span>', "", s)
    s = s.replace('<div class="work-group done">', '<div class="work-group">')
    return s


def main():
    closed = issue_state()
    s = strip_marks(open(ROADMAP, encoding="utf-8").read())

    done_total = seen_total = 0
    out = []
    # Walk the file section by section so a milestone can be counted as it ends.
    for chunk in re.split(r'(<section id="m\d+">)', s):
        if not chunk.startswith("<section"):
            out.append(chunk)
            continue
        out.append(chunk)

    s = "".join(out)

    def mark_task(m):
        nonlocal done_total, seen_total
        body = m.group(1)
        text = html.unescape(re.sub(r"<[^>]*>", "", re.sub(r'<a class="ref".*?</a>|<span class="ref".*?</span>', "", body, flags=re.S))).strip()
        text = re.sub(r"\s+", " ", text)
        seen_total += 1
        if closed.get(task_title(text)) or closed.get(filed_title(text)):
            done_total += 1
            return f'<li class="done">{body} <span class="tick">done</span></li>'
        return m.group(0)

    # Only the work blocks carry tasks; the prose uses ul.plain for other things.
    def mark_block(m):
        return re.sub(r"<li>(.*?)</li>", mark_task, m.group(0), flags=re.S)

    s = re.sub(r'<div class="work">.*?(?=\n\s*<div class="gate">)', mark_block, s, flags=re.S)

    # A group whose every task is struck through is itself done.
    def mark_group(m):
        block = m.group(0)
        tasks = re.findall(r"<li( class=\"done\")?>", block)
        if tasks and all(t for t in tasks):
            return block.replace('<div class="work-group">', '<div class="work-group done">', 1)
        return block

    s = re.sub(r'<div class="work-group">.*?</ul>\s*</div>', mark_group, s, flags=re.S)

    # A tally per milestone, beside its heading.
    def mark_milestone(m):
        head, body = m.group(1), m.group(2)
        work = "".join(re.findall(r'<div class="work">.*?(?=\n\s*<div class="gate">)', body, flags=re.S))
        total = len(re.findall(r"<li[ >]", work))
        done = len(re.findall(r'<li class="done">', work))
        if not total:
            return m.group(0)
        word = "done" if done == total else f"of {total} done"
        tally = f'<span class="tally">{done} {word}</span>'
        return head.replace("</h2>", f"</h2>{tally}", 1) + body

    s = re.sub(r'(<div class="sec-head">.*?</h2>)(.*?)(?=<section id="m|<!-- ============ AFTER)',
               mark_milestone, s, flags=re.S)

    open(ROADMAP, "w", encoding="utf-8").write(s)
    print(f"{done_total} of {seen_total} tasks marked done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
