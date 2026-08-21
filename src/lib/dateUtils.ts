export interface WeekendDates {
  saturday: string; // YYYY-MM-DD
  sunday: string;   // YYYY-MM-DD
  saturdayDisplay: string; // "Thứ 7, 15/08"
  sundayDisplay: string;   // "Chủ Nhật, 16/08"
  weekLabel: string;       // "Tuần này (15-16/08)"
}

export function getWeekendForWeekOffset(weekOffset: number = 0): WeekendDates {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Tìm ngày Thứ 2 của tuần hiện tại làm mốc chuẩn
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  // Tính ngày Thứ 7 của tuần tương ứng (Monday + 5 ngày + weekOffset * 7 ngày)
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5 + (weekOffset * 7));

  // Chủ Nhật = Thứ 7 + 1 ngày
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const formatISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplay = (prefix: string, d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${prefix}, ${dd}/${mm}`;
  };

  const satISO = formatISO(saturday);
  const sunISO = formatISO(sunday);

  let weekTitle = `Tuần ${saturday.getDate()}/${saturday.getMonth() + 1}`;
  if (weekOffset === 0) weekTitle = 'Tuần Này';
  else if (weekOffset === 1) weekTitle = 'Tuần Sau';
  else if (weekOffset === 2) weekTitle = '2 Tuần Nữa';
  else weekTitle = `${weekOffset} Tuần Nữa`;

  return {
    saturday: satISO,
    sunday: sunISO,
    saturdayDisplay: formatDisplay('Thứ 7', saturday),
    sundayDisplay: formatDisplay('Chủ Nhật', sunday),
    weekLabel: `${weekTitle} (${saturday.getDate()}/${saturday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1})`,
  };
}

export function getUpcomingWeeksList(count: number = 8): WeekendDates[] {
  const list: WeekendDates[] = [];
  for (let i = 0; i < count; i++) {
    list.push(getWeekendForWeekOffset(i));
  }
  return list;
}

/**
 * Tính số ngày yêu nhau tự động từ ngày bắt đầu 18/04/2026
 */
export function calculateLoveDays(startDateStr: string = '2026-04-18'): number {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1);
}

/**
 * Format thời gian chuẩn định dạng DD/MM/YYYY HH:MM
 */
export function formatDateTime(dateInput?: Date | string | number): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Tự động chuẩn hóa tiền VNĐ (xử lý cả dữ liệu nhập 180 (nghìn) lẫn 180000)
 */
export function formatVndCurrency(amount?: number): string {
  if (!amount || amount <= 0) return '0 VNĐ';
  const realAmount = amount < 10000 ? amount * 1000 : amount;
  return `${realAmount.toLocaleString('vi-VN')} VNĐ`;
}
