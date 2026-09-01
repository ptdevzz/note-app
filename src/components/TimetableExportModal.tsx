'use client';

import React from 'react';
import { TimetableData, TimetableSubject } from '@/lib/types';
import { Download, X, Image as ImageIcon } from 'lucide-react';

interface TimetableExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: TimetableData;
  selectedWeek: number;
  selectedGroup?: string;
  weekDates: { start: Date; end: Date; label: string };
  matchingSubjects: { dayOfWeek: number; session: 'morning' | 'afternoon'; subject: TimetableSubject; lessons: string; room: string; group: string }[];
}

export default function TimetableExportModal({ isOpen, onClose, timetable, selectedWeek, weekDates, matchingSubjects }: TimetableExportModalProps) {
  if (!isOpen) return null;

  const dayNames: { [key: number]: string } = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7' };
  const dayKeys = [2, 3, 4, 5, 6, 7];

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    // Tối ưu height vừa vặn hơn (880px thay vì 1480px)
    const height = 880;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e112a');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative glows
    ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
    ctx.beginPath(); ctx.arc(200, 150, 250, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.10)';
    ctx.beginPath(); ctx.arc(880, 700, 250, 0, Math.PI * 2); ctx.fill();

    // Header (Thu nhỏ font bớt thô)
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💕 THỜI KHÓA BIỂU BÉ YÊU 💕', width / 2, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`Lớp ${timetable.className} • ${timetable.semester}`, width / 2, 95);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 22px sans-serif';
    ctx.fillText(`Tuần ${selectedWeek} (${weekDates.label})`, width / 2, 130);

    // TABLE GRID (Kích thước & padding vừa khít)
    const tableX = 50;
    const tableY = 160;
    const headerColW = 100; // Cột Sáng/Chiều
    const colW = (width - 100 - headerColW) / 6;
    const headerRowH = 45;
    const cellH = 270;
    const tableW = headerColW + colW * 6;
    const tableH = headerRowH + cellH * 2;

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // Card nền bảng
    drawRoundRect(tableX, tableY, tableW, tableH, 16);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header Cột
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(tableX, tableY, headerColW, headerRowH);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.strokeRect(tableX, tableY, headerColW, headerRowH);

    dayKeys.forEach((dow, i) => {
      const x = tableX + headerColW + i * colW;
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(x, tableY, colW, headerRowH);
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.strokeRect(x, tableY, colW, headerRowH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dayNames[dow], x + colW / 2, tableY + 30);
    });

    // Session Rows (Sáng / Chiều)
    const sessions: { key: 'morning' | 'afternoon'; label: string; time: string }[] = [
      { key: 'morning', label: 'Sáng', time: '7h15-11h15' },
      { key: 'afternoon', label: 'Chiều', time: '12h30-16h30' },
    ];

    sessions.forEach((session, sIdx) => {
      const rowY = tableY + headerRowH + sIdx * cellH;

      ctx.fillStyle = session.key === 'morning' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)';
      ctx.fillRect(tableX, rowY, headerColW, cellH);
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.strokeRect(tableX, rowY, headerColW, cellH);

      ctx.fillStyle = session.key === 'morning' ? '#fbbf24' : '#818cf8';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(session.key === 'morning' ? '☀️' : '🌙', tableX + headerColW / 2, rowY + 50);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(session.label, tableX + headerColW / 2, rowY + 80);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(session.time, tableX + headerColW / 2, rowY + 105);

      dayKeys.forEach((dow, i) => {
        const x = tableX + headerColW + i * colW;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(x, rowY, colW, cellH);
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.strokeRect(x, rowY, colW, cellH);

        const cellItems = matchingSubjects.filter(item => item.dayOfWeek === dow && item.session === session.key);

        if (cellItems.length === 0) {
          ctx.fillStyle = '#475569';
          ctx.font = 'italic 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('—', x + colW / 2, rowY + cellH / 2);
        } else {
          let textY = rowY + 25;
          cellItems.forEach((item, idx) => {
            if (idx > 1) return;
            const isPractice = item.subject.type === 'practice';

            ctx.fillStyle = isPractice ? '#f59e0b' : '#f43f5e';
            ctx.fillRect(x + 6, textY - 12, 3, 50);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'left';

            const name = item.subject.name;
            const words = name.split(' ');
            let line = '';
            let lineY = textY;
            const maxW = colW - 20;

            words.forEach((word) => {
              const testLine = line ? line + ' ' + word : word;
              if (ctx.measureText(testLine).width > maxW && line) {
                ctx.fillText(line, x + 14, lineY);
                line = word;
                lineY += 16;
              } else {
                line = testLine;
              }
            });
            if (line) {
              ctx.fillText(line, x + 14, lineY);
              lineY += 16;
            }

            if (item.room) {
              ctx.fillStyle = '#fb7185';
              ctx.font = '600 13px sans-serif';
              ctx.fillText(`📍 P.${item.room}`, x + 14, lineY);
              lineY += 16;
            }

            textY = lineY + 10;
          });
        }
      });
    });

    // FOOTER (Gọn gàng)
    const footerY = tableY + tableH + 35;
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💖 Thiết kế bởi Anh Iu dành riêng cho Bé Yêu 💕', width / 2, footerY);

    const link = document.createElement('a');
    link.download = `TKB_BeYeu_Tuan_${selectedWeek}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"><X className="w-5 h-5" /></button>
        <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/30"><ImageIcon className="w-7 h-7" /></div>
        <h3 className="text-xl font-extrabold text-slate-100 mb-1">Xuất Ảnh TKB Tuần {selectedWeek}</h3>
        <p className="text-xs text-slate-400 mb-6">Tải bảng thời khóa biểu vừa vặn, đẹp mắt về máy!</p>
        <div className="bg-slate-800/60 rounded-2xl p-4 text-left border border-slate-700/50 mb-6 space-y-2 text-xs text-slate-300">
          <div className="flex justify-between"><span className="text-slate-400">Lớp:</span><span className="font-bold text-rose-300">{timetable.className}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Tuần:</span><span className="font-semibold">{selectedWeek} ({weekDates.label})</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Tổng số buổi:</span><span className="font-semibold text-emerald-400">{matchingSubjects.length} buổi</span></div>
        </div>
        <button onClick={handleDownload} className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all">
          <Download className="w-5 h-5 stroke-[2.5px]" /> Tải Ảnh Về Điện Thoại
        </button>
      </div>
    </div>
  );
}
