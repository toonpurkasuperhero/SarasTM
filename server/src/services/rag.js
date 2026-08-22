const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const supabase = require('../db/supabase');
const { generateEmbedding, generateHSNReasoning } = require('./gemini');

let isInitialized = false;

async function initializeRAG() {
  if (isInitialized) return;
  const { count } = await supabase.from('hsn_codes').select('*', { count: 'exact', head: true });
  if (count > 0) { isInitialized = true; return; }

  const csvPath = path.join(__dirname, '../../data/hsn_handicrafts.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('HSN CSV not found — skipping RAG init');
    return;
  }

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  const batchSize = 10;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const records = [];

    for (const row of batch) {
      const text = `${row.code} ${row.description} ${row.category || ''}`;
      const embedding = await generateEmbedding(text);
      records.push({ code: row.code, description: row.description, category: row.category, embedding });
    }

    await supabase.from('hsn_codes').insert(records);
    await new Promise((r) => setTimeout(r, 500));
  }

  isInitialized = true;
  console.log('HSN RAG initialized with', rows.length, 'entries');
}

// Keyword-based offline HSN lookup for when embeddings are unavailable
const KEYWORD_HSN = [
  { keywords: ['silk', 'saree', 'sari', 'kanchipuram', 'banarasi'], code: '50072000', description: 'Woven fabrics of silk or silk waste', confidence: 'high' },
  { keywords: ['painting', 'madhubani', 'warli', 'canvas', 'art', 'pattachitra', 'miniature'], code: '97010000', description: 'Original paintings, drawings and pastels', confidence: 'high' },
  { keywords: ['pottery', 'ceramic', 'clay', 'terracotta', 'blue pottery'], code: '69149000', description: 'Other ceramic articles', confidence: 'high' },
  { keywords: ['wood', 'wooden', 'walnut', 'carving', 'carved', 'furniture'], code: '44219090', description: 'Other articles of wood', confidence: 'high' },
  { keywords: ['cotton', 'fabric', 'textile', 'weave', 'handloom', 'dhoti'], code: '52089000', description: 'Other woven fabrics of cotton', confidence: 'high' },
  { keywords: ['jewellery', 'jewelry', 'silver', 'gold', 'necklace', 'bracelet', 'ring'], code: '71171990', description: 'Other imitation jewellery', confidence: 'high' },
  { keywords: ['shawl', 'pashmina', 'wool', 'embroidery', 'kashmiri'], code: '62149010', description: 'Shawls, scarves, mufflers — of wool', confidence: 'high' },
  { keywords: ['brass', 'bronze', 'metal', 'dhokra', 'statue', 'idol'], code: '83062990', description: 'Statuettes and ornaments, of base metal', confidence: 'high' },
  { keywords: ['basket', 'bamboo', 'cane', 'rattan', 'wicker', 'jute'], code: '46021990', description: 'Other basketwork and wickerwork', confidence: 'medium' },
  { keywords: ['leather', 'bag', 'purse', 'sandal', 'shoe', 'footwear'], code: '42029900', description: 'Other containers of leather', confidence: 'medium' },
];

function keywordHSNLookup(description) {
  const lower = description.toLowerCase();
  for (const entry of KEYWORD_HSN) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return { code: entry.code, description: entry.description, confidence: entry.confidence, explanation: `Matched keywords in: "${description}"` };
    }
  }
  return { code: '97060000', description: 'Antiques of an age exceeding one hundred years / Handicrafts (general)', confidence: 'low', explanation: 'No specific match found — defaulting to general handicrafts code' };
}

async function findHSNCode(description) {
  // If embedding is available, try vector search first
  const queryEmbedding = await generateEmbedding(description);

  if (queryEmbedding) {
    try {
      await initializeRAG();
      const { data: matches, error } = await supabase.rpc('match_hsn_codes', {
        query_embedding: queryEmbedding,
        match_count: 5,
      });

      if (!error && matches?.length) {
        return await generateHSNReasoning(description, matches);
      }
    } catch (e) {
      console.warn('Vector HSN search failed:', e.message);
    }
  }

  // Offline keyword fallback — always works
  console.log('[HSN] Using offline keyword fallback');
  return keywordHSNLookup(description);
}

module.exports = { findHSNCode, initializeRAG };
