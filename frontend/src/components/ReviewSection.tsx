"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Star, MessageSquare, ShieldCheck, Lock, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

interface ReviewSectionProps {
  noteId: string;
  /** Whether the currently authed user has a completed purchase of this note */
  canReview?: boolean;
}

function StarRating({
  value,
  interactive = false,
  onChange,
}: {
  value: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ noteId, canReview = false }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);

      // Check if current user has already reviewed
      const { data: { session } } = await supabase.auth.getSession();
      if (session && data) {
        const { data: myReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('note_id', noteId)
          .eq('buyer_id', session.user.id)
          .maybeSingle();
        setAlreadyReviewed(!!myReview);
      }
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting your review...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be logged in to leave a review.');

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ note_id: noteId, rating, comment }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || 'Failed to submit review');
      }

      toast.dismiss(toastId);
      toast.success('Review submitted! Thank you for your feedback.');
      setRating(0);
      setComment('');
      setAlreadyReviewed(true);
      fetchReviews();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregated stats
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="reviews-section" className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">
          Student Reviews
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ml-1">
          {reviews.length}
        </span>
      </div>

      {/* Aggregate Stats */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="text-center sm:border-r sm:border-gray-200 sm:pr-6">
            <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} />
            <p className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-amber-400 rounded-full transition-all"
                    style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Review Form */}
      {canReview && !alreadyReviewed && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-700">Verified Purchase — Leave a Review</h3>
          </div>

          <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating value={rating} interactive onChange={setRating} />
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
                Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Share what you found helpful about these notes..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-colors"
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{comment.length}/500</p>
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              disabled={submitting || rating === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                rating > 0 && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Star className="h-4 w-4 fill-white text-white" />
              )}
              Submit Review
            </button>
          </form>
        </div>
      )}

      {canReview && alreadyReviewed && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-8">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          You have already reviewed this note. Thank you!
        </div>
      )}

      {!canReview && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-8">
          <Lock className="h-4 w-4 shrink-0" />
          Purchase this note to leave a verified review.
        </div>
      )}

      {/* Reviews List */}
      {loadingReviews ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Star className="mx-auto h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">No reviews yet. Be the first verified buyer to leave one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isAI = !review.profiles;
            const authorName = isAI ? 'Verified AI Educator' : (review.profiles?.full_name || 'Anonymous Buyer');
            const authorInitial = isAI ? 'AI' : (review.profiles?.full_name || 'A')[0].toUpperCase();

            return (
              <div key={review.id} className={`border rounded-2xl p-5 shadow-sm transition-all ${isAI ? 'bg-gradient-to-r from-blue-50/20 to-indigo-50/20 border-blue-100/70' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      isAI ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                    }`}>
                      {authorInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        {authorName}
                        {isAI && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-100 text-blue-700 tracking-wider">
                            <Sparkles className="h-2.5 w-2.5 fill-blue-200" /> AI
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <StarRating value={review.rating} />
                    <span className="text-xs text-gray-500 font-medium">({review.rating}/5)</span>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed mt-2 pl-10">
                    "{review.comment}"
                  </p>
                )}

                <div className="pl-10 mt-2">
                  {isAI ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                      <Sparkles className="h-3.5 w-3.5 fill-blue-100 text-blue-500" /> Verified AI Educator Review
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <ShieldCheck className="h-3 w-3" /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
