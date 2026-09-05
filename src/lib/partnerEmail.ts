const STORAGE_KEY_PARTNER_EMAIL = 'admin_email';

/**
 * Đọc email người ấy từ localStorage (được lưu bởi dataService.updateConfig).
 * Trả về chuỗi rỗng khi chạy trên server hoặc chưa cấu hình.
 */
export function getPartnerEmail(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY_PARTNER_EMAIL) || '';
  } catch {
    return '';
  }
}
