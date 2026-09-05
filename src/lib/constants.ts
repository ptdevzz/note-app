export const APP_VERSION = 'v3.0.0';
export const APP_NOTIFICATION_TITLE = '💕 Sổ Tay Tình Yêu';
export const CLASS_NAME = '26CĐTT2';

/** Email fallback khi chưa cấu hình admin_email (giữ nguyên hành vi cũ) */
export const DEFAULT_PARTNER_EMAIL = 'banguai@gmail.com';

/** Nudge chỉ hiển thị nếu được gửi trong khoảng thời gian này (ms) */
export const NUDGE_MAX_AGE_MS = 60_000;
export const NUDGE_TOAST_DURATION_MS = 8_000;

/** Presence: tần suất ghi "lần truy cập cuối" và ngưỡng coi là đang online */
export const PRESENCE_HEARTBEAT_MS = 60_000;
export const PRESENCE_ONLINE_WINDOW_MS = 2 * 60_000;

export const PLACE_CATEGORY_FILTERS = ['Tất cả', 'Ăn sáng', 'Ăn tối', 'Cà phê & Chill', 'Vui chơi'] as const;
export const ALL_CATEGORIES = PLACE_CATEGORY_FILTERS[0];

export const MOOD_OPTIONS = [
  { emoji: '🥰', label: 'Yêu đời' },
  { emoji: '🤤', label: 'Thèm trà sữa' },
  { emoji: '😾', label: 'Đang dỗi' },
  { emoji: '😴', label: 'Buồn ngủ' },
  { emoji: '🥳', label: 'Hào hứng' },
  { emoji: '🥺', label: 'Cần ôm' },
  { emoji: '🤒', label: 'Hơi mệt' },
  { emoji: '💖', label: 'Nhớ bạn' },
  { emoji: '🍕', label: 'Muốn ăn ngon' },
  { emoji: '☕', label: 'Chill chill' },
] as const;
