const { test, expect } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 5174;
const TEST_IMAGE = path.join(ROOT, '__smoke_upload.png');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

let server;

test.beforeAll(async () => {
  fs.writeFileSync(
    TEST_IMAGE,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2w2mQAAAAASUVORK5CYII=',
      'base64'
    )
  );

  server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = reqPath === '/' ? '/index.html' : reqPath;
    const absolute = path.join(ROOT, safePath);

    if (!absolute.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(absolute, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(absolute) });
      res.end(data);
    });
  });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  if (fs.existsSync(TEST_IMAGE)) {
    fs.unlinkSync(TEST_IMAGE);
  }
});

test('V4 smoke flow works end-to-end', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });

  await page.selectOption('#pair', 'EURUSD');
  await page.selectOption('#direction', 'Buy');
  await page.fill('#lotSize', '0.010');
  await page.locator('#sessionChips .chip', { hasText: 'London' }).click();
  await page.selectOption('#strategy', 'ICC');

  await page.waitForSelector('input[name="createConfluence"]');
  await page.check('input[name="createConfluence"]');
  await page.setInputFiles('#beforeFile', TEST_IMAGE);
  await page.fill('#note', 'smoke run');
  await page.click('#saveBtn');

  await expect(page.locator('#toast')).toContainText(/trade saved/i);

  await page.click('#history-card > .summary');
  await page.click('#historyTabOpen');
  await expect(page.locator('.group-title.open')).toContainText(/open trades/i);

  await page.click('#viewList');
  await page.locator('.trade-row[role="button"]').first().click();
  await page.waitForSelector('#trade-detail-modal', { state: 'visible' });
  await page.selectOption('#detailCloseOutcome', 'Full Win');
  await page.fill('#detailClosePnl', '12.50');
  await page.setInputFiles('#detailCloseAfterFile', TEST_IMAGE);
  await page.click('#detailCloseBtn');

  await expect(page.locator('#trade-detail-modal')).toContainText(/status/i);
  await expect(page.locator('#trade-detail-modal')).toContainText(/closed/i);
  await page.click('#detail-modal-close');
  await page.waitForSelector('#trade-detail-modal', { state: 'hidden' });
  await page.click('#historyTabClosed');
  await expect(page.locator('.group-title')).toContainText(/closed trades/i);

  await page.click('#analytics-card > .summary');
  for (const tab of ['performance', 'risk', 'confluence', 'sessions', 'market', 'behavior']) {
    await page.click(`.analytics-tab[data-tab="${tab}"]`);
    await expect(page.locator('.stats-grid .stat').first()).toBeVisible();
  }
});
