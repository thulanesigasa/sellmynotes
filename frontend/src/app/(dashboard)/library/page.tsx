"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Download, Clock, Library } from 'lucide-react';

interface Purchase {
  id: string;
  status: string;
  created_at: string;
  notes: {
    title: string;
    course_code: string;
    institution: string;
  };
}

export default function LibraryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          status,
          created_at,
          notes (
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
    } catch (error: any) {
      toast.error('Failed to load library');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchaseId: string, title: string) => {
    setDownloadingId(purchaseId);
    toast.loading('Applying security watermarks & preparing download...');

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
        throw new Error('Failed to download document');
      }

      // Handle the file download in the browser
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.dismiss();
      toast.success('Download complete!');
      
      // Refresh to show status changed to released
      fetchLibrary();
      
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">My Library</h1>
        <p className="text-gray-500 mt-2">Access and download your purchased notes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
          <Library className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Your library is empty</h3>
          <p className="text-gray-500 mt-1">Head over to the Explore page to find notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:border-blue-300 transition-colors">
              <div className="p-6 flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {purchase.notes.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {purchase.notes.course_code}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Institution:</span>
                  {purchase.notes.institution}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                </div>
                
                <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-auto">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status: {purchase.status}
                  </span>
                  <button
                    onClick={() => handleDownload(purchase.id, purchase.notes.title)}
                    disabled={downloadingId === purchase.id}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-colors ${
                      downloadingId === purchase.id ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {downloadingId === purchase.id ? (
                      <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloadingId === purchase.id ? 'Preparing...' : 'Download PDF'}
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
