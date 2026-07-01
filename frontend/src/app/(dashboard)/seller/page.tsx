"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import {
  TrendingUp, Clock, Wallet, AlertCircle, CheckCircle2,
  BookOpen, BarChart3, ArrowUpRight
} from 'lucide-react';

interface SaleSummary {
  id: string;
  amount_zar: number;
  status: string;
  created_at: string;
  notes: {
    title: string;
    course_code: string;
  };
}

interface Metrics {
  totalGross: number;
  pendingEscrow: number;
  availableBalance: number;
  salesCount: number;
}

const PLATFORM_FEE = 0.15; // 15% platform commission
const ESCROW_HOLD_HOURS = 48;
const MIN_PAYOUT = 100;

export default function SellerDashboardPage() {
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalGross: 0,
    pendingEscrow: 0,
    availableBalance: 0,
    salesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch all completed/released purchases for notes sold by this seller
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          amount_zar,
          status,
          created_at,
          notes!inner (
            title,
            course_code,
            seller_id
          )
        `)
        .eq('notes.seller_id', session.user.id)
        .in('status', ['completed', 'released', 'escrow'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      let totalGross = 0;
      let pendingEscrow = 0;
      let availableBalance = 0;

      (data || []).forEach((sale: any) => {
        const net = sale.amount_zar * (1 - PLATFORM_FEE);
        totalGross += sale.amount_zar;

        const ageHours = (now.getTime() - new Date(sale.created_at).getTime()) / (1000 * 60 * 60);

        if (ageHours < ESCROW_HOLD_HOURS) {
          pendingEscrow += net;
        } else {
          availableBalance += net;
        }
      });

      setSales(data as any || []);
      setMetrics({
        totalGross,
        pendingEscrow,
        availableBalance,
        salesCount: (data || []).length,
      });

      // Check if payout was already requested (stored in profile)
      const { data: profile } = await supabase
        .from('profiles')
        .select('payfast_payout_details')
        .eq('id', session.user.id)
        .single();

      if (profile?.payfast_payout_details?.payout_requested) {
        setPayoutRequested(true);
      }
    } catch (error: any) {
      toast.error('Failed to load seller dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (metrics.availableBalance < MIN_PAYOUT) return;

    setRequesting(true);
    const toastId = toast.loading('Submitting payout request...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          payfast_payout_details: {
            payout_requested: true,
            requested_at: new Date().toISOString(),
            amount: metrics.availableBalance.toFixed(2),
          }
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setPayoutRequested(true);
      toast.dismiss(toastId);
      toast.success(`Payout of R${metrics.availableBalance.toFixed(2)} requested! You'll hear from us within 2 business days.`);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  const metricCards = [
    {
      id: 'metric-gross',
      label: 'Total Gross Sales',
      value: `R${metrics.totalGross.toFixed(2)}`,
      sub: `${metrics.salesCount} sale${metrics.salesCount !== 1 ? 's' : ''} completed`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      id: 'metric-escrow',
      label: 'Pending Escrow',
      value: `R${metrics.pendingEscrow.toFixed(2)}`,
      sub: `Funds held for < ${ESCROW_HOLD_HOURS}h buyer protection`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      id: 'metric-balance',
      label: 'Available Balance',
      value: `R${metrics.availableBalance.toFixed(2)}`,
      sub: `After ${PLATFORM_FEE * 100}% platform commission`,
      icon: Wallet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-9 w-9 text-blue-600" />
            Seller Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Track your earnings, escrow holds, and request payouts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {metricCards.map((card) => (
              <div
                key={card.id}
                id={card.id}
                className={`rounded-2xl border ${card.border} ${card.bg} p-6 flex items-start gap-4`}
              >
                <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payout Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Request Payout</h2>
                <p className="text-sm text-gray-500">
                  Payouts are processed within 2 business days via EFT. Minimum payout is R{MIN_PAYOUT}.
                </p>
                {metrics.availableBalance < MIN_PAYOUT && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    You need at least R{MIN_PAYOUT} available to request a payout.
                  </p>
                )}
              </div>

              {payoutRequested ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Payout Requested
                </div>
              ) : (
                <button
                  id="request-payout-btn"
                  onClick={handleRequestPayout}
                  disabled={requesting || metrics.availableBalance < MIN_PAYOUT}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all ${
                    metrics.availableBalance >= MIN_PAYOUT && !requesting
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {requesting ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  Request R{metrics.availableBalance.toFixed(2)} Payout
                </button>
              )}
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Sales History</h2>
            </div>

            {sales.length === 0 ? (
              <div className="text-center p-16 text-gray-400">
                <TrendingUp className="mx-auto h-10 w-10 mb-4 opacity-40" />
                <p className="font-medium text-gray-500">No sales yet</p>
                <p className="text-sm mt-1">Once buyers purchase your notes, they'll appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net (after 15%)</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sales.map((sale) => {
                      const ageHours = (new Date().getTime() - new Date(sale.created_at).getTime()) / (1000 * 60 * 60);
                      const inEscrow = ageHours < ESCROW_HOLD_HOURS;
                      const net = sale.amount_zar * (1 - PLATFORM_FEE);

                      return (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">{sale.notes?.title}</p>
                            <p className="text-xs text-gray-400">{sale.notes?.course_code}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(sale.created_at).toLocaleDateString('en-ZA', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            R{sale.amount_zar.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">
                            R{net.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            {inEscrow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Clock className="h-3 w-3" /> In Escrow
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3" /> Available
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
