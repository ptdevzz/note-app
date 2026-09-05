'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import BottomNav, { TabType } from '@/components/BottomNav';
import PasscodeGate from '@/components/PasscodeGate';
import AppHeader from '@/components/AppHeader';
import NotificationBanner from '@/components/NotificationBanner';
import ClipboardAutoDetectBanner from '@/components/ClipboardAutoDetectBanner';
import HomeTab from '@/components/HomeTab';
import CollectionTab, { CategoryFilter } from '@/components/CollectionTab';
import PlanTab, { PlanMode } from '@/components/PlanTab';
import TimetableTab from '@/components/TimetableTab';
import MusicAndHobbiesTab from '@/components/MusicAndHobbiesTab';
import SpinWheelModal from '@/components/SpinWheelModal';
import TikTokAddModal from '@/components/TikTokAddModal';
import DatePickerModal from '@/components/DatePickerModal';
import CheckinModal from '@/components/CheckinModal';
import StoryExportModal from '@/components/StoryExportModal';
import PrivilegesPage from '@/components/PrivilegesPage';
import NudgeToast from '@/components/NudgeToast';
import PartnerPresence from '@/components/PartnerPresence';
import { useCoupleData, DEFAULT_TIMETABLE } from '@/hooks/useCoupleData';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { usePartnerEmail } from '@/hooks/usePartnerEmail';
import { usePresence } from '@/hooks/usePresence';
import { dataService } from '@/lib/dataService';
import { getPartnerEmail } from '@/lib/partnerEmail';
import { getRoleBadge, getRoleName } from '@/lib/roleUtils';
import { calculateLoveDays, formatDateTime, getWeekendForWeekOffset } from '@/lib/dateUtils';
import { ALL_CATEGORIES, DEFAULT_PARTNER_EMAIL } from '@/lib/constants';
import { NewPlaceInput, PhotoboothMemory, PlaceItem, UserRole } from '@/lib/types';
import confetti from 'canvas-confetti';

interface MainAppContentProps {
  defaultRole: UserRole;
  onLogout: () => void;
}

function MainAppContent({ defaultRole, onLogout }: MainAppContentProps) {
  // Role: 'GF' (Bé Yêu) vs 'BF' (Anh Iu) - xác định tự động qua Passcode
  const [currentRole, setCurrentRole] = useState<UserRole>(defaultRole);
  useEffect(() => setCurrentRole(defaultRole), [defaultRole]);

  const { notificationStatus, enableNotifications } = useNotificationSetup(defaultRole);
  const partnerEmail = usePartnerEmail();
  const presence = usePresence(currentRole);
  const {
    places,
    photobooths,
    loveNote,
    setLoveNote,
    mood,
    timetable,
    setTimetable,
    isPlacesLoading,
    isPhotoboothsLoading,
    isNoteLoading,
    isMoodLoading,
    nudgeToast,
    dismissNudgeToast,
  } = useCoupleData(currentRole);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [planMode, setPlanMode] = useState<PlanMode>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(ALL_CATEGORIES);

  // Modal state
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPrivilegesOpen, setIsPrivilegesOpen] = useState(false);
  const [isStoryExportOpen, setIsStoryExportOpen] = useState(false);
  const [datePickerPlace, setDatePickerPlace] = useState<PlaceItem | null>(null);
  const [checkinPlace, setCheckinPlace] = useState<PlaceItem | null>(null);

  // Derived data
  const currentSelectedWeekend = getWeekendForWeekOffset(selectedWeekOffset);
  const plannedSat = useMemo(
    () => places.filter((p) => p.status === 'PLANNED' && p.plannedDate === currentSelectedWeekend.saturday),
    [places, currentSelectedWeekend.saturday],
  );
  const plannedSun = useMemo(
    () => places.filter((p) => p.status === 'PLANNED' && p.plannedDate === currentSelectedWeekend.sunday),
    [places, currentSelectedWeekend.sunday],
  );
  const visitedPlaces = useMemo(() => places.filter((p) => p.status === 'VISITED'), [places]);
  const savedCount = useMemo(() => places.filter((p) => p.status === 'SAVED').length, [places]);
  const isHomeLoading = isPlacesLoading || isNoteLoading || isMoodLoading;

  const roleName = getRoleName(currentRole);
  const roleBadge = getRoleBadge(currentRole);

  // Handlers
  const handleSendNudge = async () => {
    await dataService.sendNudge(currentRole, `🤏 ${roleName} chọc: "Xem lịch hẹn cuối tuần nha!" 💕`);
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: getPartnerEmail() || DEFAULT_PARTNER_EMAIL,
        subject: '💕 Lịch Hẹn Cuối Tuần Từ Người Ấy',
        sender: roleName,
      }),
    }).catch(() => {});
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    alert('Đã gửi nhắc hẹn! 🔔💕');
  };

  const handleAddPlace = async (newItem: NewPlaceInput) => {
    const fullItem = { ...newItem, createdBy: roleBadge, createdAt: formatDateTime() };
    await dataService.addPlace(fullItem as Parameters<typeof dataService.addPlace>[0]);
    await dataService.sendNudge(currentRole, `📍 ${roleName} vừa thêm 1 địa điểm mới. Xem ngay!`);
  };

  const handleAssignDate = async (placeId: string, dateStr: string | null) => {
    await dataService.updatePlace(placeId, { status: dateStr ? 'PLANNED' : 'SAVED', plannedDate: dateStr });
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
    await dataService.sendNudge(currentRole, `🎉 ${roleName} vừa check-in xong!`);
  };

  const handleDeletePlace = async (id: string) => {
    await dataService.deletePlace(id);
  };

  const handleSaveNote = async (newNote: string) => {
    setLoveNote(newNote);
    await dataService.updateLoveNote(newNote);
    await dataService.sendNudge(currentRole, `💌 ${roleName} nhắn: "${newNote}"`);
  };

  const handleAddPhotobooth = async (item: Omit<PhotoboothMemory, 'id' | 'createdAt'>) => {
    const fullItem = { ...item, createdBy: roleBadge, createdAt: formatDateTime() };
    await dataService.addPhotobooth(fullItem as Parameters<typeof dataService.addPhotobooth>[0]);
    await dataService.sendNudge(currentRole, `📸 ${roleName} thêm album Photobooth mới!`);
  };

  const handleDeletePhotobooth = async (id: string) => {
    await dataService.deletePhotobooth(id);
  };

  const handleMoodSelect = async (emoji: string, label: string) => {
    await dataService.updateMood({ emoji, label, updatedAt: formatDateTime(), by: roleBadge });
    await dataService.sendNudge(currentRole, `${emoji} ${roleName} đổi mood: ${label}`);
  };

  // Trang Đặc Quyền & Kỷ Niệm: thay toàn bộ nội dung chính, có nút quay lại
  if (isPrivilegesOpen) {
    return (
      <MobileContainer>
        <PrivilegesPage
          onBack={() => setIsPrivilegesOpen(false)}
          photobooths={photobooths}
          isPhotoboothsLoading={isPhotoboothsLoading}
          visitedPlaces={visitedPlaces}
          onAddPhotobooth={handleAddPhotobooth}
          onDeletePhotobooth={handleDeletePhotobooth}
        />
        <NudgeToast message={nudgeToast} onDismiss={dismissNudgeToast} />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <AppHeader
        currentRole={currentRole}
        activeTab={activeTab}
        onOpenMusic={() => setActiveTab('music')}
        onOpenPrivileges={() => setIsPrivilegesOpen(true)}
        onLogout={onLogout}
      />
      <PartnerPresence currentRole={currentRole} presence={presence} />

      {notificationStatus !== 'granted' && <NotificationBanner onEnable={enableNotifications} />}

      <div className="px-1 pt-1">
        <ClipboardAutoDetectBanner onAddPlace={handleAddPlace} />
      </div>

      {activeTab === 'home' && (
        <HomeTab
          isLoading={isHomeLoading}
          timetable={DEFAULT_TIMETABLE}
          places={places}
          partnerEmail={partnerEmail}
          loveNote={loveNote}
          mood={mood}
          weekend={currentSelectedWeekend}
          plannedCount={plannedSat.length + plannedSun.length}
          onSaveNote={handleSaveNote}
          onSelectMood={handleMoodSelect}
          onOpenPlan={() => setActiveTab('plan')}
          onOpenSpinWheel={() => setIsSpinOpen(true)}
        />
      )}

      {activeTab === 'tiktok' && (
        <CollectionTab
          places={places}
          isLoading={isPlacesLoading}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenAddModal={() => setIsAddOpen(true)}
          onOpenDatePicker={setDatePickerPlace}
          onToggleVisited={handleToggleVisited}
          onDeletePlace={handleDeletePlace}
        />
      )}

      {activeTab === 'plan' && (
        <PlanTab
          planMode={planMode}
          onChangePlanMode={setPlanMode}
          places={places}
          onToggleVisited={handleToggleVisited}
          onOpenAddModal={() => setIsAddOpen(true)}
          onOpenSpinWheel={() => setIsSpinOpen(true)}
          onAssignDate={handleAssignDate}
          onOpenStoryExport={() => setIsStoryExportOpen(true)}
          onSendNudge={handleSendNudge}
          onResetWeekOffset={() => setSelectedWeekOffset(0)}
        />
      )}

      {activeTab === 'timetable' && (
        <TimetableTab timetable={timetable} onUpdateTimetable={setTimetable} currentRole={currentRole} />
      )}

      {activeTab === 'music' && <MusicAndHobbiesTab currentRole={currentRole} />}

      {/* Modals */}
      <SpinWheelModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} places={places} onAssignDate={handleAssignDate} />
      <TikTokAddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddPlace} />
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
      <NudgeToast message={nudgeToast} onDismiss={dismissNudgeToast} />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => setIsAddOpen(true)}
        savedCount={savedCount}
      />
    </MobileContainer>
  );
}

export default function HomePage() {
  return (
    <PasscodeGate>
      {(unlockedRole, onLogout) => <MainAppContent defaultRole={unlockedRole} onLogout={onLogout} />}
    </PasscodeGate>
  );
}
