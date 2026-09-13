# Changelog

The releases of `agentiik.github.io`.

Every repository of the project carries the same version and is tagged at the same moment, even where nothing changed, so an entry here may say that nothing was built. [Versioning](https://agentiik.github.io/docs#versioning) sets out why, and what a version promises before and after `1.0.0`.

`0.y.z` promises nothing beyond itself: what a release here describes may be gone in the next one.

## Unreleased

**The plan is derived from the page rather than copied.** `.github/plan.py` reads `docs/roadmap/index.html` and answers with the groups and their tasks, which is what the scripts that file issues read. They used to read a snapshot taken by hand, and a snapshot drifts: the egress-proxy task added to v0.2.0 when the driver's refusal was decided never reached it, so starting that milestone from the copy would have filed ninety issues for ninety-one tasks and said nothing about the ninety-first. Found on the morning v0.2.0 started.

**A tag does not publish the site, and no longer pretends to.** The trigger added in v0.1.2 fires, builds the right site, creates a deployment and is reported as succeeding, and the live site does not change: Pages serves the deployment made from its source branch, which is main. It was tried on v0.1.2 and the CDN served the previous release for half an hour while three green checkmarks said otherwise. The trigger is gone, the reason is written where it was, and the release sequence is named in the conventions instead: merge the entry, tag, then run the publish workflow.

## v0.1.2, 2026-09-13

**Get started.** A chapter at the top of the documentation, covering what you need, installing the command line, starting a workflow repository, validating, running, reading what came out, and adding a second step. Everything in it was run against the release it names before it was written, and the page says so: it is what works today rather than what the rest of the documentation promises, and it grows with the product. It ends with what does not work yet, which at v0.1.1 is the seven verbs that reach a server, `network: egress`, and a secret on a platform with no tmpfs.

**A transcript no longer breaks its own lines.** A pty writes `\r\n`, and the carriage return was travelling inside the span that marks a typed command, so a browser broke the line between every command and its first answer. Both recorded sessions are also asciicast v2 now: asciinema 3 appends an event carrying the recorded command's exit status, which the player's vocabulary does not have.

**The site republishes for a tag.** Only a push to `main` did, so a version tagged after the last commit left `/docs` serving the previous release until something unrelated came along.

**The home page asks for one thing.** A Get started link under the lockup, and the GitHub link moved to the foot of the page beside the legal notice, where a link that is not what the page is for belongs.

## v0.1.1, 2026-09-13

This file, and nothing else.

`v0.1.0` was tagged before its changelog was written, and the fix for that is not to move the tag. Within minutes of the push, `sum.golang.org` had recorded the tagged commit of `agentiik` and `bricks` in a public append-only log and `proxy.golang.org` had cached it, so moving `v0.1.0` would have left `go get` serving the old code for ever and made a direct fetch fail with a checksum mismatch that reads as a supply-chain attack. A tag is a name somebody else pins, and a name that quietly comes to mean something else is worse than a second name.

So `v0.1.0` stays exactly where it is, describing exactly what it shipped, and this release adds the description. Every repository gets it at the same version on the same day, as every release here does. From now on a version's entry is merged before its tag is placed, which is written down in the conventions the documentation fixes.

## v0.1.0, 2026-09-12

The documentation, the roadmap and the site that serves them.

The documentation is the authority on what the product is: the code implements it and does not define it. It covers the whole engine rather than the part that exists, which is why the roadmap sits beside it and says which release fills each gap.

**Versioned publishing.** From this release the site keeps every version rather than only the current one: `/docs` serves the default and `/docs/v/0.1.0` serves this release's documentation, unchanged, for as long as somebody might still be running it. The default is resolved when the site is published rather than in the reader's browser, so an address somebody shares resolves to a page rather than to a redirect. The version selector in the header reads the list the site publishes beside the pages.

**The plan is not versioned with it.** `/docs/roadmap` is the plan as it stands, always. A plan frozen at a release is a page that says the release it published is unfinished and goes on saying it, because the commit a version is tagged on necessarily predates the mark for the task of tagging it. A pinned address still answers: `/docs/v/0.1.0/roadmap` is the plan as it stood at this release.

**A recorded session.** The command-line chapter carries a real recording of `agk validate`, `agk graph` and `agk run --local` against a laptop's Docker daemon, published as text and as an asciinema cast beside it. Every line is what the terminal answered; the only thing drawn is the prompt.
