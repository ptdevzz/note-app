import { Innertube, UniversalCache } from 'youtubei.js';
import type { Types } from 'youtubei.js';

type InnerTubeClient = Types.InnerTubeClient;

/**
 * Tách audio từ YouTube ở phía server.
 * Thứ tự: youtubei.js (nhiều client) -> mirror Invidious/Piped có proxy.
 * Ưu tiên AAC/m4a để iOS Safari phát được (Safari không chơi WebM/Opus ổn định).
 */

export interface ResolvedAudio {
  bytes: Uint8Array;
  contentType: string;
  ext: 'm4a' | 'webm';
  durationSeconds?: number;
  source: 'youtubei' | 'mirror';
}

/** Giới hạn dung lượng file audio (bài nhạc 5-6 phút AAC 128kbps ~ 5-6MB) */
export const MAX_AUDIO_BYTES = 30 * 1024 * 1024;

const INNERTUBE_CLIENTS: InnerTubeClient[] = ['ANDROID', 'IOS', 'TV', 'WEB'];

const MIRROR_ENDPOINTS = (id: string) => [
  `https://inv.nadeko.net/api/v1/videos/${id}?local=true`,
  `https://invidious.nerdvpn.de/api/v1/videos/${id}?local=true`,
  `https://inv.tux.pizza/api/v1/videos/${id}?local=true`,
  `https://pipedapi.kavin.rocks/streams/${id}`,
  `https://pipedapi.mha.fi/streams/${id}`,
];

let innertubePromise: Promise<Innertube> | null = null;

function getInnertube(): Promise<Innertube> {
  if (!innertubePromise) {
    innertubePromise = Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    }).catch((err) => {
      innertubePromise = null;
      throw err;
    });
  }
  return innertubePromise;
}

function extFromMime(mime: string): 'm4a' | 'webm' {
  return mime.includes('webm') ? 'webm' : 'm4a';
}

function normalizeMime(mime: string): string {
  const base = mime.split(';')[0].trim();
  return base === 'audio/mp4' ? 'audio/mp4' : base || 'audio/mp4';
}

async function readStreamWithLimit(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Audio vượt giới hạn ${Math.round(maxBytes / 1024 / 1024)}MB`);
    }
    chunks.push(value);
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function downloadViaInnertube(videoId: string): Promise<ResolvedAudio> {
  const yt = await getInnertube();
  let lastError: unknown = new Error('Không lấy được stream từ YouTube');

  for (const client of INNERTUBE_CLIENTS) {
    try {
      const info = await yt.getBasicInfo(videoId, { client });
      const status = info.playability_status;
      if (status && status.status !== 'OK') {
        throw new Error(status.reason || `Video không phát được (${status.status})`);
      }

      // Ưu tiên AAC trong container mp4 (m4a), fallback sang bất kỳ audio nào
      let format;
      try {
        format = info.chooseFormat({ type: 'audio', quality: 'best', codec: 'mp4a', format: 'mp4', client });
      } catch {
        format = info.chooseFormat({ type: 'audio', quality: 'best', client });
      }

      const stream = await info.download({ type: 'audio', itag: format.itag, client });
      const bytes = await readStreamWithLimit(stream, MAX_AUDIO_BYTES);
      if (bytes.byteLength < 50 * 1024) {
        throw new Error('Stream quá ngắn, có thể bị YouTube chặn');
      }

      const contentType = normalizeMime(format.mime_type);
      return {
        bytes,
        contentType,
        ext: extFromMime(contentType),
        durationSeconds: info.basic_info.duration,
        source: 'youtubei',
      };
    } catch (err) {
      lastError = err;
      console.warn(`[music-cache] youtubei client ${client} thất bại:`, err instanceof Error ? err.message : err);
    }
  }

  throw lastError;
}

interface MirrorAudioCandidate {
  url: string;
  mime: string;
  bitrate: number;
}

function pickMirrorAudio(data: any): MirrorAudioCandidate | null {
  const candidates: MirrorAudioCandidate[] = [];

  // Invidious: adaptiveFormats[].type = 'audio/mp4; codecs="mp4a.40.2"'
  for (const f of data?.adaptiveFormats ?? []) {
    if (typeof f?.type === 'string' && f.type.startsWith('audio/') && f.url) {
      candidates.push({ url: f.url, mime: f.type, bitrate: Number(f.bitrate) || 0 });
    }
  }
  // Piped: audioStreams[].mimeType = 'audio/mp4'
  for (const s of data?.audioStreams ?? []) {
    if (typeof s?.mimeType === 'string' && s.mimeType.startsWith('audio/') && s.url) {
      candidates.push({ url: s.url, mime: s.mimeType, bitrate: Number(s.bitrate) || 0 });
    }
  }

  if (candidates.length === 0) return null;
  const mp4 = candidates.filter((c) => c.mime.includes('mp4'));
  const pool = mp4.length > 0 ? mp4 : candidates;
  return pool.sort((a, b) => b.bitrate - a.bitrate)[0];
}

async function downloadViaMirrors(videoId: string): Promise<ResolvedAudio> {
  let lastError: unknown = new Error('Tất cả mirror đều thất bại');

  for (const endpoint of MIRROR_ENDPOINTS(videoId)) {
    try {
      const metaRes = await fetchWithTimeout(endpoint, 5000, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status}`);
      const data = await metaRes.json();
      const picked = pickMirrorAudio(data);
      if (!picked) throw new Error('Không có audio stream');

      const audioRes = await fetchWithTimeout(picked.url, 25000, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!audioRes.ok || !audioRes.body) throw new Error(`Tải audio lỗi HTTP ${audioRes.status}`);

      const bytes = await readStreamWithLimit(audioRes.body, MAX_AUDIO_BYTES);
      if (bytes.byteLength < 50 * 1024) throw new Error('Stream quá ngắn');

      const contentType = normalizeMime(picked.mime);
      const duration = Number(data?.lengthSeconds ?? data?.duration) || undefined;
      return { bytes, contentType, ext: extFromMime(contentType), durationSeconds: duration, source: 'mirror' };
    } catch (err) {
      lastError = err;
      console.warn(`[music-cache] mirror ${endpoint} thất bại:`, err instanceof Error ? err.message : err);
    }
  }

  throw lastError;
}

export function isValidYoutubeId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id);
}

/** Tải audio của video YouTube về bộ nhớ server, thử youtubei trước rồi tới mirror. */
export async function downloadYoutubeAudio(videoId: string): Promise<ResolvedAudio> {
  try {
    return await downloadViaInnertube(videoId);
  } catch (primaryError) {
    console.warn('[music-cache] youtubei thất bại, chuyển sang mirror:', primaryError instanceof Error ? primaryError.message : primaryError);
    return downloadViaMirrors(videoId);
  }
}
