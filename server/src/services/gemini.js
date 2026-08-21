const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

let genAI;
const getGenAI = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

async function generateListing(englishDescription) {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    if (err.message?.includes('quota') || err.message?.includes('rate')) {
      return generateListingGroq(englishDescription);
    }
    throw err;
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
  const model = getGenAI().getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function generateHSNReasoning(description, hsnMatches) {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const matchList = hsnMatches.map((m) => `${m.code}: ${m.description}`).join('\n');
  const prompt = `You are an Indian customs expert. Based on this product description and the top HSN code matches, suggest the best HSN code.

Product: "${description}"

Top HSN matches:
${matchList}

Return JSON: { "code": "XXXXXXXX", "description": "HSN description", "confidence": "high|medium|low", "explanation": "brief plain-language reason", "alternatives": [{"code": "...", "description": "..."}] }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateListing, generateEmbedding, generateHSNReasoning };
