# Changelog

The releases of `agentiik.github.io`.

Every repository of the project carries the same version and is tagged at the same moment, even where nothing changed, so an entry here may say that nothing was built. [Versioning](https://agentiik.github.io/docs#versioning) sets out why, and what a version promises before and after `1.0.0`.

`0.y.z` promises nothing beyond itself: what a release here describes may be gone in the next one.

## Unreleased

### Documentation

- Install a server shows the `.env` the Compose installation reads, verbatim and checked like `compose.yaml`, and a Behind a reverse proxy section: who holds the certificate, the `.env` line, the Caddy, nginx and Traefik configurations from `agentiik/deploy`, the bus port that is not proxied, and what a remote runner copies and trusts.

## v0.2.1, 2026-09-26

### Documentation

- Statements about the present name the series, `v0.2`, rather than `v0.2.0`, and the roadmap keeps only the console image and the signatures for v0.9.0, since v0.2.1 publishes the api, controller and runner images.
- Guides first: Get started runs its workflow on a server started with Docker Compose, a new Install a server chapter installs, checks, stops, upgrades, backs up and removes a server with Compose on Linux or Homebrew on a Mac, adds a runner on another machine and says what v0.2.1 does not do yet, and Profile A shows the real installation and the images published on ghcr.io.
- A runner of the pool `default` joins claiming no label, `agentiik-api namespace create` and `namespace remove` create and remove a namespace until v0.3.0, and the audit log records `namespace.create` and `namespace.delete`.
- Get started's local run replayed with `agk` `v0.2.1`.

### Site

- A `Copies` workflow fails when a file the documentation shows verbatim, the single-host `compose.yaml` of `agentiik/deploy` first, differs from that file on its repository's main.

## v0.2.0, 2026-09-26

### Documentation

- The runner and the server programs, settled: `agk-runner` with `join`, `serve` and `version`, the host key, rotation, drain and revocation, stops on both channels, digest-only pulls, exit code 121, and a Configuration section listing every `AGK_*` setting.
- As built: `agentiik-api serve`, `bus-init` and `bus-credential`, the join, heartbeat and bus token routes, the secrets tmpfs, and `agk-runner join` with `--labels`, `--user` and `--replace`.
- As built: uploads through one signed POST policy, acknowledgement and requeue under the key, redeeming before acknowledging, `max_requeues`, and `POST /api/v1/runs/{id}/cancel`.
- As built: task networks, `/agk/out` and `/agk/repo`, rotation, the runner image and its helper, run reads, drain and revocation, and `usage`.
- As built: task progress, results, log shipping, pools chosen by labels, taking tasks, log streams, stops and the heartbeat.
- As built: traces, Prometheus metrics, the audit log and `agentiik-api audit-verify`, `agk run --namespace`, `agk status` and `agk logs`, workflow inputs bound by the API, and TLS on every networked channel.
- Secrets are declared on the namespace under `secret:write`, and a workflow only names them.
- How a tree reaches a server before git hosting: `agk push` and one presigned GET per object.
- `POST /api/v1/runner-pools` and `POST /api/v1/runner-pools/{pool}/join-tokens` create a pool and its tokens.
- A task no timeout bounds takes the installation's ceiling, an hour by default.
- The controller reads a step's envelopes to decide, bounded by `envelope_max_bytes`.
- A task key carries the shard's cardinality, and a log is `agk://log/<run>/<task>`.
- All nine task states, in a table of their own.
- Storage says what each purge acts on, counts envelopes like artifacts, and collects an object a grace period after its count reaches zero.
- An artifact with a fetch budget is served through the API rather than redirected to.
- A task's deadline is fixed at dispatch, a requeue left on the queue can run elsewhere, and masking misses a rotated value in a container adopted after a restart.
- A table of what each answer to a redemption leads to, and one list of what a runner does with a task.
- A run is read at `/api/v1/{ns}/runs/{id}`, and a stop reaches a runner on `agentiik.stops`.
- Use cases: a new chapter of six complete workflows, each validating against the workflow schema.
- Get started and the command line table install with `brew install agentiik/tap/agk`, and the server programs with `brew install agentiik/tap/agentiik`, from `v0.2.0`, without `--HEAD`.
- Get started replayed at `v0.2.0`, which runs a workflow on a server as well as locally, with `brew trust agentiik/tap` before either formula; the data pipeline use case runs on a server from `v0.2.0`.
- The recorded sessions on the home page and under the command line re-recorded with `agk` `v0.2.0`, with their transcripts.
- Shorter, with 13 new figures and 31 new tables: the documentation goes from 32,600 to 26,400 words and the roadmap from 20,800 to 17,600.
- The result a runner owes a dispatch across a crash, `AGK_TLS_CERT_FILE` and `AGK_TLS_KEY_FILE` with the terminator's hop as the one plaintext exception, the audit chain verified at each controller term (`audit_verified`), whole numbers read as ints in expressions, a `runner.toml` reference table, and runner-side hooks said to run from v0.9.0.

### Roadmap

- Eleven v0.2.0 tasks, among them the pool's policy at dispatch and at redemption and the heartbeat's `cancel`. The tree cache moves to v0.4.0 and the egress proxy to v0.9.0.
- Tasks for `max_requeues`, the redemption's `422`, reading a run without a namespace, and names of 251 to 255 characters.
- Approvals wait for the wait step in v0.8.0 everywhere, and a secret is read at the redemption.
- The audit and test installation tasks follow what was built.

### Site

- Matomo measures the audience and loads its Tag Manager container on every page, from `mamoto.rslt.fr`, and the legal notice says so.
- A tag no longer triggers a publish. The release sequence is: merge the entry, tag, then run the publish workflow.
- `.github/plan.py` derives the plan from the roadmap page, and `.github/file-tasks.py` files a group's tasks as sub-issues.
- The repositories table and the roadmap marker list `homebrew-tap`, the thirteenth repository.

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
