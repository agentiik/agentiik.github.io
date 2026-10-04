#!/usr/bin/env python3
"""Test that sync-roadmap.py refuses a partial read of the issues.

The marker's one dangerous failure is a read that is missing issues without
saying so: every task whose issue was left out loses its mark, and the run
commits that as the truth. These tests hand issue_state() a gh that holds a
known number of issues and honours --limit as gh does, newest first, and check
that it reads a repository whole or refuses to answer at all.

Standard library only, and no token: gh is never called. The roadmap workflow
runs this before it marks anything.
"""

import importlib.util
import json
import os
import subprocess
import unittest
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("sync_roadmap", os.path.join(HERE, "sync-roadmap.py"))
sync_roadmap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync_roadmap)


def gh(counts, unreadable=()):
    """A gh holding counts[repo] issues in each repository, one where none is named."""
    def run(args, **_):
        repo = args[args.index("--repo") + 1].split("/", 1)[1]
        if repo in unreadable:
            return subprocess.CompletedProcess(args, 1, "", "HTTP 404: Not Found")
        limit = int(args[args.index("--limit") + 1])
        newest_first = range(counts.get(repo, 1) - 1, -1, -1)
        issues = [{"title": f"{repo} issue {n}", "state": "CLOSED"} for n in newest_first][:limit]
        return subprocess.CompletedProcess(args, 0, json.dumps(issues), "")
    return run


class IssueState(unittest.TestCase):
    def test_a_repository_of_612_issues_is_read_whole(self):
        # agentiik held 612 when a ceiling of 500 left out its oldest, v0.1.0's and v0.2.0's tasks.
        with mock.patch.object(sync_roadmap.subprocess, "run", gh({"agentiik": 612})):
            state = sync_roadmap.issue_state()
        self.assertTrue("agentiik issue 0" in state, "the oldest issue of 612 is missing")

    def test_a_repository_answering_the_limit_is_refused(self):
        with mock.patch.object(sync_roadmap.subprocess, "run", gh({"agentiik": sync_roadmap.LIMIT + 1})):
            with self.assertRaises(SystemExit) as refused:
                sync_roadmap.issue_state()
        self.assertIn("agentiik", str(refused.exception))

    def test_an_unreadable_repository_is_refused(self):
        with mock.patch.object(sync_roadmap.subprocess, "run", gh({}, unreadable={"schemas"})):
            with self.assertRaises(SystemExit) as refused:
                sync_roadmap.issue_state()
        self.assertIn("schemas", str(refused.exception))


if __name__ == "__main__":
    unittest.main()
