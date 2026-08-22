import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const LANGUAGES = [
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली' },
  { code: 'en', label: 'English', native: 'English' },
];

export default function VoiceListing() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('hi');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [listing, setListing] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      setAudioBlob(null);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        toast.success('Voice message recorded successfully! Ready to generate.');
      };
      mr.start();
      setRecording(true);
    } catch {
      toast.error('Microphone access denied. Use text mode instead.');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const generateListing = async () => {
    const isVoice = inputMode === 'voice';
    if (isVoice && !audioBlob && !text.trim()) {
      toast.error('Please record your voice or paste transcription first.');
      return;
    }
    if (!isVoice && !text.trim()) {
      toast.error('Please describe your product first.');
      return;
    }

    setGenerating(true);
    try {
      const fd = new FormData();
      fd.append('language', lang);
      
      if (isVoice && audioBlob) {
        fd.append('audio', audioBlob, 'description.webm');
      } else {
        fd.append('text', text);
      }

      const token = localStorage.getItem('sarastm_token');
      const res = await axios.post(`${API}/api/listing/generate`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setListing(res.data);
      toast.success('Listing generated!');
    } catch (err) {
      console.error(err);
      toast.error('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const publishListing = async () => {
    if (!listing?.id) return;
    try {
      const token = localStorage.getItem('sarastm_token');
      await axios.patch(`${API}/api/listing/${listing.id}`, { status: 'published' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing published!');
      navigate('/artisan/dashboard');
    } catch { toast.error('Failed to publish.'); }
  };

  return (
    <div className="bg-surface min-h-screen" style={{ padding: '32px 64px' }}>
      <div className="max-w-container-max mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-hanken text-primary mb-3" style={{ fontSize: '48px', lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }}>Voice Listing Studio</h1>
          <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px', maxWidth: '600px' }}>
            Speak or type in your native language. Saras AI generates a professional, SEO-optimized global listing instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Panel */}
          <div className="flex flex-col gap-6">

            {/* Language Selector */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <label className="text-on-surface-variant uppercase tracking-wider mb-3 block" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Your Language</label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`py-2 px-3 rounded-lg border text-left transition-all ${lang === l.code ? 'bg-primary-container text-on-primary border-primary-container' : 'bg-surface-container-lowest border-outline-variant hover:border-action-cyan'}`}
                    style={{ fontFamily: 'Inter', fontSize: '12px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{l.native}</div>
                    <div style={{ opacity: 0.7, fontSize: '11px' }}>{l.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 bg-surface-container rounded-lg p-1">
              {['text', 'voice'].map(m => (
                <button key={m} onClick={() => setInputMode(m)}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-inter font-semibold capitalize ${inputMode === m ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}
                  style={{ fontSize: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{m === 'text' ? 'edit' : 'mic'}</span>
                  {m === 'text' ? 'Type Description' : 'Voice Record'}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              {inputMode === 'text' ? (
                <div>
                  <label className="text-on-surface-variant uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Describe Your Product</label>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
                    placeholder="यह सिल्क की साड़ी हाथ से बुनी गई है। इसमें सोने के धागे से काम किया गया है..."
                    className="w-full border border-outline-variant rounded-lg p-4 focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan resize-none transition-all bg-surface-container-lowest"
                    style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px' }} />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 py-8">
                  <button onClick={recording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group relative ${recording ? 'bg-heritage-red' : 'bg-primary-container'}`}>
                    {recording && <div className="absolute inset-0 rounded-full border-2 border-action-cyan animate-ping opacity-60" />}
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>{recording ? 'stop' : 'mic'}</span>
                  </button>
                  <p className="text-on-surface-variant text-center" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                    {recording ? '🔴 Recording... Tap to stop' : 'Tap mic to start recording'}
                  </p>
                  {!recording && (
                    <div>
                      <label className="text-on-surface-variant uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Or paste transcript here</label>
                      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
                        placeholder="Paste your voice transcript..."
                        className="w-full border border-outline-variant rounded-lg p-3 focus:outline-none focus:border-action-cyan resize-none bg-surface-container-lowest"
                        style={{ fontFamily: 'Inter', fontSize: '14px' }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={generateListing} disabled={generating || (!text.trim() && !audioBlob)}
              className="bg-trust-blue text-on-primary py-4 px-8 rounded-lg hover:bg-primary transition-colors disabled:opacity-40 font-hanken flex items-center justify-center gap-2 shadow-sm"
              style={{ fontSize: '20px', fontWeight: '600' }}>
              {generating ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '22px' }}>refresh</span> Generating...</> : <><span className="material-symbols-outlined" style={{ fontSize: '22px' }}>auto_awesome</span> Generate Listing</>}
            </button>
          </div>

          {/* Generated Listing Preview */}
          <div>
            {!listing ? (
              <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center h-full text-center">
                <span className="material-symbols-outlined text-on-surface-variant mb-4" style={{ fontSize: '64px' }}>description</span>
                <h3 className="font-hanken text-primary mb-2" style={{ fontSize: '20px', fontWeight: '600' }}>Your Listing Will Appear Here</h3>
                <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '16px' }}>Describe your product and click Generate Listing</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2 text-action-cyan">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span className="uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>AI Generated Listing</span>
                </div>
                <h2 className="font-hanken text-primary" style={{ fontSize: '32px', fontWeight: '600', lineHeight: '40px' }}>{listing.title}</h2>
                <div className="flex gap-2 flex-wrap">
                  {(listing.seo_tags || []).slice(0, 6).map(t => (
                    <span key={t} className="bg-surface-gray text-deep-ink px-2 py-1 rounded-DEFAULT uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: '600' }}>{t}</span>
                  ))}
                </div>
                <p className="text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px' }}>{listing.story_en}</p>
                <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container rounded-lg">
                  {[['INR', '₹' + Number(listing.price_inr || 0).toLocaleString('en-IN')], ['USD', '$' + Number(listing.price_usd || 0).toFixed(2)], ['EUR', '€' + Number(listing.price_eur || 0).toFixed(2)], ['GBP', '£' + Number(listing.price_gbp || 0).toFixed(2)]].map(([c, v]) => (
                    <div key={c} className="text-center">
                      <div className="text-on-surface-variant uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '600' }}>{c}</div>
                      <div className="font-hanken text-primary font-semibold" style={{ fontSize: '18px' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={publishListing}
                    className="flex-1 bg-trust-blue text-on-primary py-3 rounded-lg hover:bg-primary transition-colors font-hanken font-semibold flex items-center justify-center gap-2"
                    style={{ fontSize: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>publish</span>
                    Publish Listing
                  </button>
                  <button onClick={() => navigate('/artisan/photo')}
                    className="flex-1 border border-action-cyan text-action-cyan py-3 rounded-lg hover:bg-action-cyan/5 transition-colors font-hanken font-semibold flex items-center justify-center gap-2"
                    style={{ fontSize: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>photo_camera</span>
                    Add Photos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
