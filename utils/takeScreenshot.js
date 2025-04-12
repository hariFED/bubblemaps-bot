const puppeteer = require('puppeteer-core');

async function takeScreenshot(address, chain) {
    const url = `https://legacy.bubblemaps.io/${chain}/token/${address}`;
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        await page.waitForTimeout(3000); // Let animations/rendering settle

        // Optional: Wait for a selector, but with catch
        try {
            await page.waitForSelector('canvas', { timeout: 10000 });
        } catch (err) {
            console.warn(`⚠️ Canvas not found on ${chain}, proceeding anyway.`);
        }

        const screenshotPath = `./screenshots/${address}-${chain}.png`;
        await page.screenshot({ path: screenshotPath });

        await browser.close();
        return screenshotPath;

    } catch (err) {
        await browser.close();
        throw err;
    }
}

module.exports = { takeScreenshot };
