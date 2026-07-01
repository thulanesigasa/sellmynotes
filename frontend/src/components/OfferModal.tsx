"use client";

import React, { useState } from 'react';
import { X, Check, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OfferModalProps {
  note: {
    id: string;
    title: string;
    course_code: string;
    institution: string;
    description: string;
    price_zar: number;
    file_path: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function OfferModal({ note, onClose, onSuccess }: OfferModalProps) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('notes')
        .update({ status: 'published' })
        .eq('id', note.id);

      if (error) throw error;

      toast.success('Offer accepted! Your note is now live on the marketplace.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Failed to accept offer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this valuation? This will permanently delete your uploaded document and note record.')) {
      return;
    }

    try {
      setLoading(true);

      // 1. Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('raw_notes')
        .remove([note.file_path]);

      if (storageError) {
        console.error('Failed to remove from storage:', storageError.message);
      }

      // 2. Delete database record
      const { error: dbError } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (dbError) throw dbError;

      toast.success('Valuation rejected. The note and file have been deleted.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Failed to reject and delete note: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Review Smart Valuation</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Note Info */}
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-2">
              {note.course_code}
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{note.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{note.institution}</p>
          </div>

          {note.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {note.description}
              </p>
            </div>
          )}

          {/* Pricing Calculation Display */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-2">
            <h4 className="text-sm font-semibold text-indigo-900">Calculated Offer Value</h4>
            <div className="text-4xl font-black text-indigo-600">R{note.price_zar}</div>
            <p className="text-xs text-indigo-700/80 max-w-sm mx-auto">
              This includes the base valuation calculated by our advanced pricing algorithm, plus a platform-optimized distribution fee.
            </p>
          </div>

          <div className="flex items-start bg-amber-50 border border-amber-200 rounded-xl p-4 space-x-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-normal">
              Accepting this offer will immediately list the note on our public marketplace for other students to explore and purchase. Commission deductions and payout rules apply.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleReject}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-gray-200 text-sm font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 hover:border-red-200 shadow-sm transition-all disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reject & Delete
          </button>
          
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full sm:flex-1 inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-50 ml-auto"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Accept & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
