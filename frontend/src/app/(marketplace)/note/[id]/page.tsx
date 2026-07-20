"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import {
  BookOpen, GraduationCap, Star, ShoppingCart, ArrowLeft,
  Tag, User, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import ReviewSection from '@/components/ReviewSection';

interface Note {
  id: string;
  title: string;
  description: string | null;
  course_code: string;
  institution: string;
  price_zar: number;
  created_at: string;
  seller_id: string;
  profiles: {
    full_name: string | null;
    university: string | null;
  };
}

interface ReviewStats {
  avg: number;
  count: number;
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [hasVerifiedPurchase, setHasVerifiedPurchase] = useState(false);
  const [isOwnNote, setIsOwnNote] = useState(false);



  const fetchNote = async () => {
    setLoading(true);
    try {
      // 1. Fetch note details
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          description,
          course_code,
          institution,
          price_zar,
          created_at,
          seller_id,
          profiles (
            full_name,
            university
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setNote(data as any);

      // 2. Fetch aggregated review stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('note_id', id);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
        setReviewStats({ avg, count: reviews.length });
      }

      // 3. Check if current user has a completed purchase for this note
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.id === (data as any).seller_id) {
          setIsOwnNote(true);
        }

        const { data: purchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('note_id', id)
          .eq('buyer_id', session.user.id)
          .in('status', ['completed', 'released'])
          .maybeSingle();

        setHasVerifiedPurchase(!!purchase);
      }
    } catch (error: any) {
      toast.error('Failed to load note details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const handleBuy = async () => {
    if (!note) return;
    setPurchasing(true);
    const toastId = toast.loading('Initiating checkout...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.dismiss(toastId);
        toast.error('Please log in to purchase notes.');
        return;
      }

      const res = await fetch('/api/payfast/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ note_id: note.id }),
      });

      const { payfastData, error: apiError } = await res.json();
      if (!res.ok) throw new Error(apiError || 'Checkout failed');

      toast.dismiss(toastId);

      // Build PayFast form and submit
      const pfHost = 'https://sandbox.payfast.co.za/eng/process';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = pfHost;
      Object.entries(payfastData).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(val);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Note not found</h1>
        <p className="text-gray-500 mt-2">This note may have been removed or is not published.</p>
        <Link href="/explore" className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />

      {/* Back link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Tag className="h-3 w-3" />
                {note.course_code}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                <GraduationCap className="h-3 w-3" />
                {note.institution}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{note.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
              <Link href={`/seller/${note.seller_id}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <User className="h-4 w-4" />
                {note.profiles?.full_name || 'Verified Seller'}
              </Link>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {new Date(note.created_at).toLocaleDateString('en-ZA', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
              {reviewStats.count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <strong className="text-gray-900">{reviewStats.avg.toFixed(1)}</strong>
                  <span className="text-gray-400">({reviewStats.count} reviews)</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {note.description && (
            <div className="bg-gradient-to-br from-white to-blue-50/10 rounded-2xl border border-blue-100/70 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-500" /> Syllabus & Course Outline
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100/70 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 fill-blue-100" /> AI Refined Summary
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">{note.description}</p>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection
            noteId={note.id}
            canReview={hasVerifiedPurchase && !isOwnNote}
          />
        </div>

        {/* Sidebar — Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Listed Price</p>
                <p className="text-4xl font-black text-gray-900 mt-1">R{note.price_zar.toFixed(2)}</p>
              </div>

              {reviewStats.count > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="text-sm font-semibold text-amber-800">
                    {reviewStats.avg.toFixed(1)} / 5 · {reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {isOwnNote ? (
                <div className="text-center text-sm text-gray-500 py-2">
                  This is your own note — you cannot purchase it.
                </div>
              ) : hasVerifiedPurchase ? (
                <div className="space-y-3">
                  <div className="text-center text-sm text-green-600 font-semibold py-2">
                    ✓ You own this note
                  </div>
                  <Link
                    href="/library"
                    className="block w-full text-center px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Download in My Library →
                  </Link>
                </div>
              ) : (
                <button
                  id={`buy-note-${note.id}`}
                  onClick={handleBuy}
                  disabled={purchasing}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                    purchasing
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-md'
                  }`}
                >
                  {purchasing ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  Buy Now — R{note.price_zar.toFixed(2)}
                </button>
              )}

              <p className="text-xs text-gray-400 text-center">
                Secure checkout via PayFast · Instant download after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
