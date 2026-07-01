"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import {
  ShieldAlert, CheckCircle2, XCircle, Clock, RefreshCw,
  AlertTriangle, Search, Filter, ExternalLink, Download
} from 'lucide-react';

interface AdminPurchase {
  id: string;
  status: string;
  amount_zar: number;
  created_at: string;
  updated_at: string;
  buyer_id: string;
  notes: {
    title: string;
    course_code: string;
    institution: string;
    seller_id: string;
  } | null;
  profiles: {
    full_name: string | null;
    phone_number: string | null;
  } | null;
}

type FilterStatus = 'all' | 'completed' | 'escrow' | 'refunded' | 'released' | 'pending';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-700',
  completed: 'bg-blue-100 text-blue-700',
  escrow:    'bg-amber-100 text-amber-700',
  released:  'bg-green-100 text-green-700',
  refunded:  'bg-red-100 text-red-700',
};

export default function AdminDashboardPage() {
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [filtered, setFiltered] = useState<AdminPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [generatingLedger, setGeneratingLedger] = useState(false);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          status,
          amount_zar,
          created_at,
          updated_at,
          buyer_id,
          notes (
            title,
            course_code,
            institution,
            seller_id
          ),
          profiles!buyer_id (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      const list = (data as any) || [];
      setPurchases(list);
      applyFilters(list, filterStatus, searchQuery);
    } catch (err: any) {
      toast.error(`Failed to load purchases: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  function applyFilters(
    list: AdminPurchase[],
    status: FilterStatus,
    query: string
  ) {
    let result = list;
    if (status !== 'all') result = result.filter((p) => p.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.notes?.title?.toLowerCase().includes(q) ||
          p.profiles?.full_name?.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.notes?.course_code?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    applyFilters(purchases, filterStatus, searchQuery);
  }, [filterStatus, searchQuery, purchases]);

  const handleAction = async (
    purchaseId: string,
    action: 'disputed' | 'refunded' | 'released'
  ) => {
    const labels: Record<string, string> = {
      disputed: 'flag as disputed',
      refunded: 'mark as refunded',
      released: 'manually release',
    };

    if (!confirm(`Are you sure you want to ${labels[action]} this purchase?`)) return;

    setProcessingId(purchaseId);
    const toastId = toast.loading(`Applying action: ${action}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`/api/admin/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Action failed');

      toast.dismiss(toastId);
      toast.success(`Purchase ${action} successfully.`);
      fetchPurchases();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateLedger = async () => {
    setGeneratingLedger(true);
    const toastId = toast.loading('Generating payout ledger...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to generate ledger');

      if (!body.ledger || body.ledger.length === 0) {
        toast.dismiss(toastId);
        toast.info('No pending payouts found.');
        return;
      }

      // Convert to CSV
      const headers = ['Seller ID', 'Seller Name', 'Amount (ZAR)', 'Purchase IDs', 'Banking Details'];
      const rows = body.ledger.map((row: any) => [
        row.seller_id,
        `"${row.seller_name}"`,
        row.amount_zar,
        `"${row.purchase_ids.join(',')}"`,
        `"${JSON.stringify(row.payfast_details || {}).replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payout_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(toastId);
      toast.success('Ledger generated and downloaded successfully.');
      fetchPurchases(); // Refresh the table
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Failed to generate ledger');
    } finally {
      setGeneratingLedger(false);
    }
  };

  // Summary stats
  const stats = {
    total: purchases.length,
    escrow: purchases.filter((p) => p.status === 'escrow' || p.status === 'completed').length,
    refunded: purchases.filter((p) => p.status === 'refunded').length,
    grossVolume: purchases
      .filter((p) => ['completed', 'released', 'escrow'].includes(p.status))
      .reduce((sum, p) => sum + p.amount_zar, 0),
  };

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'escrow', label: 'Escrow / Disputed' },
    { value: 'released', label: 'Released' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <ShieldAlert className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Dispute resolution · Escrow management · Refunds</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            id="admin-generate-ledger-btn"
            onClick={handleGenerateLedger}
            disabled={generatingLedger}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generatingLedger ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Download className="h-4 w-4" />
            )}
            Payout Ledger
          </button>
          <button
            id="admin-refresh-btn"
            onClick={fetchPurchases}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Purchases', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: 'In Escrow / Disputed', value: stats.escrow, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Refunded', value: stats.refunded, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Gross Volume', value: `R${stats.grossVolume.toFixed(2)}`, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-2xl p-5`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            id="admin-search"
            type="text"
            placeholder="Search by buyer, note title, course code, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <Filter className="h-4 w-4 text-gray-400 ml-2 shrink-0" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              id={`filter-${opt.value}`}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterStatus === opt.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <AlertTriangle className="mx-auto h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">No purchases match your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['ID', 'Buyer', 'Note', 'Amount', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((purchase) => {
                  const isProcessing = processingId === purchase.id;
                  const canDispute = ['completed', 'released'].includes(purchase.status);
                  const canRefund = ['completed', 'escrow', 'released'].includes(purchase.status);
                  const canRelease = purchase.status === 'escrow';

                  return (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-gray-500">
                          {purchase.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {purchase.profiles?.full_name || '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {purchase.profiles?.phone_number || ''}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">
                          {purchase.notes?.title || '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {purchase.notes?.course_code} · {purchase.notes?.institution}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          R{purchase.amount_zar.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[purchase.status] || 'bg-gray-100 text-gray-600'}`}>
                          {purchase.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(purchase.created_at).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        <br />
                        <span className="text-gray-300">
                          {new Date(purchase.created_at).toLocaleTimeString('en-ZA', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {canRelease && (
                            <button
                              id={`release-${purchase.id}`}
                              onClick={() => handleAction(purchase.id, 'released')}
                              disabled={isProcessing}
                              title="Manually release escrow"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Release
                            </button>
                          )}

                          {canDispute && (
                            <button
                              id={`dispute-${purchase.id}`}
                              onClick={() => handleAction(purchase.id, 'disputed')}
                              disabled={isProcessing}
                              title="Flag as disputed — pauses escrow timer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                              <Clock className="h-3.5 w-3.5" /> Dispute
                            </button>
                          )}

                          {canRefund && (
                            <button
                              id={`refund-${purchase.id}`}
                              onClick={() => handleAction(purchase.id, 'refunded')}
                              disabled={isProcessing}
                              title="Mark as refunded"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Refund
                            </button>
                          )}

                          {isProcessing && (
                            <svg className="animate-spin h-4 w-4 text-gray-400 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {purchases.length} purchases
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
