#!/usr/bin/env python3
"""Check that every file the documentation shows verbatim is the file it names.

A page that copies a file from another repository says so in the comment just
before the copy:

    <!-- Verbatim copy of single-host/compose.yaml in https://github.com/agentiik/deploy, ... -->

and the next <pre><code> block is compared, once its markup is removed and its
entities unescaped, with that file on the repository's main branch (or on the
ref COPY_REF names, to try a branch that is not merged yet). A copy that differs
fails, since the point of showing the file is that a reader can run what CI runs.

Standard library only, and no token: the repositories copied from are public.
"""

import html
import os
import re
import sys
import urllib.request

PAGES = ["docs/index.html"]
REF = os.environ.get("COPY_REF", "main")

COPY = re.compile(
    r"<!-- Verbatim copy of (?P<path>\S+) in https://github\.com/(?P<repo>[\w.-]+/[\w.-]+)\b.*?-->"
    r".*?<pre><code>(?P<body>.*?)</code></pre>",
    re.S,
)


def fetch(repo, path):
    url = f"https://raw.githubusercontent.com/{repo}/{REF}/{path}"
    with urllib.request.urlopen(url, timeout=30) as answer:
        return answer.read().decode()


def main():
    failed = 0
    seen = 0
    for page in PAGES:
        text = open(page, encoding="utf-8").read()
        for copy in COPY.finditer(text):
            seen += 1
            repo, path = copy["repo"], copy["path"]
            shown = html.unescape(re.sub(r"<[^>]+>", "", copy["body"])).rstrip("\n")
            try:
                source = fetch(repo, path).rstrip("\n")
            except Exception as err:  # a copy nothing can be compared with is not a pass
                print(f"{page}: {repo}/{path}@{REF} could not be read: {err}")
                failed += 1
                continue
            if shown == source:
                print(f"{page}: {repo}/{path}@{REF} is the copy shown")
                continue
            failed += 1
            print(f"{page}: the copy of {repo}/{path}@{REF} differs from the file:")
            for number, (a, b) in enumerate(zip(shown.splitlines(), source.splitlines()), 1):
                if a != b:
                    print(f"  line {number}\n    page: {a}\n    file: {b}")
                    break
            else:
                print(f"  the page has {len(shown.splitlines())} lines, the file {len(source.splitlines())}")
    if seen == 0:
        print("no verbatim copy found: the comment that marks one has changed, and nothing was checked")
        return 1
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
