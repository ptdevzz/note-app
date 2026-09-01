'use client';

import React, { useState, useEffect } from 'react';
import MobileContainer from '@/components/MobileContainer';
import BottomNav, { TabType } from '@/components/BottomNav';
import PokeLoveEffect from '@/components/PokeLoveEffect';
import LoveNoteSection from '@/components/LoveNoteSection';
import SpinWheelModal from '@/components/SpinWheelModal';
import TikTokAddModal from '@/components/TikTokAddModal';
import LoveCouponsModal from '@/components/LoveCouponsModal';
import DatePickerModal from '@/components/DatePickerModal';
import CheckinModal from '@/components/CheckinModal';
import DateMemoriesScrapbook from '@/components/DateMemoriesScrapbook';
import CurrentWeekendView from '@/components/CurrentWeekendView';
import PasscodeGate from '@/components/PasscodeGate';
import PhotoboothVault from '@/components/PhotoboothVault';
import WeekendCountdownWidget from '@/components/WeekendCountdownWidget';
import ClipboardAutoDetectBanner from '@/components/ClipboardAutoDetectBanner';
import StoryExportModal from '@/components/StoryExportModal';
import MusicAndHobbiesTab from '@/components/MusicAndHobbiesTab';
import TimetableTab from '@/components/TimetableTab';
import { PlaceCardSkeleton, HomeHeaderSkeleton, PhotoboothGridSkeleton } from '@/components/SkeletonLoader';
import { requestNotificationPermission, getNotificationPermissionStatus, triggerLocalNotification, registerServiceWorker, subscribeWebPush } from '@/lib/notificationService';
import { PlaceItem, LoveCoupon, MoodStatus, PhotoboothMemory, TimetableData } from '@/lib/types';
import defaultScheduleData from '@/data/schedule_26cdtt2.json';
import { dataService } from '@/lib/dataService';
import { getWeekendForWeekOffset, calculateLoveDays, formatDateTime } from '@/lib/dateUtils';
import confetti from 'canvas-confetti';
import { 
  Plus, Search, Sparkles, MapPin, ExternalLink, Calendar as CalendarIcon, CheckCircle2, 
  Smile, Flame, Dices, Trash2, ChevronLeft, ChevronRight, Navigation, BellRing, Share2, LogOut, Bell, Music, Gift
} from 'lucide-react';

function MainAppContent({ defaultRole, onLogout }: { defaultRole: 'GF' | 'BF'; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [coupons, setCoupons] = useState<LoveCoupon[]>([]);
  const [photobooths, setPhotobooths] = useState<PhotoboothMemory[]>([]);
  const [loveNote, setLoveNote] = useState('');
  const [mood, setMood] = useState<MoodStatus>({ emoji: '🥰', label: 'Vui vẻ', updatedAt: 'Hôm nay', by: 'Bé Yêu' });
  const [timetable, setTimetable] = useState<TimetableData>(defaultScheduleData as unknown as TimetableData);
  const [isPlacesLoading, setIsPlacesLoading] = useState(true);
  const [isCouponsLoading, setIsCouponsLoading] = useState(true);
  const [isPhotoboothsLoading, setIsPhotoboothsLoading] = useState(true);
  const [isNoteLoading, setIsNoteLoading] = useState(true);
  const [isMoodLoading, setIsMoodLoading] = useState(true);
  const [isStoryExportOpen, setIsStoryExportOpen] = useState(false);
  const [nudgeToast, setNudgeToast] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');

  // User Perspective Role: 'GF' (Bé Yêu) vs 'BF' (Anh iu) - Determined automatically by Passcode!
  const [currentRole, setCurrentRole] = useState<'GF' | 'BF'>(defaultRole);

  useEffect(() => {
    setCurrentRole(defaultRole);
    registerServiceWorker().then(() => {
      const status = getNotificationPermissionStatus();
      setNotificationStatus(status);
      if (status === 'granted') {
        subscribeWebPush(defaultRole);
      } else if (status === 'default') {
        requestNotificationPermission(defaultRole).then(p => setNotificationStatus(p));
      }
    });
  }, [defaultRole]);

  // Week navigation state
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);
  const [planMode, setPlanMode] = useState<'current' | 'calendar'>('current');
  const currentSelectedWeekend = getWeekendForWeekOffset(selectedWeekOffset);

  // Modal States
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [datePickerPlace, setDatePickerPlace] = useState<PlaceItem | null>(null);
  const [checkinPlace, setCheckinPlace] = useState<PlaceItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Real-time Data Subscriptions (Firebase Firestore + LocalStorage fallback)
  useEffect(() => {
    setIsPlacesLoading(true);
    setIsCouponsLoading(true);
    setIsPhotoboothsLoading(true);

    const unsubPlaces = dataService.subscribePlaces((items) => {
      setPlaces(items);
      setIsPlacesLoading(false);
    });

    const unsubCoupons = dataService.subscribeCoupons((items) => {
      setCoupons(items);
      setIsCouponsLoading(false);
    });

    const unsubPhotobooths = dataService.subscribePhotobooths((items) => {
      setPhotobooths(items);
      setIsPhotoboothsLoading(false);
    });

    const unsubLoveNote = dataService.subscribeLoveNote((note) => {
      setLoveNote(note);
      setIsNoteLoading(false);
    });

    const unsubMood = dataService.subscribeMood((mood) => {
      setMood(mood);
      setIsMoodLoading(false);
    });

    const unsubTimetable = dataService.subscribeTimetable((data) => {
      setTimetable(data);
    });

    const unsubNudge = dataService.subscribeNudge((nudge) => {
      if (nudge && nudge.from !== currentRole && Date.now() - nudge.timestamp < 60000) {
        const timeLabel = formatDateTime(nudge.timestamp);
        const toastMsg = `${nudge.message} • ${timeLabel}`;
        setNudgeToast(toastMsg);
        triggerLocalNotification('💕 Sổ Tay Tình Yêu', nudge.message);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => setNudgeToast(null), 8000);
      }
    });

    return () => {
      unsubPlaces();
      unsubCoupons();
      unsubPhotobooths();
      unsubLoveNote();
      unsubMood();
      unsubTimetable();
      unsubNudge();
    };
  }, [currentRole]);

  // Handlers
  const handleEnableNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
    if (perm === 'granted') {
      triggerLocalNotification('💕 Sổ Tay Tình Yêu', 'Đã bật thông báo PWA thành công trên điện thoại của bạn!');
      alert('🎉 Đã bật thông báo PWA thành công! Mọi cập nhật từ người ấy sẽ nảy thông báo trên iPhone của bạn.');
    } else {
      alert('Quyền thông báo chưa được cấp. Bạn có thể kiểm tra Cài đặt của iPhone!');
    }
  };

  const handleSendNudge = async () => {
    const name = currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu';
    const message = `🤏 ${name} chọc: "Xem lịch hẹn cuối tuần nha!" 💕`;
    await dataService.sendNudge(currentRole, message);
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'banguai@gmail.com',
        subject: '💕 Lịch Hẹn Cuối Tuần Từ Người Ấy',
        sender: name
      })
    }).catch(() => {});
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    alert('Đã gửi nhắc hẹn! 🔔💕');
  };

  const handleAddPlace = async (newItem: any) => {
    const timeStr = formatDateTime();
    const fullItem = {
      ...newItem,
      createdBy: currentRole === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙',
      createdAt: timeStr
    };
    await dataService.addPlace(fullItem);
    const name = currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu';
    await dataService.sendNudge(currentRole, `📍 ${name} vừa thêm 1 địa điểm mới. Xem ngay!`);
  };

  const handleAssignDate = async (placeId: string, dateStr: string | null) => {
    const newStatus = dateStr ? 'PLANNED' : 'SAVED';
    await dataService.updatePlace(placeId, { status: newStatus, plannedDate: dateStr });
  };

  const handleToggleVisited = (place: PlaceItem) => {
    if (place.status === 'VISITED') {
      dataService.updatePlace(place.id, { status: 'SAVED' });
    } else {
      setCheckinPlace(place);
    }
  };

  const handleSaveReview = async (id: string, rating: number, notes: string, costEstimate?: number, photoUrl?: string) => {
    await dataService.updatePlace(id, {
      status: 'VISITED',
      rating,
      notes,
      costEstimate,
      photoUrl,
      visitedAt: formatDateTime(),
    });
    const name = currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu';
    await dataService.sendNudge(currentRole, `🎉 ${name} vừa check-in xong!`);
  };

  const handleDeletePlace = async (id: string) => {
    await dataService.deletePlace(id);
  };

  const handleSaveNote = async (newNote: string) => {
    setLoveNote(newNote);
    await dataService.updateLoveNote(newNote);
    const name = currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu';
    await dataService.sendNudge(currentRole, `💌 ${name} nhắn: "${newNote}"`);
  };

  const handleUseCoupon = async (id: string) => {
    await dataService.useCoupon(id);
  };

  const handleAddPhotobooth = async (item: Omit<PhotoboothMemory, 'id' | 'createdAt'>) => {
    const timeStr = formatDateTime();
    const fullItem = {
      ...item,
      createdBy: currentRole === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙',
      createdAt: timeStr
    };
    await dataService.addPhotobooth(fullItem as any);
    const name = currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu';
    await dataService.sendNudge(currentRole, `📸 ${name} thêm album Photobooth mới!`);
  };

  const handleDeletePhotobooth = async (id: string) => {
    await dataService.deletePhotobooth(id);
  };

  const handleMoodSelect = async (emoji: string, label: string) => {
    const timeStr = formatDateTime();
    const newMood = {
      emoji,
      label,
      updatedAt: timeStr,
      by: currentRole === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙'
    };
    await dataService.updateMood(newMood);
    const name = currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu';
    await dataService.sendNudge(currentRole, `${emoji} ${name} đổi mood: ${label}`);
  };

  // Google Maps Helper
  const openGoogleMaps = (title: string, tags: string[]) => {
    const queryStr = `${title} ${tags.join(' ')}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
    window.open(url, '_blank');
  };

  // Filtering (Show all places except those already PLANNED or VISITED)
  const filteredPlaces = places.filter((p) => {
    const isAvailable = p.status !== 'PLANNED' && p.status !== 'VISITED';
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    return isAvailable && matchesSearch && matchesCat;
  });

  const plannedSat = places.filter((p) => p.status === 'PLANNED' && p.plannedDate === currentSelectedWeekend.saturday);
  const plannedSun = places.filter((p) => p.status === 'PLANNED' && p.plannedDate === currentSelectedWeekend.sunday);
  const visitedPlaces = places.filter((p) => p.status === 'VISITED');

  const isHomeLoading = isPlacesLoading || isNoteLoading || isMoodLoading;

  return (
    <MobileContainer>
      {/* Top App Header with Logout & Role Badge */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-400/40 shrink-0">
            <img src="/couple.png" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30 inline-block">
              {currentRole === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙'}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
              v2.5.6
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab('music')}
            className={`p-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center active:scale-95 transition-all shadow-sm shrink-0 ${activeTab === 'music' ? 'border-rose-500 text-rose-300 bg-rose-500/30' : 'border-rose-500/30 text-rose-300 bg-slate-900'}`}
            title="Nghe Nhạc & Góc Sở Thích"
          >
            <Music className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <button
            onClick={() => setIsCouponsModalOpen(true)}
            className="bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-300 px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1 whitespace-nowrap active:scale-95 transition-all shadow-sm shrink-0"
            title="Phiếu Đặc Quyền & Album Photobooth Kỷ Niệm"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Đặc Quyền</span>
          </button>

          <button
            onClick={onLogout}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-rose-400 p-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center whitespace-nowrap active:scale-95 transition-all shadow-sm shrink-0"
            title="Khóa ứng dụng / Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* PWA Notification Permission Banner */}
      {notificationStatus !== 'granted' && (
        <div className="mx-1 my-2 p-3 bg-gradient-to-r from-pink-950/80 via-rose-950/80 to-purple-950/80 border border-rose-500/30 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Thông báo PWA iPhone 🔔</div>
              <p className="text-[10px] text-rose-200/80">Nhận thông báo tức thì khi người ấy thêm quán mới!</p>
            </div>
          </div>
          <button
            onClick={handleEnableNotification}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-all shrink-0"
          >
            Bật Ngay ✨
          </button>
        </div>
      )}

      {/* Auto Detect Clipboard Banner */}
      <div className="px-1 pt-1">
        <ClipboardAutoDetectBanner onAddPlace={handleAddPlace} />
      </div>

      {/* --- TAB 1: HOME --- */}
      {activeTab === 'home' && (
        isHomeLoading ? (
          <div className="py-2">
            <HomeHeaderSkeleton />
          </div>
        ) : (
          <div className="space-y-4 pb-4 animate-in fade-in duration-200">
          {/* Interactive Love Widget */}
          <PokeLoveEffect
            currentRole={currentRole}
            partnerName={currentRole === 'GF' ? (localStorage.getItem('admin_partner1') || 'Bạn Trai') : (localStorage.getItem('admin_partner2') || 'Bạn Gái')}
          />

          {/* Realtime Weekend Date Countdown Clock */}
          <WeekendCountdownWidget
            places={places}
            partnerEmail={typeof window !== 'undefined' ? localStorage.getItem('admin_email') || '' : ''}
          />

          {/* Secret Daily Love Note */}
          <LoveNoteSection
            note={loveNote}
            onSaveNote={handleSaveNote}
            partnerName="Mỗi Ngày"
          />

          {/* Girlfriend Mood Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Smile className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200">Tâm Trạng Hôm Nay</h3>
              </div>
              <span className="text-[10px] text-slate-400">{mood.updatedAt}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{mood.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-slate-100">{mood.label}</span>
                  <p className="text-[10px] text-slate-400">Cập nhật bởi {mood.by}</p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mb-2 font-medium">Bạn muốn cập nhật tâm trạng?</div>
            <div className="flex justify-between gap-1.5">
              {[
                { emoji: '🥰', label: 'Yêu đời' },
                { emoji: '🤤', label: 'Thèm trà sữa' },
                { emoji: '😾', label: 'Đang dỗi' },
                { emoji: '😴', label: 'Lười lười' },
                { emoji: '🥳', label: 'Muốn đi chơi' },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleMoodSelect(m.emoji, m.label)}
                  className={`flex-1 p-2 rounded-xl border text-center transition-transform active:scale-95 ${
                    mood.label === m.label
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-lg">{m.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Weekend Banner */}
          <div 
            onClick={() => setActiveTab('plan')}
            className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-rose-900/40 border border-slate-800 rounded-3xl p-4 shadow-md flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Lịch Hẹn Cuối Tuần Này Gần Nhất</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentSelectedWeekend.saturdayDisplay} & {currentSelectedWeekend.sundayDisplay} ({plannedSat.length + plannedSun.length} món)
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSpinOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-2xl shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 shrink-0"
            >
              <Dices className="w-4 h-4" />
              <span>Xoay 🎲</span>
            </button>
          </div>
        </div>
      )
    )}

      {/* --- TAB 2: TIKTOK FEED / COLLECTION --- */}
      {activeTab === 'tiktok' && (
        <div className="space-y-4 pb-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Bộ Sưu Tập</h2>
              <p className="text-xs text-slate-400">Các địa điểm & hoạt động 2 đứa đã lưu</p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên quán, quận (vd: Q1, Lẩu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {['Tất cả', 'Ăn sáng', 'Ăn tối', 'Cà phê & Chill', 'Vui chơi'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isPlacesLoading ? (
            <div className="space-y-3">
              <PlaceCardSkeleton />
              <PlaceCardSkeleton />
              <PlaceCardSkeleton />
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/50 border border-slate-800/60 rounded-3xl p-6">
              <Sparkles className="w-8 h-8 text-rose-400/50 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">Chưa tìm thấy địa điểm nào.</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-3 text-xs text-rose-400 font-bold hover:underline"
              >
                + Bấm nút cộng để thêm hoạt động đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden p-3 shadow-md hover:border-slate-700 transition-colors relative"
                >
                  <div className="flex space-x-3">
                    <img
                      src={place.thumbnail}
                      alt={place.title}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {place.category}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                        {place.title}
                      </h3>

                      {(place.createdBy || place.createdAt) && (
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {place.createdBy || 'Bé Yêu'} {place.createdAt ? `• ${formatDateTime(place.createdAt)}` : ''}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 mt-2">
                        {place.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center space-x-0.5 text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-800"
                          >
                            <MapPin className="w-2.5 h-2.5 text-rose-400" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {place.tiktokUrl ? (
                        <a
                          href={place.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-rose-400 font-semibold flex items-center space-x-1 text-[11px]"
                        >
                          <span>TikTok</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}

                      <button
                        onClick={() => openGoogleMaps(place.title, place.tags)}
                        className="text-emerald-400 hover:underline font-semibold flex items-center space-x-1 text-[11px]"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Chỉ đường</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDatePickerPlace(place)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-colors ${
                          place.status === 'PLANNED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <CalendarIcon className="w-3 h-3" />
                        <span>
                          {place.plannedDate
                            ? `${place.plannedDate.split('-').slice(1).reverse().join('/')}`
                            : '+ Xếp Lịch'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleToggleVisited(place)}
                        className={`p-1 rounded-xl transition-colors ${
                          place.status === 'VISITED' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: CURRENT WEEKEND DETAILED VIEW --- */}
      {activeTab === 'plan' && (
        <div className="space-y-4 pb-4">
          {/* Top Sub-tab switcher: Tuần Này Gần Nhất vs Xem Nhiều Tuần */}
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setPlanMode('current');
                setSelectedWeekOffset(0);
              }}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                planMode === 'current'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tuần Này Gần Nhất</span>
            </button>

            <button
              onClick={() => setPlanMode('calendar')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                planMode === 'calendar'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch Các Tuần Sau</span>
            </button>
          </div>

          {/* Quick Action Toolbar for Weekend Plan */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsStoryExportOpen(true)}
              className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Xuất Ảnh Story 📸</span>
            </button>

            <button
              onClick={handleSendNudge}
              className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-sm"
            >
              <BellRing className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              <span>Nhắc Xem Lịch 🔔</span>
            </button>
          </div>

          {/* Sub-view: Multi-Week View */}
          {planMode === 'calendar' ? (
            <CurrentWeekendView
              places={places}
              onToggleVisited={handleToggleVisited}
              onOpenAddModal={() => setIsAddOpen(true)}
              onOpenSpinWheel={() => setIsSpinOpen(true)}
              onAssignDate={handleAssignDate}
            />
          ) : (
            <CurrentWeekendView
              places={places}
              onToggleVisited={handleToggleVisited}
              onOpenAddModal={() => setIsAddOpen(true)}
              onOpenSpinWheel={() => setIsSpinOpen(true)}
              onAssignDate={handleAssignDate}
            />
          )}
        </div>
      )}

      {/* --- TAB 3: TIMETABLE (Thời Khóa Biểu Bé Yêu) --- */}
      {activeTab === 'timetable' && (
        <TimetableTab
          timetable={timetable}
          onUpdateTimetable={setTimetable}
          currentRole={currentRole}
        />
      )}

      {/* --- TAB: MUSIC & HOBBIES (Nhạc Yêu Thích & Góc Sở Thích 2 Đứa) --- */}
      {activeTab === 'music' && (
        <MusicAndHobbiesTab currentRole={currentRole} />
      )}

      {/* Modals */}
      <SpinWheelModal
        isOpen={isSpinOpen}
        onClose={() => setIsSpinOpen(false)}
        places={places}
        onAssignDate={handleAssignDate}
      />

      <TikTokAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddPlace}
      />

      <DatePickerModal
        isOpen={Boolean(datePickerPlace)}
        onClose={() => setDatePickerPlace(null)}
        place={datePickerPlace}
        onAssignDate={handleAssignDate}
      />

      <CheckinModal
        isOpen={Boolean(checkinPlace)}
        onClose={() => setCheckinPlace(null)}
        place={checkinPlace}
        onSaveReview={handleSaveReview}
      />

      <StoryExportModal
        isOpen={isStoryExportOpen}
        onClose={() => setIsStoryExportOpen(false)}
        saturdayPlaces={plannedSat}
        sundayPlaces={plannedSun}
        saturdayDisplay={currentSelectedWeekend.saturdayDisplay}
        sundayDisplay={currentSelectedWeekend.sundayDisplay}
        weekLabel={currentSelectedWeekend.weekLabel}
        loveDays={calculateLoveDays()}
      />

      {/* Coupons & Photobooth Modal */}
      {isCouponsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Đặc Quyền & Kỷ Niệm 🎁</h3>
              </div>
              <button
                onClick={() => setIsCouponsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <LoveCouponsModal coupons={coupons} onUseCoupon={handleUseCoupon} />

              <PhotoboothVault
                items={photobooths}
                isLoading={isPhotoboothsLoading}
                onAddPhotobooth={handleAddPhotobooth}
                onDeletePhotobooth={handleDeletePhotobooth}
              />

              <DateMemoriesScrapbook visitedPlaces={visitedPlaces} />
            </div>
          </div>
        </div>
      )}

      {/* Realtime Nudge Toast Banner */}
      {nudgeToast && (
        <div className="fixed top-5 inset-x-4 z-50 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 animate-in slide-in-from-top-5 duration-300 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
          <p className="text-xs font-bold flex-1 leading-snug">{nudgeToast}</p>
          <button onClick={() => setNudgeToast(null)} className="text-white/80 hover:text-white text-xs font-extrabold px-1.5 py-0.5 rounded-lg bg-black/20">✕</button>
        </div>
      )}

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => setIsAddOpen(true)}
        savedCount={places.filter((p) => p.status === 'SAVED').length}
      />
    </MobileContainer>
  );
}

export default function HomePage() {
  return (
    <PasscodeGate>
      {(unlockedRole, onLogout) => (
        <MainAppContent defaultRole={unlockedRole} onLogout={onLogout} />
      )}
    </PasscodeGate>
  );
}
