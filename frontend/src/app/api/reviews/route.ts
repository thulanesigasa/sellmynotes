import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    // 1. Verify authenticated user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { note_id, rating, comment } = await req.json();

    if (!note_id || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid payload. note_id and rating (1–5) are required.' },
        { status: 400 }
      );
    }

    // 2. ZERO-TRUST: Verify this user has a completed purchase for this note
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('note_id', note_id)
      .eq('buyer_id', user.id)
      .in('status', ['completed', 'released'])
      .maybeSingle();

    if (purchaseError) {
      console.error('Purchase verification error:', purchaseError);
      return NextResponse.json({ error: 'Failed to verify purchase' }, { status: 500 });
    }

    if (!purchase) {
      // Strictly reject — user did not buy this note
      return NextResponse.json(
        { error: 'Forbidden. You must purchase this note before leaving a review.' },
        { status: 403 }
      );
    }

    // 3. Check for duplicate review
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('note_id', note_id)
      .eq('buyer_id', user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this note.' },
        { status: 409 }
      );
    }

    // 4. Insert the verified review
    const { data: review, error: insertError } = await supabaseAdmin
      .from('reviews')
      .insert([{
        note_id,
        buyer_id: user.id,
        rating,
        comment: comment?.trim() || null,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Review insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error('Review API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
