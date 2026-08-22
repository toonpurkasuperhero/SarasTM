import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '../../lib/constants';

const BHASHINI_ENABLED = !!(
  import.meta.env.VITE_BHASHINI_ENABLED === 'true'
);

export default function VoiceRecorder({ onRecordingComplete, onTextComplete }) {
  const [mode, setMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('hi');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [textDesc, setTextDesc] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.start(250);
    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleVoiceSubmit = () => {
    if (audioBlob) onRecordingComplete(audioBlob, language);
  };

  const handleTextSubmit = () => {
    if (textDesc.trim()) onTextComplete(textDesc.trim());
  };

  const formatDuration = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex bg-paytm-bg rounded-xl p-1 gap-1">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            mode === 'text' ? 'bg-white shadow text-paytm-navy' : 'text-gray-400 hover:text-paytm-navy'
          }`}
        >
          ✍️ Type Description
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            mode === 'voice' ? 'bg-white shadow text-paytm-navy' : 'text-gray-400 hover:text-paytm-navy'
          }`}
        >
          🎙️ Voice {!BHASHINI_ENABLED && <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Coming soon</span>}
        </button>
      </div>

      {mode === 'text' && (
        <div className="space-y-4">
          <div className="bg-paytm-cyan/10 border border-paytm-cyan/20 rounded-xl p-3 text-sm text-paytm-navy">
            <strong>Tip:</strong> Describe your craft — what it's made of, the technique, the tradition behind it, and a price range. AI will generate the full listing.
          </div>
          <div>
            <label className="block text-sm font-semibold text-paytm-navy mb-2">Describe your craft</label>
            <textarea
              value={textDesc}
              onChange={(e) => setTextDesc(e.target.value)}
              rows={6}
              placeholder="Example: I make Madhubani paintings on handmade paper using natural colours like turmeric and indigo. This painting shows peacocks dancing in monsoon. It took me 4 days. I want to price it around ₹4500."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{textDesc.length} chars</p>
          </div>
          <button
            onClick={handleTextSubmit}
            disabled={textDesc.trim().length < 20}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate My Listing
          </button>
        </div>
      )}

      {mode === 'voice' && (
        <div className="space-y-6">
          {!BHASHINI_ENABLED && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-amber-500 text-xl flex-shrink-0">⏳</span>
              <div>
                <p className="font-semibold text-amber-700">Bhashini voice key pending approval</p>
                <p className="text-sm text-amber-600 mt-0.5">Use the <strong>Type Description</strong> tab for now. Voice mode will auto-enable once the API key is added.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-paytm-navy mb-2">Speak in your language</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    language === lang.code
                      ? 'border-paytm-cyan bg-paytm-cyan/10 text-paytm-navy'
                      : 'border-gray-200 text-gray-500 hover:border-paytm-cyan/50'
                  }`}
                >
                  <div>{lang.native}</div>
                  <div className="text-xs text-gray-400">{lang.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 py-8">
            <div className="relative">
              {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" />}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!BHASHINI_ENABLED}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 active:scale-95 ${
                  !BHASHINI_ENABLED ? 'bg-gray-300 cursor-not-allowed' :
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-paytm-cyan hover:bg-paytm-cyan-dark'
                }`}
              >
                {isRecording ? (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                ) : (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </button>
            </div>

            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="text-paytm-cyan font-mono font-bold">{formatDuration(duration)}</span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            )}

            {audioBlob && !isRecording && (
              <div className="w-full space-y-3">
                <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10 rounded-lg" />
                <button onClick={handleVoiceSubmit} className="btn-primary w-full">
                  Generate My Listing
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
