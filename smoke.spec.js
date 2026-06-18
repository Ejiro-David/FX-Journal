const { test, expect } = require("@playwright/test");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 5174;
const TEST_IMAGE = path.join(ROOT, "__smoke_upload.png");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

let server;

test.beforeAll(async () => {
  fs.writeFileSync(
    TEST_IMAGE,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2w2mQAAAAASUVORK5CYII=",
      "base64"
    )
  );

  server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const safePath = reqPath === "/" ? "/index.html" : reqPath;
    const absolute = path.join(ROOT, safePath);

    if (!absolute.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(absolute, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType(absolute) });
      res.end(data);
    });
  });

  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  if (fs.existsSync(TEST_IMAGE)) {
    fs.unlinkSync(TEST_IMAGE);
  }
});

test("Edge Forge logs a trade and opens detail", async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
  await page.click('[data-screen="log"]');

  await page.selectOption("#fPair", "EURUSD");
  await page.click('#fDirectionToggle button[data-value="buy"]');
  await page.fill("#fEntryPrice", "1.12345");
  await page.fill("#fLotSize", "0.01");
  await page.click('#fStrategyToggle button[data-strategy="SMC"]');
  await page.locator("#fSessionPills .chip", { hasText: "London" }).click();
  await page.locator("#fConfluenceList .confluence-item").first().click();
  await page.setInputFiles("#fImageInput", TEST_IMAGE);
  await page.fill("#fNote", "smoke run");

  await page.click("#fSaveBtn");
  await page.click("#fSaveBtn", { timeout: 250 }).catch(() => null);

  await expect(page.locator("#toast")).toContainText(/saved/i);
  await expect(page.locator(".history-card")).toHaveCount(1);
  await expect(page.locator(".history-card").first()).toContainText("EURUSD BUY");

  await page.locator(".history-card").first().click();
  await expect(page.locator("#tradeDetailModal")).toBeVisible();
  await expect(page.locator("#tradeDetailModal")).toContainText("EURUSD");
  await expect(page.locator("#tradeDetailModal")).toContainText("buy");
});

test("Before and after screenshots can both be selected", async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
  await page.click('[data-screen="log"]');

  await page.setInputFiles("#fImageInput", TEST_IMAGE);
  await expect(page.locator("#fBeforePreviewWrap")).toBeVisible();
  await expect(page.locator("#fAfterWrap")).toBeVisible();

  await page.setInputFiles("#fAfterInput", TEST_IMAGE);
  await expect(page.locator("#fBeforePreviewWrap")).toBeVisible();
  await expect(page.locator("#fAfterPreviewWrap")).toBeVisible();
});
