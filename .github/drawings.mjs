// Draws what the site shows in HTML rather than in pictures, and refuses what spills: the Design
// system chapter's drawings of the console, at three widths on both grounds, and every page at a
// phone's width and a desktop's. Nothing else looks at them in a browser, and a drawing of the
// console whose words run out of their tile says the opposite of what the chapter asks.
//
//     node .github/drawings.mjs ../agentiik out/
//
// Playwright comes from the console's own dependencies in the agentiik checkout named, as for
// console-shots.mjs, so that nothing here pins a version of it. Each drawing is written to the
// directory named, as drawing-<n>-<width>-<ground>.png, to be looked at; the run fails where an
// element of a drawing lies outside the box that holds it, or where a page scrolls sideways.
// Words cut short by an ellipsis are listed but do not fail it, since a drawing may mean to cut.

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const engine = resolve(process.argv[2] ?? "../agentiik");
const out = resolve(process.argv[3] ?? "drawings");
const site = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { chromium } = await import(pathToFileURL(join(engine, "console/node_modules/@playwright/test/index.mjs")).href);

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const failures = [];
const notes = [];

// The boxes an element of a drawing is held in: what it must not spill out of.
const boxes = ".ds-win,.ds-sheet,.ds-side,.ds-tile,.ds-row,.ds-lr,.ds-r,td,.ds-detail,.ds-dhead,.ds-kv,.ds-log,.ds-reason,.ds-palette,.ds-pin,.ds-it,.ds-pfoot,.ds-bar,.ds-ptitle,.ds-acts,.ds-filters,.ds-canvas,.ds-timeline,.ds-content,.ds-crumbs,.ds-tl,.ds-depth > div,.ds-m,.ds-live,.ds-bento,.ds-nav,.ds-tabs,.ds-insp,.ds-left";

for (const width of [1440, 1024, 390]) {
  for (const ground of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: ground });
    await page.goto(pathToFileURL(join(site, "docs/index.html")).href + "#design");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const figures = await page.$$("#design figure.ds-figure");
    for (let n = 0; n < figures.length; n++) {
      await figures[n].scrollIntoViewIfNeeded();
      await figures[n].screenshot({ path: join(out, `drawing-${n}-${width}-${ground}.png`), animations: "disabled" });
    }
    if (ground === "light") {
      const found = await page.evaluate((boxes) => {
        const spills = [];
        const cut = [];
        const name = (el) => (typeof el.className === "string" ? el.className : el.className.baseVal) || el.tagName.toLowerCase();
        const text = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48);
        for (const el of document.querySelectorAll("#design .ds *")) {
          if (el.closest(".ds-sprite")) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const box = el.parentElement.closest(boxes);
          if (box) {
            const b = box.getBoundingClientRect();
            const over = Math.max(r.right - b.right, b.left - r.left);
            if (over > 0.5) spills.push(`${name(el)} spills ${Math.round(over)}px out of ${name(box)}: "${text(el)}"`);
          }
          const s = getComputedStyle(el);
          if (el.scrollWidth > el.clientWidth + 1 && (s.overflowX === "hidden" || s.textOverflow === "ellipsis")) cut.push(`${name(el)} cuts ${el.scrollWidth - el.clientWidth}px: "${text(el)}"`);
        }
        return { spills: [...new Set(spills)], cut: [...new Set(cut)] };
      }, boxes);
      for (const s of found.spills) failures.push(`${width}px: ${s}`);
      for (const c of found.cut) notes.push(`${width}px: ${c}`);
    }
    await page.close();
  }
}

// Every page, at a phone's width and a desktop's: none scrolls sideways, whatever it holds.
for (const path of ["index.html", "docs/index.html", "docs/roadmap/index.html", "legal/index.html"]) {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(pathToFileURL(join(site, path)).href);
    await page.evaluate(() => document.fonts.ready);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (wide > 0) failures.push(`${path} at ${width}px scrolls ${wide}px sideways`);
    await page.close();
  }
}

await browser.close();
for (const n of notes) console.log(`cut short   ${n}`);
for (const f of failures) console.log(`spills      ${f}`);
console.log(`${failures.length} spilling, ${notes.length} cut short, drawings in ${out}`);
process.exit(failures.length ? 1 : 0);
