'use client';

import React, { useState, useEffect } from 'react';
import { TimetableData, TimetableSubject } from '@/lib/types';
import TimetableExportModal from './TimetableExportModal';
import TimetableImportModal from './TimetableImportModal';
import {
  Calendar as CalendarIcon, Clock, MapPin, User, Download,
  ChevronLeft, ChevronRight, BookOpen, LayoutGrid,
  ShieldCheck, Upload, Heart
} from 'lucide-react';

interface TimetableTabProps {
  timetable: TimetableData;
  onUpdateTimetable: (newData: TimetableData) => void;
  currentRole: 'GF' | 'BF';
}

export default function TimetableTab({ timetable, onUpdateTimetable, currentRole }: TimetableTabProps) {
  const [selectedGroup, setSelectedGroup] = useState<'N1' | 'N2'>('N1');
  const [viewMode, setViewMode] = useState<'month' | 'grid' | 'today' | 'list'>('month');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Month View state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 8, 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  // Lưu nhóm đã chọn
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGroup = localStorage.getItem('usweekends_tkb_group') as 'N1' | 'N2';
      if (savedGroup) setSelectedGroup(savedGroup);
    }
  }, []);

  const handleGroupChange = (group: 'N1' | 'N2') => {
    setSelectedGroup(group);
    if (typeof window !== 'undefined') {
      localStorage.setItem('usweekends_tkb_group', group);
    }
  };

  // Helper to parse date string "DD/MM/YYYY" or "YYYY-MM-DD"
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return null;
  };

  const semesterStart = parseDate(timetable.startDate) || new Date(2026, 8, 7);

  // Auto detect current week index on mount
  useEffect(() => {
    const today = new Date();
    setSelectedCalendarDate(today);
    const diffTime = today.getTime() - semesterStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    const currentW = Math.floor(diffDays / 7) + 1;
    if (currentW >= 1 && currentW <= 20) {
      setSelectedWeek(currentW);
    } else {
      setSelectedWeek(1);
    }
    if (today >= semesterStart) {
      setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timetable.startDate]);

  const getWeekDates = (weekNum: number) => {
    const start = new Date(semesterStart);
    start.setDate(start.getDate() + (weekNum - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 5);
    const formatShort = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    return { start, end, label: `${formatShort(start)} - ${formatShort(end)}` };
  };

  const currentWeekDates = getWeekDates(selectedWeek);

  const isSubjectActiveInWeek = (sub: TimetableSubject, weekNum: number) => {
    const weekStart = new Date(semesterStart);
    weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const subStart = parseDate(sub.startDate);
    const subEnd = parseDate(sub.endDate);
    if (!subStart || !subEnd) return true;
    return subStart <= weekEnd && subEnd >= weekStart;
  };

  // Kiểm tra môn có học vào ngày cụ thể hay không (Lọc theo selectedGroup)
  const getSubjectsForDate = (targetDate: Date) => {
    const jsDay = targetDate.getDay();
    const targetDow = jsDay === 0 ? 8 : jsDay + 1;
    if (targetDow > 7) return [];

    const items: {
      subject: TimetableSubject;
      session: 'morning' | 'afternoon';
      lessons: string;
      room: string;
      group: string;
    }[] = [];

    timetable.subjects.forEach((sub) => {
      const subStart = parseDate(sub.startDate);
      const subEnd = parseDate(sub.endDate);
      if (subStart && subEnd) {
        const tDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const sStart = new Date(subStart.getFullYear(), subStart.getMonth(), subStart.getDate());
        const sEnd = new Date(subEnd.getFullYear(), subEnd.getMonth(), subEnd.getDate());
        if (tDate < sStart || tDate > sEnd) return;
      }
      sub.schedules.forEach((sch) => {
        if (sch.dayOfWeek === targetDow) {
          // Lọc theo nhóm: chỉ lấy nhóm trùng khớp hoặc nhóm ALL
          if (sch.group === 'ALL' || sch.group === selectedGroup) {
            items.push({
              subject: sub,
              session: sch.session,
              lessons: sch.lessons,
              room: sch.room,
              group: sch.group,
            });
          }
        }
      });
    });

    return items;
  };

  const getMatchingSubjectsForWeek = () => {
    const items: {
      dayOfWeek: number;
      session: 'morning' | 'afternoon';
      subject: TimetableSubject;
      lessons: string;
      room: string;
      group: string;
    }[] = [];

    timetable.subjects.forEach((sub) => {
      if (!isSubjectActiveInWeek(sub, selectedWeek)) return;
      sub.schedules.forEach((sch) => {
        if (sch.group === 'ALL' || sch.group === selectedGroup) {
          items.push({
            dayOfWeek: sch.dayOfWeek,
            session: sch.session,
            subject: sub,
            lessons: sch.lessons,
            room: sch.room,
            group: sch.group,
          });
        }
      });
    });
    return items;
  };

  const matchingSubjects = getMatchingSubjectsForWeek();

  const days = [
    { dow: 2, label: 'Thứ 2' },
    { dow: 3, label: 'Thứ 3' },
    { dow: 4, label: 'Thứ 4' },
    { dow: 5, label: 'Thứ 5' },
    { dow: 6, label: 'Thứ 6' },
    { dow: 7, label: 'Thứ 7' },
  ];

  const todayDate = new Date();
  const currentJsDay = todayDate.getDay();
  const currentDow = currentJsDay === 0 ? 8 : currentJsDay + 1;
  const todayMatching = matchingSubjects.filter(item => item.dayOfWeek === currentDow);

  const isMilitaryWeek = selectedWeek === 10 || selectedWeek === 11;

  // Lịch tháng Helper
  const getDaysInMonthMatrix = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const matrix: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      matrix.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      matrix.push(new Date(year, month, d));
    }
    return matrix;
  };

  const monthMatrix = getDaysInMonthMatrix(currentMonthDate);
  const selectedDateSubjects = getSubjectsForDate(selectedCalendarDate);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  return (
    <div className="pb-24 pt-4 px-3 max-w-md mx-auto min-h-screen text-slate-100 animate-fade-in">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-rose-900/40 via-purple-900/30 to-slate-900/80 border border-rose-500/20 rounded-3xl p-4 mb-4 backdrop-blur-md relative overflow-hidden shadow-lg shadow-rose-950/20">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider">
                {timetable.className}
              </span>
              <span className="text-slate-400 text-xs font-medium">{timetable.semester}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5 tracking-tight">
              Thời Khóa Biểu <Heart className="w-4 h-4 fill-rose-500 text-rose-500 inline" />
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsExportModalOpen(true)} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-rose-300 rounded-2xl border border-slate-700/60 transition active:scale-95 flex items-center gap-1 text-xs font-semibold" title="Xuất ảnh TKB">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 rounded-2xl border border-slate-700/60 transition active:scale-95 flex items-center gap-1 text-xs font-semibold" title="Import HK mới">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NÚT CHỌN NHÓM THỰC HÀNH GỌN NHẸ */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Nhóm thực hành của bé:</span>
          <div className="bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 flex gap-1">
            {(['N1', 'N2'] as const).map(g => (
              <button
                key={g}
                onClick={() => handleGroupChange(g)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedGroup === g
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nhóm {g.replace('N', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GDQP NOTICE */}
      {isMilitaryWeek && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Đợt Học GDQP-AN (Quân Khu 7)</span>
            <p className="text-[11px] text-amber-200/80 mt-0.5">Sinh viên học tập trung tại Trung tâm GDQP-AN. Tạm dừng các môn tại trường.</p>
          </div>
        </div>
      )}

      {/* VIEW MODE TOGGLE BUTTONS */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {viewMode === 'grid' && (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 flex items-center justify-between">
            <button onClick={() => setSelectedWeek(w => Math.max(1, w - 1))} disabled={selectedWeek <= 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-xs font-extrabold text-rose-400">Tuần {selectedWeek}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{currentWeekDates.label}</span>
            </div>
            <button onClick={() => setSelectedWeek(w => Math.min(20, w + 1))} disabled={selectedWeek >= 20} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {viewMode !== 'grid' && <div className="flex-1" />}

        <div className="bg-slate-900 p-1 border border-slate-800 rounded-2xl flex gap-1">
          {[
            { mode: 'month' as const, icon: CalendarIcon, tip: 'Tháng' },
            { mode: 'grid' as const, icon: LayoutGrid, tip: 'Bảng Tuần' },
            { mode: 'today' as const, icon: Clock, tip: 'Hôm Nay' },
            { mode: 'list' as const, icon: BookOpen, tip: 'Tất Cả Môn' }
          ].map(v => (
            <button key={v.mode} onClick={() => setViewMode(v.mode)} title={v.tip}
              className={`p-2 rounded-xl text-xs font-semibold transition ${viewMode === v.mode ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
              <v.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: MONTH CALENDAR (Giao diện giống Hình 2) */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          {/* Calendar Header & Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            {/* Header Tháng & Nút Chuyển Tháng */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1">
                tháng {currentMonthDate.getMonth() + 1}, {currentMonthDate.getFullYear()}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thứ trong tuần */}
            <div className="grid grid-cols-7 text-center mb-2 text-xs font-bold text-slate-400">
              <span>Th 2</span>
              <span>Th 3</span>
              <span>Th 4</span>
              <span>Th 5</span>
              <span>Th 6</span>
              <span className="text-rose-400">Th 7</span>
              <span className="text-rose-400">CN</span>
            </div>

            {/* Các Ngày Trong Tháng */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
              {monthMatrix.map((dateObj, idx) => {
                if (!dateObj) return <div key={idx} />;

                const isSelected = isSameDay(dateObj, selectedCalendarDate);
                const isToday = isSameDay(dateObj, todayDate);
                const daySubjects = getSubjectsForDate(dateObj);
                const hasClass = daySubjects.length > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCalendarDate(dateObj)}
                    className="flex flex-col items-center justify-center py-1.5 relative transition active:scale-90"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/40 scale-105'
                          : isToday
                          ? 'border border-rose-500 text-rose-400'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {dateObj.getDate()}
                    </div>

                    {/* Chấm vàng/xanh báo lịch học (giống hình 2) */}
                    {hasClass && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-amber-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chi tiết môn học trong ngày được chọn (phía dưới lịch) */}
          <div className="space-y-3">
            <div className="inline-block bg-sky-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md shadow-sky-500/20">
              {selectedCalendarDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </div>

            {selectedDateSubjects.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-xs italic">
                Không có lịch học trong ngày này 🎉
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateSubjects.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 border-l-4 border-l-emerald-500 shadow-md">
                    <h4 className="font-extrabold text-white text-sm mb-2">{item.subject.name}</h4>
                    <div className="space-y-1 text-xs text-slate-300 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tiết :</span>
                        <span className="font-bold text-white">{item.lessons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giờ :</span>
                        <span className="font-bold text-white">{item.session === 'morning' ? '07:15 - 11:15' : '12:30 - 16:30'}</span>
                      </div>
                      {item.room && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phòng :</span>
                          <span className="font-bold text-rose-400">{item.room}</span>
                        </div>
                      )}
                      {item.subject.lecturer && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Giảng viên :</span>
                          <span className="font-bold text-slate-200">{item.subject.lecturer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-3">
          {days.map(({ dow, label }) => {
            const dayItems = matchingSubjects.filter(i => i.dayOfWeek === dow);
            const isToday = currentDow === dow;
            return (
              <div key={dow} className={`bg-slate-900/90 border rounded-2xl p-3 transition-all ${isToday ? 'border-rose-500/60 shadow-lg shadow-rose-950/20' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg ${isToday ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{label}</span>
                    {isToday && <span className="text-[10px] text-rose-400 font-bold tracking-tight">Hôm nay</span>}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{dayItems.length > 0 ? `${dayItems.length} môn` : 'Nghỉ học'}</span>
                </div>
                {dayItems.length === 0 ? (
                  <div className="text-center py-2 text-xs text-slate-500 italic">Không có tiết học 🎉</div>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map((item, idx) => {
                      const isPractice = item.subject.type === 'practice';
                      const isMilitary = item.subject.type === 'military';
                      return (
                        <div key={idx} className={`p-3 rounded-xl border text-xs relative overflow-hidden transition-all ${isPractice ? 'bg-amber-950/20 border-amber-500/30 text-amber-100' : isMilitary ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100' : 'bg-slate-800/60 border-slate-700/60 text-slate-200'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.session === 'morning' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                  {item.session === 'morning' ? '☀️ Sáng' : '🌙 Chiều'}
                                </span>
                                <span className="font-mono text-[11px] text-rose-300 font-bold">Tiết {item.lessons}</span>
                              </div>
                              <h4 className="font-bold text-slate-100 text-sm tracking-tight mb-1">{item.subject.name}</h4>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                                {item.room && <span className="flex items-center gap-1 text-rose-400 font-semibold"><MapPin className="w-3 h-3" /> P.{item.room}</span>}
                                {item.subject.lecturer && <span className="flex items-center gap-1 text-slate-400"><User className="w-3 h-3" /> {item.subject.lecturer}</span>}
                              </div>
                            </div>
                          </div>
                          {item.subject.notes && <div className="mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400 italic">💡 {item.subject.notes}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TODAY */}
      {viewMode === 'today' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-xs text-rose-400 font-extrabold uppercase tracking-wider block mb-1">Lịch Học Hôm Nay</span>
            <h3 className="text-lg font-extrabold text-white">{todayDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</h3>
          </div>
          {todayMatching.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl">🥳</div>
              <h4 className="text-base font-bold text-slate-200">Hôm Nay Bé Được Nghỉ Học!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Không có lịch học nào trong ngày hôm nay. Dành thời gian nghỉ ngơi hoặc đi chill cùng Anh Iu nhen 💕</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayMatching.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-lg shadow-rose-950/20 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg">Tiết {item.lessons} ({item.session === 'morning' ? '07h15' : '12h30'})</span>
                    {item.room && <span className="text-rose-400 font-extrabold text-xs flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20"><MapPin className="w-3.5 h-3.5" /> Phòng {item.room}</span>}
                  </div>
                  <h4 className="text-base font-bold text-slate-100 mb-1">{item.subject.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> Giảng viên: {item.subject.lecturer}</p>
                  {item.subject.notes && <div className="mt-3 p-2.5 bg-slate-950/60 rounded-xl text-xs text-amber-300/90 border border-slate-800">💡 {item.subject.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: LIST */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên môn học, giảng viên..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500" />
          <div className="space-y-2.5">
            {timetable.subjects
              .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || sub.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) || sub.code.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((sub) => (
                <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-100 text-sm leading-snug">{sub.name}</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${sub.type === 'practice' ? 'bg-amber-500/20 text-amber-300' : sub.type === 'military' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {sub.type === 'practice' ? 'Thực hành' : sub.type === 'military' ? 'GDQP' : 'Lý thuyết'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 flex-wrap text-[11px]">
                    {sub.credits > 0 && <span>Tín chỉ: <strong className="text-slate-200">{sub.credits}</strong></span>}
                    <span>GV: <strong className="text-slate-200">{sub.lecturer}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <CalendarIcon className="w-3 h-3 text-rose-400" /> <span>{sub.startDate} ➔ {sub.endDate}</span>
                  </div>
                  {sub.notes && <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">💡 {sub.notes}</p>}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <TimetableExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} timetable={timetable} selectedWeek={selectedWeek} weekDates={currentWeekDates} matchingSubjects={matchingSubjects} />
      <TimetableImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={(newData) => onUpdateTimetable(newData)} />
    </div>
  );
}
