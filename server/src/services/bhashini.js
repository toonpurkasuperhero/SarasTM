const axios = require('axios');
const FormData = require('form-data');

const DHRUVA_BASE = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

const headers = {
  Authorization: process.env.BHASHINI_API_KEY,
  userID: process.env.BHASHINI_USER_ID,
  ulcaApiKey: process.env.BHASHINI_API_KEY,
  'Content-Type': 'application/json',
};

const LANG_SERVICE_IDS = {
  hi: { asrId: 'ai4bharat/conformer-hi-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  bn: { asrId: 'ai4bharat/conformer-bn-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  ta: { asrId: 'ai4bharat/conformer-ta-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  te: { asrId: 'ai4bharat/conformer-te-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  mr: { asrId: 'ai4bharat/conformer-mr-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  gu: { asrId: 'ai4bharat/conformer-gu-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  kn: { asrId: 'ai4bharat/conformer-kn-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  ml: { asrId: 'ai4bharat/conformer-ml-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  or: { asrId: 'ai4bharat/conformer-or-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  pa: { asrId: 'ai4bharat/conformer-pa-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
  mai: { asrId: 'ai4bharat/conformer-mai-gpu--t4', nmt: 'ai4bharat/indictrans-v2-all-gpu--t4' },
};

async function transcribeAudio(audioBuffer, language) {
  const audioBase64 = audioBuffer.toString('base64');
  const serviceId = LANG_SERVICE_IDS[language]?.asrId || LANG_SERVICE_IDS.hi.asrId;

  const payload = {
    pipelineTasks: [
      {
        taskType: 'asr',
        config: {
          language: { sourceLanguage: language },
          serviceId,
          audioFormat: 'webm',
          samplingRate: 16000,
        },
      },
    ],
    inputData: {
      audio: [{ audioContent: audioBase64 }],
    },
  };

  const res = await axios.post(DHRUVA_BASE, payload, { headers });
  const output = res.data?.pipelineResponse?.[0]?.output?.[0]?.source;
  if (!output) throw new Error('No transcription output from Bhashini');
  return output;
}

async function translateToEnglish(text, sourceLang) {
  const serviceId = LANG_SERVICE_IDS[sourceLang]?.nmt || LANG_SERVICE_IDS.hi.nmt;

  const payload = {
    pipelineTasks: [
      {
        taskType: 'translation',
        config: {
          language: { sourceLanguage: sourceLang, targetLanguage: 'en' },
          serviceId,
        },
      },
    ],
    inputData: {
      input: [{ source: text }],
    },
  };

  const res = await axios.post(DHRUVA_BASE, payload, { headers });
  const output = res.data?.pipelineResponse?.[0]?.output?.[0]?.target;
  if (!output) throw new Error('No translation output from Bhashini');
  return output;
}

module.exports = { transcribeAudio, translateToEnglish };
