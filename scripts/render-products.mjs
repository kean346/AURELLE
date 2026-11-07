import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: [
    "--no-sandbox",
    "--enable-webgl",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 1300 } });
page.on("pageerror", (e) => console.error(e));
await page.goto("http://localhost:5173/?studio");
await page.waitForFunction(() => typeof window.renderProduct === "function");
await page.evaluate(() => document.fonts.ready);
for (let i = 0; i < 6; i++) {
  const data = await page.evaluate((i) => window.renderProduct(i), i);
  writeFileSync(
    `public/media/raw-product-${i}.png`,
    Buffer.from(data.split(",")[1], "base64"),
  );
}
await browser.close();
