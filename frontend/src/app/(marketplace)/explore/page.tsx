"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Search, GraduationCap, CreditCard } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  course_code: string;
  institution: string;
  price_zar: number;
}

export default function ExplorePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your notes are ready to download.');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment cancelled.');
    }
    fetchNotes();
  }, [searchParams]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, course_code, institution, price_zar')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast.error('Failed to load notes');
      console.error('Fetch Notes Error:', JSON.stringify(error, null, 2), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (noteId: string) => {
    setProcessingId(noteId);
    toast.loading('Initializing secure checkout...');

    try {
      // Get the session token to pass to the API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.dismiss();
        toast.error('You must be logged in to purchase notes.');
        setProcessingId(null);
        return;
      }

      const res = await fetch('/api/payfast/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ note_id: noteId })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      toast.dismiss();
      toast.success('Redirecting to PayFast...');

      // Create a dynamic form and submit it to PayFast Sandbox
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

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.course_code.toLowerCase().includes(search.toLowerCase()) ||
    n.institution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Explore Notes</h1>
          <p className="text-gray-500 mt-2">Find and purchase top-tier study material.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
            placeholder="Search by course, institution, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{note.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                        Buy Now
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
