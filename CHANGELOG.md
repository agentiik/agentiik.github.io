# Changelog

The releases of `agentiik.github.io`.

Every repository of the project carries the same version and is tagged at the same moment, even where nothing changed, so an entry here may say that nothing was built. [Versioning](https://agentiik.github.io/docs#versioning) sets out why, and what a version promises before and after `1.0.0`.

`0.y.z` promises nothing beyond itself: what a release here describes may be gone in the next one.

## Unreleased

**Task networks, trees and rotation, as built.** `network: internal` is a network of the task's own with no route out and no address of the runner host in it, needs Docker 28.0 or later and takes one of the daemon's `default-address-pools`, with a `daemon.json` example; `/agk/out` is a bind held to the size rules at collection rather than a tmpfs, and `/agk/repo` a tree laid out under `.trees` with each file held to its digest; a redemption's `200` must echo the `task_id` and answer the message, or it is treated as a refusal or no answer; and a rotation is signed over `agentiik runner rotation`, the runner and `at`, within five minutes of the API's clock and once.

**Use cases.** A new chapter after Get started with six workflows: home automation, DevOps, finance, cybersecurity, a data pipeline, and an AI agent calling a workflow over MCP. Each is a complete `agentiik.yaml` that validates against the workflow schema, with a table linking what it uses to the section that specifies it and the release it runs from, per the roadmap. Only the data pipeline runs today; the others reach the network and wait for the egress proxy in v0.9.0. The wait brick has no manifest yet, so the finance example passes it no parameters and assumes its `out` port.

**What the runner batch built, as built.** `agentiik-api serve`, `bus-init` and `bus-credential`, the bus identity and its three files, and a first run with the interim operator token; the join, heartbeat and bus token routes; a stop's shape and its four reasons; exit code 121 for any broken output contract, measured before the first upload; the secrets tmpfs, its `fstab` line and `ReadWritePaths`; what `runner.env` accepts; a controller that ends rather than retrying once it loses the database, the bus or its lock; and `agk-runner join` as built, with `--labels`, `--user` and `--replace`, writing the settings the unit no longer repeats.

**Install with Homebrew.** Get started and the command line table now install `agk` with `brew install agentiik/tap/agk`, and the server programs with `brew install --HEAD agentiik/tap/agentiik`, from the new `homebrew-tap` repository, the thirteenth, which the repositories table and the roadmap marker now list.

**The runner and the server programs, settled.** `agk-runner` with `join`, `serve` and `version`; the host key, rotation, drain and revocation with `revocation_grace`; stops on both channels; where runner policy lives; three capabilities for the agent; digest-only pulls, tags resolved at push; exit code 121; a failed shard's empty ports; the interim operator token; and a new Configuration section listing every `AGK_*` setting. The roadmap gains eleven v0.2.0 tasks, among them the pool's policy at dispatch and at redemption and the heartbeat's `cancel`, moves the tree cache to v0.4.0 and the egress proxy to v0.9.0, folds v0.9.0's runner binary tasks into v0.2.0, and folds v0.4.0's tree fetch and mount into v0.2.0's fetch task. Whether `revocation_grace` should follow the deadlines a revoked runner holds is left open.

**One list of what a runner does with a task.** Task bus and Runner each numbered the same sequence their own way; Runner keeps it, with both checks of the record and the ending written after the outputs, and Task bus points at its steps.

**What each answer to a redemption leads to.** A table beside the example: a `200` binds, a `409` is acknowledged, a `422` the installation can never answer is reported as no container ran, and no answer, a `401` or another `5xx` is asked again until the deadline, then reported `timed_out`. The `422` is a new v0.2.0 task, since the API answers `500` to both kinds today.

**A task's deadline is fixed when it is dispatched.** The page said it started when the container was created, while the controller fixes it at dispatch and the grant expires with it; the queue, the pull and `pre_task` now count against it, and a task whose deadline passes before anyone redeems it is reported `timed_out` with no container ran.

**A requeue left on the queue can run elsewhere.** The host still running a key leaves its requeue unacknowledged, and the page now says that another runner of the pool may take it after AckWait and run it beside the first container.

**What masking misses after a rotation.** A runner that restarts and adopts its container redeems again and masks the rotated value, while the container still writes the old one in clear; the limit is written beside the masking rule, and whether a grant should keep its first values is left open.

**A secret is read before the pull, on the roadmap too.** The v0.2.0 task still said a value was retrieved at the last moment; it now says at the redemption, before the image is pulled, as the page decides.

**Approvals wait for the wait step everywhere.** The v0.6.0 console band and the v0.7.0 MCP audit task no longer count approvals, which the v0.8.0 task now carries, and the MCP tools table gives `run.approve` and `run.reject` the same v0.8.0 note as the API.

**Where a run is read, as served.** A run is read at `/api/v1/{ns}/runs/{id}`, which is the `Location` a cancellation answers with; the route table says so, and serving the two routes without a namespace, which a phone needs, is a new v0.2.0 task.

**How a stop reaches a runner.** On the bus subject `agentiik.stops`, which a runner subscribes to over its own connection, as the engine does: the Channels table and the cancellation say so, with what a runner that was not connected misses, and the roadmap task no longer looks for stops in the heartbeat's answer.

**A name of 251 to 255 characters, placed on the roadmap.** A workflow output is held to 250 like a port, since `agk run --local` writes it as `<name>.json`, and two v0.4.0 tasks enforce both and write every bound into the schemas; the database row names the columns the domain types.

**`max_requeues` on the roadmap.** Two v0.2.0 tasks: bounding requeues per key, titled as its issue #194 so the roadmap marks it, and reading the bound from the installation's configuration, which the page's "set by" row now links.

**Redeem before acknowledging, requeues bounded, a run cancelled, as built.** A runner now takes a message, records the key, redeems, acknowledges, then pulls and runs, so nothing sweeps a task nobody redeemed and one waiting on a full queue or a slow pull is never lost; secret values are read before the pull. A host answers a requeue of a key it already ended from its record, by reference. `max_requeues`, 3 by default, bounds requeues per key. `POST /api/v1/runs/{id}/cancel` and each route's body cap are listed, and an identifier is at most 255 characters. On the roadmap, cancel stays in v0.2.0 and approve and reject join the wait step in v0.8.0.

**Uploads, acknowledgements and requeues, as built.** A task redeems its grant once, after the image pull, for one signed POST policy; the built-in store holds each object to its digest, and a MinIO or S3 presigner joins v0.9.0. A runner records a key and acknowledges on take, and a result is heard only from the runner its dispatch is bound to. A lost task is requeued under its key with a new `task_id`, only where `retry.on` names `lost`, spending no retry. The gaps left are named: a host dying between acknowledgement and redemption, a requeue coming back to the host that already ended its key, requeues nothing bounds, and overwrites on MinIO or S3.

**Secrets declared on the namespace.** A namespace declares each secret through `/api/v1/{ns}/secrets/{name}` under a ninth permission, `secret:write`: `builtin` with a write-only value, or `env` for development; `vault` waits for v0.9.0. A workflow only names them, `secrets: [billing]`, and a mount may carry a dot. Auditing a secret write and refusing an undeclared name at push are marked as not built yet. On the roadmap, suspending a waiting run joins the wait step in v0.8.0.

**How a tree reaches a server before git hosting.** `agk push` carries the commit's tree, a version keeps a manifest with a counted reference to each object, and a runner redeems its task's grant for one presigned GET per object. The limits of that interim push sit in a decision block for François to confirm.

**Shorter, with more pictures.** The documentation, Get started and the roadmap are rewritten with diagrams, tables and examples in place of long prose: 13 new figures and 31 new tables. The documentation goes from 32,600 to 26,400 words and the roadmap from 20,800 to 17,600. Every anchor, every rule and every task already filed as an issue is kept.

**The two routes that make a pool exist.** The route table served the pools and the runner inventory and had no route that created either, while Registering a runner opens on an administrator creating a pool with its labels, its accepted namespaces and its resource ceilings. So the one thing the chapter says happens first was the one thing the API could not do, and a pool was in practice a name that came into being the first time a join token used it. `POST /api/v1/runner-pools` and `POST /api/v1/runner-pools/{pool}/join-tokens` are named now, both administrator only. Labels are not self-asserted also gains its first link: a token may permit only labels its pool carries, so the chain from machine to token now ends at somebody who wrote the label down rather than in mid-air.

**What bounds a task nothing bounds.** A step declaring no `timeout`, in a workflow declaring neither a root one nor a default, had no deadline at all. Two things need one: a container nothing bounds holds a runner until somebody notices, which is the case `max_run_duration` exists to make impossible, and the per-task grant a runner fetches its inputs with expires with the task, so a task with no deadline is a credential that never stops working. The installation's ceiling answers it, an hour by default, applied only where nothing else did. Deliberately not `max_run_duration`, which stays a ceiling on what a workflow may ask for: a ceiling that quietly became a default would be a number nobody reads as a ceiling any more.

**What the control plane really carries.** Sizing said it "holds no payloads, only state, with one exception", and the engine has always had a second one. Sharding a `fan_out: item` splits an envelope's items, `zip` pairs them, `join` keys on them and an expression under `fan_out: item` reads one: all four need the items themselves, so the controller reads a step's published envelopes at the moment it decides. The page now says so, and bounds it, because the bound is the interesting part: what the controller reads is capped by `envelope_max_bytes` per port per step and never by the artifacts those envelopes reference, so a hundred gigabyte file still travels as a digest between two runners. The decision block under the exposed context claimed the opposite in as many words, that the controller "never loads whole envelopes into memory in order to schedule", and now says what the rule actually buys.

**A task key carries the cardinality, and a log has a URI of its own.** The task message printed `01JMZ8V1P9C4/invoice/2/3` beside `"shard": { "index": 3, "of": 8 }`, four segments where the engine mints five. A shard is an index and a cardinality, `AGK_SHARD` carries `3/8`, and a key without the `8` cannot say which fan-out it belonged to. And the result message printed a log as `agk://run/<run>/<step>/log`, which the artifact grammar refuses and which cannot tell eight shards apart anyway. The scheme names a kind in its first segment, so a log is `agk://log/<run>/<task>`: a log belongs to one task, not to one port.

**Starting a group is a script.** `.github/file-tasks.py` reads the plan from the page and files a group's tasks as sub-issues: type Task, the milestone of the release, a body naming the sections that specify each one, the sub-issue link, and a project row with Release, Spec and Section. It was done by hand until now, and by hand is where the mistakes are: the title a task issue carries is the task cut at a hundred and three characters, never mid-word, which is not a rule anybody reproduces from memory. It prints what it would file unless told to write, skips what is already filed so an interrupted run is finished by running it again, and looks its identifiers up rather than carrying them pasted in.

**What each purge acts on.** Storage named three purges and a collector and never said what the three are measured against. An artifact carries its own instant, resolved when the reference is written, which is why raising a namespace ceiling later extends nothing. An envelope and a log are not declared one at a time the way an output is, so both live by the workflow's `defaults.retain` capped by the namespace, resolved once when the run finishes. And collection is not a retention at all: it is what falls out of the other two. Written while building the tables, where the question is not answerable by guessing.

**An envelope is a counted object.** Two steps publishing identical bytes publish one object, so an envelope purge that deleted by digest alone would delete what another step still names. The page had said this of artifacts and left envelopes to be read as bytes belonging to one step. There is one counter for every kind of object now, and the difference between an artifact and an envelope is what points at it.

**Collection waits.** An object is deleted a grace period after its count reaches zero, a day by default, because content addressing means a run writing the same bytes tomorrow references what is there rather than uploading again, and collecting on the instant would turn every such write back into an upload. A decision block carries the reasoning and the gap the delay alone does not close.

**Task states, all nine of them.** The page drew seven and the engine has produced nine since v0.1.0: a task stopped at its deadline is `timed_out` and a task stopped by a cancellation is `cancelled`, neither of which is `failed`, because the brick decided nothing and there is no exit code of its own to read. The wire written yesterday took the page's seven and could not carry a result the driver produces, which is how it was found. They have a table of their own now, beside the run states.

**A one-shot artifact is served, not redirected to.** Three chapters disagreed. How long an artifact lives says a fetch counts when the response completes and that an interrupted transfer does not consume anything; the API served every artifact as a 302 to a presigned URL, which ends the moment it is issued, so nothing could observe a completion; and Sizing said the control plane holds no payloads at all. An artifact with a fetch budget now comes through the API, everything else stays a redirect, and Sizing carries the exception with its bound. Found while settling what the storage group has to build, and settled before a line of it was written.

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
