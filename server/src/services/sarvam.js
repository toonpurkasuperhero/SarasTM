// server/src/services/sarvam.js
const axios = require('axios');
const FormData = require('form-data');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const SARVAM_ENABLED = !!SARVAM_API_KEY;

const LANG_MAP = {
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
  mai: 'mai-IN',
  en: 'en-IN'
};

async function transcribeAudio(audioBuffer, languageCode) {
  if (!SARVAM_ENABLED) {
    console.warn('⚠️ Sarvam API Key not configured. Returning mock transcription.');
    return 'यह एक सुंदर हस्तनिर्मित कलाकृति है जिसे मास्टर कारीगर ने तैयार किया है।';
  }

  try {
    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm',
    });
    form.append('model', 'saaras:v4');
    
    // Map standard code to BCP-47
    const bcp47 = LANG_MAP[languageCode] || 'hi-IN';
    form.append('language_code', bcp47);
    form.append('mode', 'transcribe');

    console.log(`🎙️ Sending ASR request to Sarvam for language: ${bcp47}`);
    
    const response = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        ...form.getHeaders(),
      },
    });

    const transcript = response.data?.transcript;
    if (!transcript) {
      throw new Error('Invalid response structure from Sarvam ASR');
    }

    return transcript;
  } catch (error) {
    console.error('❌ Sarvam ASR request failed:', error.response?.data || error.message);
    throw new Error(`Sarvam Speech-to-Text failed: ${error.message}`);
  }
}

async function translateToEnglish(text, sourceLang) {
  if (!SARVAM_ENABLED) {
    console.warn('⚠️ Sarvam API Key not configured. Returning mock translation.');
    return 'This is a beautiful hand-woven heritage craft item, created by master weavers using traditional skills.';
  }

  try {
    const bcp47 = LANG_MAP[sourceLang] || 'hi-IN';
    
    console.log(`🔤 Translating via Sarvam from ${bcp47} to en-IN`);
    
    const response = await axios.post('https://api.sarvam.ai/translate', {
      input: text,
      source_language_code: bcp47,
      target_language_code: 'en-IN',
      model: 'sarvam-translate:v1',
    }, {
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const translatedText = response.data?.translated_text;
    if (!translatedText) {
      throw new Error('Invalid response structure from Sarvam Translation');
    }

    return translatedText;
  } catch (error) {
    console.error('❌ Sarvam Translation failed:', error.response?.data || error.message);
    throw new Error(`Sarvam Translation failed: ${error.message}`);
  }
}

module.exports = {
  transcribeAudio,
  translateToEnglish,
  SARVAM_ENABLED,
};
