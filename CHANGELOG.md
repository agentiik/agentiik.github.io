# Changelog

The releases of `agentiik.github.io`.

Every repository of the project carries the same version and is tagged at the same moment, even where nothing changed, so an entry here may say that nothing was built. [Versioning](https://agentiik.github.io/docs#versioning) sets out why, and what a version promises before and after `1.0.0`.

`0.y.z` promises nothing beyond itself: what a release here describes may be gone in the next one.

## Unreleased

### Documentation

- The v0.2.5 operator token becomes v0.3.0's bootstrap token, working until the first administrator, made with `agk user create LOGIN --admin`, has enrolled a passkey; enrolment links last an hour.
- Upgrades change `compose.yaml` and `.env` and nothing else, as CI checks.
- The authentication policy's defaults and routes, the API's sign-in page, `agk login`'s loopback exchange, and passkeys unavailable on an IP address.
- Passkeys verified with the standard library and no attestation.
- How a principal is written; logins and namespaces share one name space; `NS/agentiik` holds no grant by default.
- API tokens expire after 90 days by default, a year at most.
- `max_runs_per_hour` counts a sliding hour and answers 429 with `Retry-After`.
- An administrator widening their own access notifies the owners in `GET /api/v1/me`.
- A run refused at creation ends `cancelled`, naming the lapsed grant.
- The v0.3.0 routes for users, groups, service accounts, namespaces, namespace grants, tokens and the policy.
- The identity and access audit actions of v0.3.0.
- A deny names one permission; a grant's scope is `NS` or `NS/workflow`; a token's scope is `{permissions, within}`.
- Quotas are optional, `allowed_runner_pools` sits inside them and refuses an empty list; the Terraform example follows.
- The roadmap's installer writes the bootstrap token to `.env` and prints none.
- `operator` holds `run:read` to follow runs, and `workflow:delete` is `owner`'s alone; the roles table gains a `delete` column and names the permissions of each column.
- `secret:use` is checked at the push, against the pusher, by the version `PUT`, a git push and `workflow.commit` alike: a version naming a secret is refused with 403 without it, and running it takes `workflow:run` alone.
- The access figure and the console's access mock deny `run:read_data` to an `editor`, which holds it, rather than to roles that never did.
- Secret permissions come from namespace grants alone, and a grant or a deny ends at the instant its expiry names.
- Logins and principal names follow the namespace grammar, 255 characters at most; `installation` is refused as a login, and `operator` also marks the bootstrap token's writes.
- Removing a principal removes what it holds, and is refused while a namespace's record names it as owner.
- A namespace's policy applies at sign-in to every account holding a grant in it, and the installation's is stored whole.
- A passkey's kind comes from Backup Eligibility alone, which never changes.
- Enrolment links: their three kinds, what a fresh one revokes, one enrolment-only session each, and a suspended account's still working.
- An installation addressed by IP signs in with passwords without rewriting its stored policy.
- What passkey verification refuses, and a stalled signature counter refusing the sign-in, audited and told to the user, with no lock.
- Removing a workflow or a namespace removes its grants.
- A self-granting administrator notifies the namespace's owner, or every holder of `owner` where there is none; owning a namespace means holding `owner` there.
- Notifications are kept 90 days, or dismissed with `DELETE /api/v1/me/notifications/{id}`.
- `max_concurrent_tasks` and `max_retention_days` default to 20 and 90; the other quotas bound nothing until set.
- A token carries an administrator's powers only where its scope does not narrow them away.
- `DELETE /api/v1/me/credentials/{id}`, and a single read and a delete for users, groups and namespaces.
- Group, membership and service account changes are audited.
- Storage lists the identity tables as migrated: no mail on users, and an AAGUID that may name a model nothing certifies.
- The Relying Party Identifier is the host of the public URL; a domain shared with a console comes with the console.
- The bootstrap token's hash is kept in the database from v0.3.0.
- `max_runs_per_hour` is counted under a lock on the namespace, `Retry-After` gives the seconds until one more run fits, a refused `workflow:` call fails its step, and a 429 is not audited; `agk run` exits 1 for it.
- `allowed_runner_pools` names pools that exist; a step only a pool outside it could take fails at dispatch with 125, and a redemption by such a pool is refused with 422.
- `operator` marks everything the bootstrap token writes, and `installation` what `init` and `agentiik-api namespace` do.
- Administering is `grant:manage` at the installation, through a token with no scope; an administrator may grant in any namespace, its owner told.
- Owning a namespace and holding a grant in one mean an unexpired role grant, own or a group's; a deny alone is no grant and takes no ownership away.
- A token scoped to a workflow does not reach its namespace's routes, and a token that opens nothing is answered one `401` sentence.
- `agentiik-api migrate` keeps the bootstrap token's hash as `init` does, from `AGK_OPERATOR_TOKEN`, and imports a v0.2 hash from `AGK_OPERATOR_TOKEN_FILE` once; the other programs pass that file over.
- Homebrew keeps the bootstrap token in `operator-token.env` and migrates at every start, so an upgrade is `brew upgrade` and a restart.
- An installation built by hand starts with `AGK_OPERATOR_TOKEN=$token agentiik-api migrate`, and a v0.2 one upgrades by running the new `migrate`.
- Upgrading to v0.3.0 starts from v0.2.5's `compose.yaml`.
- `POST /api/v1/namespaces` requires an owner, a user or group given the `owner` role in the same transaction and recorded as `grant.create` beside `namespace.create`; deleting a personal namespace is refused with 409.
- `agk namespace create`, `list`, `show`, `delete` and `quotas`, which reads first and lifts a bound only with `--lift NAME`; a change to a namespace answered with a 5xx exits 4.
- `agentiik-api namespace` creates a namespace with no owner and its built-in identity, removes one as the route does, and records both by `installation`.
- Namespace and quota bodies are held to 64 KiB and 1,024 pools and refuse `null`; `namespace.update` records the quotas as they then stand.
- `POST /api/v1/auth/tokens` answers 403 to a scoped token and to the bootstrap token; the listing is newest first, a scoped token lists and revokes itself alone, and revoking twice answers 204.
- `agk token create`, `list` and `revoke`; `create` prints the token alone on standard output.
- A token's value is `agktoken_` and 43 base64url characters; token bodies are held to 64 KiB and 1,024 permissions or places.
- `api_token.create` and `api_token.revoke` record whose token, its expiry, label and scope, in a service account's namespace.
- `init` creates `AGK_INIT_NAMESPACE` again at every run where it is missing, with no owner.
- `agk console`, the console in a terminal: runs, a run, its graph, workflows, sharing and runners over the web console's routes, as the signed-in principal, with no server and no permission of its own.

## v0.2.5, 2026-09-26

### Documentation

- Every version on the page is v0.2.5's.
- Get started runs a server with the README's five lines, then pushes and runs the chapter's workflow; `compose.yaml`, the services table and the `.env.example` are left to Install a server.
- Install a server follows the deploy README: Start, On a server, Behind a reverse proxy, `compose.yaml` and `.env.example` in full, Change a setting, Upgrade, Back up, Remove, and a runner on another machine.
- `AGENTIIK_OPERATOR_TOKEN` is required in `.env`; the minted token and `docker compose logs init` are gone.
- The state is in `data/` beside `compose.yaml`, or `AGENTIIK_DATA`; backups, removal, Profile A and the object store say so rather than naming `agentiik_*` volumes.
- `AGENTIIK_BUS_PORT` in the requirements and settings; port 8222 is no longer a requirement.

## v0.2.4, 2026-09-26

### Site

- The theme follows the system's alone: the switch and the choice it remembered are gone.

### Documentation

- Every version, output and image tag on the page is v0.2.4's, and both recordings are made again with it.
- The API renews the bus credential in a `bus` volume; an upgrade replaces `compose.yaml`; a `setup` installation is installed anew.
- `agentiik-api health` and the API's health check in the Compose file; a renewed bus credential is taken with no restart.
- Get started and Install a server lead with the one `compose.yaml`, in full, then `docker compose up -d --wait` and `docker compose logs init`, then the optional `.env`; `setup`, `add-runner`, `AGENTIIK_DATA`, `DOCKER_GID` and the generated env files are gone.
- Install a server says what `init` does at every start and what each `.env` setting changes at the next `docker compose up -d`.
- Behind a reverse proxy uses `AGENTIIK_PROXY_URL` and `AGENTIIK_CA`, with the proxy files as they are now.
- Add a runner on another machine shows `runner/compose.yaml` and its `.env.example`, checked like the other copies.
- `agentiik-api init` in the command line and Configuration, with `AGK_PROXY_URL`, `AGK_INIT_DIR`, `AGK_INIT_HOST`, `AGK_INIT_NAMESPACE` and `AGK_OPERATOR_TOKEN`.
- The runner container drops from root on its own, and `serve` joins with `AGK_RUNNER_JOIN_TOKEN` or `AGK_RUNNER_JOIN_TOKEN_FILE`, joining again when its address, labels or namespaces change.
- A task's secrets are on a tmpfs volume of its own: the host tmpfs, `/etc/fstab` line and `secrets_dir` are gone, and masking of a redelivered task says what it now covers.

## v0.2.3, 2026-09-26

### Site

- Redesigned on the design system: Archivo and JetBrains Mono only, its tokens in both themes, a theme switch, the width of the screen for tables, figures and code with prose kept to a measure, the contents as a drawer on a phone and the chapter's sections in the right margin of a wide screen, every table scrolling on its own with an edge that shows it, copy buttons, heading anchors, figures that enlarge, the proxy files as tabs, and the four console mockups redrawn as vector from one markup for both themes.

### Documentation

- Every version, output and image tag on the page is v0.2.3's.

## v0.2.2, 2026-09-26

### Documentation

- Every version, output and image tag on the page is v0.2.2's.
- Install a server shows the `.env` the Compose installation reads, verbatim and checked like `compose.yaml`, and a Behind a reverse proxy section: who holds the certificate, the `.env` line, the Caddy, nginx and Traefik configurations from `agentiik/deploy`, the bus port that is not proxied, and what a remote runner copies and trusts.
- Get started's server workflow keeps a file as an artifact for seven days, `retain: 7d`, and fetches it with `curl`, as the deploy README runs it in CI.

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
