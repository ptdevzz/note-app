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

export interface LoveSong {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
  youtubeId?: string;
  addedBy: string;
  addedAt: string;
}

export interface CoupleHobby {
  id: string;
  owner: 'GF' | 'BF'; // Bé Yêu hay Anh Iu
  category: 'Đá banh' | 'Máy tính gem' | 'Làm neo' | 'Ăn ún' | 'Khác';
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  addedAt: string;
}

export interface SharedMusicState {
  currentSong?: LoveSong | null;
  isPlaying: boolean;
  playedSeconds: number;
  updatedAt: number;
}

export interface CoupleProfile {
  coupleCode: string;
  partner1Name: string;
  partner2Name: string;
  startDate: string;
  currentLoveNote: string;
  partner2Mood: MoodStatus;
}

export interface TimetableScheduleItem {
  dayOfWeek: number; // 2: T2, 3: T3, 4: T4, 5: T5, 6: T6, 7: T7
  session: 'morning' | 'afternoon';
  lessons: string; // '1-5', '6-10'
  room: string;
  group: 'ALL' | 'N1' | 'N2';
}

export interface TimetableSubject {
  id: string;
  tt?: string;
  code: string;
  name: string;
  credits: number;
  type: 'theory' | 'practice' | 'military';
  lecturer: string;
  startDate: string; // DD/MM/YYYY
  endDate: string; // DD/MM/YYYY
  schedules: TimetableScheduleItem[];
  notes?: string;
}

export interface TimetableData {
  semester: string;
  className: string;
  startDate: string;
  endDate: string;
  notes: string[];
  subjects: TimetableSubject[];
}
