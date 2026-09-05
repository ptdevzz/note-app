import { NextResponse } from 'next/server';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { downloadYoutubeAudio, isValidYoutubeId } from '@/lib/server/youtubeAudio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Tải + upload một bài ~3-6MB thường mất 10-30s
export const maxDuration = 60;

interface CacheResult {
  audioUrl: string;
  storagePath: string;
  contentType: string;
  durationSeconds?: number;
  cached: boolean;
  source?: 'youtubei' | 'mirror';
}

/** Nếu file đã có trên Storage (bài được thêm lại) thì dùng luôn, không tải lại */
async function findExisting(youtubeId: string): Promise<CacheResult | null> {
  if (!storage) return null;
  for (const ext of ['m4a', 'webm'] as const) {
    const storagePath = `music/${youtubeId}.${ext}`;
    try {
      const audioUrl = await getDownloadURL(ref(storage, storagePath));
      return {
        audioUrl,
        storagePath,
        contentType: ext === 'm4a' ? 'audio/mp4' : 'audio/webm',
        cached: true,
      };
    } catch {
      // chưa có file
    }
  }
  return null;
}

/**
 * POST /api/music-cache  { youtubeId }
 * Tách audio từ YouTube ở server, upload lên Firebase Storage,
 * trả về URL tĩnh để client phát như mp3 thường (tua được, chạy nền, không phụ thuộc mirror).
 */
export async function POST(request: Request) {
  if (!storage) {
    return NextResponse.json({ error: 'Firebase Storage chưa được cấu hình' }, { status: 503 });
  }

  let youtubeId: unknown;
  try {
    ({ youtubeId } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  if (!isValidYoutubeId(youtubeId)) {
    return NextResponse.json({ error: 'youtubeId không hợp lệ' }, { status: 400 });
  }

  try {
    const existing = await findExisting(youtubeId);
    if (existing) {
      return NextResponse.json(existing);
    }

    const audio = await downloadYoutubeAudio(youtubeId);
    const storagePath = `music/${youtubeId}.${audio.ext}`;
    const fileRef = ref(storage, storagePath);

    await uploadBytes(fileRef, audio.bytes, {
      contentType: audio.contentType,
      cacheControl: 'public, max-age=31536000, immutable',
      customMetadata: { youtubeId, source: audio.source },
    });
    const audioUrl = await getDownloadURL(fileRef);

    const result: CacheResult = {
      audioUrl,
      storagePath,
      contentType: audio.contentType,
      durationSeconds: audio.durationSeconds,
      cached: false,
      source: audio.source,
    };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không tải được audio';
    console.warn('[music-cache] lỗi:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
