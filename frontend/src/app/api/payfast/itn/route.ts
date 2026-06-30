import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const itnData: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      itnData[key] = value.toString();
    }

    const {
      m_payment_id,
      pf_payment_id,
      payment_status,
      item_name,
      amount_gross,
      amount_fee,
      amount_net,
      signature
    } = itnData;

    if (!m_payment_id) {
      return NextResponse.json({ error: 'Missing m_payment_id' }, { status: 400 });
    }

    // 1. Verify ITN against PayFast server
    // For Sandbox, use sandbox.payfast.co.za. For prod, use www.payfast.co.za
    const pfHost = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za';
    
    // Convert formData back to string for validation
    const params = new URLSearchParams(itnData as any).toString();
    
    const validateResponse = await fetch(`${pfHost}/eng/query/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const validateResult = await validateResponse.text();

    if (validateResult !== 'VALID') {
      console.error('PayFast Validation Failed', validateResult);
      return NextResponse.json({ error: 'Invalid ITN' }, { status: 400 });
    }

    // 2. Process Successful Payment
    if (payment_status === 'COMPLETE') {
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from('purchases')
        .update({
          status: 'completed',
          payfast_pf_payment_id: pf_payment_id
        })
        .eq('id', m_payment_id)
        .select()
        .single();

      if (purchaseError) {
        console.error('Failed to update purchase in DB', purchaseError);
      } else {
        console.log(`Purchase ${m_payment_id} marked as COMPLETE`);
      }
    }

    // 3. Always return 200 OK so PayFast knows we received it
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error('ITN Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
