#!/usr/bin/env python3
"""Derive the issue plan from the roadmap page, which is the authority.

The plan used to be a snapshot taken by hand, and a snapshot drifts: the egress-proxy task
added to v0.2.0 when the driver's refusal was decided never reached it, so expanding that
milestone's groups from the copy would have created ninety issues for ninety-one tasks and
said nothing about the ninety-first. Reading the page removes the copy.

Usage: plan_from_roadmap.py [<roadmap/index.html>] > issue_plan.json
"""

import html
import json
import os
import re
import sys

ROADMAP = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "roadmap", "index.html")

# The milestone a section carries, by its anchor. The roadmap numbers them m01 upward.
def release_of(section_id):
    n = int(section_id[1:])
    return f"v0.{n}.0" if n < 10 else "v1.0.0"


def text_of(fragment):
    """The prose of a fragment, with the reference links taken out and entities resolved."""
    t = re.sub(r'<a class="ref".*?</a>|<span class="ref".*?</span>|<span class="tick">[^<]*</span>', "", fragment, flags=re.S)
    t = re.sub(r"<[^>]*>", "", t)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def refs_of(fragment):
    """The sections a task links to, or the word the page uses when it links to none."""
    anchors = re.findall(r'<a class="ref" href="\.\./#([^"]+)">', fragment)
    if anchors:
        return anchors
    if re.search(r'<span class="ref">\s*implied\s*</span>', fragment, re.I):
        return ["implied"]
    return ["implied"]


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else ROADMAP
    s = open(path, encoding="utf-8").read()

    plan = []
    parts = re.split(r'<section id="(m\d+)">', s)[1:]
    for section_id, body in zip(parts[0::2], parts[1::2]):
        release = release_of(section_id)
        # Only the work blocks carry groups; the prose above and the gate below do not.
        work = "".join(re.findall(r'<div class="work">.*?(?=\n\s*<div class="gate">)', body, re.S))
        for group in re.findall(r'<div class="work-group(?: done)?">.*?</ul>', work, re.S):
            head = re.search(r'<h4>(.*?)</h4>\s*<span class="work-repo">(.*?)</span>', group, re.S)
            if not head:
                continue
            title, repos = text_of(head.group(1)), text_of(head.group(2))
            tasks = [{"task": text_of(li), "refs": refs_of(li)}
                     for li in re.findall(r"<li[^>]*>(.*?)</li>", group, re.S)]
            # A group whose label names two repositories is filed in the first of them,
            # which is where its work starts. The label keeps both, because the page is
            # telling a reader where the work lands rather than where the issue lives.
            for repo in [r.strip() for r in repos.split("·")]:
                plan.append({
                    "release": release,
                    "repo": repo,
                    "repos": [r.strip() for r in repos.split("·")],
                    "title": title,
                    "starts_after": int(section_id[1:]) - 1,
                    "tasks": tasks,
                })
                break

    json.dump(plan, sys.stdout, indent=1, ensure_ascii=False)
    sys.stdout.write("\n")
    print(f"{len(plan)} groupes, {sum(len(g['tasks']) for g in plan)} tâches", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
