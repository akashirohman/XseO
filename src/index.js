// src/index.js
require('dotenv').config();

const { scrapeGoogleResults } = require('./scraper/googleScraper');
const { scrapeContent } = require('./scraper/contentScraper');
const { summarizeHeadings, suggestMetaDescription, analyzeFullTextForSubtopics } = require('./utils/textProcessor'); // Import fungsi baru

async function runOptimizer(keyword) {
    console.log(`\n--- Memulai Optimasi Konten untuk Keyword: "${keyword}" ---\n`);

    console.log('1. Mengambil hasil pencarian Google...');
    const googleResults = await scrapeGoogleResults(keyword, 1);

    if (googleResults.length === 0) {
        console.log('Tidak ada hasil Google yang ditemukan atau diblokir.');
        return;
    }

    console.log(`Ditemukan ${googleResults.length} URL dari Google. Memproses konten dari beberapa URL teratas...`);
    // Ambil 5 URL teratas dan pastikan valid untuk scraping konten
    const relevantUrls = googleResults.slice(0, 5)
                                     .map(r => r.url)
                                     .filter(url => url.startsWith('http') && !url.includes('google.com')); // Filter URL Google sendiri

    const contentDetails = [];
    for (const url of relevantUrls) {
        const detail = await scrapeContent(url);
        contentDetails.push(detail);
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Jeda antar scraping konten
    }

    console('\n--- Ringkasan Analisis Kompetitor ---\n');

    const competitorTitles = contentDetails.map(d => d.title).filter(t => t !== 'N/A');
    const competitorH1s = contentDetails.map(d => d.h1).filter(h => h !== 'N/A');
    const competitorH2s = contentDetails.flatMap(d => d.h2s);
    const competitorDescriptions = googleResults.map(r => r.description).filter(d => d !== 'N/A');
    const competitorFullTexts = contentDetails.map(d => d.fullText).filter(t => t.length > 100); // Hanya teks yang cukup panjang

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

    // --- TAMBAHAN BARU: Saran Subtopik dari Teks Lengkap ---
    if (competitorFullTexts.length > 0) {
        const suggestedSubtopics = analyzeFullTextForSubtopics(competitorFullTexts);
        console(`**Saran Subtopik Utama (dari isi artikel):** ${suggestedSubtopics}`);
    }
    // --- AKHIR TAMBAHAN BARU ---

    console('\n--- Optimasi Selesai! ---\n');
}

const targetKeyword = process.argv[2];
if (!targetKeyword) {
    console.log('Penggunaan: node src/index.js "kata kunci target Anda"');
    console.log('Contoh: node src/index.js "manfaat kopi untuk kesehatan"');
} else {
    runOptimizer(targetKeyword);
}
