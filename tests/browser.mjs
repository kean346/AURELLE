import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.setDefaultTimeout(20000);
async function jump(id) {
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY,
      behavior: "instant",
    });
  }, id);
  await page.waitForTimeout(300);
}
async function settle(n) {
  await page.waitForFunction(
    (n) =>
      Math.abs(Number(document.querySelector(".runway").dataset.position) - n) <
      0.002,
    n,
  );
}
try {
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () => document.querySelector(".hero-video")?.readyState >= 2,
  );
  const film = page.locator(".hero-video");
  await page.mouse.move(5, 5);
  await page
    .getByRole("button", { name: "Play portrait film", exact: true })
    .count()
    .then(async (n) => {
      if (n)
        await page
          .getByRole("button", { name: "Play portrait film", exact: true })
          .click();
    });
  const t0 = await film.evaluate((v) => v.currentTime);
  await page.waitForTimeout(700);
  assert.ok(
    (await film.evaluate((v) => v.currentTime)) > t0,
    "Actual portrait film plays",
  );
  await page.getByRole("button", { name: "Pause portrait film" }).click();
  assert.equal(await film.evaluate((v) => v.paused), true);
  await film.evaluate((v) => (v.currentTime = 3));
  await page.waitForTimeout(200);
  await page.mouse.move(800, 400);
  await page.mouse.move(1150, 400, { steps: 8 });
  await page.waitForTimeout(400);
  const right = await film.evaluate((v) => v.currentTime);
  await page.mouse.move(800, 400, { steps: 8 });
  await page.waitForTimeout(400);
  assert.ok(
    (await film.evaluate((v) => v.currentTime)) < right,
    "Mouse scrubs portrait backwards",
  );
  await page.getByRole("slider", { name: "Portrait film position" }).focus();
  await page.keyboard.press("End");
  await page.waitForTimeout(300);
  assert.ok((await film.evaluate((v) => v.currentTime)) > 8);
  console.log(
    "PASS actual local portrait MP4: playback, pause, mouse forward/reverse, keyboard scrub",
  );
  await page.screenshot({ path: "artifacts/revision-hero-1440.png" });
  assert.equal(await page.getByText("Less noise.", { exact: true }).count(), 0);
  assert.equal(
    await page.getByText("Skin. Light.", { exact: false }).count(),
    0,
  );
  assert.equal(
    await page.locator(".campaign,.philosophy,.finale,.ritual-sticky").count(),
    0,
  );
  await jump("collection");
  const stage = page.locator(".runway-stage");
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await settle(1);
  await page.keyboard.press("ArrowLeft");
  await settle(0);
  const r = await stage.boundingBox(),
    x = r.x + r.width * 0.4,
    y = r.y + r.height * 0.6;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + r.width * 0.22, y, { steps: 12 });
  await page.mouse.up();
  await settle(1);
  await stage.focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
  await settle(7);
  assert.equal(await page.locator(".runway").getAttribute("data-active"), "1");
  await page.mouse.move(x, y);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 120);
  await settle(8);
  const card = page.locator(".product-card:not([inert])").first();
  await card.locator(".favorite").click();
  assert.equal(
    await card.locator(".favorite").getAttribute("aria-pressed"),
    "true",
  );
  await card.locator(".add-product").click();
  await page.locator(".bag-button").click();
  await page.getByRole("button", { name: "Review your ritual" }).click();
  assert.match(await page.locator(".order-note").innerText(), /demonstration/);
  await page.keyboard.press("Escape");
  await stage.focus();
  await page.keyboard.press("Escape");
  assert.notEqual(
    await page.evaluate(() => document.activeElement.className),
    "runway-stage",
  );
  const sy = await page.evaluate(() => scrollY);
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, 180);
  await page.waitForTimeout(450);
  assert.ok(
    (await page.evaluate(() => scrollY)) > sy,
    "Unfocused runway no longer captures page wheel",
  );
  await jump("collection");
  await page.screenshot({ path: "artifacts/revision-collection-1440.png" });
  console.log(
    "PASS runway: original spring/loop, arrows, drag, wheel while focused, favorites, bag and Escape; normal page scroll preserved",
  );
  await jump("signature");
  await page.waitForFunction(
    () =>
      document.querySelector(".signature .product-world")?.dataset.rendered ===
      "true",
  );
  const world = page.locator(".signature .product-world");
  const camera = await world.getAttribute("data-camera");
  await page.getByRole("button", { name: "Rotate product right" }).click();
  await page.waitForTimeout(200);
  assert.notEqual(await world.getAttribute("data-camera"), camera);
  await page.getByRole("button", { name: "Reset product view" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "artifacts/revision-signature-1440.png" });
  await jump("ingredients");
  await page.locator(".serum-macro").evaluate((i) => i.decode());
  assert.ok(
    await page.locator(".serum-macro").evaluate((i) => i.naturalWidth > 1000),
  );
  assert.equal(
    await page
      .locator(".ingredients-art")
      .evaluate((el) => el.clientHeight > 400),
    true,
  );
  await page.waitForTimeout(500);
  await page.screenshot({ path: "artifacts/revision-ingredients-1440.png" });
  await jump("ritual");
  const c = page.locator(".ritual-card").first();
  await c.waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  await c.hover({ position: { x: 40, y: 50 } });
  assert.notEqual(
    await c.evaluate((el) => getComputedStyle(el).getPropertyValue("--rx")),
    "0deg",
  );
  await c.locator("button").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Add Essential Cleanser/ })
    .click();
  await page.keyboard.press("Escape");
  await page.mouse.move(1, 1);
  await page.screenshot({ path: "artifacts/revision-cards-1440.png" });
  console.log(
    "PASS detailed live 3D rotate/reset, visible texture scene, tilt cards and card-to-bag action",
  );
  await page.reload();
  assert.match(await page.locator(".bag-button").innerText(), /\([1-9]/);
  for (const size of [
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await jump("top");
    await page.waitForFunction(
      () => document.documentElement.dataset.scrolled === "false",
    );
    await page.screenshot({
      path: `artifacts/revision-hero-${size.width}.png`,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await jump("collection");
    await page.screenshot({
      path: `artifacts/revision-collection-${size.width}.png`,
    });
    await jump("ritual");
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `artifacts/revision-cards-${size.width}.png`,
    });
    if (size.width === 390) {
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: /Collection/ })
        .click();
      assert.equal(await page.getByRole("dialog").count(), 0);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await jump("top");
  assert.equal(await page.locator(".hero-video").count(), 0);
  await jump("collection");
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  assert.equal(
    await page
      .locator(".runway")
      .evaluate(
        (el) => Number(el.dataset.position) === Number(el.dataset.target),
      ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS desktop/mobile, persistent bag, reduced-motion, no runtime or console errors",
  );
} finally {
  await browser.close();
}
