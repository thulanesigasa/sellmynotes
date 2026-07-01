import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type AdminAction = 'disputed' | 'refunded' | 'released';
const ALLOWED_ACTIONS: AdminAction[] = ['disputed', 'refunded', 'released'];

/**
 * PATCH /api/admin/purchases/[purchaseId]
 * Admin-only: update a purchase status for dispute/refund/release.
 * Middleware enforces role=admin before this runs.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    // Double-check admin role server-side (defence in depth)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Authorization' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Re-verify admin role from DB
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const { purchaseId } = await params;
    const { action, note } = await req.json();

    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Map action → purchase_status value
    const statusMap: Record<AdminAction, string> = {
      disputed: 'escrow',    // re-use escrow status; flag separately via admin note
      refunded: 'refunded',
      released: 'released',
    };

    const updatePayload: Record<string, any> = {
      status: statusMap[action as AdminAction],
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('purchases')
      .update(updatePayload)
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ purchase: updated, action, note }, { status: 200 });
  } catch (error: any) {
    console.error('Admin purchase mutation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/purchases/[purchaseId]
 * Admin-only: fetch single purchase details.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Authorization' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { purchaseId } = await params;
    const { data, error } = await supabaseAdmin
      .from('purchases')
      .select('*, notes(title, course_code, institution, seller_id), profiles!buyer_id(full_name, phone_number)')
      .eq('id', purchaseId)
      .single();

    if (error) throw error;
    return NextResponse.json({ purchase: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
