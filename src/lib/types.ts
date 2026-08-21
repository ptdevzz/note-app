export type PlaceCategory = 'Ăn sáng' | 'Ăn trưa' | 'Ăn tối' | 'Cà phê & Chill' | 'Vui chơi' | 'Khác';

export type PlaceStatus = 'SAVED' | 'PLANNED' | 'VISITED';

export interface PlaceItem {
  id: string;
  coupleId: string;
  tiktokUrl: string;
  title: string;
  thumbnail: string;
  authorName: string;
  category: PlaceCategory;
  tags: string[];
  status: PlaceStatus;
  plannedDate?: string | null; // YYYY-MM-DD
  rating?: number; // 1-5 stars
  notes?: string;
  costEstimate?: number; // e.g. 300000 (VND)
  photoUrl?: string; // Memories photo
  createdBy: string;
  createdAt: string;
  visitedAt?: string; // DD/MM/YYYY HH:MM - ngày đi thực tế
}

export interface PhotoboothMemory {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  location: string;
  frameColor: 'pink' | 'dark' | 'cream' | 'purple';
  stripImage: string; // Cover photo / strip image
  images?: string[]; // Multiple photos array (Facebook collage grid style)
  videoUrl?: string; // Video timelapse from Photobooth QR code
  notes?: string;
  createdAt: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUsed: boolean;
  usedAt?: string;
  code: string;
}

export interface DailyLoveNote {
  id: string;
  content: string;
  author: string;
  updatedAt: string;
}

export interface MoodStatus {
  emoji: string;
  label: string;
  updatedAt: string;
  by: string;
}

export interface CoupleProfile {
  coupleCode: string;
  partner1Name: string;
  partner2Name: string;
  startDate: string;
  currentLoveNote: string;
  partner2Mood: MoodStatus;
}
