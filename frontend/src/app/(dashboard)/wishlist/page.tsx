"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Bookmark, GraduationCap, CreditCard, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  course_code: string;
  institution: string;
  price_zar: number;
}

export default function WishlistPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        fetchWishlist(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchWishlist = async (uid: string) => {
    try {
      // Fetch wishlist records for this user, joining with notes
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          note_id,
          notes:note_id (
            id,
            title,
            course_code,
            institution,
            price_zar
          )
        `)
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out deleted notes or nulls
      const validNotes = data
        ?.filter(item => item.notes)
        .map(item => Array.isArray(item.notes) ? item.notes[0] : item.notes) as Note[];

      setNotes(validNotes || []);
    } catch (error: any) {
      toast.error('Failed to load wishlist');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (noteId: string) => {
    if (!userId) return;
    
    // Optimistic UI update
    setNotes(prev => prev.filter(n => n.id !== noteId));
    toast.success("Removed from wishlist.");

    try {
      await supabase.from('wishlists').delete().eq('user_id', userId).eq('note_id', noteId);
    } catch (e) {
      console.error("Error removing from wishlist:", e);
    }
  };

  const handleBuy = async (noteId: string) => {
    setProcessingId(noteId);
    toast.loading('Initializing secure checkout...');

    try {
      if (!userId) {
        toast.dismiss();
        toast.error('You must be logged in to purchase notes.');
        setProcessingId(null);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/payfast/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ note_id: noteId })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      toast.dismiss();
      toast.success('Redirecting to PayFast...');

      const payfastUrl = 'https://sandbox.payfast.co.za/eng/process';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payfastUrl;

      for (const key in result.payfastData) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = result.payfastData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
      setProcessingId(null);
    }
  };

  if (!userId && !loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
        <p className="text-gray-500">You need to be signed in to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">My Wishlist</h1>
        <p className="text-gray-500 mt-2">Notes you've saved for later.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
          <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-1">Head over to the Explore page to find notes to save.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
              <div className="p-6 flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-2">{note.title}</h3>
                  
                  <button 
                    onClick={() => removeFromWishlist(note.id)}
                    className="p-1.5 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {note.course_code}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {note.institution}
                </div>
                
                <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-auto">
                  <span className="text-2xl font-extrabold text-gray-900">R{note.price_zar}</span>
                  
                  <button
                    onClick={() => handleBuy(note.id)}
                    disabled={processingId === note.id}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-colors ${
                      processingId === note.id ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {processingId === note.id ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Buy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
