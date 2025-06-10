// src/index.js
require('dotenv').config();
const readline = require('readline'); // Import modul readline

const { scrapeGoogleResults } = require('./scraper/googleScraper');
const { scrapeContent } = require('./scraper/contentScraper');
const { summarizeHeadings, suggestMetaDescription, analyzeFullTextForSubtopics, generateContentDraft } = require('./utils/textProcessor');

// Buat interface readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runOptimizer(keyword) {
    console.log(`\n--- Memulai Optimasi Konten untuk Keyword: "${keyword}" ---\n`);

    console.log('1. Mengambil hasil pencarian Google...');
    const googleResults = await scrapeGoogleResults(keyword, 1);

    if (googleResults.length === 0) {
        console.log('Tidak ada hasil Google yang ditemukan atau diblokir. Coba lagi dengan keyword lain atau cek koneksi/API Key.');
        return;
    }

    console.log(`Ditemukan ${googleResults.length} URL dari Google. Memproses konten dari beberapa URL teratas...`);
    const relevantUrls = googleResults.slice(0, 5)
                                     .map(r => r.url)
                                     .filter(url => url.startsWith('http') && !url.includes('google.com'));

    const contentDetails = [];
    for (const url of relevantUrls) {
        const detail = await scrapeContent(url);
        contentDetails.push(detail);
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    }

    console('\n--- Ringkasan Analisis Kompetitor ---\n');

    const competitorTitles = contentDetails.map(d => d.title).filter(t => t !== 'N/A');
    const competitorH1s = contentDetails.map(d => d.h1).filter(h => h !== 'N/A');
    const competitorH2s = contentDetails.flatMap(d => d.h2s);
    const competitorDescriptions = googleResults.map(r => r.description).filter(d => d !== 'N/A');
    const competitorFullTexts = contentDetails.map(d => d.fullText).filter(t => t.length > 100);

    console('Judul Artikel Kompetitor Umum:');
    competitorTitles.forEach(t => console(`- ${t}`));
    console('\nH1 Kompetitor Umum:');
    competitorH1s.forEach(h => console(`- ${h}`));
    console('\nH2 Kompetitor Umum (Top 5):');
    competitorH2s.slice(0, 5).forEach(h => console(`- ${h}`));

    console('\n--- Saran Konten Anda (Seringkas Mungkin) ---\n');

    const suggestedTitle = `Panduan Lengkap ${keyword}: Manfaat, Cara & Tips Terbaik`;
    console(`**Saran Judul Artikel:** ${suggestedTitle}`);

    const suggestedMetaDescription = suggestMetaDescription(competitorDescriptions);
    console(`**Saran Meta Deskripsi:** ${suggestedMetaDescription}`);

    const suggestedH1 = `Memahami ${keyword}: Panduan Lengkap dan Terbaru`;
    console(`**Saran H1:** ${suggestedH1}`);

    const summarizedH2Keywords = summarizeHeadings(competitorH2s);
    console(`**Saran H2:** Sertakan subtopik seperti: ${summarizedH2Keywords}`);

    if (competitorFullTexts.length > 0) {
        const suggestedSubtopics = analyzeFullTextForSubtopics(competitorFullTexts);
        console(`**Saran Subtopik Utama (dari isi artikel):** ${suggestedSubtopics}`);

        console('\n--- Draf Teks Awal (Oleh Gemini) ---');
        const promptForIntro = `Tuliskan 2 paragraf pengantar singkat dan menarik tentang "${keyword}" untuk sebuah artikel blog yang informatif. Sertakan kalimat pembuka yang kuat dan perkenalan singkat tentang apa yang akan dibahas dalam artikel. Keywords: ${suggestedSubtopics}.`;
        const introDraft = await generateContentDraft(promptForIntro);
        console(introDraft);
        console('\n*Catatan: Draf ini perlu diedit, diperiksa fakta, dan diperkaya oleh manusia.*\n');

    } else {
        console('\nTidak cukup teks lengkap dari kompetitor untuk analisis subtopik atau generasi draf.');
    }

    console('\n--- Optimasi Selesai! ---\n');
    rl.close(); // Tutup interface readline setelah selesai
}

// Interaksi Selamat Datang dan Input Keyword
console.log('##############################################');
console.log('#                                            #');
console.log('#          Selamat Datang di XseO !          #');
console.log('#                                            #');
console.log('##############################################');
console.log('\n');

rl.question('Silahkan masukkan kata kunci: ', (keyword) => {
    if (keyword.trim() === '') {
        console.log('Kata kunci tidak boleh kosong. Silahkan coba lagi.');
        rl.close();
    } else {
        runOptimizer(keyword.trim());
    }
});
