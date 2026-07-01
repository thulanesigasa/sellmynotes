"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { User, Star, BookOpen, Clock, Tag } from 'lucide-react';
import Link from 'next/link';

interface SellerProfile {
  id: string;
  full_name: string | null;
  university: string | null;
  created_at: string;
}

interface Note {
  id: string;
  title: string;
  course_code: string;
  institution: string;
  price_zar: number;
  created_at: string;
}

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSellerData();
    }
  }, [id]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, university, created_at')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as any);

      // 2. Fetch seller's active notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, course_code, institution, price_zar, created_at')
        .eq('seller_id', id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData as any || []);

      // 3. Calculate avg rating
      if (notesData && notesData.length > 0) {
        const noteIds = notesData.map((n: any) => n.id);
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('rating')
          .in('note_id', noteIds);

        if (reviewsData && reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length;
          setAvgRating(avg);
          setReviewCount(reviewsData.length);
        }
      }

    } catch (err: any) {
      toast.error('Failed to load seller profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Seller not found</h1>
        <p className="text-gray-500 mt-2">This profile may have been removed.</p>
        <Link href="/explore" className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />

      {/* Seller Header */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-12 mb-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {(profile.full_name || 'S')[0].toUpperCase()}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {profile.full_name || 'Anonymous Seller'}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
              {profile.university && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {profile.university}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">{notes.length}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Notes</div>
              </div>
              
              <div className="w-px h-10 bg-gray-200" />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-gray-900">
                  {avgRating !== null ? avgRating.toFixed(1) : '—'}
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {reviewCount} Review{reviewCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Notes Grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-600" />
        Notes by {profile.full_name?.split(' ')[0] || 'this seller'}
      </h2>

      {notes.length === 0 ? (
        <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900">No active notes</h3>
          <p className="text-gray-500 mt-1">This seller hasn't published any notes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link key={note.id} href={`/note/${note.id}`} className="group block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full group-hover:border-blue-300 group-hover:shadow-md transition-all">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {note.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      <Tag className="h-3 w-3" />
                      {note.course_code}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                      {note.institution}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="text-lg font-black text-gray-900">
                      R{note.price_zar.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      View details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
