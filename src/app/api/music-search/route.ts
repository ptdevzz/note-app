import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results: any[] = [];
    const seenIds = new Set<string>();

    // 1. Tìm kiếm YouTube Music Full Track (100% Nguyên bài 3-5 phút, Không giới hạn 30s)
    try {
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' lyric video')}`;
      const ytRes = await fetch(ytUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8'
        }
      });

      if (ytRes.ok) {
        const html = await ytRes.text();
        const videoMatches = Array.from(html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g));
        const titleMatches = Array.from(html.matchAll(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g));
        const authorMatches = Array.from(html.matchAll(/"ownerText":\{"runs":\[\{"text":"([^"]+)"\}\]/g));

        for (let i = 0; i < videoMatches.length && results.length < 15; i++) {
          const vId = videoMatches[i][1];
          if (!seenIds.has(vId)) {
            seenIds.add(vId);
            const rawTitle = titleMatches[i]?.[1] || query;
            const author = authorMatches[i]?.[1] || 'V-Pop Artist';

            results.push({
              id: vId,
              title: rawTitle,
              artist: author,
              coverUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              audioUrl: `/api/music-stream?id=${vId}`,
              youtubeId: vId,
            });
          }
        }
    return NextResponse.json({ results });
  } catch (err) {
    console.warn('Lỗi music search backend:', err);
    return NextResponse.json({ results: [] });
  }
}
