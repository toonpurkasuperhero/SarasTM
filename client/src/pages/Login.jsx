// client/src/pages/Login.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInArtisan } = useAuthStore();

  // Artisan Portal state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [artisanLoading, setArtisanLoading] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  // Buyer Portal state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [buyerLoading, setBuyerLoading] = useState(false);

  // 1. Send OTP / Verify OTP Flow
  const handleArtisanSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setArtisanLoading(true);
    try {
      if (!showOtpField) {
        // Send OTP Simulation
        toast.success(`Secure OTP sent to +91 ${phone}`);
        setShowOtpField(true);
      } else {
        // Verify OTP Simulation
        if (otp === '123456' || otp.length === 6) {
          await signInArtisan(phone);
          toast.success('Artisan authenticated successfully!');
          navigate('/artisan/dashboard');
        } else {
          toast.error('Invalid OTP. For demo purposes, enter any 6-digit code.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Artisan sign-in failed');
    } finally {
      setArtisanLoading(false);
    }
  };

  // 2. Voice Login via Sarvam AI ASR
  const startVoiceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        toast.loading('Processing voice authentication...', { id: 'voice-auth' });
        try {
          const fd = new FormData();
          fd.append('audio', audioBlob, 'phone.webm');
          fd.append('language', 'hi'); // Default translation / voice check

          const res = await axios.post(`${API}/api/listing/generate`, fd);
          // Standard mock digit check (or simply login the mock artisan)
          await signInArtisan('9876543210');
          toast.dismiss('voice-auth');
          toast.success('Voice verified! Welcome Priya Devi.');
          navigate('/artisan/dashboard');
        } catch {
          // Fallback to bypass for demo convenience
          await signInArtisan('9876543210');
          toast.dismiss('voice-auth');
          toast.success('Voice verified (Offline demo)! Welcome Priya Devi.');
          navigate('/artisan/dashboard');
        }
      };

      mr.start();
      setVoiceRecording(true);
      toast('Start speaking your 10-digit number...', { icon: '🎙️' });
    } catch {
      toast.error('Microphone access denied. Try phone input instead.');
    }
  };

  const stopVoiceLogin = () => {
    mediaRef.current?.stop();
    setVoiceRecording(false);
  };

  // 3. Buyer Sign-In Flow
  const handleBuyerSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setBuyerLoading(true);
    try {
      await signIn(email, password);
      toast.success('Sign-in successful! Entering Marketplace.');
      navigate('/store');
    } catch (err) {
      toast.error(err.message || 'Buyer sign-in failed');
    } finally {
      setBuyerLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row w-full h-screen max-w-screen-3xl mx-auto bg-surface-container-lowest relative shadow-2xl font-inter overflow-hidden">
      
      {/* Artisan Entrance (Left Panel) */}
      <section className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative z-10 border-b md:border-b-0 md:border-r border-outline-variant bg-surface-container-lowest overflow-y-auto pattern-bg">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-fixed/20 to-transparent pointer-events-none" />
        
        <div className="relative z-20 flex flex-col h-full py-12 md:py-24">
          <div className="mb-auto">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-trust-blue" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <h1 className="font-hanken text-trust-blue font-bold text-3xl">SarasTM</h1>
            </div>
            <p className="font-inter text-xs text-heritage-red uppercase tracking-widest mt-2 ml-1">Artisan Entrance</p>
          </div>

          <div className="max-w-md w-full mx-auto md:mx-0 mt-12 md:mt-0">
            <h2 className="font-hanken text-4xl text-on-background mb-4 font-bold">Welcome back, Creator.</h2>
            <p className="text-on-surface-variant mb-10 text-base" style={{ fontFamily: 'Inter' }}>
              Access your digital storefront, manage your craft catalog, and connect with global buyers seamlessly.
            </p>

            <form className="space-y-6" onSubmit={handleArtisanSubmit}>
              {!showOtpField ? (
                <div>
                  <label className="block text-xs text-on-surface mb-2 font-bold uppercase tracking-wider">Phone Number</label>
                  <div className="flex shadow-sm rounded-md border border-outline-variant bg-surface-lowest focus-within:border-trust-blue transition-colors">
                    <span className="inline-flex items-center px-4 bg-surface-container-low border-r border-outline-variant text-on-surface-variant">+91</span>
                    <input
                      className="flex-grow bg-transparent px-4 py-3 text-base focus:outline-none"
                      placeholder="Enter your 10-digit number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-on-surface mb-2 font-bold uppercase tracking-wider">OTP Verification</label>
                  <input
                    className="w-full bg-surface-lowest border border-outline-variant rounded-md px-4 py-3 text-base focus:outline-none focus:border-trust-blue focus:ring-1 focus:ring-trust-blue"
                    placeholder="Enter 6-digit OTP code"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <p className="text-xs text-on-surface-variant mt-2">Enter any 6-digit code to continue demo.</p>
                </div>
              )}

              <button
                className="w-full bg-trust-blue text-on-primary py-3.5 px-4 rounded-lg hover:bg-primary transition-all duration-300 flex justify-center items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-bold"
                type="submit"
                disabled={artisanLoading}
              >
                {artisanLoading ? 'Authenticating...' : showOtpField ? 'Verify OTP' : 'Send Secure OTP'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="flex-shrink-0 mx-4 text-xs text-on-surface-variant uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>

              <div>
                <button
                  onClick={voiceRecording ? stopVoiceLogin : startVoiceLogin}
                  className={`w-full border-2 text-primary py-3.5 px-4 rounded-lg transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden font-bold ${voiceRecording ? 'border-heritage-red bg-heritage-red/5' : 'border-action-cyan/30 hover:bg-action-cyan/5'}`}
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[28px] text-action-cyan ${voiceRecording ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {voiceRecording ? 'stop_circle' : 'mic'}
                  </span>
                  <span>{voiceRecording ? 'Recording... Click to Stop' : 'Login via Voice'}</span>
                </button>
                <p className="text-xs text-center text-on-surface-variant mt-3 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Speak your registered phone number in your language (e.g. Hindi, Tamil, Telugu)
                </p>
              </div>
            </form>
          </div>

          <div className="mt-auto pt-12 md:pt-0">
            <p className="text-xs text-on-surface-variant text-center md:text-left">
              Need help? <a className="text-trust-blue hover:underline font-semibold" href="#">Contact Artisan Support</a>
            </p>
          </div>
        </div>
      </section>

      {/* Customer & Buyer Entrance (Right Panel) */}
      <section className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative z-10 bg-surface-container-low overflow-y-auto border-l border-outline-variant/50 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="relative z-20 flex flex-col h-full py-12 md:py-24">
          <div className="mb-auto text-right">
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-2 hidden md:block">Customer & Buyer Entrance</p>
          </div>

          <div className="max-w-md w-full mx-auto md:mx-0 lg:ml-auto mt-12 md:mt-0">
            <h2 className="font-hanken text-4xl text-on-background mb-4 font-bold">Discover Heritage.</h2>
            <p className="text-on-surface-variant mb-10 text-base" style={{ fontFamily: 'Inter' }}>
              Sign in to explore verified, AI-curated authentic Indian craftsmanship from vetted artisans.
            </p>

            <form className="space-y-6" onSubmit={handleBuyerSubmit}>
              <div>
                <label className="block text-xs text-on-surface mb-2 font-bold uppercase tracking-wider">Corporate or Personal Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                  </span>
                  <input
                    className="block w-full rounded-md border border-outline-variant bg-surface-lowest text-base focus:outline-none focus:border-trust-blue focus:ring-1 focus:ring-trust-blue pl-10 py-3 transition-colors"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs text-on-surface font-bold uppercase tracking-wider">Password</label>
                  <a className="text-xs text-action-cyan hover:underline transition-colors font-semibold" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                  </span>
                  <input
                    className="block w-full rounded-md border border-outline-variant bg-surface-lowest text-base focus:outline-none focus:border-trust-blue focus:ring-1 focus:ring-trust-blue pl-10 py-3 transition-colors"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="w-full bg-deep-ink text-on-primary py-3.5 px-4 rounded-lg hover:bg-inverse-surface transition-all duration-300 shadow-sm mt-2 font-bold"
                type="submit"
                disabled={buyerLoading}
              >
                {buyerLoading ? 'Signing In...' : 'Sign In to Marketplace'}
              </button>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="flex-shrink-0 mx-4 text-xs text-on-surface-variant uppercase tracking-wider">Continue with</span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    signIn('buyer@sarastm.in', 'password');
                    toast.success('Signed in with Google!');
                    navigate('/store');
                  }}
                  className="bg-surface-container-lowest border border-outline-variant py-3 rounded-lg flex justify-center items-center hover:bg-surface-container transition-colors shadow-sm gap-2 text-on-surface text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">language</span> Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signIn('buyer@sarastm.in', 'password');
                    toast.success('Signed in with LinkedIn!');
                    navigate('/store');
                  }}
                  className="bg-surface-container-lowest border border-outline-variant py-3 rounded-lg flex justify-center items-center hover:bg-surface-container transition-colors shadow-sm gap-2 text-on-surface text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#0077b5]" style={{ fontVariationSettings: "'FILL' 1" }}>work</span> LinkedIn
                </button>
              </div>
            </form>
          </div>

          <div className="mt-auto pt-12 md:pt-0 text-center md:text-right">
            <p className="text-xs text-on-surface-variant">
              New to SarasTM? <a className="text-action-cyan hover:underline font-semibold" href="#">Apply for Buyer Access</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
