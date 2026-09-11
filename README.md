# Agentiik documentation

Everything written about Agentiik lives in this repository. Documents are HTML and
open in a browser without a build step or a server.

| Document | Served at | What it is |
| --- | --- | --- |
| [index.html](index.html) | `/` | The home page: what Agentiik is, one screen of the console, and the list of documents. |
| [docs/index.html](docs/index.html) | `/docs` | The documentation proper: scope, the workflow language, the brick contract, access control, the runtime, security, deployment profiles, MCP, and the repository and licensing layout. |
| [docs/roadmap/index.html](docs/roadmap/index.html) | `/docs/roadmap` | The order in which the documentation becomes code: ten milestones, each defined by what it makes possible and by the fact that closes it. No dates. |

## Layout

```
index.html             the home page, one file, styles inline
docs/                  the documentation
  index.html           what Agentiik is
  roadmap/index.html   in what order it gets built
legal/                 the legal notice, as legal/index.html
assets/                the images the documents reference
brand/                 square exports of the mark, for avatars and slides
.github/workflows/     the workflow that publishes the site
LICENSE                Apache-2.0, for the code
LICENSES/              the full text of both licences the repository uses
README.md
```

`assets/` holds the web console mockups, one file per screen and per theme:

| Screen | Light | Dark |
| --- | --- | --- |
| Run list | `console-runs-light.png` | `console-runs-dark.png` |
| Workflow and graph | `console-graph-light.png` | `console-graph-dark.png` |
| Run inspector | `console-inspector-light.png` | `console-inspector-dark.png` |
| Access and sharing | `console-sharing-light.png` | `console-sharing-dark.png` |

It also holds `logo.svg`, the mark the console wears: the documents draw it inline in
their header so that it follows the reader's theme, and the file exists so the site has
an icon.

## Conventions

- **One HTML file per document.** Styles are inline; images live in `assets/` and are
  referenced relatively, so a picture can be opened, replaced and reviewed on its own
  instead of being buried in the page as base64.
- **The sidebar is the same in every document of `docs/`.** It carries the list of
  documents first, then the current one broken into parts, then the sections of whichever
  chapter is being read. A document long enough to need a sidebar is long enough to need
  it grouped: a flat list of twenty-six chapters tells a reader where they are and
  nothing about where that is.
- **Diagrams are inline SVG.** They are drawn with `currentColor` and the page palette,
  which is what lets them follow the reader's theme; an external image file cannot do
  that, so diagrams stay in the document while screenshots stay in `assets/`.
- **Both themes.** Documents follow the reader's system theme, and every screenshot
  exists in a light and a dark version so the page can show the matching one.
- **Movement only on the home page, and only a little.** Elements rise into place on
  load and drift within 34 pixels on scroll. It is off under `prefers-reduced-motion`,
  and the hidden state is applied only once scripting has announced itself, so a blocked
  script leaves a readable page rather than an empty one.
- **English.** Documentation and code are written in English throughout.
- **No numbered headings.** Chapters and sections are named, never numbered.

## Publishing

`main` is published to <https://agentiik.github.io/>. This repository is the site:
`.github/workflows/publish.yml` copies the tree into a Pages artifact and deploys it,
with no build step in between, so what the site serves is exactly what a clone opens.
A document's path in the repository is its path on the site, which is why the
documentation sits in `docs/` and is reached at <https://agentiik.github.io/docs>, and
the roadmap at <https://agentiik.github.io/docs/roadmap>; a document added in a
directory of its own needs no change to the workflow.

Pages has to deploy from GitHub Actions rather than from a branch; the workflow asks for
that itself on its first run.

## Where this sits

This is the documentation repository of the `agentiik` organisation. The documentation
calls it the home of the public site and the documentation, and every other repository
keeps only a short README pointing here, so that a reader never has to guess which copy
is current.

| | |
| --- | --- |
| [agentiik](https://github.com/agentiik/agentiik) | The core: graph evaluator, container driver, controller, HTTP API, runner, `agk`. |
| [schemas](https://github.com/agentiik/schemas) | The workflow, brick and envelope schemas, and the OpenAPI document. |
| [bricks](https://github.com/agentiik/bricks) | The standard catalog. |
| [brick-sdk](https://github.com/agentiik/brick-sdk) | Optional helpers for the envelope contract. |
| [design](https://github.com/agentiik/design) | Tokens, icons and the specimen sheet. |
| [console](https://github.com/agentiik/console) | The web console. |
| [ios](https://github.com/agentiik/ios) · [android](https://github.com/agentiik/android) | The mobile applications. |
| [deploy](https://github.com/agentiik/deploy) | Compose stacks, installer, migration notes. |
| [terraform-provider-agentiik](https://github.com/agentiik/terraform-provider-agentiik) | Namespaces, workflow repositories, grants and tokens, as HCL. |
| [.github](https://github.com/agentiik/.github) | Security policy, code of conduct, contribution guide, licensing and trademark notes. |

Those repositories are private until they hold something worth reading.

## Where the rest will come from

The language reference and the API reference are generated from
[`agentiik/schemas`](https://github.com/agentiik/schemas) rather than written here,
so that this repository, the command line and the `workflow.language` MCP tool can
never teach three different languages. When those generators exist, their output
lands here alongside the hand-written documents.

## Licence

Apache-2.0 for code, CC BY 4.0 for the prose, the diagrams and the images — the split
the documentation sets out in
[LICENSING.md](https://github.com/agentiik/.github/blob/main/LICENSING.md). The Agentiik
name and mark are covered by neither; see
[TRADEMARK.md](https://github.com/agentiik/.github/blob/main/TRADEMARK.md).
