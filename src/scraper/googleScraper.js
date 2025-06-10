const puppeteer = require('puppeteer');

async function scrapeGoogleResults(keyword, pages = 1) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true }); // headless: true untuk tanpa GUI browser
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 }); // Set viewport

        const results = [];

        for (let i = 0; i < pages; i++) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${i * 10}`;
            console.log(`Navigating to: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Tunggu sampai jaringan idle

            // Cek apakah ada CAPTCHA atau blokir
            const pageTitle = await page.title();
            if (pageTitle.includes('CAPTCHA') || pageTitle.includes('robot')) {
                console.error('Google blocked the request. CAPTCHA or abnormal traffic detected.');
                break; // Hentikan scraping jika diblokir
            }

            // Ekstrak URL dan judul dari hasil pencarian
            const pageResults = await page.evaluate(() => {
                const data = [];
                // Selector untuk link hasil pencarian mungkin berubah, sesuaikan jika perlu
                document.querySelectorAll('div.g > div > div > div > a').forEach(link => {
                    const href = link.href;
                    const titleElement = link.querySelector('h3');
                    const descriptionElement = link.parentNode.querySelector('div[data-sncf="1"] span'); // Selector untuk deskripsi
                    if (href && titleElement) {
                        data.push({
                            title: titleElement.innerText,
                            url: href,
                            description: descriptionElement ? descriptionElement.innerText : ''
                        });
                    }
                });
                return data;
            });
            results.push(...pageResults);

            // Tunggu sebentar sebelum halaman berikutnya untuk menghindari blokir
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        }
        return results;

    } catch (error) {
        console.error('Error during Google scraping:', error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeGoogleResults };
