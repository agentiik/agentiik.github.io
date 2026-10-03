// Renders the screenshots of the web console the site shows, assets/console-<screen>-<theme>.png,
// from the console of an agentiik checkout rather than drawing them, so that what a reader sees is
// what a release serves.
//
//     node .github/console-shots.mjs ../agentiik
//
// The checkout's console must be built first (npm ci && npm run build in its console/), at the
// release the site describes. Its own stand-in for the API, console/tests/serve.js, answers from
// the recorded answers its screen tests use, alice.json and dana.json, and Playwright comes from
// the console's own dependencies, so nothing here pins a version of either.
//
// The recorded answers are made for tests, and a test reads them at a fixed instant. A reader
// reads a screenshot as a moment of a real installation, so three things are made to look like
// one: every run and grant identifier becomes a ULID of the instant it names, its random half
// drawn from a fixed seed so that rendering again changes nothing; the clock stands a few minutes
// after the newest run, so that what runs has run for minutes rather than a day; and finance is
// owned by alice, with the grants a team keeps, so that its sharing can be shown.
//
// agk console is drawn too, as assets/console-term-<screen>-<theme>.png. A terminal cannot be
// screenshotted from a browser, so agk-console-shots_test.go is copied beside the package's own
// screen tests, which it borrows, run on the same answers, and removed: it writes each screen's
// cells with their colours, and each is drawn here one cell to a box of the monospace face, so
// that box drawing joins and nothing a fallback face draws wider moves a column. The checkout's
// Go toolchain draws them. A second argument renders only the screens whose name it matches.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const engine = resolve(process.argv[2] ?? "../agentiik");
const web = join(engine, "console");
const site = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { chromium } = await import(pathToFileURL(join(web, "node_modules/@playwright/test/index.mjs")).href);
const { serve } = await import(pathToFileURL(join(web, "tests/serve.js")).href);

// The instant every screenshot is taken at: four minutes after the newest run of the answers.
const now = new Date("2026-09-30T06:04:30Z");

// Twice the pixels of the page, for a screen that has them and for the enlarged figure.
const scale = 2;

const screens = [
  // The site's home page.
  { name: "home", who: "alice", path: "/", height: 1000 },
  { name: "admin-home", who: "dana", path: "/", height: 1000 },
  { name: "editor", who: "alice", path: "/finance/workflows/monthly-invoicing", height: 1000, steps: [["click", "button", "Edit"]] },
  // The web console's chapter of the documentation.
  { name: "runs", who: "alice", path: "/finance/workflows/monthly-invoicing/runs", height: 1000 },
  { name: "inspector", who: "alice", path: (ids) => `/finance/runs/${ids.get("01JMZ8V1P9C4XQ7K2N4D6F8H0A")}`, height: 1000 },
  { name: "sharing", who: "alice", path: "/finance/sharing", height: 1000 },
  { name: "workflow-statistics", who: "alice", path: "/finance/workflows/monthly-invoicing/statistics", height: 1180, steps: [["click", "button", "30 days"]] },
  { name: "quotas", who: "alice", path: "/finance/statistics?tab=quotas", height: 1020 },
  { name: "pools", who: "dana", path: "/runners/statistics", height: 1000 },
];

// agk console's chapter: the failed run with its log, the views beside it, and the run at 80 by
// 24 over SSH in the 256 colours such a session usually reports. Each key is pressed as a person
// would press it.
const failed = "01JMZ8V1P9C4XQ7K2N4D6F8H0A";
const running = "01JMZ8W4K2R7QX6T1N3P5V7Y9A";
const terminal = [
  { name: "term-run", who: "alice", run: failed, width: 160, height: 44, logs: true },
  { name: "term-ssh", who: "alice", run: failed, width: 80, height: 24, depth: "256" },
  { name: "term-ports", who: "alice", run: failed, width: 160, height: 44, keys: ["tab"] },
  { name: "term-sharing", who: "alice", width: 160, height: 44, keys: ["3"] },
  { name: "term-runners", who: "dana", width: 160, height: 44, keys: ["4"] },
  { name: "term-graph", who: "alice", run: running, width: 160, height: 30, keys: ["g", "g"] },
  { name: "term-palette", who: "alice", run: failed, width: 160, height: 44, keys: [":", "r", "e", "p"] },
];

// What invoice wrote before its third shard failed twice, as its log reads.
function invoiceLog(started) {
  const at = (s) => new Date(started + s * 1000).toISOString().slice(11, 19);
  const invoice = (i) => `INV-2026-09-${String(1840 + i).padStart(5, "0")}`;
  const lines = [];
  for (let shard = 1; shard <= 8; shard++) lines.push(`${at(shard)} invoice ${shard}/8 | reading 27 orders from in`);
  for (let i = 1; i <= 9; i++) lines.push(`${at(20 + i)} invoice 3/8 | posted ${invoice(i)} to the ledger`);
  lines.push(`${at(31)} invoice 3/8 | the ledger answered 503 Service Unavailable, Retry-After: 30`);
  lines.push(`${at(31)} invoice 3/8 | exit 108: the ledger is unavailable, try again later`);
  lines.push(`${at(62)} invoice 3/8, attempt 2 | reading 27 orders from in`);
  for (let i = 10; i <= 14; i++) lines.push(`${at(60 + i)} invoice 3/8, attempt 2 | posted ${invoice(i)} to the ledger`);
  lines.push(`${at(108)} invoice 3/8, attempt 2 | the ledger answered 503 Service Unavailable, Retry-After: 30`);
  lines.push(`${at(108)} invoice 3/8, attempt 2 | exit 108: the ledger is unavailable, try again later`);
  return lines;
}

const ULID = /01[0-9A-HJKMNP-TV-Z]{24}/g;
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// mulberry32: a small generator, seeded, so that two renderings draw the same identifiers.
function generator(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ulid(at, random) {
  let time = "";
  let ms = at;
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[ms % 32] + time;
    ms = Math.floor(ms / 32);
  }
  let tail = "";
  for (let i = 0; i < 16; i++) tail += CROCKFORD[Math.floor(random() * 32)];
  return time + tail;
}

// The instant each identifier names, from the record that carries it.
function instants(value, found = new Map()) {
  if (Array.isArray(value)) {
    for (const item of value) instants(item, found);
  } else if (value && typeof value === "object") {
    const when = value.created_at ?? value.granted_at ?? value.started_at;
    for (const key of ["run", "id"]) {
      if (typeof value[key] === "string" && /^01[0-9A-HJKMNP-TV-Z]{24}$/.test(value[key]) && when && !found.has(value[key])) {
        found.set(value[key], Date.parse(when));
      }
    }
    for (const item of Object.values(value)) instants(item, found);
  }
  return found;
}

// The same answers with every identifier a ULID of its instant, those of no record a day before,
// and every digest made of one byte repeated, as a test writes one, a digest as SHA-256 draws it.
function identified(text, random, ids) {
  const at = instants(JSON.parse(text));
  return text
    .replace(ULID, (old) => {
      if (!ids.has(old)) ids.set(old, ulid(at.get(old) ?? now.getTime() - 86_400_000, random));
      return ids.get(old);
    })
    .replace(/sha256:([0-9a-f]{64})/g, (whole, hex) => {
      if (!/^(.{1,2})\1+$/.test(hex)) return whole;
      if (!ids.has(whole)) ids.set(whole, "sha256:" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(random() * 16)]).join(""));
      return ids.get(whole);
    });
}

// Each workflow's last twenty runs, which the terminal's runs view draws beside each run and a
// workflow's runs page lists: those the answers list, then older ones made like the newest that
// ended, every two hours or so, their lengths within a third of it and one in twelve failed.
function historied(scenario, random) {
  const listed = scenario["GET /api/v1/runs"].body.runs;
  const iso = (ms) => new Date(ms).toISOString().replace(".000Z", "Z");
  const length = (r) => Date.parse(r.finished_at) - Date.parse(r.started_at);
  for (const key of new Set(listed.map((r) => `${r.namespace}/${r.workflow}`))) {
    const [namespace, workflow] = key.split("/");
    const own = listed.filter((r) => r.namespace === namespace && r.workflow === workflow);
    // The runs before are made like the newest that ended on its own trigger rather than a
    // person's, as most of a workflow's runs are, and last about as long as those that succeeded.
    const model = own.find((r) => r.finished_at && r.trigger_kind !== "manual") ?? own.find((r) => r.finished_at) ?? own[0];
    const succeeded = own.filter((r) => r.state === "succeeded").map(length).sort((a, b) => a - b);
    const took = succeeded.length > 0 ? succeeded[Math.floor(succeeded.length / 2)] : model.finished_at ? length(model) * 0.6 : 60_000;
    const runs = [...own];
    // A schedule fires on the minute it names, every two hours here; anything else comes when it comes.
    let at = model.trigger_kind === "schedule" ? Date.parse(model.created_at) : Date.parse(own.at(-1).created_at);
    while (runs.length < 20) {
      at -= model.trigger_kind === "schedule" ? 7_200_000 : 7_200_000 + Math.floor((random() - 0.5) * 1_800_000);
      if (at >= Date.parse(own.at(-1).created_at)) continue;
      const lasted = Math.round(took * (0.7 + random() * 0.6));
      const state = random() < 1 / 12 ? "failed" : "succeeded";
      const from = Date.parse(model.started_at ?? model.created_at);
      const scale = model.finished_at ? lasted / length(model) : 1;
      const moved = (t) => (t ? iso(at + Math.round((Date.parse(t) - from) * scale)) : undefined);
      const steps = (model.steps ?? []).map((st, n, all) => ({ ...st, verdict: state === "failed" && n === all.length - 1 ? "failed" : "succeeded", started_at: moved(st.started_at), finished_at: moved(st.finished_at ?? model.finished_at) }));
      runs.push({ ...model, run: ulid(at, random), state, created_at: iso(at), started_at: iso(at), finished_at: iso(at + lasted), steps });
    }
    scenario[`GET /api/v1/runs?limit=20&namespace=${namespace}&workflow=${workflow}`] = { status: 200, body: { runs } };
    // A workflow's runs page lists its own runs of the last 24 hours, where the answers list every
    // workflow's under each.
    const day = runs.filter((r) => now.getTime() - Date.parse(r.created_at) < 86_400_000);
    scenario[`GET /api/v1/runs?namespace=${namespace}&workflow=${workflow}`] = { status: 200, body: { runs: day } };
  }
  return scenario;
}

// What invoice published on out before it failed, which the terminal's inspector shows of the
// failed run: invoices, as the orders normalize wrote became.
function invoiced(scenario, ids) {
  const run = ids.get(failed);
  const orders = scenario[`GET /api/v1/runs/${run}/steps/normalize/outputs/ok`].body.items;
  scenario[`GET /api/v1/runs/${run}/steps/invoice/outputs/out`] = {
    status: 200,
    body: {
      meta: { run_id: run, step: "invoice", port: "out", attempt: 2, count: 211, produced_at: "2026-09-30T05:42:55.4Z" },
      items: orders.slice(0, 8).map((o, i) => ({
        id: o.id,
        data: { invoice: `INV-2026-09-${String(1801 + i).padStart(5, "0")}`, order: o.data.order, customer: o.data.customer, amount: o.data.amount, currency: o.data.currency, issued: "2026-09-30" },
        files: [],
      })),
    },
  };
  return scenario;
}

// finance as alice's to share: her permissions there an owner's, and the grants of a finance team.
function owned(scenario, random) {
  const me = scenario["GET /api/v1/me"].body;
  me.permissions.finance = ["workflow:read", "workflow:run", "workflow:write", "workflow:delete", "run:read", "run:read_data", "secret:use", "secret:write", "grant:manage"];
  const grant = (principal, gives, by, at, more = {}) => ({ id: ulid(Date.parse(at), random), principal, scope: "finance", ...gives, granted_by: by, granted_at: at, ...more });
  const invoicing = { scope: "finance/monthly-invoicing" };
  scenario["GET /api/v1/finance/grants"] = {
    status: 200,
    body: {
      grants: [
        grant("alice", { role: "owner" }, "dana", "2026-09-14T08:30:00Z"),
        grant("group:team-finance", { role: "editor" }, "alice", "2026-09-14T08:41:00Z"),
        grant("group:auditors", { role: "viewer" }, "alice", "2026-09-22T13:05:00Z", { expires_at: "2026-10-31T00:00:00Z" }),
        grant("bruno", { role: "operator" }, "alice", "2026-09-15T09:12:00Z"),
        grant("bruno", { deny: "run:read_data" }, "alice", "2026-09-15T09:13:00Z"),
        grant("finance/billing-bot", { role: "operator" }, "alice", "2026-09-18T16:20:00Z"),
        grant("chloe", { role: "viewer" }, "alice", "2026-09-29T10:02:00Z", { expires_at: "2026-12-31T00:00:00Z" }),
      ],
    },
  };
  // monthly-invoicing, where the terminal's sharing view opens, adds what its own operators hold.
  scenario["GET /api/v1/finance/workflows/monthly-invoicing/grants"] = {
    status: 200,
    body: {
      grants: [
        ...scenario["GET /api/v1/finance/grants"].body.grants,
        grant("group:billing-ops", { role: "operator" }, "alice", "2026-09-21T14:30:00Z", invoicing),
        grant("chloe", { role: "editor" }, "alice", "2026-09-29T10:04:00Z", { ...invoicing, expires_at: "2026-10-31T00:00:00Z" }),
        grant("group:billing-ops", { deny: "run:read_data" }, "alice", "2026-09-21T14:31:00Z", invoicing),
      ],
    },
  };
  return scenario;
}

// dana as an administrator who also works in two namespaces, as one does: she reads finance and
// works in team-ops, so that her home shows their runs beside the server's, and the server's last
// hour is the hour the screenshots are taken in rather than the next day's.
function administered(dana, alice) {
  const me = dana["GET /api/v1/me"].body;
  me.permissions.finance = ["workflow:read", "run:read"];
  me.permissions["team-ops"] = ["workflow:read", "workflow:run", "workflow:write", "run:read", "run:read_data"];
  for (const key of ["GET /api/v1/runs", "GET /api/v1/finance/workflows", "GET /api/v1/team-ops/workflows", "GET /api/v1/finance/stats/runs?bucket=1d", "GET /api/v1/team-ops/stats/runs?bucket=1d"]) {
    dana[key] ??= structuredClone(alice[key]);
  }
  dana["GET /api/v1/stats/activity"] = JSON.parse(JSON.stringify(dana["GET /api/v1/stats/activity"]).replaceAll("2026-10-01T", "2026-09-30T"));
  // Its runners were last heard from as the answers were recorded, two minutes before the
  // screenshots: heard from again since, as a runner beats every ten seconds.
  for (const r of dana["GET /api/v1/runners"].body.runners) {
    const seen = Date.parse(r.last_seen_at);
    if (now.getTime() - seen < 600_000) r.last_seen_at = new Date(seen + 120_000).toISOString().replace(".000Z", "Z");
  }
  return dana;
}

function scenarios() {
  const random = generator(20261002);
  const ids = new Map();
  const read = (who) => JSON.parse(identified(readFileSync(join(web, "tests/fixtures", `${who}.json`), "utf8"), random, ids));
  const alice = historied(invoiced(owned(read("alice"), random), ids), random);
  return { ids, alice, dana: administered(read("dana"), alice) };
}

const { ids, ...answers } = scenarios();
const only = process.argv[3] ? new RegExp(process.argv[3]) : null;
const wanted = (name) => !only || only.test(name);

// agk console's screens as cells, drawn by agk-console-shots_test.go on the same answers.
function cellsOf(shots) {
  const dir = mkdtempSync(join(tmpdir(), "agk-console-shots-"));
  const test = join(engine, "cmd/agk/internal/console/zz_site_shots_test.go");
  try {
    for (const who of Object.keys(answers)) writeFileSync(join(dir, `${who}.json`), JSON.stringify(answers[who]));
    const detail = answers.alice[`GET /api/v1/runs/${ids.get(failed)}`].body;
    const started = Date.parse(detail.steps.find((s) => s.step === "invoice").started_at);
    const asked = shots.map((s) => ({ ...s, run: s.run ? ids.get(s.run) : "", logs: s.logs ? { invoice: invoiceLog(started) } : undefined }));
    writeFileSync(join(dir, "shots.json"), JSON.stringify(asked));
    copyFileSync(join(site, ".github", "agk-console-shots_test.go"), test);
    execFileSync("go", ["test", "./cmd/agk/internal/console", "-run", "^TestSiteShots$", "-count=1"], { cwd: engine, stdio: "inherit", env: { ...process.env, AGK_SITE_SHOTS: dir, AGK_SITE_NOW: now.toISOString() } });
    const cells = {};
    for (const s of shots) for (const theme of ["light", "dark"]) cells[`${s.name}-${theme}`] = JSON.parse(readFileSync(join(dir, `${s.name}-${theme}.json`), "utf8"));
    return cells;
  } finally {
    rmSync(test, { force: true });
    rmSync(dir, { recursive: true, force: true });
  }
}

// A cell is 7.5 by 16.5 CSS pixels, JetBrains Mono's advance and its ascent and descent at 12.5px,
// whole device pixels at twice the scale. Box drawing and blocks are drawn rather than set, as a
// terminal of today draws them, so that every line joins its neighbour whatever face is at hand.
const cell = { width: 7.5, height: 16.5, size: 12.5 };
const arms = { "─": "lr", "│": "ud", "┌": "rd", "┐": "ld", "└": "ru", "┘": "lu", "├": "udr", "┤": "udl", "┬": "lrd", "┴": "lru", "┼": "lrud", "╴": "l", "╶": "r", "╵": "u", "╷": "d", "━": "LR", "┃": "UD", "┏": "RD", "┓": "LD", "┗": "RU", "┛": "LU", "┣": "UDR", "┫": "UDL", "┳": "LRD", "┻": "LRU", "╋": "LRUD" };
const dashed = { "┄": "lr", "┈": "lr", "╌": "lr", "┆": "ud", "┊": "ud", "╎": "ud" };
const rounded = { "╭": "rd", "╮": "ld", "╰": "ru", "╯": "lu" };
const eighths = "▁▂▃▄▅▆▇█";

function drawn(ch) {
  // The centre falls on a whole pixel, so that a line of one pixel covers two whole device pixels.
  const w = cell.width, h = cell.height, cx = Math.round(w / 2), cy = Math.round(h / 2);
  const svg = (inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none">${inner}</svg>`;
  if (dashed[ch]) {
    const across = dashed[ch] === "lr";
    const n = "┄┆".includes(ch) ? 3 : "┈┊".includes(ch) ? 4 : 2;
    const d = across ? `M0 ${cy}L${w} ${cy}` : `M${cx} 0L${cx} ${h}`;
    const step = (across ? w : h) / n;
    return svg(`<path d="${d}" stroke="currentColor" stroke-width="1" stroke-dasharray="${step / 2} ${step / 2}" stroke-dashoffset="${-step / 4}" fill="none"/>`);
  }
  if (arms[ch]) {
    const heavy = /[A-Z]/.test(arms[ch]);
    const a = arms[ch].toLowerCase();
    const to = { l: [0, cy], r: [w, cy], u: [cx, 0], d: [cx, h] };
    const d = [...a].map((k) => `M${cx} ${cy}L${to[k][0]} ${to[k][1]}`).join("");
    return svg(`<path d="${d}" stroke="currentColor" stroke-width="${heavy ? 2 : 1}" stroke-linecap="square" fill="none"/>`);
  }
  if (rounded[ch]) {
    const [x, y] = [rounded[ch][0] === "r" ? w : 0, rounded[ch][1] === "d" ? h : 0];
    const r = Math.min(cx, cy);
    const hx = cx + (x > cx ? r : -r), vy = cy + (y > cy ? r : -r);
    return svg(`<path d="M${x} ${cy}L${hx} ${cy}Q${cx} ${cy} ${cx} ${vy}L${cx} ${y}" stroke="currentColor" stroke-width="1" fill="none"/>`);
  }
  const e = eighths.indexOf(ch);
  if (e >= 0) return svg(`<rect x="0" y="${h - (h * (e + 1)) / 8}" width="${w}" height="${(h * (e + 1)) / 8}" fill="currentColor" shape-rendering="crispEdges"/>`);
  if (ch === "▏") return svg(`<rect x="0" y="0" width="${w / 8}" height="${h}" fill="currentColor" shape-rendering="crispEdges"/>`);
  return null;
}

const escaped = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The page one screen is drawn on: each cell a box of its own, in the ground the palette paints.
function terminalPage(screen) {
  const count = (pick) => {
    const n = new Map();
    for (const line of screen.lines) for (const seg of line) if (pick(seg)) n.set(pick(seg), (n.get(pick(seg)) ?? 0) + seg.cells.length);
    return [...n].sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const ground = count((s) => s.bg) ?? "#ffffff";
  const ink = count((s) => s.fg) ?? "#000000";
  const fonts = join(web, "node_modules/@fontsource-variable/jetbrains-mono/files");
  const face = (subset, range) => `@font-face{font-family:"JetBrains Mono";font-weight:100 800;src:url("${pathToFileURL(join(fonts, `jetbrains-mono-${subset}-wght-normal.woff2`)).href}") format("woff2");unicode-range:${range}}`;
  const rows = screen.lines
    .map((line) => {
      const spans = line.map((seg) => {
        const style = [`color:${seg.fg || ink}`, `background:${seg.bg || ground}`, seg.bold ? "font-weight:700" : "", seg.faint ? "opacity:.6" : "", seg.under ? "text-decoration:underline" : ""].filter(Boolean).join(";");
        const glyphs = seg.cells.map((c) => (c === "" ? "" : `<i>${drawn(c) ?? escaped(c)}</i>`)).join("");
        return `<span style="${style}">${glyphs}</span>`;
      });
      return `<div>${spans.join("")}</div>`;
    })
    .join("");
  return `<!doctype html><meta charset="utf-8"><style>
${face("latin", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")}
${face("latin-ext", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF")}
html,body{margin:0;background:${ground}}
main{display:inline-block;padding:${cell.height}px ${cell.width * 2}px;font:${cell.size}px/${cell.height}px "JetBrains Mono","DejaVu Sans Mono",ui-monospace,monospace;font-variant-ligatures:none}
main div{display:flex;height:${cell.height}px}
main span{display:flex}
main i{display:block;font-style:normal;width:${cell.width}px;height:${cell.height}px;text-align:center;white-space:pre;overflow:visible}
main svg{display:block}
</style><main>${rows}</main>`;
}

// The web console's screens need its build; agk console's need none.
const pages = screens.filter((s) => wanted(s.name));
const servers = {};
if (pages.length > 0) for (const who of Object.keys(answers)) servers[who] = await serve({ scenario: answers[who], prefix: "/" });

const browser = await chromium.launch();
try {
  for (const screen of pages) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({ deviceScaleFactor: scale, viewport: { width: 1440, height: screen.height }, colorScheme: theme, locale: "en-GB", timezoneId: "UTC" });
      const page = await context.newPage();
      await page.clock.install({ time: now });
      const path = typeof screen.path === "function" ? screen.path(ids) : screen.path;
      await page.goto(servers[screen.who].url.replace(/\/$/, "") + path);
      await page.waitForLoadState("networkidle");
      for (const [act, role, name] of screen.steps ?? []) {
        if (act === "click") await page.getByRole(role, { name, exact: true }).first().click();
        await page.waitForLoadState("networkidle");
      }
      // Fonts, charts and the graph's layout settle after the answers do.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      const file = join(site, "assets", `console-${screen.name}-${theme}.png`);
      writeFileSync(file, await page.screenshot());
      console.log(`${file.slice(site.length + 1)}  ${path}`);
      await context.close();
    }
  }

  const shots = terminal.filter((s) => wanted(s.name));
  if (shots.length > 0) {
    const cells = cellsOf(shots);
    const drawnIn = mkdtempSync(join(tmpdir(), "agk-console-pages-"));
    try {
      for (const shot of shots) {
        for (const theme of ["light", "dark"]) {
          const html = join(drawnIn, `${shot.name}-${theme}.html`);
          writeFileSync(html, terminalPage(cells[`${shot.name}-${theme}`]));
          const context = await browser.newContext({ deviceScaleFactor: scale, viewport: { width: 400, height: 300 } });
          const page = await context.newPage();
          await page.goto(pathToFileURL(html).href);
          await page.evaluate(() => document.fonts.ready);
          const file = join(site, "assets", `console-${shot.name}-${theme}.png`);
          writeFileSync(file, await page.locator("main").screenshot());
          console.log(`${file.slice(site.length + 1)}  agk console ${shot.width}x${shot.height} ${(shot.keys ?? []).join(" ")}`);
          await context.close();
        }
      }
    } finally {
      rmSync(drawnIn, { recursive: true, force: true });
    }
  }
} finally {
  await browser.close();
  for (const server of Object.values(servers)) await server.close();
}
