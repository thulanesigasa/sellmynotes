import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    // 1. Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Authorization' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch purchases that are 'released' and payout_status is 'pending'
    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from('purchases')
      .select('id, amount_zar, notes(seller_id)')
      .eq('status', 'released')
      .eq('payout_status', 'pending');

    if (purchasesError) {
      throw purchasesError;
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ message: 'No pending payouts found', ledger: [] }, { status: 200 });
    }

    // 3. Group by seller_id and calculate owed amounts (amount_zar * 0.85)
    const PLATFORM_FEE = 0.15;
    const sellerLedger: Record<string, { total_owed: number, purchase_ids: string[] }> = {};

    for (const purchase of purchases) {
      const sellerId = purchase.notes?.seller_id;
      if (!sellerId) continue;
      
      const netAmount = purchase.amount_zar * (1 - PLATFORM_FEE);
      
      if (!sellerLedger[sellerId]) {
        sellerLedger[sellerId] = { total_owed: 0, purchase_ids: [] };
      }
      sellerLedger[sellerId].total_owed += netAmount;
      sellerLedger[sellerId].purchase_ids.push(purchase.id);
    }

    // 4. Update payout_status to 'processing' for the included purchases
    const purchaseIdsToUpdate = purchases.map((p: any) => p.id);
    if (purchaseIdsToUpdate.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('purchases')
        .update({ payout_status: 'processing', updated_at: new Date().toISOString() })
        .in('id', purchaseIdsToUpdate);

      if (updateError) {
        throw updateError;
      }
    }

    // 5. Fetch seller banking/PayFast details
    const sellerIds = Object.keys(sellerLedger);
    const { data: sellers } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, payfast_payout_details')
      .in('id', sellerIds);

    const sellerMap = new Map((sellers || []).map(s => [s.id, s]));

    // Format the ledger for the frontend (CSV generation)
    const ledger = Object.entries(sellerLedger).map(([sellerId, data]) => {
      const seller = sellerMap.get(sellerId);
      return {
        seller_id: sellerId,
        seller_name: seller?.full_name || 'Unknown',
        amount_zar: Number(data.total_owed.toFixed(2)),
        payfast_details: seller?.payfast_payout_details || null,
        purchase_ids: data.purchase_ids
      };
    });

    return NextResponse.json({ message: 'Ledger generated successfully', ledger }, { status: 200 });

  } catch (error: any) {
    console.error('Payout Ledger generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
