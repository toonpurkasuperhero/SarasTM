const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const GEMINI_MODEL = 'gemini-3.6-flash';

let genAI;
const getGenAI = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

let genAIv1beta;
const getGenAIv1beta = () => {
  if (!genAIv1beta) genAIv1beta = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAIv1beta;
};

async function generateListing(englishDescription) {
  const prompt = `You are an expert copywriter for a global Indian craft marketplace. Given this artisan's description of their craft (already translated to English), generate a compelling product listing.

Artisan description: "${englishDescription}"

Return ONLY valid JSON in this exact format:
{
  "title": "A concise, compelling product title (max 60 chars)",
  "story": "A rich, authentic 2-3 sentence brand story that highlights the craft tradition, technique, and cultural significance",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "suggested_price_inr": <number>,
  "suggested_price_usd": <number>,
  "suggested_price_eur": <number>,
  "suggested_price_gbp": <number>,
  "craft_type": "The most likely craft category",
  "region_label": "The likely Indian state or region"
}`;

  try {
    const model = getGenAI().getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');
    return JSON.parse(jsonMatch[0]);
  } catch (geminiErr) {
    console.warn('Gemini listing failed, using Groq fallback:', geminiErr.message);
    return generateListingGroq(englishDescription);
  }
}

async function generateListingGroq(englishDescription) {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Generate a product listing JSON for this Indian craft: "${englishDescription}". Return only JSON with fields: title, story, seo_tags (array of 6), suggested_price_inr, suggested_price_usd, suggested_price_eur, suggested_price_gbp, craft_type, region_label`,
        },
      ],
      response_format: { type: 'json_object' },
    },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  return JSON.parse(res.data.choices[0].message.content);
}

async function generateEmbedding(text) {
  // Try Gemini text-embedding-004 (requires v1beta endpoint)
  try {
    const model = getGenAIv1beta().getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent({ content: { parts: [{ text }] } });
    return result.embedding.values;
  } catch (err) {
    console.warn('Gemini embedding failed, using HuggingFace fallback:', err.message);
  }

  // Try HuggingFace
  try {
    const res = await axios.post(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2',
      { inputs: text, options: { wait_for_model: true } },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    const embedding = res.data;
    return Array.isArray(embedding[0]) ? embedding[0] : embedding;
  } catch (err2) {
    console.warn('HuggingFace embedding also failed:', err2.message);
    // Return a zero-length fallback so RAG can still use keyword search
    return null;
  }
}

async function generateHSNReasoning(description, hsnMatches) {
  const matchList = hsnMatches.map((m) => `${m.code}: ${m.description}`).join('\n');
  const prompt = `You are an Indian customs expert. Based on this product description and the top HSN code matches, suggest the best HSN code.

Product: "${description}"

Top HSN matches:
${matchList}

Return JSON only: { "code": "XXXXXXXX", "description": "HSN description", "confidence": "high|medium|low", "explanation": "brief plain-language reason", "alternatives": [{"code": "...", "description": "..."}] }`;

  try {
    const model = getGenAI().getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return JSON.parse(res.data.choices[0].message.content);
  }
}

module.exports = { generateListing, generateEmbedding, generateHSNReasoning };
