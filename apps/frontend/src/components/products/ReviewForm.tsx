'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

interface ReviewFormProps {
    productId: number;
    onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.post('/reviews', {
                productId,
                rating,
                comment,
            });
            setRating(0);
            setComment('');
            onSuccess();
        } catch (err: any) {
            console.error('Failed to submit review:', err);
            setError(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 font-plus-jakarta-sans">
            <div className="relative">
                <span className="absolute -top-10 left-0 text-[9px] font-black uppercase tracking-[0.4em] text-emerald-600/40">Engagement</span>
                <h3 className="text-xl font-black text-black uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Customer Reviews</h3>
            </div>

            <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100 italic transition-all hover:bg-white hover:shadow-inner group">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 group-hover:text-emerald-600 transition-colors">Select Quality Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="focus:outline-none transition-all hover:scale-125"
                        >
                            <Star
                                size={24}
                                strokeWidth={2.5}
                                className={`${star <= (hover || rating)
                                    ? 'fill-emerald-600 text-emerald-600'
                                    : 'text-gray-200'
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <label htmlFor="comment" className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">
                    Personal Narrative
                </label>
                <textarea
                    id="comment"
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Describe your encounter with this horological piece..."
                    className="w-full px-6 py-5 bg-white border border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-600 transition-all font-medium text-black text-[14px] leading-relaxed shadow-sm hover:border-gray-300"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <p className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
                        Diagnostic: {error}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-emerald-600 text-white rounded-full font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center hover:bg-emerald-700 transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(5,150,105,0.4)] active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none mt-4"
            >
                {isSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                    'Submit Review'
                )}
            </button>
        </form>
    );
}
