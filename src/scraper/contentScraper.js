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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        const title = $('title').text() || $('meta[property="og:title"]').attr('content') || 'N/A';
        const h1 = $('h1').first().text() || 'N/A';
        const h2s = [];
        $('h2').each((i, el) => {
            const h2Text = $(el).text().trim();
            if (h2Text) {
                h2s.push(h2Text);
            }
        });

        // --- TAMBAHAN BARU: Ekstraksi Teks Lengkap ---
        let fullText = '';
        // Kita akan mencoba beberapa selector umum untuk konten utama
        // Ini mungkin perlu disesuaikan tergantung struktur web yang diskrape
        const mainContentSelectors = [
            'article',
            'div.entry-content',
            'div.post-content',
            'div.main-content',
            'div#content',
            'body' // Fallback terakhir, bisa banyak noise
        ];

        let contentFound = false;
        for (const selector of mainContentSelectors) {
            const contentDiv = $(selector).first();
            if (contentDiv.length) {
                fullText = contentDiv.find('p').map((i, el) => $(el).text().trim()).get().join('\n');
                if (fullText.length > 500) { // Pastikan teks cukup panjang untuk dianggap valid
                    contentFound = true;
                    break;
                }
            }
        }
        // Jika tidak ada selector spesifik yang berhasil, ambil semua paragraf dari body
        if (!contentFound) {
            fullText = $('p').map((i, el) => $(el).text().trim()).get().join('\n');
        }
        // --- AKHIR TAMBAHAN BARU ---

        return {
            url: url,
            title: title,
            h1: h1,
            h2s: h2s.slice(0, 5),
            fullText: fullText // Tambahkan fullText ke output
        };

    } catch (error) {
        console.error(`[ContentScraper] Error saat scraping konten dari ${url}:`, error.message);
        return { url: url, title: 'N/A', h1: 'N/A', h2s: [], fullText: '' };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeContent };
