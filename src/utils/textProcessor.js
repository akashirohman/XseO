// src/utils/textProcessor.js
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

function summarizeHeadings(headings) {
    const commonWords = {};
    headings.forEach(h => {
        const tokens = tokenizer.tokenize(h.toLowerCase());
        tokens.forEach(token => {
            // Filter kata-kata umum (stopwords) dan kata pendek
            if (token.length > 2 && !natural.stopwords.check(token)) {
                commonWords[token] = (commonWords[token] || 0) + 1;
            }
        });
    });

    // Urutkan kata-kata berdasarkan frekuensi
    const sortedWords = Object.keys(commonWords).sort((a, b) => commonWords[b] - commonWords[a]);

    // Ambil beberapa kata kunci teratas untuk ringkasan
    return sortedWords.slice(0, 5).join(', ');
}

function suggestMetaDescription(descriptions) {
    // Gabungkan beberapa deskripsi teratas dan ambil bagian penting
    const combined = descriptions.join(' ').slice(0, 300); // Batasi panjang
    // Ini bisa lebih canggih dengan NLP, tapi untuk ringkas, ini cukup
    return combined.length > 150 ? combined.substring(0, 147) + '...' : combined;
}

module.exports = {
    summarizeHeadings,
    suggestMetaDescription
};
