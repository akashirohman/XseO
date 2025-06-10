// src/utils/textProcessor.js
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

function summarizeHeadings(headings) {
    const commonWords = {};
    headings.forEach(h => {
        const tokens = tokenizer.tokenize(h.toLowerCase());
        tokens.forEach(token => {
            if (token.length > 2 && !natural.stopwords.check(token)) {
                commonWords[token] = (commonWords[token] || 0) + 1;
            }
        });
    });

    const sortedWords = Object.keys(commonWords).sort((a, b) => commonWords[b] - commonWords[a]);
    return sortedWords.slice(0, 5).join(', '); // Ambil 5 kata kunci teratas
}

function suggestMetaDescription(descriptions) {
    const combined = descriptions.join(' ').slice(0, 300);
    return combined.length > 150 ? combined.substring(0, 147) + '...' : combined;
}

// --- FUNGSI BARU: Analisis Teks Lengkap untuk Subtopik ---
function analyzeFullTextForSubtopics(texts) {
    const allTokens = [];
    texts.forEach(text => {
        const tokens = tokenizer.tokenize(text.toLowerCase());
        tokens.forEach(token => {
            if (token.length > 2 && !natural.stopwords.check(token)) {
                allTokens.push(token);
            }
        });
    });

    const wordCounts = {};
    allTokens.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Urutkan kata-kata berdasarkan frekuensi
    const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);

    // Ambil 10-15 kata/frasa paling sering (yang bukan kata kunci utama)
    // Ini adalah heuristik sederhana, bisa lebih canggih dengan TF-IDF
    const topKeywords = sortedWords.slice(0, 15).filter(word => !natural.JaroWinklerDistance(word, 'keyword utama', undefined, true) > 0.8);
    
    return topKeywords.join(', ');
}
// --- AKHIR FUNGSI BARU ---

module.exports = {
    summarizeHeadings,
    suggestMetaDescription,
    analyzeFullTextForSubtopics // Export fungsi baru
};
