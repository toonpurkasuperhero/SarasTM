import { useState } from 'react';
import VoiceRecorder from '../../components/artisan/VoiceRecorder';
import ListingEditor from '../../components/artisan/ListingEditor';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { listingAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Record', 'Review & Edit', 'Published!'];

export default function VoiceListing() {
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [listing, setListing] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const handleRecordingComplete = async (audioBlob, language) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      const res = await listingAPI.generate(formData);
      setListing(res.data);
      setStep(1);
    } catch (err) {
      toast.error('Failed to process recording. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await listingAPI.update(listing.id, listing);
      await listingAPI.publish(listing.id);
      toast.success('🎉 Your craft is now live globally!');
      setStep(2);
    } catch {
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title mb-2">Voice-Powered Listing</h1>
        <p className="text-gray-500">Speak about your craft in your language — AI handles the rest</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-paytm-cyan' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i <= step ? 'border-paytm-cyan bg-paytm-cyan text-white' : 'border-gray-200'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-paytm-cyan' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && !processing && (
        <Card>
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </Card>
      )}

      {processing && (
        <Card className="text-center py-16">
          <Spinner size="lg" />
          <div className="mt-6 space-y-2">
            <p className="font-semibold text-paytm-navy">AI is crafting your listing...</p>
            <p className="text-sm text-gray-400">Transcribing → Translating → Generating your story</p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {['Bhashini ASR', 'Translation', 'Gemini AI'].map((step, i) => (
              <div key={step} className="text-center">
                <div className="text-xs text-gray-400 mb-1">{step}</div>
                <div className="h-1 bg-paytm-cyan/20 rounded-full overflow-hidden">
                  <div className="h-full bg-paytm-cyan animate-pulse rounded-full" style={{ animationDelay: `${i * 300}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {step === 1 && listing && (
        <Card>
          <div className="mb-6 bg-paytm-cyan/10 border border-paytm-cyan/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-semibold text-paytm-navy">AI has generated your listing!</p>
              <p className="text-sm text-gray-500 mt-0.5">Review and edit every field before publishing</p>
            </div>
          </div>
          <ListingEditor
            listing={listing}
            onChange={setListing}
            onPublish={handlePublish}
            publishing={publishing}
          />
        </Card>
      )}

      {step === 2 && (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-paytm-navy mb-2">You're now a global seller!</h2>
          <p className="text-gray-500 mb-8">Your craft is live. Buyers worldwide can discover and purchase it.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(`/product/${listing.id}`)} className="btn-secondary">
              View Your Listing
            </button>
            <button onClick={() => navigate('/artisan/photo')} className="btn-primary">
              Enhance Photos →
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
