import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Tìm kiếm bài hát chuẩn YouTube Data (Hỗ trợ 100% Nhạc Việt, Full Track)
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' lyric video')}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      next: { revalidate: 3600 }
    });

    const html = await res.text();
    const videoMatches = Array.from(html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g));
    const titleMatches = Array.from(html.matchAll(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g));
    const authorMatches = Array.from(html.matchAll(/"ownerText":\{"runs":\[\{"text":"([^"]+)"\}\]/g));

    const results: any[] = [];
    const seenIds = new Set<string>();

    for (let i = 0; i < videoMatches.length && results.length < 12; i++) {
      const vId = videoMatches[i][1];
      if (!seenIds.has(vId)) {
        seenIds.add(vId);
        const rawTitle = titleMatches[i]?.[1] || query;
        const author = authorMatches[i]?.[1] || 'YouTube Music';

        results.push({
          id: vId,
          title: rawTitle,
          artist: author,
          coverUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
          youtubeId: vId,
        });
      }
    }

    // Fallback qua Invidious API nếu scraping không tìm thấy
    if (results.length === 0) {
      const invRes = await fetch(`https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      if (invRes.ok) {
        const data = await invRes.json();
        (data || []).slice(0, 12).forEach((item: any) => {
          results.push({
            id: item.videoId,
            title: item.title,
            artist: item.author || 'YouTube',
            coverUrl: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            youtubeId: item.videoId,
          });
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Lỗi API music-search:', error);
    return NextResponse.json({ results: [] });
  }
}
