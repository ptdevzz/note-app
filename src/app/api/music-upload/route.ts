import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { audioUrl, title, id } = await request.json();

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing audioUrl' }, { status: 400 });
    }

    // Nạp stream audio buffer từ nguồn
    const audioRes = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!audioRes.ok) {
      return NextResponse.json({ error: 'Cannot download audio source' }, { status: 400 });
    }

    const arrayBuffer = await audioRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = `data:audio/mp3;base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      fileUrl: base64Audio,
      storagePath: `music/${id || Date.now()}.mp3`
    });
  } catch (err: any) {
    console.warn('Lỗi music upload backend:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
