import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '../../lib/constants';

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('hi');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

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

  const handleSubmit = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, language);
    }
  };

  const formatDuration = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
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
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" />
              <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring opacity-30" />
            </>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 active:scale-95 ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-paytm-cyan hover:bg-paytm-cyan-dark'
            }`}
          >
            {isRecording ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
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
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-paytm-cyan rounded-full animate-wave"
                  style={{
                    height: '24px',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-paytm-cyan font-mono font-bold">{formatDuration(duration)}</span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
        )}

        {!isRecording && duration === 0 && (
          <p className="text-gray-400 text-sm text-center">
            Tap the mic to start recording<br />Tell us about your craft in your language
          </p>
        )}

        {audioBlob && !isRecording && (
          <div className="w-full space-y-3">
            <div className="bg-paytm-green/10 rounded-xl p-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-paytm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-paytm-green">Recording ready ({formatDuration(duration)})</span>
            </div>
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10 rounded-lg" />
            <button
              onClick={handleSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate My Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
