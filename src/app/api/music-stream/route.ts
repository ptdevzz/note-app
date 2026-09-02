import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing youtube id' }, { status: 400 });
  }

  // Danh sách các Piped & Invidious Public Mirror siêu nhanh
  const instances = [
    `https://pipedapi.kavin.rocks/streams/${id}`,
    `https://pipedapi.mha.fi/streams/${id}`,
    `https://inv.nadeko.net/api/v1/videos/${id}`,
    `https://invidious.nerdvpn.de/api/v1/videos/${id}`,
    `https://inv.tux.pizza/api/v1/videos/${id}`
  ];

  for (const endpoint of instances) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // Max 3.5s timeout per mirror

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();

        // 1. Check Piped audioStreams
        if (data.audioStreams && data.audioStreams.length > 0) {
          const stream = data.audioStreams.find((s: any) => s.mimeType && s.mimeType.includes('audio')) || data.audioStreams[0];
          if (stream?.url) {
            return NextResponse.redirect(stream.url);
          }
        }

        // 2. Check Invidious adaptiveFormats
        if (data.adaptiveFormats && data.adaptiveFormats.length > 0) {
          const audio = data.adaptiveFormats.find((f: any) => f.type && f.type.includes('audio'));
          if (audio?.url) {
            return NextResponse.redirect(audio.url);
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback 3: Trả về link HTML5 Embed Stream nếu các Mirror quá tải
  return NextResponse.redirect(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`);
}
