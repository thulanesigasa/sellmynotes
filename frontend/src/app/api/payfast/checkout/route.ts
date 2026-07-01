import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generatePayFastSignature } from '@/lib/payfast';

export async function POST(req: Request) {
  try {
    const { note_id } = await req.json();
    
    // 1. Verify Authentication Token from headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const buyer_id = user.id;

    // 2. Fetch the note details to get the price
    const { data: note, error: noteError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', note_id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.status !== 'published') {
      return NextResponse.json({ error: 'Note is not published' }, { status: 400 });
    }

    // 3. Create a pending purchase record using Admin Client
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert([{
        buyer_id,
        note_id,
        amount_zar: note.price_zar,
        status: 'pending'
      }])
      .select()
      .single();

    if (purchaseError) {
      console.error('Purchase Insert Error:', purchaseError);
      return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
    }

    // 4. Construct PayFast data payload
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const payfastData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || '10000100', // sandbox default
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a', // sandbox default
      return_url: `${baseUrl}/explore?payment=success`,
      cancel_url: `${baseUrl}/explore?payment=cancelled`,
      notify_url: `${baseUrl}/api/payfast/itn`,
      name_first: user.user_metadata?.full_name?.split(' ')[0] || 'Student',
      name_last: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Buyer',
      email_address: user.email || 'buyer@student.co.za',
      m_payment_id: purchase.id,
      amount: note.price_zar.toFixed(2),
      item_name: note.title,
    };

    // 5. Generate MD5 Signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || 'jt7NOz29yCb'; // sandbox default
    const signature = generatePayFastSignature(payfastData, passphrase);
    payfastData['signature'] = signature;

    return NextResponse.json({ payfastData });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
