'use client';

import React, { useState } from 'react';
import { TimetableData } from '@/lib/types';
import { dataService } from '@/lib/dataService';
import { X, Upload, FileText, AlertTriangle } from 'lucide-react';

interface TimetableImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newData: TimetableData) => void;
}

export default function TimetableImportModal({ isOpen, onClose, onSuccess }: TimetableImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setJsonText(event.target?.result as string);
        setErrorMsg(null);
      } catch { setErrorMsg('Không thể đọc file JSON này.'); }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) { setErrorMsg('Vui lòng dán chuỗi JSON hoặc chọn file JSON.'); return; }
    try {
      setIsSaving(true); setErrorMsg(null);
      const parsed = JSON.parse(jsonText) as TimetableData;
      if (!parsed.semester || !parsed.className || !Array.isArray(parsed.subjects)) {
        throw new Error('Cấu trúc JSON không đúng. Cần chứa semester, className, và mảng subjects.');
      }
      await dataService.updateTimetableData(parsed);
      onSuccess(parsed);
      onClose();
      alert('🎉 Đã cập nhật Thời khóa biểu thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Cấu trúc JSON bị lỗi syntax.');
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30"><Upload className="w-5 h-5" /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Import Thời Khóa Biểu Mới</h3>
            <p className="text-xs text-slate-400">Nạp dữ liệu TKB cho học kỳ mới (HK2, HK3...)</p>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>1. Tải file .json do AI gen:</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="json-file-input" />
              <label htmlFor="json-file-input" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs rounded-xl cursor-pointer border border-slate-700 transition flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Select .json
              </label>
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">2. Hoặc dán (Paste) mã JSON vào đây:</label>
            <textarea rows={8} value={jsonText} onChange={(e) => { setJsonText(e.target.value); setErrorMsg(null); }}
              placeholder='{\n  "semester": "HK2 - NH 2026-2027",\n  "className": "26CĐTT2",\n  "subjects": [...]\n}'
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono resize-none" />
          </div>
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /><span>{errorMsg}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold text-sm transition">Hủy Bỏ</button>
          <button onClick={handleImport} disabled={isSaving}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
            {isSaving ? 'Đang cập nhật...' : 'Cập Nhật TKB Mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
