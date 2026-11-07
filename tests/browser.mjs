import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(20000);
page.on("pageerror", (e) => errors.push(e.message));
const wait = (ms) => page.waitForTimeout(ms);
const jump = async (id, fraction = 0) => {
  await page.evaluate(
    ({ id, fraction }) => {
      const el = document.getElementById(id);
      const rect = el.getBoundingClientRect();
      window.scrollTo({
        top:
          scrollY +
          rect.top +
          Math.max(0, rect.height - innerHeight) * fraction,
        behavior: "instant",
      });
    },
    { id, fraction },
  );
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.scrolled ===
      String(scrollY > innerHeight * 0.8),
  );
  await wait(100);
};
const position = () =>
  page.locator(".runway").getAttribute("data-position").then(Number);
async function settle(target) {
  await page.waitForFunction(
    (t) =>
      Math.abs(Number(document.querySelector(".runway").dataset.position) - t) <
      0.002,
    target,
    { timeout: 20000 },
  );
}
try {
  await page.goto(base);
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(() => document.fonts.ready);
  await wait(700);
  await page.screenshot({ path: "artifacts/home-1440.png" });
  assert.equal(
    await page.locator(".hero-video").count(),
    0,
    "No nonexistent film or fake autoplay",
  );
  await jump("collection");
  const stage = page.locator(".runway-stage");
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await settle(1);
  await page.keyboard.press("ArrowLeft");
  await settle(0);
  const rect = await stage.boundingBox();
  const x = rect.x + rect.width * 0.46,
    y = rect.y + rect.height * 0.6;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + rect.width * 0.22, y, { steps: 12 });
  await page.mouse.up();
  await settle(1);
  // Rail is derived from p*2: cleanser is the first of three visible cards at p=1.
  assert.equal(await page.locator(".product-card").count(), 12);
  const firstVisible = await page.locator(".product-card").evaluateAll(
    (cards) =>
      cards
        .filter((c) => !c.inert)
        .map((c) => ({ i: c.dataset.product, y: c.getBoundingClientRect().y }))
        .sort((a, b) => a.y - b.y)[0],
  );
  assert.equal(firstVisible.i, "1");
  const current = await position();
  await stage.focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
  await settle(current + 6);
  assert.equal(await page.locator(".runway").getAttribute("data-active"), "1");
  await page.mouse.move(rect.x + rect.width * 0.6, y);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 120);
  await settle(8);
  // Focus a distant sprite by clicking its visible screen position.
  const prior = await position();
  const sprite = page.locator('.product-sprite[data-i="4"]');
  const sr = await sprite.boundingBox();
  await page.mouse.click(sr.x + sr.width * 0.5, sr.y + sr.height * 0.35);
  await wait(2000);
  assert.notEqual(await position(), prior, "Click-to-focus changes p");
  const favorite = page.locator(".product-card:not([inert]) .favorite").first();
  await favorite.click();
  assert.equal(await favorite.getAttribute("aria-pressed"), "true");
  await page.locator(".product-card:not([inert]) .add-product").first().click();
  assert.match(await page.locator(".bag-button").innerText(), /\([12]\)/);
  await page.locator(".bag-button").click();
  await page.getByRole("button", { name: "Review your ritual" }).click();
  assert.match(
    await page.locator(".order-note").innerText(),
    /demonstration store/,
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.reload();
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  assert.match(
    await page.locator(".bag-button").innerText(),
    /\([12]\)/,
    "Bag survives refresh",
  );
  await jump("signature");
  const world = page.locator(".signature .product-world");
  await page.waitForFunction(
    () =>
      document.querySelector(".signature .product-world")?.dataset.rendered ===
      "true",
  );
  const cam = await world.getAttribute("data-camera");
  await page.getByRole("button", { name: "Rotate product right" }).click();
  await wait(300);
  assert.notEqual(await world.getAttribute("data-camera"), cam);
  await page.getByRole("button", { name: "Reset product view" }).click();
  await wait(300);
  await page.screenshot({ path: "artifacts/signature-1440.png" });
  await jump("story", 0.3);
  await page.waitForFunction(
    () =>
      document.querySelector(".story .product-world")?.dataset.rendered ===
      "true",
  );
  const r1 = Number(
    await page.locator(".story .product-world").getAttribute("data-rotation"),
  );
  await jump("story", 0.75);
  await wait(200);
  const r2 = Number(
    await page.locator(".story .product-world").getAttribute("data-rotation"),
  );
  assert.ok(r2 > r1);
  await jump("story", 0.3);
  await wait(200);
  const r3 = Number(
    await page.locator(".story .product-world").getAttribute("data-rotation"),
  );
  assert.ok(Math.abs(r3 - r1) < 0.08, "3D scroll orbit reverses");
  await page.screenshot({ path: "artifacts/story-1440.png" });
  await jump("ritual", 0.12);
  assert.match(await page.locator(".ritual-time").innerText(), /MORNING/);
  await jump("ritual", 0.8);
  assert.match(await page.locator(".ritual-time").innerText(), /EVENING/);
  await jump("ritual", 0.12);
  assert.match(await page.locator(".ritual-time").innerText(), /MORNING/);
  await jump("journal");
  await page.screenshot({ path: "artifacts/journal-1440.png" });
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await page.locator("#email").fill("test@example.com");
  await page
    .getByRole("button", { name: "Save interest", exact: true })
    .click();
  assert.match(
    await page.locator(".newsletter-note").innerText(),
    /No email was sent/,
  );
  await page.getByRole("button", { name: "Get in touch" }).click();
  await page.locator('input[name="name"]').fill("Test");
  await page
    .getByRole("dialog")
    .locator('input[name="email"]')
    .fill("test@example.com");
  await page.locator("textarea").fill("A ritual enquiry.");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download enquiry draft" }).click();
  assert.equal((await download).suggestedFilename(), "aurelle-enquiry.txt");
  await page.keyboard.press("Escape");
  console.log(
    "PASS desktop: runway arrows / drag / wheel / click / loop / rail sync, favorites, bag persistence, 3D rotate/reset, reversible story and ritual, newsletter/contact demo",
  );
  for (const size of [
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(
      () =>
        document.documentElement.dataset.scrolled ===
        String(scrollY > innerHeight * 0.8),
    );
    await wait(300);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({ path: `artifacts/home-${size.width}.png` });
    await jump("collection");
    await wait(300);
    await page.screenshot({ path: `artifacts/runway-${size.width}.png` });
    if (size.width === 390) {
      assert.equal(
        await page
          .locator(".product-card")
          .first()
          .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
        160,
      );
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      assert.equal(await page.getByRole("dialog").count(), 1);
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: /Collection/ })
        .click();
      assert.equal(await page.getByRole("dialog").count(), 0);
    }
  }
  console.log(
    "PASS layout: 1920×1080 and 390×844, horizontal mobile rail, mobile menu, no horizontal overflow",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await jump("collection");
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.scrolled ===
      String(scrollY > innerHeight * 0.8),
  );
  await wait(100);
  const pd = await page.locator(".runway").evaluate((e) => e.dataset);
  assert.ok(Math.abs(Number(pd.position) - Number(pd.target)) < 0.0001);
  console.log("PASS reduced motion: runway jumps directly to target");
  // Inject local test patterns only into this test page; never ship fixture films as human motion.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const manifest = JSON.parse(readFileSync("public/media/manifest.json"));
  manifest.hero.src = "/test-seek.mp4";
  manifest.story.src = "/test-single-gop.mp4";
  manifest.story.strategy = "seek";
  await page.route("**/media/manifest.json", (route) =>
    route.fulfill({ json: manifest }),
  );
  async function serveFilm(route, path) {
    const body = readFileSync(path),
      range = route.request().headers().range;
    const match = range?.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = Number(match[1]),
        end = match[2] ? Number(match[2]) : body.length - 1;
      await route.fulfill({
        status: 206,
        body: body.subarray(start, end + 1),
        contentType: "video/mp4",
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${start}-${end}/${body.length}`,
          "Content-Length": String(end - start + 1),
        },
      });
    } else
      await route.fulfill({
        body,
        contentType: "video/mp4",
        headers: { "Accept-Ranges": "bytes" },
      });
  }
  await page.route("**/test-seek.mp4", (route) =>
    serveFilm(route, "artifacts/test-seek.mp4"),
  );
  await page.route("**/test-single-gop.mp4", (route) =>
    serveFilm(route, "artifacts/test-single-gop.mp4"),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await page.waitForFunction(
    () => document.querySelector(".hero-video")?.readyState >= 2,
  );
  assert.equal(
    await page.locator(".hero-video").evaluate((v) => v.paused),
    true,
  );
  await page.mouse.move(400, 360);
  await page.mouse.move(1000, 360, { steps: 12 });
  await wait(500);
  const time = await page.locator(".hero-video").evaluate((v) => v.currentTime);
  assert.ok(time > 0.5);
  await page.mouse.move(500, 360, { steps: 12 });
  await wait(500);
  assert.ok(
    (await page.locator(".hero-video").evaluate((v) => v.currentTime)) < time,
  );
  await page.getByRole("slider", { name: "Portrait film position" }).focus();
  await page.keyboard.press("End");
  await wait(400);
  assert.ok(
    (await page.locator(".hero-video").evaluate((v) => v.currentTime)) > 2.5,
  );
  await jump("story", 0.75);
  await page.waitForFunction(
    () => document.querySelector(".frame-film video")?.currentTime > 2,
  );
  const storyTime = await page
    .locator(".frame-film video")
    .evaluate((v) => v.currentTime);
  await jump("story", 0.2);
  await page.waitForFunction(
    (t) => document.querySelector(".frame-film video").currentTime < t,
    storyTime,
  );
  console.log(
    "PASS film fixtures: no autoplay, mouse forward/reverse, accessible slider, reversible scroll seeking",
  );
  manifest.story.strategy = "frames";
  await page.reload();
  await jump("story", 0.5);
  await page.waitForFunction(
    () =>
      document.querySelector(".frame-film canvas")?.dataset.ready === "true",
    null,
    { timeout: 30000 },
  );
  assert.equal(
    await page.locator(".frame-film canvas").getAttribute("data-pipeline"),
    "webcodecs",
  );
  await page.waitForFunction(
    () =>
      Number(document.querySelector(".frame-film canvas")?.dataset.frames) >=
      96,
  );
  const hash = () =>
    page
      .locator(".frame-film canvas")
      .evaluate((c) => c.toDataURL().slice(-1000));
  const h1 = await hash();
  await jump("story", 0.75);
  await wait(700);
  const h2 = await hash();
  assert.notEqual(h1, h2);
  await jump("story", 0.2);
  await wait(700);
  const h3 = await hash();
  assert.notEqual(h2, h3);
  console.log(
    "PASS single-keyframe WebCodecs pipeline: demux, software decode, bounded cache, canvas forward/reverse",
  );
  assert.deepEqual(errors, []);
  console.log("PASS no browser runtime errors");
} finally {
  await browser.close();
}
