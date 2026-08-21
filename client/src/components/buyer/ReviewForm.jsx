import { useState } from 'react';
import Button from '../ui/Button';
import { reviewsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ReviewForm({ orderId, productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await reviewsAPI.create({ orderId, productId, rating, comment });
      toast.success('Review submitted!');
      onSuccess?.();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-paytm-navy mb-2">Your Rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span className={(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-paytm-navy block mb-2">Your Experience</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Tell others about this craft piece..."
          className="input-field resize-none"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
