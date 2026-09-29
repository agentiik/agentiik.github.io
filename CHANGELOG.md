# Changelog

The releases of `agentiik.github.io`.

Every repository of the project carries the same version and is tagged at the same moment, even where nothing changed, so an entry here may say that nothing was built. [Versioning](https://agentiik.github.io/docs#versioning) sets out why, and what a version promises before and after `1.0.0`.

`0.y.z` promises nothing beyond itself: what a release here describes may be gone in the next one.

## Unreleased

### Documentation

- Get started offers the installer in one command beside Homebrew and `go install`.
- A fetch negotiates with `multi_ack_detailed`, every common commit answered `ACK <id> common`, since git's client over HTTP keeps no state but the commits it was told are common, and without it a fetch of a history longer than sixteen commits failed; a client not asking for it gets git's single `ACK`.
- A fetch may want any commit or tag a ref reaches, as git's own `upload-pack` serves over HTTP, so that a fetch racing a push is not refused; an object no ref reaches is still `not our ref`.
- A POST to `git-upload-pack` or `git-receive-pack` of another type than the one git sends is refused with 415, as git's `http-backend` refuses it, since neither type may be sent cross-site without a preflight and a browser that cached a token as Basic's password cannot be made to fetch or push.
- A push is refused whole, `missing necessary objects`, where a new tip or any object its pack holds, reached or not, names an object held neither in the pack nor in the repository, which keeps every object the repository holds naming only objects it holds.
- A commit that is a version already is not judged again, `secret:use` included, but its tree is compared with the one recorded, and one a tree push recorded with other files is refused; pushing a version to another ref now costs reading its tree.
- A ref named past 1,024 bytes is answered 400 as a push's commands are read, before anything is recorded.
- The validation reads at most 16 MiB out of a tree, every file it reads together, refusing a file that says it is larger before reading it, and a walk of a commit's tree visits at most 65,536 paths, since git lets one tree name another any number of times; a version a git push makes holds at most 4,096 files, as a tree push's does, and the interim push's decision no longer says git hosting lifts that bound.
- Once a push's refs have moved it is answered as accepted, and what is left to write is written whatever becomes of the request, a failure there being the operator's and not the pusher's.
- The version route refuses with 409 a commit that is not a version yet once a git push has given the repository a branch or a tag, asked before anything is written and again under the repository's lock, since a tree pushed then would be a version no ref reaches and no clone holds; `workflow_versions` and What a push does say so.
- Sizing gives the API's scratch disk: each git push being received spools the pack as sent, at most 2 GiB, and the pack it is rewritten to, at most 8 GiB, under `TMPDIR`, `/var/lib/agentiik/tmp` in the API image, about 10 GiB a push in the container's writable layer unless a volume is mounted there, since the pack is read back at offsets and a thin pack's deltas are resolved against the repository.
- The route table describes git's smart HTTP as served: its three routes, protocol version 0 whatever a client asks for, an API token as the password of HTTP Basic or as a bearer token and never a session, 401 asking for Basic so that git asks its credential helper, 404 for a repository that does not exist or cannot be read, 403 for a reader's push, and what is not served: the dumb protocol, shallow and partial clones, push certificates, push options and `report-status-v2`.
- A push holds each ref to its pusher: creating or fast-forwarding a branch and creating a tag take `workflow:write`; a forced push, a branch moved to a commit that is not ahead of where it was or a tag moved, any deletion and any push to the protected default branch, its first included, take `grant:manage`. A git push never creates a repository.
- What a push does sets out its steps in order, with what git prints when the hook refuses one, and decisions say why version 0 alone, why every push is atomic, and why every tip a push leaves is judged, a feature branch's too.
- Sessions and tokens says a git client authenticates with the command line's token and never a session; the audit log records `ref.update` and `push.refuse` from v0.4.0, with their details; a `workflow_versions` row a git push writes has `source` `git`, the commit's first parent, and the pusher as its author rather than the commit's git author.
- A workflow repository keeps image pins and brick manifests, which a git push is judged against since it carries neither and its hook reaches no registry: `agk push` records them before it pushes with git and the tree push records a new version's pins, and a plain `git push` is refused as `image-not-pinned` for a tag no pin holds and as `manifest-missing` for a brick image no manifest is recorded for.
- The route table describes `GET` and `POST /api/v1/{ns}/workflows/{name}/images`, a manifest recorded again replacing the one held, and the version route recording a new version's pins; the audit log records `image.pin` and `image.manifest` from v0.4.0, a manifest recorded or replaced with its SHA-256 and that of the one it replaced, since a version made from a manifest takes its parameters' checks and where its secrets are mounted from it.
- The storage tables give `image_pins` its 384-byte bound on a reference and `brick_manifests` its 256 KiB bound on a manifest, kept as the file the image holds, byte for byte.
- Two decisions say why the pins and manifests are the repository's rather than the namespace's, and why a pin moves and a manifest can be replaced, and both are audited.
- An image reference in the store is printable ASCII and a tag holds no `@`; an image by digest is kept less any tag written beside its digest, so a step writing the tag beside the digest finds the manifest recorded without it, and two manifests given for two spellings of one image, or a reference naming no repository, are refused with 400. A manifest is listed with the SHA-256 of what is kept, computed by the database, rather than its text.
- Reading the YAML says a workflow file, a file it includes and a brick manifest are read as YAML 1.2 and held to bounds, each with its reason, wherever they are read, a runner reading a manifest out of an image and a stored version read back included, the one exception to a bound applying only where a version is made: 16 MiB before anything reads it; nesting of 128 levels, a path of 1 KiB and no explicit key, from the lexer's tokens, since the parser costs the sum of every path's length; 250,000 values and 16 MiB once aliases are followed, counted on the syntax tree and again on the decoded value, with an anchor name defined twice or an alias before its anchor refused. A decision says why: ten lines of anchors stand for three billion values, and one such document held whoever read it until memory ran out.
- The brick manifest section says a run takes its parameters' checks and where its secrets are mounted from the manifest the version keeps, and a runner reads the image's own to refuse an image carrying none and to take the account the brick runs as.
- A new workflow repository's default branch is unprotected unless created otherwise: whoever holds `workflow:write` pushes to it, as before v0.4.0, and an owner protects it when wanted.
- The route table describes creating, reading, renaming, moving, protecting and deleting a workflow repository, and the tree at a ref, with their statuses and permissions.
- Creating a workflow takes `workflow:write` at namespace scope, as in v0.3, and the platform tool `workflow.create` says so.
- The include layer is what included files bring, hidden blocks and defaults, and a step written in an included file keeps its own values above `defaults`, the entry point overriding it keyword by keyword.
- An included file is validated against `workflow.schema.json#/$defs/fragment` and refuses what makes an entry point; a path include resolves against the file naming it; a workflow include reads a library repository's root `agentiik.yaml`.
- `files` says what a glob matches, `**` included, how a directory or a glob is relocated, and that `to` is absolute.
- A version is any commit a push leaves a branch or a tag pointing at, and `workflow_versions` records its pusher and its `source`.
- `grant:manage` names and protects a workflow's default branch, `workflow:write` creates a workflow, and `workflow:delete` takes the runs with it.
- The audit log records `workflow.create`, `workflow.update`, `workflow.delete` and `ref.protect` from v0.4.0.
- A port or a workflow output past 250 characters is refused by `agk validate`, `agk run --local`, `agk push` and the push, 422, and a version stored before v0.4.0 naming one is read back as it was accepted.
- The push refuses a secret the namespace does not declare, 422, naming the secret and each step mounting it, once the pusher holds `secret:use`.
- A commit already stored, pushed again with the same files, is answered as that version and not judged by a rule added after it was stored.
- `agk run --local` says before its first step that it executes the working tree, uncommitted changes included, in the transcripts and in both recordings, re-recorded, which ran in 2.5 seconds.
- Includes and inheritance says how each keyword meets across files and layers: `before_script` and `after_script` keep every layer's commands, outwards in; `vars` and `params` merge by name, `defaults` keyword by keyword, `secrets` each once; a hidden block written again is replaced whole, and a file included twice is applied once.
- An include that leaves the tree, names a file the commit does not hold or comes back to a file still being resolved is refused, and a hidden block needs no pin and no manifest until a step extends it.
- `after_script` merges as `before_script` does, and `shell`, `before_script` and `after_script` are carried by a script step alone.
- The entry point is `agentiik.yaml` at the repository's root and `metadata` names the repository; `agk push` pushes the whole tree, refusing an entry point below the root, naming `git subtree split`, and a `metadata.namespace` other than `--namespace`.
- The version route refuses a `metadata.name` or `metadata.namespace` other than its path's with 422, a refusal names `file:line:column` and its rule, and the version records only what it was judged over.
- The storage tables give `workflows` its repository key and creator, `workflow_refs` its rows and their 1,024-byte bound, `git_packs` its states, and `workflow_versions` what it holds today and its `source`; a repository's packs are kept under `<namespace>/git/`, which the orphan sweep never walks.
- The default branch is never deleted: another branch is named the default first.
- A decision says why git is served by an implementation on the standard library, and how it is tested against git.

### Site

- The home page opens on its headline, workflow orchestration, with Documentation between Get started and Roadmap, more room between its parts, and the command that installs `agk` under the buttons, with a button to copy it and a link to the script.
- `install.sh`, served at `/install.sh`, builds `agk` from the latest release's tag, helper included, with Homebrew, with Go 1.21 or later, which fetches the Go release the module names, or in Docker's `golang` image, asking which, where to install and whether to go ahead; `AGK_METHOD`, `AGK_VERSION`, `AGK_BIN_DIR` and `AGK_YES` answer ahead for a run with no terminal.
- The home page puts MCP first among four things Agentiik is, and shows the command line on a laptop, the command line against a server and an MCP client's calls as three tabs; the MCP tab is drawn from the documentation and says it arrives in v0.7.0.
- The home page's text is shorter and says what each part shows.
- The sketches behind the opening are eighteen workflows of different trades, a transcode, a rollout, an alert triage, a nightly load and more, each under its namespace and name, laid out left to right or top to bottom, with shards filling, approvals waiting, a flaky step retried, steps skipped and a verdict when the run ends.
- The mark on the home page has solid lighter bars, so the canvas no longer shows through them.
- A shared link to the home page, the documentation, the roadmap or the legal notice shows a card, drawn in `brand/social.html` and rendered into `assets/`, with the page's title and a sentence.

- The home page shows the command line against a server as well as on a laptop: a recording of agk push, agk run, agk status and agk logs against an installation, made by the deploy repository's CI; one player serves both recordings, and it now takes the page's colours rather than its own black.
- The home page's logo is larger again, the first thing the opening shows.
- The home page's headline says plainly what Agentiik is, open source workflow orchestration, and the line under it keeps what sets it apart.
- The home page's opening offers the organisation on GitHub beside Get started and the roadmap.
- The home page's canvas draws small workflows on its grid, a few at a time where there is room beside the text: steps appear column by column, edges route to them at right angles, each step runs, then the sketch fades and another starts elsewhere. Nothing moves where the reader asks for less motion.
- The home page's mockups keep the one rounded corner they draw: the frame around them no longer adds a border and a radius of its own, and their shadow follows the window's shape.
- The home page's headline says the two things Agentiik is built on, a container per step and a commit per run, and its graph is the console's current mockup, drawn as vectors, so it stays sharp at any screen density.
- The home page opens on the product: a headline and two ways in over the console's graph canvas, the graph view beside its agentiik.yaml, the three ideas the documentation opens on, then the runs view and the recording, each with a title.
- The documentation and the roadmap lay everything in one column of one width, text, tables, code and figures alike, rather than prose at one measure and the rest wider; a table or a drawing wider than the column scrolls in its frame or opens in the viewer.

## v0.3.0, 2026-09-28

### Documentation

- Every version on the page is v0.3.0's, and the copies of deploy's files are its release's.
- Install a server says what v0.3 does not do yet, leaving out creating a namespace through the API and purging, which v0.3.0 does.
- Homebrew's `agentiik-setup` makes the namespace `demo`, as Compose does, never one named after whoever installs it, and a v0.2 server keeps its namespace, which the first administrator is given like any other; the Homebrew passages describe the tap as released rather than from v0.3.0, and its CI as creating the first administrator and upgrading a server the previous release set up.
- The recordings' captions give the durations they recorded, 2.6 and 3.1 seconds.
- The README counts six repositories holding no code yet.
- The v0.2.5 operator token becomes v0.3.0's bootstrap token, working until the first administrator, made with `agk user create LOGIN --admin`, has signed in; enrolment links last an hour.
- Upgrades change `compose.yaml` and `.env` and nothing else, as CI checks.
- The authentication policy's defaults and routes, the API's sign-in page, `agk login`'s loopback exchange, and passkeys unavailable on an IP address.
- Passkeys verified with the standard library and no attestation.
- How a principal is written; logins and namespaces share one name space; `NS/agentiik` holds no grant by default.
- API tokens expire after 90 days by default, a year at most.
- The v0.3.0 routes for users, groups, service accounts, namespaces, namespace grants, tokens and the policy.
- The identity and access audit actions of v0.3.0.
- A deny names one permission; a grant's scope is `NS` or `NS/workflow`; a token's scope is `{permissions, within}`.
- Quotas are optional, `allowed_runner_pools` sits inside them and refuses an empty list; the Terraform example follows.
- The roadmap's installer writes the bootstrap token to `.env` and prints none.
- `operator` holds `run:read` to follow runs, and `workflow:delete` is `owner`'s alone; the roles table gains a `delete` column and names the permissions of each column.
- `secret:use` is checked at the push, against the pusher, by the version `PUT`, a git push and `workflow.commit` alike: a version naming a secret is refused with 403 without it, and running it takes `workflow:run` alone.
- The access figure and the console's access mock deny `run:read_data` to an `editor`, which holds it, rather than to roles that never did.
- Secret permissions come from namespace grants alone, and a grant or a deny ends at the instant its expiry names.
- Logins and principal names follow the namespace grammar, 255 characters at most; `installation` is refused as a login.
- Removing a principal removes what it holds, and is refused while a namespace's record names it as owner.
- A namespace's policy applies at sign-in to every account holding a grant in it, and the installation's is stored whole.
- A passkey's kind comes from Backup Eligibility alone, which never changes.
- Enrolment links: their three kinds, what a fresh one revokes, and a suspended account's still working.
- An installation addressed by IP signs in with passwords without rewriting its stored policy.
- What passkey verification refuses, and a stalled signature counter refusing the sign-in, audited and told to the user, with no lock.
- Removing a workflow or a namespace removes its grants.
- An administrator widening their own access notifies the namespace's owner in `GET /api/v1/me`, or every holder of `owner` where there is none.
- Notifications are kept 90 days, removed when read past them, or dismissed with `DELETE /api/v1/me/notifications/{id}`.
- `max_concurrent_tasks` and `max_retention_days` default to 20 and 90; the other quotas bound nothing until set.
- A token carries an administrator's powers only where its scope does not narrow them away.
- `DELETE /api/v1/me/credentials/{id}`, and a single read and a delete for users, groups and namespaces.
- Group, membership and service account changes are audited.
- Storage lists the identity tables as migrated: no mail on users, and an AAGUID that may name a model nothing certifies.
- The Relying Party Identifier is the host of the public URL.
- The bootstrap token's hash is kept in the database.
- `max_runs_per_hour` counts a sliding hour under a lock on the namespace and answers 429 with `Retry-After`, the seconds until one more run fits; a refused `workflow:` call fails its step, and a 429 is not audited; `agk run` exits 1 for it.
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
- The documentation specifies `agk console`, v0.6.0's console in a terminal: runs, a run, its graph, workflows, sharing and runners over the web console's routes, as the signed-in principal, with no server and no permission of its own, drawn with Bubble Tea, Lip Gloss and Bubbles, confined to `cmd/agk`: panes that resize and stack at 80 by 24, the graph as boxes and edges, the design system's palette falling back to 256 and 16 colours and `NO_COLOR`, spinners, progress and sparklines, the mouse, a filter as you type, a command palette on `:` and toasts from `GET /api/v1/me`; eight mockups show it.
- The roadmap plans `agk console` in v0.6.0, a seventh group of twenty-three tasks, and its approvals with the wait step in v0.8.0.
- The web console takes `agk console`'s design language: a top bar with the namespace switcher and the principal and no sidebar, panes with rounded borders, state badges, monospaced identifiers, the graph as boxes and edges, toasts and a key line, keeping the browser's mouse, forms, visual editor and passkeys. Its four mockups and the home page's are redrawn as browser windows, scheduled runs by `finance/agentiik`.
- The web console's statistics: a workflow's runs, durations, queue wait, exit codes, hours and ports, a namespace against its quotas, and the pools and runners for administrators, one range driving a zoom, a readout, a comparison, CSV and JSON exports and a link to the runs counted; three mockups show them.
- `GET /api/v1/{ns}/stats/runs`, `/stats/steps`, `/stats/ports` and `/stats/quotas`, and `GET /api/v1/stats/pools` for administrators, from v0.6.0, counting only what `run:read` reaches; `agk console` draws a histogram of a workflow's durations from the first.
- The roadmap's console shell follows the look, and v0.6.0 gains Statistics and charts, thirteen tasks across agentiik, schemas and console with the chart library an open question, and `agk console`'s histogram; a milestone may hold eight groups.
- The user and group routes as merged: the display name defaults to the login, a repeat before enrolling answers 200 with a fresh link, groups take up to 1,024 first members, and a membership change answers the group.
- A user's empty personal namespace goes with them, and the last administrator who can sign in is not removed once the bootstrap has ended.
- The grant routes at both scopes: who may list, create and revoke, what each refuses, and the owners told of every grant an administrator writes or of any widening of their own access.
- `GET /api/v1/me`, `agk whoami`, `agk share`, `agk grants`, `agk user` and `agk group`.
- Bodies of users, groups, grants and service accounts are held to 64 KiB, and a route that reads no body refuses one.
- Service accounts as merged: the routes and `agk service-account`, the built-in `NS/agentiik` given by `init` and `migrate` to every older namespace, and unattended runs written as its own.
- A token may expire a minute past the year, a principal holds at most 100 live ones, a service account's own token mints none for that account, and none is minted for `NS/agentiik`.
- `init` says so and goes on where a login holds `AGK_INIT_NAMESPACE`'s name.
- The session cookie `__Host-agentiik_session`: 12 hours idle, 30 days at most, no expiry of its own; a request changing something needs the public URL's `Origin`, two credentials are 400, and a session that may only enrol is 403 elsewhere.
- The passkey ceremonies: a 32-byte challenge good for 5 minutes, user verification asked wherever any policy requires it, a passkey added from a session, and the session a registration opens; an enrolment code opens no session of its own.
- `signin.fail` is recorded by the address, bounded at 10 per address and 100 in all per 10 minutes; `installation` creates each personal namespace at its user's first sign-in.
- Storage gains `webauthn_challenges`, and a session records only the credential that opened it.
- `POST /api/v1/auth/sign-out` and `GET /auth/assets/{name}`; what the sign-in and enrolment pages show, and their Content-Security-Policy.
- The web console is served on the API's origin, at the root of the public URL, so the Relying Party Identifier stays the public URL's host; a page on another host of the same site is a threat the `Origin` check answers. The roadmap's console deployment tasks say so.
- Password sign-in: 10 attempts per login and 30 per address in 15 minutes, then 429 with `Retry-After`; one hash per processor at once, and 503 after waiting 5 seconds; a TOTP code beside a password, RFC 6238, no code accepted twice.
- Where a passkey is required, a password's session only enrols, whatever passkeys the account holds, read at every request; the passkey that reaches `min_passkeys` deletes the password.
- Behind `AGENTIIK_PROXY_URL` the API reads a sign-in's address from the last `X-Forwarded-For` entry; nginx needs `proxy_set_header X-Forwarded-For $remote_addr;`, which deploy's `nginx.conf` carries.
- Setting a password from an enrolment link, a recovery code or a session, and a TOTP generator from a session: `POST /api/v1/auth/password/enrol`, `PUT` and `DELETE /api/v1/me/password`, `/api/v1/me/totp` and its confirmation; 12 characters to 1,024 bytes, not the login, no composition rule.
- An enrolment link sets a password where the policy allows one, the only way in on an installation addressed by an IP address; `agk user create` says so, and storage gains `totp_enrolments`.
- Recovery codes from another administrator, `agk user recover`, never for oneself, enrolling a passkey or a password; `agentiik-api recover` on the host for an administrator, told to every administrator in `GET /api/v1/me` as `break_glass_recovery`.
- Forbidding passwords acts when they come to be forbidden, deleting passwords and their TOTP generators and suspending the accounts with no passkey the policy accepts; a passkey enrolled, or a password set, from a code lifts that suspension.
- A policy change that would leave no administrator able to sign in is refused with 409; the policy routes replace the whole policy, and `agk auth policy` reads it first, sets what is named and takes `--inherit`.
- Adding a way in from a session takes a sign-in in the last 10 minutes, else 403 with RFC 9470's challenge; the credential routes and `policy.change`, `credential.remove` and `credential.enrol` say what they record.
- `agk login` signs in with a passkey or a password, prints the port to forward over SSH, keeps one token per installation in `profile.json` and revokes the one it replaces; `agk logout`; the exchange's code, its 401, 403 and 409, and the exit codes both verbs leave with.
- Storage gains `exchange_codes`, and `api_token.create` records the credential that signed in for a token `agk login` minted.
- A run's principal is asked again at admission, before its concurrency group and on every pass until it is let in; a run refused ends `cancelled` with a reason naming a grant by identifier, role and scope, the whole account going to `run.cancel` by `installation`; a run the bootstrap token started and not let in when it ends is cancelled.
- `max_artifact_bytes` counts live artifacts and writes under way, each digest once, and the built-in store answers 507 past it, failing the step on the platform's account; `max_retention_days` keeps what declares no `retain`; `max_run_duration` caps the root `timeout` rather than refusing it, and bounds a run writing none.
- The quota gauges `agentiik_quota_used` and `agentiik_quota_limit`, folded past 1,000 namespaces.
- The controller that leads runs the purges, the collection and the orphan sweep: a pass at the start of its term and every 10 minutes, batches of 1,000 rows or 100 runs, a line in its log per pass, and six counters; the collection's 24-hour grace is a constant, and a write holds its object a day past its policy.
- Orphans go to the collection a day after they were written and are deleted a day later; the artifact files v0.2 left unrecorded are recorded by `init`, `migrate` given `AGK_OBJECTS_DIR`, and the controller, and v0.2 runs expire at their namespace's `max_retention_days`.
- Storage lists `artifact_objects`, `artifact_uploads` and `artifact_room` and the new run columns, and says what an object's count counts; an envelope may outlive a one-shot output, whose file then answers 410.
- PostgreSQL 18 in the Compose installation: `postgres-upgrade` runs before PostgreSQL, upgrades a 17 cluster in copy mode and keeps it as `data/postgres-17`, needing the cluster's size and 128 MiB free; backups leave `data/postgres*` out; Homebrew stays on 17; `ghcr.io/agentiik/postgres-upgrade` is published with the other images.
- The roadmap plans in v0.3.0 the sign-in and enrolment page and setting a password and a TOTP under Passkeys, passwords and recovery, and the purges and the collection of what v0.2 left under Quotas, isolation and what stays invisible.
- An enrolment link or recovery code refused is recorded as `signin.fail`, naming its account and never the code, within the same bound; each password a policy change takes is a `credential.remove` by whoever changed it.
- An administrator putting themselves in a group, taking themselves out, or removing a group they are in tells the owners where that widens their own access, and the entry names who was told.
- The audit log says what changes something and is not recorded, and why: a push, a TOTP generator started, a sign-out, a notification dismissed, a runner's own traffic, an upload, a 429, and a wrong guess from a signed-in session.
- The bootstrap token ends when the first administrator has signed in: at their first passkey, or at the first request of a full session their password opens, the policy relaxed since included; its recovery codes end with it, and a first link opens nothing once its user holds a credential; `GET /api/v1/users/{login}` answers `suspended_for`.
- Once the bootstrap has ended, a grant carrying a role or a group membership that would leave no administrator able to sign in is refused with 409 naming the setting; a password that could only ever enrol, a passkey required and `min_passkeys` held, is refused with 409 naming `passkey`.
- agk talks to the installation `agk login` last signed in to where neither `--server` nor `AGENTIIK_SERVER` names one, never sending `AGENTIIK_TOKEN` there (exit 2); a refused exchange is recorded as `signin.fail`.
- `stats` is reserved as a namespace name from v0.3.0, for v0.6.0's `GET /api/v1/stats/pools`, served at that path alone; a namespace of that name made before keeps every route, with nothing to do.
- Removing a TOTP generator takes a code it shows now, and no sign-in of the last 10 minutes, which starting and confirming one need.
- An administrator the bootstrap token creates is given the `owner` role on every namespace no record names an owner of, recorded as `grant.create` by `operator`, so the first administrator owns the installation's namespaces with nothing shared by hand.
- Install a server copies deploy's `compose.yaml` as it no longer gives the API `AGK_OPERATOR_TOKEN_FILE`, and its `.env` examples as they call the token in `.env` the bootstrap token and have an administrator issue join tokens.
- Get started and Install a server create the first administrator with the bootstrap token, `agk user create alice --admin`, which hands them `demo`, then sign in from a browser that trusts the certificate and with `agk login`; a new token in `.env` counts only until that sign-in, and an administrator issues join tokens.
- Every table naming a namespace is under row level security, the audit log, the policy, the notifications and the service accounts included.
- A refusal asks what an allowed request would ask, so that how long it takes discovers nothing either.
- A run names its runner by identifier alone, and a presigned URL lasts 5 minutes, signed over the namespace, the digest and the run.
- A notification names its `act` and who did it, `by`.
- Putting anybody in a group is told to the owners where it holds a role, and where nobody owns, to the other administrators as well; `group_member.add` names who was told.
- `GET /api/v1/me` leaves out a workflow its caller holds nothing in.
- A deny of `grant:manage` on a workflow is refused with 422.
- A runner joining is recorded as `runner.join`, by whoever issued its join token.
- At most 10,000 passkey challenges are open across the installation; past them the options answer 503 with `Retry-After`.
- The roadmap's v0.3.0 tasks for the sign-in page, the purges, the collection of what v0.2 left and the access fixture say what was built, each under its issue's title, and a task publishes the image that upgrades PostgreSQL between major versions; the plan holds 673 tasks.

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
