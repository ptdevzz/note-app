'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { dataService } from '@/lib/dataService';
import { triggerLocalNotification } from '@/lib/notificationService';
import { formatDateTime } from '@/lib/dateUtils';
import { APP_NOTIFICATION_TITLE, NUDGE_MAX_AGE_MS, NUDGE_TOAST_DURATION_MS } from '@/lib/constants';
import { MoodStatus, PhotoboothMemory, PlaceItem, TimetableData, UserRole } from '@/lib/types';
import defaultScheduleData from '@/data/schedule_26cdtt2.json';

export const DEFAULT_TIMETABLE = defaultScheduleData as unknown as TimetableData;

const DEFAULT_MOOD: MoodStatus = { emoji: '🥰', label: 'Vui vẻ', updatedAt: 'Hôm nay', by: 'Bé Yêu' };

/**
 * Đăng ký toàn bộ realtime subscription (Firestore + LocalStorage fallback)
 * cho dữ liệu dùng chung của cặp đôi. Re-subscribe khi role thay đổi.
 */
export function useCoupleData(currentRole: UserRole) {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [photobooths, setPhotobooths] = useState<PhotoboothMemory[]>([]);
  const [loveNote, setLoveNote] = useState('');
  const [mood, setMood] = useState<MoodStatus>(DEFAULT_MOOD);
  const [timetable, setTimetable] = useState<TimetableData>(DEFAULT_TIMETABLE);

  const [isPlacesLoading, setIsPlacesLoading] = useState(true);
  const [isPhotoboothsLoading, setIsPhotoboothsLoading] = useState(true);
  const [isNoteLoading, setIsNoteLoading] = useState(true);
  const [isMoodLoading, setIsMoodLoading] = useState(true);

  const [nudgeToast, setNudgeToast] = useState<string | null>(null);

  useEffect(() => {
    setIsPlacesLoading(true);
    setIsPhotoboothsLoading(true);

    const unsubscribers = [
      dataService.subscribePlaces((items) => {
        setPlaces(items);
        setIsPlacesLoading(false);
      }),
      dataService.subscribePhotobooths((items) => {
        setPhotobooths(items);
        setIsPhotoboothsLoading(false);
      }),
      dataService.subscribeLoveNote((note) => {
        setLoveNote(note);
        setIsNoteLoading(false);
      }),
      dataService.subscribeMood((nextMood) => {
        setMood(nextMood);
        setIsMoodLoading(false);
      }),
      dataService.subscribeTimetable(setTimetable),
      dataService.subscribeNudge((nudge) => {
        if (!nudge || nudge.from === currentRole) return;
        if (Date.now() - nudge.timestamp >= NUDGE_MAX_AGE_MS) return;

        setNudgeToast(`${nudge.message} • ${formatDateTime(nudge.timestamp)}`);
        triggerLocalNotification(APP_NOTIFICATION_TITLE, nudge.message);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => setNudgeToast(null), NUDGE_TOAST_DURATION_MS);
      }),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [currentRole]);

  return {
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
    dismissNudgeToast: () => setNudgeToast(null),
  };
}
