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

async function findHSNCode(description) {
  await initializeRAG();
  const queryEmbedding = await generateEmbedding(description);

  const { data: matches, error } = await supabase.rpc('match_hsn_codes', {
    query_embedding: queryEmbedding,
    match_count: 5,
  });

  if (error || !matches?.length) {
    return { code: 'Unable to determine', description: '', confidence: 'low', explanation: 'No matches found in HSN database' };
  }

  return await generateHSNReasoning(description, matches);
}

module.exports = { findHSNCode, initializeRAG };
