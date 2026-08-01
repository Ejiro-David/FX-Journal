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
  await page.fill("#fMoodOpen", "Focused and patient. The setup matches my plan.");
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
  await expect(page.locator("#tradeDetailModal")).toContainText("Focused and patient");
});

test("Closing requires journal and process score", async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded" });
  await page.click('[data-screen="log"]');
  await page.selectOption("#fPair", "EURUSD");
  await page.click('#fDirectionToggle button[data-value="buy"]');
  await page.fill("#fEntryPrice", "1.12345");

  await page.click("#fSaveBtn");
  await expect(page.locator("#toast")).toContainText("opening journal");
  await expect(page.locator(".history-card")).toHaveCount(0);

  await page.fill("#fMoodOpen", "Calm and selective. This is my planned entry.");
  await page.click("#fSaveBtn");
  await expect(page.locator(".history-card")).toHaveCount(1);

  await page.locator("[data-quick-close]").click();
  await page.click('#ctOutcomeGrid button[data-outcome="win"]');
  await page.fill("#ctPnlInput", "25");
  await page.click("#ctSaveBtn");
  await expect(page.locator("#toast")).toContainText("closing journal");

  await page.fill("#ctMoodClose", "The trade felt controlled and I stayed with the plan.");
  await page.click("#ctSaveBtn");
  await expect(page.locator("#toast")).toContainText("followed all rules");

  await page.click('#ctProcessToggle button[data-process="true"]');
  await page.click("#ctSaveBtn");
  await page.click("#ctSaveBtn", { timeout: 250 }).catch(() => null);

  await expect(page.locator(".history-card")).toContainText("Rules ✓");
  await expect(page.locator("#todayTally")).toContainText("Today: 1 win / 0 losses");
  await expect(page.locator("#processAdherence")).toHaveText("100%");
  await expect(page.locator("#processScored")).toContainText("1 scored / 1 closed");
});

test("Two wins set the non-blocking day-complete state", async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded" });

  for (const [index, pair] of ["EURUSD", "GBPUSD"].entries()) {
    await page.click('[data-screen="log"]');
    await page.selectOption("#fPair", pair);
    await page.click('#fDirectionToggle button[data-value="buy"]');
    await page.fill("#fEntryPrice", index === 0 ? "1.12345" : "1.30123");
    await page.fill("#fMoodOpen", `Opening reflection ${index + 1}`);
    await page.click('#fOutcomeGrid button[data-outcome="win"]');
    await page.fill("#fPnlInput", "10");
    await page.fill("#fMoodClose", `Closing reflection ${index + 1}`);
    await page.click('#fProcessToggle button[data-process="true"]');
    await page.click("#fSaveBtn");
    await expect(page.locator(".history-card")).toHaveCount(index + 1);
  }

  await expect(page.locator("#todayTally")).toContainText("Today: 2 wins / 0 losses");
  await expect(page.locator("#circuitBreakerState")).toBeVisible();
  await expect(page.locator('.sidebar-nav-item[data-screen="log"]')).toHaveClass(/circuit-complete/);
  await expect(page.locator('.nav-fab[data-screen="log"]')).toHaveClass(/circuit-complete/);

  await page.fill("#weekBalanceInput", "10000");
  await page.click("#saveWeekBalanceBtn");
  await expect(page.locator("#weekPnl")).toHaveText("+$20.00");

  await page.locator('.sidebar-nav-item[data-screen="log"]').click();
  await expect(page.locator("#screen-log")).toHaveClass(/is-active/);
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
