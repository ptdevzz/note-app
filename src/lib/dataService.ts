import { PlaceItem, LoveCoupon, MoodStatus, CoupleProfile, PhotoboothMemory } from './types';
import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';

const STORAGE_KEY_PLACES = 'us_weekends_places_v4';
const STORAGE_KEY_NOTE = 'us_weekends_love_note_v4';
const STORAGE_KEY_MOOD = 'us_weekends_mood_v4';
const STORAGE_KEY_COUPONS = 'us_weekends_coupons_v5';
const STORAGE_KEY_PHOTOBOOTHS = 'us_weekends_photobooths_v2';

const INITIAL_PLACES: PlaceItem[] = [];

// Rich Photobooth Initial Samples (6 Photos Facebook Grid)
const INITIAL_PHOTOBOOTHS: PhotoboothMemory[] = [
  {
    id: 'ptb-1',
    title: 'Kỷ Niệm Chụp Photobooth Life4Cuts Q1 💖',
    date: '2026-04-18',
    location: 'Photobooth Life4Cuts Quận 1',
    frameColor: 'pink',
    stripImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: 'https://www.tiktok.com',
    notes: 'Album chụp 6 tấm xinh xỉu! Bấm vào để xem tất cả ảnh HD nha.',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_COUPONS: LoveCoupon[] = [
  {
    id: 'coupon-1',
    code: 'MOVIE_JELLY_KISS',
    title: 'Đi Xem Phim Ở Jelly Kiss',
    description: 'Đặc quyền rủ người ấy đi xem phim riêng tư cực chill ở Jelly Kiss.',
    icon: '🎬',
    isUsed: false
  },
  {
    id: 'coupon-2',
    code: 'KISS_10_TIMES',
    title: 'Hun 10 Cái',
    description: 'Được nhận 10 nụ hôn ngọt ngào bất cứ lúc nào!',
    icon: '💋',
    isUsed: false
  },
  {
    id: 'coupon-3',
    code: 'EAT_JOLLIBEE',
    title: 'Đi Ăn Jollibee',
    description: 'Bao đi ăn gà rán & mì ý Jollibee giòn rụm thơm ngon.',
    icon: '🍗',
    isUsed: false
  }
];

export const dataService = {
  // --- PLACES API ---
  async getPlaces(): Promise<PlaceItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'places'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaceItem));
      } catch (err) {
        console.warn('Lỗi Firestore getPlaces, chuyển sang mock storage:', err);
      }
    }

    if (typeof window === 'undefined') return INITIAL_PLACES;
    const raw = localStorage.getItem(STORAGE_KEY_PLACES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(INITIAL_PLACES));
      return INITIAL_PLACES;
    }
    return JSON.parse(raw);
  },

  async addPlace(item: Omit<PlaceItem, 'id' | 'createdAt'>): Promise<PlaceItem> {
    const newItem: PlaceItem = {
      ...item,
      id: 'place-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'places'), newItem);
        return { ...newItem, id: docRef.id };
      } catch (err) {
        console.warn('Lỗi Firestore addPlace, dùng localStorage:', err);
      }
    }

    const current = await this.getPlaces();
    const updated = [newItem, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
    }
    return newItem;
  },

  async updatePlace(id: string, patch: Partial<PlaceItem>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'places', id);
        await updateDoc(ref, patch);
        return;
      } catch (err) {
        console.warn('Lỗi Firestore updatePlace:', err);
      }
    }

    const current = await this.getPlaces();
    const updated = current.map(item => item.id === id ? { ...item, ...patch } : item);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
    }
  },

  async deletePlace(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'places', id));
        return;
      } catch (err) {
        console.warn('Lỗi Firestore deletePlace:', err);
      }
    }

    const current = await this.getPlaces();
    const updated = current.filter(item => item.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
    }
  },

  // --- PHOTOBOOTHS API ---
  async getPhotobooths(): Promise<PhotoboothMemory[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'photobooths'));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PhotoboothMemory));
        }
      } catch (err) {
        console.warn('Lỗi Firestore getPhotobooths:', err);
      }
    }

    if (typeof window === 'undefined') return INITIAL_PHOTOBOOTHS;
    const raw = localStorage.getItem(STORAGE_KEY_PHOTOBOOTHS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PHOTOBOOTHS, JSON.stringify(INITIAL_PHOTOBOOTHS));
      return INITIAL_PHOTOBOOTHS;
    }
    return JSON.parse(raw);
  },

  async addPhotobooth(item: Omit<PhotoboothMemory, 'id' | 'createdAt'>): Promise<PhotoboothMemory> {
    const newItem: PhotoboothMemory = {
      ...item,
      id: 'ptb-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'photobooths', newItem.id);
        await setDoc(ref, newItem);
      } catch (err) {
        console.warn('Lỗi Firestore addPhotobooth:', err);
      }
    }

    const current = await this.getPhotobooths();
    const updated = [newItem, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PHOTOBOOTHS, JSON.stringify(updated));
    }
    return newItem;
  },

  async deletePhotobooth(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'photobooths', id));
      } catch (err) {
        console.warn('Lỗi Firestore deletePhotobooth:', err);
      }
    }

    const current = await this.getPhotobooths();
    const updated = current.filter(p => p.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PHOTOBOOTHS, JSON.stringify(updated));
    }
  },

  // --- LOVE NOTE API ---
  async getLoveNote(): Promise<string> {
    if (typeof window === 'undefined') return 'Hôm nay thế nào rồi? Nhớ ăn uống đầy đủ nha 💕';
    return localStorage.getItem(STORAGE_KEY_NOTE) || 'Hôm nay thế nào rồi? Nhớ ăn uống đầy đủ nha 💕';
  },

  async updateLoveNote(note: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_NOTE, note);
    }
  },

  // --- MOOD STATUS API ---
  async getMood(): Promise<MoodStatus> {
    if (typeof window === 'undefined') return { emoji: '🥰', label: 'Vui vẻ & Yêu đời', updatedAt: 'Vừa xong', by: 'Bạn Gái' };
    const raw = localStorage.getItem(STORAGE_KEY_MOOD);
    return raw ? JSON.parse(raw) : { emoji: '🥰', label: 'Vui vẻ & Yêu đời', updatedAt: 'Vừa xong', by: 'Bạn Gái' };
  },

  async updateMood(mood: MoodStatus): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify(mood));
    }
  },

  // --- LOVE COUPONS API (FIREBASE DIRECT SYNC) ---
  async getCoupons(): Promise<LoveCoupon[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoveCoupon));
        }
      } catch (err) {
        console.warn('Lỗi Firestore getCoupons, dùng localStorage:', err);
      }
    }

    if (typeof window === 'undefined') return INITIAL_COUPONS;
    const raw = localStorage.getItem(STORAGE_KEY_COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return JSON.parse(raw);
  },

  async addCoupon(item: Omit<LoveCoupon, 'id'>): Promise<LoveCoupon> {
    const newItem: LoveCoupon = {
      ...item,
      id: 'coupon-' + Date.now()
    };

    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'coupons', newItem.id);
        await setDoc(ref, newItem);
      } catch (err) {
        console.warn('Lỗi Firestore addCoupon:', err);
      }
    }

    const current = await this.getCoupons();
    const updated = [...current, newItem];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
    }
    return newItem;
  },

  async useCoupon(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'coupons', id);
        await updateDoc(ref, { isUsed: true, usedAt: 'Vừa kích hoạt' });
      } catch (err) {
        console.warn('Lỗi Firestore useCoupon:', err);
      }
    }

    const coupons = await this.getCoupons();
    const updated = coupons.map(c => c.id === id ? { ...c, isUsed: true, usedAt: 'Vừa kích hoạt' } : c);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
    }
  },

  async resetCoupon(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'coupons', id);
        await updateDoc(ref, { isUsed: false, usedAt: null });
      } catch (err) {
        console.warn('Lỗi Firestore resetCoupon:', err);
      }
    }

    const coupons = await this.getCoupons();
    const updated = coupons.map(c => c.id === id ? { ...c, isUsed: false, usedAt: undefined } : c);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
      } catch (err) {
        console.warn('Lỗi Firestore deleteCoupon:', err);
      }
    }

    const coupons = await this.getCoupons();
    const updated = coupons.filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
    }
  }
};
