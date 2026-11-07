import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.TEST_BASE_URL || "http://localhost:5173";
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(base);
  await page.evaluate(() =>
    window.scrollTo({
      top: document.getElementById("collection").offsetTop,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(300);
  const box = await page.locator(".runway-stage").boundingBox();
  const session = await context.newCDPSession(page);
  const x = box.x + 60,
    y = Math.min(450, box.y + box.height * 0.6);
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
  await page.waitForFunction(
    () => document.querySelector(".runway").dataset.active === "1",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
  );
  await page.locator(".exit-runway").tap();
  await page.waitForFunction(() => location.hash === "#ritual");
  console.log("PASS real mobile touch drag, touch exit link, no page overflow");
  await context.close();
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() =>
    Object.defineProperty(window, "Worker", { value: undefined }),
  );
  const manifest = JSON.parse(readFileSync("public/media/manifest.json"));
  manifest.story.src = "/fallback-film.mp4";
  manifest.story.strategy = "frames";
  await p.route("**/media/manifest.json", (r) => r.fulfill({ json: manifest }));
  await p.route("**/fallback-film.mp4", async (route) => {
    const body = readFileSync("artifacts/test-single-gop.mp4"),
      range = route.request().headers().range;
    const match = range?.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = Number(match[1]),
        end = match[2] ? Number(match[2]) : body.length - 1;
      return route.fulfill({
        status: 206,
        body: body.subarray(start, end + 1),
        contentType: "video/mp4",
        headers: {
          "Content-Range": `bytes ${start}-${end}/${body.length}`,
          "Accept-Ranges": "bytes",
        },
      });
    }
    return route.fulfill({ body, contentType: "video/mp4" });
  });
  await p.goto(base);
  await p.evaluate(() => {
    const el = document.getElementById("story");
    window.scrollTo({
      top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.5,
      behavior: "instant",
    });
  });
  await p.waitForFunction(
    () =>
      document.querySelector(".frame-film canvas")?.dataset.ready === "true",
    null,
    { timeout: 30000 },
  );
  assert.equal(
    await p.locator(".frame-film canvas").getAttribute("data-pipeline"),
    "capture",
  );
  console.log(
    "PASS missing Worker: sequential native frame capture fallback, canvas ready",
  );
  await p.evaluate(() =>
    window.scrollTo({
      top: document.getElementById("signature").offsetTop,
      behavior: "instant",
    }),
  );
  await p.waitForFunction(
    () =>
      document.querySelector(".signature .product-world")?.dataset.rendered ===
      "true",
  );
  await p
    .locator(".signature canvas")
    .evaluate((c) =>
      c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await p.locator(".signature .webgl-fallback").waitFor({ state: "visible" });
  assert.match(
    await p.locator(".signature .webgl-fallback").innerText(),
    /3D view unavailable/,
  );
  console.log("PASS WebGL context-loss fallback visible and honestly labeled");
  await p.close();
} finally {
  await browser.close();
}
