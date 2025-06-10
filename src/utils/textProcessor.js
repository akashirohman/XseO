// src/utils/textProcessor.js
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// --- TAMBAHAN BARU: Import Google Generative AI ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Gunakan gemini-pro untuk teks
// --- AKHIR TAMBAHAN BARU ---

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
    return sortedWords.slice(0, 5).join(', ');
}

function suggestMetaDescription(descriptions) {
    const combined = descriptions.join(' ').slice(0, 300);
    return combined.length > 150 ? combined.substring(0, 147) + '...' : combined;
}

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

    const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);

    // Filter kata kunci yang terlalu umum dan relevan
    const topKeywords = sortedWords.slice(0, 15).filter(word => {
        // Ini bisa lebih canggih dengan daftar stopwords khusus konteks
        return !['dan', 'yang', 'ini', 'adalah', 'untuk', 'pada', 'dengan', 'dari', 'bisa', 'akan'].includes(word);
    });
    
    return topKeywords.join(', ');
}

// --- FUNGSI BARU: Generasi Draf Konten dengan Gemini ---
async function generateContentDraft(prompt) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("[Gemini] GEMINI_API_KEY tidak ditemukan di .env. Lewati generasi draf konten.");
            return "Untuk generasi draf konten, tambahkan GEMINI_API_KEY Anda di file .env";
        }
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("[Gemini] Error saat generate konten:", error.message);
        return `Gagal membuat draf konten: ${error.message}. Pastikan API key valid dan kuota mencukupi.`;
    }
}
// --- AKHIR FUNGSI BARU ---


module.exports = {
    summarizeHeadings,
    suggestMetaDescription,
    analyzeFullTextForSubtopics,
    generateContentDraft // Export fungsi baru
};
