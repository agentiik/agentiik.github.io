# Changelog

The releases of `agentiik.github.io`.

Every repository of the project carries the same version and is tagged at the same moment, even where nothing changed, so an entry here may say that nothing was built. [Versioning](https://agentiik.github.io/docs#versioning) sets out why, and what a version promises before and after `1.0.0`.

`0.y.z` promises nothing beyond itself: what a release here describes may be gone in the next one.

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
