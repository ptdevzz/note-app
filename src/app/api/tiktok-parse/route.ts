import { NextResponse } from 'next/server';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
    });
    if (!res.ok) return imageUrl;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    // Giới hạn 500KB base64 để tránh vượt Firestore doc limit
    if (dataUri.length > 500_000) return imageUrl;

    return dataUri;
  } catch {
    return imageUrl;
  }
}

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
      return NextResponse.json({
        success: true,
        data: {
          title: 'Video TikTok địa điểm ăn uống/chill',
          thumbnail: FALLBACK_IMG,
          authorName: 'TikTok User',
          category: 'Ăn tối',
          tags: ['Sài Gòn'],
        }
      });
    }

    const data = await res.json();
    
    // Auto extract category guess from title
    const titleLower = (data.title || '').toLowerCase();
    let guessedCategory = 'Ăn tối';
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

    // Fetch thumbnail và convert sang base64 để lưu vĩnh viễn
    const thumbnailUrl = data.thumbnail_url || FALLBACK_IMG;
    const thumbnailBase64 = await fetchImageAsBase64(thumbnailUrl);

    return NextResponse.json({
      success: true,
      data: {
        title: data.title || 'Địa điểm TikTok hot',
        thumbnail: thumbnailBase64,
        authorName: data.author_name || 'TikTok Creator',
        category: guessedCategory,
        tags,
      }
    });
  } catch (error) {
    console.error('Lỗi khi bóc tách TikTok:', error);
    return NextResponse.json({
      success: true,
      data: {
        title: 'Địa điểm TikTok được lưu',
        thumbnail: FALLBACK_IMG,
        authorName: 'TikTok Video',
        category: 'Ăn tối',
        tags: ['Đáng thử'],
      }
    });
  }
}

