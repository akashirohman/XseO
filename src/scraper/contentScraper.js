// src/scraper/contentScraper.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeContent(url) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        console.log(`[ContentScraper] Mengunjungi: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Tunggu DOM saja

        const html = await page.content();
        const $ = cheerio.load(html);

        const title = $('title').text() || $('meta[property="og:title"]').attr('content') || 'N/A';
        const h1 = $('h1').first().text() || 'N/A';
        const h2s = [];
        $('h2').each((i, el) => {
            const h2Text = $(el).text().trim();
            if (h2Text) { // Pastikan tidak ada H2 kosong
                h2s.push(h2Text);
            }
        });

        return {
            url: url,
            title: title,
            h1: h1,
            h2s: h2s.slice(0, 5) // Ambil maksimal 5 H2 teratas untuk ringkasan
        };

    } catch (error) {
        console.error(`[ContentScraper] Error saat scraping konten dari ${url}:`, error.message);
        return { url: url, title: 'N/A', h1: 'N/A', h2s: [] };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeContent };
