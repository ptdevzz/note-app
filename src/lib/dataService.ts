import { PlaceItem, LoveCoupon, MoodStatus, PhotoboothMemory } from './types';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, getDocs, getDoc, addDoc, updateDoc, doc, deleteDoc, 
  query, orderBy, setDoc, onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY_PLACES = 'us_weekends_places_v4';
const STORAGE_KEY_NOTE = 'us_weekends_love_note_v4';
const STORAGE_KEY_MOOD = 'us_weekends_mood_v4';
const STORAGE_KEY_COUPONS = 'us_weekends_coupons_v5';
const STORAGE_KEY_PHOTOBOOTHS = 'us_weekends_photobooths_v2';

const INITIAL_PLACES: PlaceItem[] = [];
const INITIAL_PHOTOBOOTHS: PhotoboothMemory[] = [
 
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
    title: 'Hun 10 Cái Ngọt Ngào',
    description: 'Được nhận 10 nụ hôn ngọt ngào bất cứ lúc nào!',
    icon: '💋',
    isUsed: false
  },
  {
    id: 'coupon-3',
    code: 'EAT_JOLLIBEE',
    title: 'Đi Ăn Jollibee Giòn Rụm',
    description: 'Bao đi ăn gà rán & mì ý Jollibee giòn rụm thơm ngon.',
    icon: '🍗',
    isUsed: false
  },
  {
    id: 'coupon-4',
    code: 'MILK_TEA_SIZE_L',
    title: 'Bao 1 Ly Trà Sữa Size L',
    description: 'Đặc quyền được anh mua tặng 1 ly trà sữa full topping size L!',
    icon: '🧋',
    isUsed: false
  },
  {
    id: 'coupon-5',
    code: 'MASSAGE_15_MINS',
    title: 'Massage Lưng & Vai 15 Phút',
    description: 'Được người ấy bóp vai, đấm lưng thư giãn sau ngày làm việc mệt mỏi.',
    icon: '💆‍♀️',
    isUsed: false
  },
  {
    id: 'coupon-6',
    code: 'FORGIVE_FOR_FREE',
    title: 'Thẻ Miễn Trừ Lỗi Nhỏ',
    description: 'Thẻ được tha lỗi bất kì 1 lần mà không bị dỗi hay trách móc.',
    icon: '🥺',
    isUsed: false
  },
  {
    id: 'coupon-7',
    code: 'BUY_SNACKS',
    title: 'Dẫn Đi Mua Đồ Ăn Vặt',
    description: 'Dẫn bé yêu đi cửa hàng tiện lợi/siêu thị chọn vô tư những món khoái khẩu.',
    icon: '🛒',
    isUsed: false
  }
];

export const dataService = {
  // --- REALTIME SUBSCRIBERS ---

  subscribePlaces(callback: (places: PlaceItem[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'places'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
          const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaceItem));
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(items));
          }
          callback(items);
        }, (err) => {
          console.warn('Lỗi Firestore subscribePlaces:', err);
        });
      } catch (err) {
        console.warn('Không thể đăng ký Firestore subscribePlaces:', err);
      }
    }

    this.getPlaces().then(callback);
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_PLACES) {
          this.getPlaces().then(callback);
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    return () => {};
  },

  subscribePhotobooths(callback: (photobooths: PhotoboothMemory[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'photobooths'));
        return onSnapshot(q, (snap) => {
          let items: PhotoboothMemory[] = [];
          if (!snap.empty) {
            items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PhotoboothMemory));
          } else {
            items = INITIAL_PHOTOBOOTHS;
            // Auto seed initial photobooths collection to Firebase Firestore!
            INITIAL_PHOTOBOOTHS.forEach(item => {
              setDoc(doc(db!, 'photobooths', item.id), item).catch(e => {
                console.warn('Lỗi auto-seed photobooth lên Firebase:', e);
              });
            });
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_PHOTOBOOTHS, JSON.stringify(items));
          }
          callback(items);
        }, (err) => {
          console.warn('Lỗi Firestore subscribePhotobooths:', err);
        });
      } catch (err) {
        console.warn('Không thể đăng ký Firestore subscribePhotobooths:', err);
      }
    }

    this.getPhotobooths().then(callback);
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_PHOTOBOOTHS) {
          this.getPhotobooths().then(callback);
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    return () => {};
  },

  subscribeCoupons(callback: (coupons: LoveCoupon[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'coupons'));
        return onSnapshot(q, (snap) => {
          let items: LoveCoupon[] = [];
          if (!snap.empty) {
            items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoveCoupon));
          } else {
            items = INITIAL_COUPONS;
            // Automatically push initial coupons dataset up to Firebase Firestore!
            INITIAL_COUPONS.forEach(coupon => {
              setDoc(doc(db!, 'coupons', coupon.id), coupon).catch(e => {
                console.warn('Lỗi auto-seed coupon lên Firebase:', e);
              });
            });
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(items));
          }
          callback(items);
        }, (err) => {
          console.warn('Lỗi Firestore subscribeCoupons:', err);
        });
      } catch (err) {
        console.warn('Không thể đăng ký Firestore subscribeCoupons:', err);
      }
    }

    this.getCoupons().then(callback);
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_COUPONS) {
          this.getCoupons().then(callback);
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    return () => {};
  },

  subscribeLoveNote(callback: (note: string) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'settings', 'love_note');
        return onSnapshot(ref, (snap) => {
          if (snap.exists() && snap.data()?.content) {
            const note = snap.data().content;
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_NOTE, note);
            }
            callback(note);
          }
        }, (err) => {
          console.warn('Lỗi Firestore subscribeLoveNote:', err);
        });
      } catch (err) {
        console.warn('Không thể đăng ký Firestore subscribeLoveNote:', err);
      }
    }

    this.getLoveNote().then(callback);
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_NOTE) {
          this.getLoveNote().then(callback);
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    return () => {};
  },

  subscribeMood(callback: (mood: MoodStatus) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'settings', 'mood');
        return onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            const moodData = snap.data() as MoodStatus;
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify(moodData));
            }
            callback(moodData);
          }
        }, (err) => {
          console.warn('Lỗi Firestore subscribeMood:', err);
        });
      } catch (err) {
        console.warn('Không thể đăng ký Firestore subscribeMood:', err);
      }
    }

    this.getMood().then(callback);
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_MOOD) {
          this.getMood().then(callback);
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    return () => {};
  },

  // --- PLACES API ---
  async getPlaces(): Promise<PlaceItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'places'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaceItem));
        }
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

    // Optimistic local storage update
    if (typeof window !== 'undefined') {
      try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY_PLACES) || '[]');
        const updated = [newItem, ...current];
        localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage addPlace:', e);
      }
    }

    // Non-blocking Firestore Sync
    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'places', newItem.id);
      setDoc(ref, newItem).catch(err => {
        console.warn('Lỗi Firestore addPlace (kiểm tra Rules trên Firebase Console):', err);
      });
    }

    return newItem;
  },

  async updatePlace(id: string, patch: Partial<PlaceItem>): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const current: PlaceItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PLACES) || '[]');
        const updated = current.map(item => item.id === id ? { ...item, ...patch } : item);
        localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage updatePlace:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'places', id);
      updateDoc(ref, patch).catch(err => {
        console.warn('Lỗi Firestore updatePlace:', err);
      });
    }
  },

  async deletePlace(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const current: PlaceItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PLACES) || '[]');
        const updated = current.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage deletePlace:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'places', id)).catch(err => {
        console.warn('Lỗi Firestore deletePlace:', err);
      });
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

    if (typeof window !== 'undefined') {
      try {
        const current: PhotoboothMemory[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PHOTOBOOTHS) || '[]');
        const updated = [newItem, ...current];
        localStorage.setItem(STORAGE_KEY_PHOTOBOOTHS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage addPhotobooth:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'photobooths', newItem.id);
      setDoc(ref, newItem)
        .then(() => console.log('Đã lưu Photobooth lên Firestore thành công! ID:', newItem.id))
        .catch(err => {
          console.warn('Lỗi Firestore addPhotobooth:', err);
        });
    }

    return newItem;
  },

  async deletePhotobooth(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const current: PhotoboothMemory[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PHOTOBOOTHS) || '[]');
        const updated = current.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY_PHOTOBOOTHS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage deletePhotobooth:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'photobooths', id)).catch(err => {
        console.warn('Lỗi Firestore deletePhotobooth:', err);
      });
    }
  },

  // --- LOVE NOTE API ---
  async getLoveNote(): Promise<string> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'love_note'));
        if (snap.exists() && snap.data()?.content) {
          return snap.data().content;
        }
      } catch (err) {
        console.warn('Lỗi Firestore getLoveNote:', err);
      }
    }
    if (typeof window === 'undefined') return 'Hôm nay thế nào rồi? Nhớ ăn uống đầy đủ nha 💕';
    return localStorage.getItem(STORAGE_KEY_NOTE) || 'Hôm nay thế nào rồi? Nhớ ăn uống đầy đủ nha 💕';
  },

  async updateLoveNote(note: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_NOTE, note);
    }

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'settings', 'love_note'), { content: note, updatedAt: new Date().toISOString() }).catch(err => {
        console.warn('Lỗi Firestore updateLoveNote:', err);
      });
    }
  },

  // --- MOOD STATUS API ---
  async getMood(): Promise<MoodStatus> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'mood'));
        if (snap.exists()) {
          return snap.data() as MoodStatus;
        }
      } catch (err) {
        console.warn('Lỗi Firestore getMood:', err);
      }
    }
    if (typeof window === 'undefined') return { emoji: '🥰', label: 'Vui vẻ & Yêu đời', updatedAt: 'Vừa xong', by: 'Bạn Gái' };
    const raw = localStorage.getItem(STORAGE_KEY_MOOD);
    return raw ? JSON.parse(raw) : { emoji: '🥰', label: 'Vui vẻ & Yêu đời', updatedAt: 'Vừa xong', by: 'Bạn Gái' };
  },

  async updateMood(mood: MoodStatus): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify(mood));
    }

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'settings', 'mood'), mood).catch(err => {
        console.warn('Lỗi Firestore updateMood:', err);
      });
    }
  },

  // --- LOVE COUPONS API ---
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

    if (typeof window !== 'undefined') {
      try {
        const current: LoveCoupon[] = JSON.parse(localStorage.getItem(STORAGE_KEY_COUPONS) || '[]');
        const updated = [...current, newItem];
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage addCoupon:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'coupons', newItem.id);
      setDoc(ref, newItem).catch(err => {
        console.warn('Lỗi Firestore addCoupon:', err);
      });
    }

    return newItem;
  },

  async useCoupon(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const coupons: LoveCoupon[] = JSON.parse(localStorage.getItem(STORAGE_KEY_COUPONS) || '[]');
        const updated = coupons.map(c => c.id === id ? { ...c, isUsed: true, usedAt: 'Vừa kích hoạt' } : c);
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage useCoupon:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'coupons', id);
      updateDoc(ref, { isUsed: true, usedAt: 'Vừa kích hoạt' }).catch(err => {
        console.warn('Lỗi Firestore useCoupon:', err);
      });
    }
  },

  async resetCoupon(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const coupons: LoveCoupon[] = JSON.parse(localStorage.getItem(STORAGE_KEY_COUPONS) || '[]');
        const updated = coupons.map(c => c.id === id ? { ...c, isUsed: false, usedAt: undefined } : c);
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage resetCoupon:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'coupons', id);
      updateDoc(ref, { isUsed: false, usedAt: null }).catch(err => {
        console.warn('Lỗi Firestore resetCoupon:', err);
      });
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const coupons: LoveCoupon[] = JSON.parse(localStorage.getItem(STORAGE_KEY_COUPONS) || '[]');
        const updated = coupons.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Lỗi localStorage deleteCoupon:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'coupons', id)).catch(err => {
        console.warn('Lỗi Firestore deleteCoupon:', err);
      });
    }
  },

  // --- REALTIME NUDGE / REMINDER API ---
  subscribeNudge(callback: (nudge: { from: string; message: string; timestamp: number } | null) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'settings', 'nudge');
        return onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            callback(snap.data() as any);
          } else {
            callback(null);
          }
        });
      } catch (e) {
        console.warn('Lỗi subscribeNudge:', e);
      }
    }
    return () => {};
  },

  async sendNudge(from: string, message: string): Promise<void> {
    const nudgeObj = {
      from,
      message,
      timestamp: Date.now()
    };
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'settings', 'nudge'), nudgeObj).catch(e => {
        console.warn('Lỗi sendNudge Firestore:', e);
      });
    }
  }
};

