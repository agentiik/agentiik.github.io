# Agentiik documentation

Everything written about Agentiik lives in this repository. Documents are HTML and
open in a browser without a build step or a server.

| Document | What it is |
| --- | --- |
| [index.html](index.html) | The functional and technical specification: scope, the workflow language, the brick contract, access control, the runtime, security, deployment profiles, MCP, and the repository and licensing layout. |

## Layout

```
index.html             the specification, one file, styles inline
assets/                the images the documents reference
.github/workflows/     the workflow that publishes the site
README.md
```

`assets/` holds the web console mockups, one file per screen and per theme:

| Screen | Light | Dark |
| --- | --- | --- |
| Run list | `console-runs-light.png` | `console-runs-dark.png` |
| Workflow and graph | `console-graph-light.png` | `console-graph-dark.png` |
| Run inspector | `console-inspector-light.png` | `console-inspector-dark.png` |
| Access and sharing | `console-sharing-light.png` | `console-sharing-dark.png` |

## Conventions

- **One HTML file per document.** Styles are inline; images live in `assets/` and are
  referenced relatively, so a picture can be opened, replaced and reviewed on its own
  instead of being buried in the page as base64.
- **Diagrams are inline SVG.** They are drawn with `currentColor` and the page palette,
  which is what lets them follow the reader's theme; an external image file cannot do
  that, so diagrams stay in the document while screenshots stay in `assets/`.
- **Both themes.** Documents follow the reader's system theme, and every screenshot
  exists in a light and a dark version so the page can show the matching one.
- **English.** Documentation and code are written in English throughout.
- **No numbered headings.** Chapters and sections are named, never numbered.

## Publishing

`main` is published to <https://agentiik.github.io/>. This repository is the site:
`.github/workflows/publish.yml` copies the HTML documents and `assets/` into a Pages
artifact and deploys it, with no build step in between, so what the site serves is
exactly what a clone opens. `index.html` is the specification, which makes the
specification the landing page.

Pages has to deploy from GitHub Actions rather than from a branch; the workflow asks for
that itself on its first run.

## Where the rest will come from

The language reference and the API reference are generated from
[`agentiik/schemas`](https://github.com/agentiik/schemas) rather than written here,
so that this repository, the command line and the `workflow.language` MCP tool can
never teach three different languages. When those generators exist, their output
lands here alongside the hand-written documents.
