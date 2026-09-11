#!/usr/bin/env python3
"""Assemble the site for Pages: the working tree, plus one archived copy of the
documentation per released version, plus the list the version selector reads.

There is still no build of any document. Nothing here generates, transforms or
compiles a page: every file is copied as it stands, which is why a clone opens
the same documentation the site serves. What this adds is the versions beside
it, extracted from their tags with `git archive`.

Which version /docs serves is decided here rather than in the browser, so that
the address a reader shares resolves to a page rather than to a redirect:

    the highest stable release      (X.Y.Z, X >= 1, no pre-release)
    else the highest 0.y.z release  (tagged, but promising nothing; see Versioning)
    else the highest rc
    else the highest beta
    else the highest alpha
    else main
"""

import json
import os
import re
import shutil
import subprocess
import sys

SITE = "_site"
DOCS = "docs"

# Order of preference. A channel earlier in this list wins outright: the newest
# alpha never outranks the oldest stable, because the question the default
# answers is "what may a reader rely on", not "what is most recent".
CHANNELS = ["stable", "release", "rc", "beta", "alpha"]

TAG = re.compile(
    r"^v(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)"
    r"(?:-(?P<pre>(?:alpha|beta|rc)(?:\.(?:0|[1-9]\d*))?))?$"
)


def run(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def channel_of(major, pre):
    if not pre:
        return "stable" if major >= 1 else "release"
    return pre.split(".")[0]


def sort_key(v):
    """Semantic Versioning precedence, with a pre-release ranking below its target."""
    pre = v["pre"]
    if not pre:
        return (v["major"], v["minor"], v["patch"], 3, 0)
    name, _, num = pre.partition(".")
    rank = {"alpha": 0, "beta": 1, "rc": 2}[name]
    return (v["major"], v["minor"], v["patch"], rank, int(num or 0))


def discover():
    """Every tag that names a version and carries a docs/ directory."""
    found = []
    for tag in run("git", "tag", "--list", "v*").split():
        m = TAG.match(tag)
        if not m:
            continue
        try:
            run("git", "cat-file", "-e", f"{tag}:{DOCS}")
        except subprocess.CalledProcessError:
            print(f"  {tag}: no {DOCS}/ at this tag, skipped")
            continue
        major = int(m.group("major"))
        pre = m.group("pre")
        found.append({
            "tag": tag,
            "version": tag[1:],
            "major": major,
            "minor": int(m.group("minor")),
            "patch": int(m.group("patch")),
            "pre": pre,
            "channel": channel_of(major, pre),
        })
    return sorted(found, key=sort_key, reverse=True)


def choose_default(versions):
    for channel in CHANNELS:
        for v in versions:
            if v["channel"] == channel:
                return v["version"]
    return "main"


def extract(tag, dest):
    os.makedirs(dest, exist_ok=True)
    archive = subprocess.Popen(
        ["git", "archive", "--format=tar", f"{tag}:{DOCS}"], stdout=subprocess.PIPE
    )
    subprocess.run(["tar", "-x", "-C", dest], stdin=archive.stdout, check=True)
    archive.stdout.close()
    if archive.wait() != 0:
        raise SystemExit(f"git archive failed for {tag}")


def main():
    if os.path.exists(SITE):
        shutil.rmtree(SITE)
    os.makedirs(SITE)

    subprocess.run(
        ["rsync", "-a",
         "--exclude", ".git/", "--exclude", ".DS_Store", "--exclude", ".gitignore",
         "--exclude", ".github/", "--exclude", f"{SITE}/", "--exclude", "README.md",
         "./", f"{SITE}/"],
        check=True,
    )

    versions = discover()
    for v in versions:
        dest = os.path.join(SITE, DOCS, "v", v["version"])
        extract(v["tag"], dest)
        print(f"  {v['version']:<16} {v['channel']:<8} -> /{DOCS}/v/{v['version']}/")

    # main is always reachable under its own name, so a link to it is a link to
    # the current state rather than to whatever happens to be default that week.
    main_dir = os.path.join(SITE, DOCS, "v", "main")
    shutil.copytree(DOCS, main_dir, dirs_exist_ok=True)

    default = choose_default(versions)
    if default != "main":
        target = os.path.join(SITE, DOCS)
        for name in os.listdir(target):
            if name != "v":
                path = os.path.join(target, name)
                shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)
        src = os.path.join(SITE, DOCS, "v", default)
        for name in os.listdir(src):
            s, d = os.path.join(src, name), os.path.join(target, name)
            shutil.copytree(s, d) if os.path.isdir(s) else shutil.copy2(s, d)

    listing = [{"version": v["version"], "channel": v["channel"]} for v in versions]
    listing.append({"version": "main", "channel": "development"})
    with open(os.path.join(SITE, DOCS, "versions.json"), "w") as f:
        json.dump({"default": default, "versions": listing}, f, indent=2)
        f.write("\n")

    print(f"  default          -> {default}")
    print(f"  {len(listing)} version(s) listed")


if __name__ == "__main__":
    sys.exit(main())
