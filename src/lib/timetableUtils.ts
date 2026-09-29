import { TimetableData, TimetableScheduleItem, TimetableSubject } from './types';

export interface TodayScheduleEntry extends TimetableScheduleItem {
  subject: TimetableSubject;
}

/** Parse chuỗi DD/MM/YYYY hoặc YYYY-MM-DD thành Date (00:00 local) */
function parseDateStr(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  } else if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return null;
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Chuyển JS getDay() (0=CN..6=T7) sang quy ước thời khóa biểu (2=T2..7=T7, 8=CN) */
export function toTimetableDayOfWeek(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 8 : jsDay + 1;
}

/**
 * Lấy danh sách tiết học của một ngày cụ thể,
 * chỉ tính các môn đang trong khoảng startDate..endDate.
 * Lọc theo group (mặc định N1) — chỉ trả về schedule với group === 'ALL' hoặc group === selectedGroup.
 */
export function getSubjectsForDate(
  timetable: TimetableData,
  date: Date = new Date(),
  selectedGroup: 'N1' | 'N2' = 'N1'
): TodayScheduleEntry[] {
  const dayOfWeek = toTimetableDayOfWeek(date);
  const target = stripTime(date);

  return timetable.subjects.flatMap((subject) => {
    const start = parseDateStr(subject.startDate);
    const end = parseDateStr(subject.endDate);
    if (start && end) {
      const sStart = stripTime(start);
      const sEnd = stripTime(end);
      if (target < sStart || target > sEnd) return [];
    }

    return subject.schedules
      .filter((schedule) =>
        schedule.dayOfWeek === dayOfWeek &&
        (schedule.group === 'ALL' || schedule.group === selectedGroup)
      )
      .map((schedule) => ({ ...schedule, subject }));
  });
}
