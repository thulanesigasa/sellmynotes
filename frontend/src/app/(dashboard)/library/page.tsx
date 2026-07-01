"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Download, Clock, Library, UploadCloud, Star, CheckCircle2, ShieldCheck } from 'lucide-react';
import OfferModal from '@/components/OfferModal';
import Link from 'next/link';

interface Purchase {
  id: string;
  status: string;
  created_at: string;
  note_id: string;
  amount_zar: number;
  notes: {
    id: string;
    title: string;
    course_code: string;
    institution: string;
  };
}

interface UploadedNote {
  id: string;
  title: string;
  course_code: string;
  institution: string;
  description: string;
  price_zar: number;
  status: string;
  file_path: string;
  created_at: string;
}

type TabType = 'purchases' | 'uploads';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('purchases');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [uploads, setUploads] = useState<UploadedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Selected note for Offer Review modal
  const [selectedNote, setSelectedNote] = useState<UploadedNote | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'purchases') {
      await fetchLibrary();
    } else {
      await fetchUploads();
    }
    setLoading(false);
  };

  const fetchLibrary = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch purchases
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          status,
          created_at,
          note_id,
          amount_zar,
          notes (
            id,
            title,
            course_code,
            institution
          )
        `)
        .eq('buyer_id', session.user.id)
        .in('status', ['completed', 'released'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data as any || []);

      // Fetch which note_ids the user has already reviewed
      if (data && data.length > 0) {
        const noteIds = data.map((p: any) => p.note_id).filter(Boolean);
        const { data: myReviews } = await supabase
          .from('reviews')
          .select('note_id')
          .eq('buyer_id', session.user.id)
          .in('note_id', noteIds);

        if (myReviews) {
          setReviewedIds(new Set(myReviews.map((r: any) => r.note_id)));
        }
      }
    } catch (error: any) {
      toast.error('Failed to load library');
      console.error(error);
    }
  };

  const fetchUploads = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploads(data as any || []);
    } catch (error: any) {
      toast.error('Failed to load uploads');
      console.error(error);
    }
  };

  const handleDownload = async (purchaseId: string, noteTitle: string) => {
    setDownloadingId(purchaseId);
    const toastId = toast.loading('Applying security watermarks & preparing download...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`/api/delivery/${purchaseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to download document');
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteTitle.replace(/\s+/g, '_')}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.dismiss(toastId);
      toast.success('Download complete!');

      // Refresh purchases to reflect status → released
      fetchLibrary();

    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Smart Valuing...
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 animate-pulse">
            Valued — Action Needed
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" /> Active / Listed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">My Workspace</h1>
          <p className="text-gray-500 mt-2">Manage your purchases, uploaded notes, and smart valuations.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          <button
            id="tab-purchases"
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'purchases' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Purchases
          </button>
          <button
            id="tab-uploads"
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'uploads' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Uploads
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : activeTab === 'purchases' ? (
        // --- Purchases Tab ---
        purchases.length === 0 ? (
          <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
            <Library className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Your library is empty</h3>
            <p className="text-gray-500 mt-1">Head over to the Explore page to find notes.</p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => {
              const hasReviewed = reviewedIds.has(purchase.note_id);
              const isReleased = purchase.status === 'released';

              return (
                <div
                  key={purchase.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {/* Header strip */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />

                  <div className="p-6 flex-grow space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {purchase.notes?.title}
                      </h3>
                      <span className="inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {purchase.notes?.course_code}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Institution: </span>
                      {purchase.notes?.institution}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(purchase.created_at).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <span className="font-semibold text-gray-700">R{purchase.amount_zar}</span>
                    </div>

                    {/* Status + actions */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        {isReleased ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <ShieldCheck className="h-3 w-3" /> Downloaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Ready to Download
                          </span>
                        )}

                        <button
                          id={`download-btn-${purchase.id}`}
                          onClick={() => handleDownload(purchase.id, purchase.notes?.title)}
                          disabled={downloadingId === purchase.id}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all ${
                            downloadingId === purchase.id
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                          }`}
                        >
                          {downloadingId === purchase.id ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {downloadingId === purchase.id ? 'Preparing...' : isReleased ? 'Re-download' : 'Download PDF'}
                        </button>
                      </div>

                      {/* Leave Review CTA — only shown after download if not already reviewed */}
                      {isReleased && !hasReviewed && (
                        <Link
                          href={`/explore?review=${purchase.note_id}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          Leave a Review
                        </Link>
                      )}
                      {isReleased && hasReviewed && (
                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Review submitted
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // --- Uploads Tab ---
        uploads.length === 0 ? (
          <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">You haven't uploaded any notes yet</h3>
            <p className="text-gray-500 mt-1">Start selling your study material to earn payouts.</p>
            <Link
              href="/upload"
              className="mt-6 inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Upload Notes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploads.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-md transition-all">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />

                <div className="p-6 flex-grow space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {note.title}
                    </h3>
                    <span className="inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {note.course_code}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Institution: </span>
                    {note.institution}
                  </div>

                  <div className="flex items-center text-sm text-gray-400 gap-1">
                    <Clock className="h-4 w-4" />
                    Uploaded {new Date(note.created_at).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div>{getStatusBadge(note.status)}</div>

                    {note.status === 'draft' && (
                      <button
                        id={`review-offer-${note.id}`}
                        onClick={() => setSelectedNote(note)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        Review Offer
                      </button>
                    )}

                    {note.status === 'published' && (
                      <div className="text-sm font-extrabold text-gray-900">
                        R{note.price_zar}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Offer Review Modal */}
      {selectedNote && (
        <OfferModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSuccess={fetchUploads}
        />
      )}
    </div>
  );
}
