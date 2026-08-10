import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tiktokUrl = searchParams.get('url');

  if (!tiktokUrl) {
    return NextResponse.json({ error: 'URL TikTok không hợp lệ' }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // Fallback response if TikTok oembed fails or is blocked
      return NextResponse.json({
        title: 'Video TikTok địa điểm ăn uống/chill',
        thumbnail_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        author_name: 'TikTok User',
        html: '',
        url: tiktokUrl
      });
    }

    const data = await res.json();
    
    // Auto extract category guess from title
    const titleLower = (data.title || '').toLowerCase();
    let guessedCategory = 'Ăn uống';
    if (titleLower.includes('cafe') || titleLower.includes('cà phê') || titleLower.includes('coffee')) {
      guessedCategory = 'Cà phê & Chill';
    } else if (titleLower.includes('lẩu') || titleLower.includes('nướng') || titleLower.includes('bbq') || titleLower.includes('tối')) {
      guessedCategory = 'Ăn tối';
    } else if (titleLower.includes('sáng') || titleLower.includes('bún') || titleLower.includes('phở')) {
      guessedCategory = 'Ăn sáng';
    } else if (titleLower.includes('xem phim') || titleLower.includes('chơi') || titleLower.includes('du lịch') || titleLower.includes('triển lãm')) {
      guessedCategory = 'Vui chơi';
    }

    // Auto extract district/location tag guess
    const tags: string[] = [];
    const districtMatch = titleLower.match(/q(\d+|10|11|12)|quận\s*(\d+|10|11|12|tân bình|bình thạnh|gò vấp|phú nhuận|thủ đức)/i);
    if (districtMatch) {
      tags.push(districtMatch[0].toUpperCase());
    } else {
      tags.push('Sài Gòn');
    }

    return NextResponse.json({
      title: data.title || 'Địa điểm TikTok hot',
      thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      author_name: data.author_name || 'TikTok Creator',
      html: data.html || '',
      url: tiktokUrl,
      guessedCategory,
      tags
    });
  } catch (error) {
    console.error('Lỗi khi bóc tách TikTok:', error);
    return NextResponse.json({
      title: 'Địa điểm TikTok được lưu',
      thumbnail_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      author_name: 'TikTok Video',
      html: '',
      url: tiktokUrl,
      guessedCategory: 'Ăn uống',
      tags: ['Đáng thử']
    });
  }
}
