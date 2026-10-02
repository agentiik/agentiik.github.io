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

import { readFileSync, writeFileSync } from "node:fs";
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

// The same answers with every identifier a ULID of its instant, those of no record a day before.
function identified(text, random, ids) {
  const at = instants(JSON.parse(text));
  return text.replace(ULID, (old) => {
    if (!ids.has(old)) ids.set(old, ulid(at.get(old) ?? now.getTime() - 86_400_000, random));
    return ids.get(old);
  });
}

// finance as alice's to share: her permissions there an owner's, and the grants of a finance team.
function owned(scenario, random) {
  const me = scenario["GET /api/v1/me"].body;
  me.permissions.finance = ["workflow:read", "workflow:run", "workflow:write", "workflow:delete", "run:read", "run:read_data", "secret:use", "secret:write", "grant:manage"];
  const grant = (principal, gives, by, at, more = {}) => ({ id: ulid(Date.parse(at), random), principal, scope: "finance", ...gives, granted_by: by, granted_at: at, ...more });
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
  return dana;
}

function scenarios() {
  const random = generator(20261002);
  const ids = new Map();
  const read = (who) => JSON.parse(identified(readFileSync(join(web, "tests/fixtures", `${who}.json`), "utf8"), random, ids));
  const alice = owned(read("alice"), random);
  return { ids, alice, dana: administered(read("dana"), alice) };
}

const { ids, ...answers } = scenarios();
const servers = {};
for (const who of Object.keys(answers)) servers[who] = await serve({ scenario: answers[who], prefix: "/" });

const browser = await chromium.launch();
try {
  for (const screen of screens) {
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
} finally {
  await browser.close();
  for (const server of Object.values(servers)) await server.close();
}
