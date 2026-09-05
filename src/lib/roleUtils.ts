import { UserRole } from './types';

/** Tên gọi ngắn: dùng trong tin nhắn nudge */
export function getRoleName(role: UserRole): string {
  return role === 'GF' ? 'Bé Yêu' : 'Anh Iu';
}

/** Tên có icon: dùng cho badge và trường createdBy / by */
export function getRoleBadge(role: UserRole): string {
  return role === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙';
}

export function getPartnerRole(role: UserRole): UserRole {
  return role === 'GF' ? 'BF' : 'GF';
}
