import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.TEST_BASE_URL || "http://localhost:5173";
try {
  const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    }),
    p = await ctx.newPage();
  await p.goto(base);
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() =>
    window.scrollTo({
      top: document.getElementById("collection").offsetTop,
      behavior: "instant",
    }),
  );
  await p.waitForTimeout(650);
  const r = await p.locator(".runway-stage").boundingBox(),
    session = await ctx.newCDPSession(p),
    x = r.x + 50,
    y = Math.min(420, r.y + r.height * 0.6);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 10; i++)
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + i * 18, y }],
    });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await p.waitForFunction(
    () => document.querySelector(".runway").dataset.active === "1",
  );
  await p.locator(".exit-runway").tap();
  await p.waitForFunction(() => location.hash === "#ritual");
  await p.locator(".ritual-card button").first().tap();
  await p.getByRole("dialog").waitFor();
  await p.getByRole("button", { name: "Close dialog", exact: true }).tap();
  assert.ok(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  console.log(
    "PASS mobile touch: drag, runway exit, interactive card tap and close, no overflow",
  );
  await ctx.close();
  const q = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await q.goto(base);
  await q.evaluate(() =>
    window.scrollTo({
      top: document.getElementById("signature").offsetTop,
      behavior: "instant",
    }),
  );
  await q.waitForFunction(
    () =>
      document.querySelector(".signature .product-world")?.dataset.rendered ===
      "true",
  );
  await q
    .locator(".signature canvas")
    .evaluate((c) =>
      c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await q.locator(".webgl-fallback").waitFor({ state: "visible" });
  assert.match(
    await q.locator(".webgl-fallback").innerText(),
    /Studio render shown/,
  );
  console.log(
    "PASS WebGL context-loss: high-resolution studio-render fallback",
  );
  await q.close();
  const f = await browser.newPage();
  await f.route("**/hero-portrait.mp4", (r) => r.abort());
  await f.goto(base);
  await f.waitForTimeout(500);
  await f.waitForFunction(() => !document.querySelector(".hero-video"));
  assert.equal(
    await f
      .locator(".hero-poster")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
    true,
  );
  assert.equal(
    await f
      .locator(".hero")
      .getByText(/pending|missing|DEV/i)
      .count(),
    0,
  );
  console.log(
    "PASS video-error fallback: visible poster, no missing-asset notice in product UI",
  );
  await f.close();
} finally {
  await browser.close();
}
