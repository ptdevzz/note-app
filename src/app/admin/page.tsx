'use client';

import React, { useState, useEffect } from 'react';
import { PlaceItem, LoveCoupon, PlaceCategory } from '@/lib/types';
import { dataService } from '@/lib/dataService';
import { 
  Settings, Heart, Key, Save, Trash2, Plus, RefreshCw, 
  Mail, Calendar, CheckCircle2, Sparkles, AlertTriangle, Bookmark, Lock
} from 'lucide-react';

export default function AdminConfigPage() {
  // Config States
  const [partner1Name, setPartner1Name] = useState('Anh iu');
  const [partner2Name, setPartner2Name] = useState('Bé Yêu');
  const [startDate, setStartDate] = useState('2026-04-18');
  const [partner2Email, setPartner2Email] = useState('');
  const [resendKey, setResendKey] = useState('');
  
  // Dual Passcodes
  const [passcodeGf, setPasscodeGf] = useState('1804'); // Birthday of Girlfriend
  const [passcodeBf, setPasscodeBf] = useState('1008'); // Birthday of Boyfriend

  // Daily Love Note State
  const [loveNote, setLoveNote] = useState('');

  // Coupons Master State
  const [coupons, setCoupons] = useState<LoveCoupon[]>([]);
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponIcon, setNewCouponIcon] = useState('🎁');

  // Collection Master State
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [newPlaceTitle, setNewPlaceTitle] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState<PlaceCategory>('Ăn tối');
  const [newPlaceTag, setNewPlaceTag] = useState('Quận 1');
  const [newPlaceUrl, setNewPlaceUrl] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPartner1Name(localStorage.getItem('admin_partner1') || 'Anh iu');
      setPartner2Name(localStorage.getItem('admin_partner2') || 'Bé Yêu');
      setStartDate(localStorage.getItem('admin_startdate') || '2026-04-18');
      setPartner2Email(localStorage.getItem('admin_email') || '');
      setPasscodeGf(localStorage.getItem('admin_passcode_gf') || localStorage.getItem('admin_passcode') || '1804');
      setPasscodeBf(localStorage.getItem('admin_passcode_bf') || '1008');
    }

    const unsubPlaces = dataService.subscribePlaces((items) => setPlaces(items));
    const unsubCoupons = dataService.subscribeCoupons((items) => setCoupons(items));
    const unsubNote = dataService.subscribeLoveNote((note) => setLoveNote(note));
    const unsubConfig = dataService.subscribeConfig((config) => {
      if (config) {
        if (config.partner1Name) setPartner1Name(config.partner1Name);
        if (config.partner2Name) setPartner2Name(config.partner2Name);
        if (config.startDate) setStartDate(config.startDate);
        if (config.partner2Email) setPartner2Email(config.partner2Email);
        if (config.passcodeGf) setPasscodeGf(config.passcodeGf);
        if (config.passcodeBf) setPasscodeBf(config.passcodeBf);
      }
    });

    return () => {
      unsubPlaces();
      unsubCoupons();
      unsubNote();
      unsubConfig();
    };
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateConfig({
      partner1Name,
      partner2Name,
      startDate,
      partner2Email,
      passcodeGf: passcodeGf.trim() || '1804',
      passcodeBf: passcodeBf.trim() || '1008'
    });
    dataService.updateLoveNote(loveNote);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Firebase Direct Coupon Management
  const handleResetCoupon = async (id: string) => {
    await dataService.resetCoupon(id);
    await loadAllAdminData();
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponTitle.trim()) return;

    await dataService.addCoupon({
      code: 'COUPON_' + Date.now().toString().slice(-4),
      title: newCouponTitle.trim(),
      description: newCouponDesc.trim() || 'Thẻ đặc quyền tình yêu dành riêng cho bạn gái.',
      icon: newCouponIcon.trim() || '🎁',
      isUsed: false
    });

    setNewCouponTitle('');
    setNewCouponDesc('');
    await loadAllAdminData();
  };

  const handleDeleteCoupon = async (id: string) => {
    await dataService.deleteCoupon(id);
    await loadAllAdminData();
  };

  const handleAddAdminPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceTitle.trim()) return;

    await dataService.addPlace({
      coupleId: 'couple-123',
      tiktokUrl: newPlaceUrl.trim(),
      title: newPlaceTitle.trim(),
      thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      authorName: 'Admin PC',
      category: newPlaceCategory,
      tags: [newPlaceTag.trim() || 'Sài Gòn'],
      status: 'SAVED',
      createdBy: partner1Name || 'Anh iu',
    });

    setNewPlaceTitle('');
    setNewPlaceUrl('');
    await loadAllAdminData();
  };

  const handleDeletePlace = async (id: string) => {
    await dataService.deletePlace(id);
    await loadAllAdminData();
  };

  const handleClearAllData = () => {
    if (confirm('Bạn có chắc chắn muốn reset toàn bộ dữ liệu về trạng thái ban đầu?')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* PC Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                Trang Quản Trị Ẩn (PC Admin)
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">Cấu Hình Master Data & Mật Khẩu Ngày Sinh Đôi</h1>
            </div>
          </div>

          <a
            href="/"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            ← Về Màn Hình Mobile
          </a>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Đã lưu thành công tất cả cấu hình Master Data & Passcode!</span>
          </div>
        )}

        {/* Section 1: Couple Profile & Dual Passcode Config */}
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">1. Cấu Hình Thông Tin Cặp Đôi & 2 Mật Khẩu Ngày Sinh</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên Bạn Trai
              </label>
              <input
                type="text"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên Bạn Gái
              </label>
              <input
                type="text"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Ngày Yêu (YYYY-MM-DD)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* DUAL PASSCODE CONFIGURATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-pink-300 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-pink-400" />
                <span>Mật Khẩu Ngày Sinh Bạn Gái (Mở Góc Nhìn Bé Yêu)</span>
              </label>
              <input
                type="text"
                required
                placeholder="1804"
                value={passcodeGf}
                onChange={(e) => setPasscodeGf(e.target.value)}
                className="w-full bg-slate-900 border border-pink-500/50 rounded-xl px-3 py-2.5 text-xs text-pink-300 font-mono font-bold focus:border-pink-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">VD: 1804 &rarr; Nhập pass này tự nhảy sang Góc nhìn Bé Yêu</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Mật Khẩu Ngày Sinh Bạn Trai (Mở Góc Nhìn Anh iu)</span>
              </label>
              <input
                type="text"
                required
                placeholder="1008"
                value={passcodeBf}
                onChange={(e) => setPasscodeBf(e.target.value)}
                className="w-full bg-slate-900 border border-purple-500/50 rounded-xl px-3 py-2.5 text-xs text-purple-300 font-mono font-bold focus:border-purple-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">VD: 1008 &rarr; Nhập pass này tự nhảy sang Góc nhìn Anh iu</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Email Bạn Gái (Nhận Thông Báo Mail)</span>
              </label>
              <input
                type="email"
                placeholder="nguoiyeu@gmail.com"
                value={partner2Email}
                onChange={(e) => setPartner2Email(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Mã Resend API Key (Gửi Email Thật)</span>
              </label>
              <input
                type="password"
                placeholder="re_123456789..."
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lời Nhắn Bí Mật Cho Bạn Gái Hôm Nay
            </label>
            <textarea
              rows={2}
              value={loveNote}
              onChange={(e) => setLoveNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-rose-100 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-rose-500/20 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Tất Cả Cấu Hình</span>
          </button>
        </form>

        {/* Section 2: Manage Collection Places Master Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">2. Quản Lý Master Data Bộ Sưu Tập (Places & Activities)</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{places.length} Địa điểm trong bộ sưu tập</span>
          </div>

          <form onSubmit={handleAddAdminPlace} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-rose-300">+ Thêm Địa Điểm Master Trực Tiếp Từ PC</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Tên quán / Hoạt động (vd: Quán Lẩu Rooftop Q1)"
                value={newPlaceTitle}
                onChange={(e) => setNewPlaceTitle(e.target.value)}
                className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <select
                value={newPlaceCategory}
                onChange={(e) => setNewPlaceCategory(e.target.value as PlaceCategory)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Ăn tối">🍲 Ăn tối</option>
                <option value="Cà phê & Chill">☕ Cà phê & Chill</option>
                <option value="Vui chơi">🎬 🎳 Vui chơi</option>
                <option value="Ăn sáng">🥣 Ăn sáng</option>
                <option value="Khác">🛍️ Khác</option>
              </select>
              <input
                type="text"
                placeholder="Quận / Vị trí (vd: Quận 1)"
                value={newPlaceTag}
                onChange={(e) => setNewPlaceTag(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <input
              type="text"
              placeholder="Link TikTok / Link clip (tùy chọn)..."
              value={newPlaceUrl}
              onChange={(e) => setNewPlaceUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Địa Điểm Master</span>
            </button>
          </form>

          {places.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">Bộ sưu tập hiện tại đang trống.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Tên Địa Điểm / Hoạt Động</th>
                    <th className="p-3">Thể Loại</th>
                    <th className="p-3">Quận</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {places.map((place) => (
                    <tr key={place.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="p-3 font-semibold text-slate-100 flex items-center space-x-2 min-w-[200px]">
                        <img src={place.thumbnail} alt={place.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="line-clamp-1">{place.title}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {place.category}
                        </span>
                      </td>
                      <td className="p-3">{place.tags.join(', ')}</td>
                      <td className="p-3">
                        {place.status === 'VISITED' ? (
                          <span className="text-emerald-400 font-bold">Đã đi ⭐</span>
                        ) : place.status === 'PLANNED' ? (
                          <span className="text-amber-400 font-bold">Đã xếp lịch 📅</span>
                        ) : (
                          <span className="text-slate-400 font-semibold">Đã lưu 📌</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                          title="Xóa khỏi bộ sưu tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Manage Love Coupons Master (Firebase Synced) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">3. Quản Lý Thẻ Đặc Quyền Bạn Gái (Firebase Synced Coupons)</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{coupons.length} Thẻ Master</span>
          </div>

          <form onSubmit={handleAddCoupon} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-rose-300">+ Thêm Thẻ Đặc Quyền Mới Trực Tiếp Vào Firebase</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Icon (vd: 🍔, 💆‍♀️, 🎬)"
                value={newCouponIcon}
                onChange={(e) => setNewCouponIcon(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                required
                placeholder="Tên thẻ (vd: Bao đi ăn sushi)"
                value={newCouponTitle}
                onChange={(e) => setNewCouponTitle(e.target.value)}
                className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <input
              type="text"
              placeholder="Mô tả quyền lợi thẻ..."
              value={newCouponDesc}
              onChange={(e) => setNewCouponDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thẻ Mới Vào Firebase</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-start space-x-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{coupon.icon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white">{coupon.title}</h4>
                      {coupon.isUsed && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Đã dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{coupon.description}</p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">CODE: {coupon.code}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  {coupon.isUsed && (
                    <button
                      onClick={() => handleResetCoupon(coupon.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0"
                      title="Reset trạng thái thẻ về chưa dùng trong Firebase"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs shrink-0"
                    title="Xóa thẻ khỏi Firebase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Reset / Danger Zone */}
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Khu Vực Nguy Hiểm (Danger Zone)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reset toàn bộ dữ liệu bộ sưu tập và bộ nhớ đệm về lại trạng thái ban đầu.
            </p>
          </div>

          <button
            onClick={handleClearAllData}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Reset Dữ Liệu Ban Đầu
          </button>
        </div>

      </div>
    </div>
  );
}
