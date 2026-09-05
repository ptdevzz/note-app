'use client';

import { useEffect, useState } from 'react';
import { getPartnerEmail } from '@/lib/partnerEmail';

/**
 * Email người ấy, đọc từ localStorage sau khi mount (tránh lệch SSR/CSR)
 * và tự cập nhật khi localStorage thay đổi ở tab khác.
 */
export function usePartnerEmail(): string {
  const [partnerEmail, setPartnerEmail] = useState('');

  useEffect(() => {
    const sync = () => setPartnerEmail(getPartnerEmail());
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return partnerEmail;
}
