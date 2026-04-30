'use client';

import { useState } from 'react';
import { Star, User, Calendar } from 'lucide-react';
import Image from 'next/image';

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
        picture?: string;
    };
}

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Star size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 font-medium">Be the first to share your experience with this product!</p>
            </div>
        );
    }

    const averageRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

    return (
        <div className="space-y-12 font-plus-jakarta-sans">
            {/* Review Stats Header */}
            <div className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>

                <div className="text-center md:text-left relative z-10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Average Rating</p>
                    <div className="flex items-end gap-3 px-4 py-6 bg-gray-50/50 rounded-xl border border-gray-100">
                        <h2 className="text-7xl font-black text-black tracking-tighter leading-none">{averageRating.toFixed(1)}</h2>
                        <div className="mb-1">
                            <div className="flex gap-1 text-emerald-600 mb-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={14} className={i <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200'} strokeWidth={3} />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{reviews.length} Total Reviews</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-sm space-y-3 relative z-10">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = (count / reviews.length) * 100;
                        return (
                            <div key={rating} className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-gray-400 w-3">{rating}</span>
                                <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(5,150,105,0.2)]" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 w-10 text-right uppercase tracking-widest">{percentage.toFixed(0)}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Individual Reviews - Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
}

function ReviewItem({ review }: { review: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = review.comment.length > 150;

    return (
        <div className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs overflow-hidden border border-emerald-100 shadow-inner relative">
                        {review.user.picture ? (
                            <Image src={review.user.picture || 'https://placehold.co/100x100/000000/ffffff?text=User'} alt={review.user.name} fill sizes="48px" className="object-cover" />
                        ) : (
                            review.user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-black text-[13px] uppercase tracking-widest leading-none mb-1.5">{review.user.name}</h4>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            <Calendar size={10} strokeWidth={3} />
                            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1 text-emerald-600 p-2 bg-emerald-50/50 rounded-lg">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={10} className={i <= review.rating ? 'fill-current' : 'text-gray-200'} strokeWidth={3} />
                    ))}
                </div>
            </div>

            <div className="relative">
                <p className={`text-gray-500 text-[14px] font-medium leading-[1.8] italic group-hover:text-black transition-all duration-500 ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                    "{review.comment}"
                </p>

                {isLong && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 transition-all group/btn"
                    >
                        <span className="w-4 h-[1px] bg-emerald-200 group-hover/btn:w-8 transition-all"></span>
                        {isExpanded ? 'Collapse' : 'Read More'}
                    </button>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <div className="w-8 h-[1px] bg-gray-100 group-hover:w-16 group-hover:bg-emerald-200 transition-all duration-500"></div>
            </div>
        </div>
    );
}
