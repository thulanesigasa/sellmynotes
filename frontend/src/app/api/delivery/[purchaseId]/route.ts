import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const purchaseId = params.purchaseId;
    
    // 1. Get auth token from headers (the client sends this)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    // 2. Call the Python backend delivery endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    const response = await fetch(`${backendUrl}/delivery/download/${purchaseId}`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python backend error:', errorText);
      return NextResponse.json({ error: 'Failed to download document' }, { status: response.status });
    }

    // 3. Stream the PDF back to the client
    const headers = new Headers(response.headers);
    // Ensure content type and disposition are passed through
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="note_${purchaseId}.pdf"`);

    return new NextResponse(response.body, {
      status: 200,
      headers
    });
    
  } catch (error: any) {
    console.error('Delivery proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
