'use client';

import React from 'react';
import TodayScheduleWidget from '@/components/TodayScheduleWidget';
import WeekendCountdownWidget from '@/components/WeekendCountdownWidget';
import LoveNoteSection from '@/components/LoveNoteSection';
import MoodTracker from '@/components/MoodTracker';
import WeekendQuickBanner from '@/components/WeekendQuickBanner';
import { HomeHeaderSkeleton } from '@/components/SkeletonLoader';
import { WeekendDates } from '@/lib/dateUtils';
import { MoodStatus, PlaceItem, TimetableData } from '@/lib/types';

interface HomeTabProps {
  isLoading: boolean;
  timetable: TimetableData;
  places: PlaceItem[];
  partnerEmail: string;
  loveNote: string;
  mood: MoodStatus;
  weekend: WeekendDates;
  plannedCount: number;
  onSaveNote: (note: string) => Promise<void>;
  onSelectMood: (emoji: string, label: string) => void;
  onOpenPlan: () => void;
  onOpenSpinWheel: () => void;
}

export default function HomeTab({
  isLoading,
  timetable,
  places,
  partnerEmail,
  loveNote,
  mood,
  weekend,
  plannedCount,
  onSaveNote,
  onSelectMood,
  onOpenPlan,
  onOpenSpinWheel,
}: HomeTabProps) {
  if (isLoading) {
    return (
      <div className="py-2">
        <HomeHeaderSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      <TodayScheduleWidget timetable={timetable} />
      <WeekendCountdownWidget places={places} partnerEmail={partnerEmail} />
      <LoveNoteSection note={loveNote} onSaveNote={onSaveNote} partnerName="Mỗi Ngày" />
      <MoodTracker mood={mood} onSelect={onSelectMood} />
      <WeekendQuickBanner
        weekend={weekend}
        plannedCount={plannedCount}
        onOpenPlan={onOpenPlan}
        onOpenSpinWheel={onOpenSpinWheel}
      />
    </div>
  );
}
