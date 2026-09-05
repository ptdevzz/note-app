import { TimetableData, TimetableScheduleItem, TimetableSubject } from './types';

export interface TodayScheduleEntry extends TimetableScheduleItem {
  subject: TimetableSubject;
}

/** Parse chuỗi DD/MM/YYYY thành Date (00:00 local) */
function parseDmy(dateStr: string): Date {
  const [d, m, y] = dateStr.split('/').map(Number);
  return new Date(y, m - 1, d);
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
 */
export function getSubjectsForDate(timetable: TimetableData, date: Date = new Date()): TodayScheduleEntry[] {
  const dayOfWeek = toTimetableDayOfWeek(date);
  const target = stripTime(date);

  return timetable.subjects.flatMap((subject) => {
    const start = stripTime(parseDmy(subject.startDate));
    const end = stripTime(parseDmy(subject.endDate));
    if (target < start || target > end) return [];

    return subject.schedules
      .filter((schedule) => schedule.dayOfWeek === dayOfWeek)
      .map((schedule) => ({ ...schedule, subject }));
  });
}
