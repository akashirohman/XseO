// src/scraper/googleScraper.js
const puppeteer = require('puppeteer');

async function scrapeGoogleResults(keyword, pages = 1) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Pastikan ini true saat di VPS
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Penting untuk VPS
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        const results = [];

        for (let i = 0; i < pages; i++) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${i * 10}`;
            console.log(`[GoogleScraper] Mengunjungi: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            const pageTitle = await page.title();
            if (pageTitle.includes('CAPTCHA') || pageTitle.includes('robot')) {
                console.error('[GoogleScraper] Google memblokir permintaan. Terdeteksi CAPTCHA atau trafik tidak normal.');
                break;
            }

            const pageResults = await page.evaluate(() => {
                const data = [];
                document.querySelectorAll('div.g').forEach(resultDiv => {
                    const linkElement = resultDiv.querySelector('div > div > div > a');
                    if (linkElement) {
                        const titleElement = linkElement.querySelector('h3');
                        // Google sering mengubah selector untuk deskripsi. Coba beberapa kemungkinan.
                        const descriptionElement = resultDiv.querySelector('div[data-sncf="1"] span') || // Umum
                                                 resultDiv.querySelector('div.lJ9Rpe div.lyLd8b span') || // Varian lain
                                                 resultDiv.querySelector('.VwiC3b span') || // Varian lain
                                                 resultDiv.querySelector('.st'); // Varian lama
                        
                        data.push({
                            title: titleElement ? titleElement.innerText : 'N/A',
                            url: linkElement.href,
                            description: descriptionElement ? descriptionElement.innerText : 'N/A'
                        });
                    }
                });
                return data;
            });
            results.push(...pageResults);

            // Jeda singkat antar halaman untuk menghindari pemblokiran
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
        }
        return results;

    } catch (error) {
        console.error('[GoogleScraper] Error saat scraping Google:', error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeGoogleResults };
