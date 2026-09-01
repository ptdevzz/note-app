'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LoveSong, CoupleHobby } from '@/lib/types';
import { dataService } from '@/lib/dataService';
import { formatDateTime } from '@/lib/dateUtils';
import { 
  Music, Heart, Plus, Search, Play, Pause, Trash2, 
  Sparkles, Gamepad2, Dumbbell, Utensils, Scissors, ExternalLink,
  Radio, Video, Volume2, VolumeX, Youtube, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MusicAndHobbiesTabProps {
  currentRole: 'GF' | 'BF';
}

export default function MusicAndHobbiesTab({ currentRole }: MusicAndHobbiesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'music' | 'hobbies'>('music');
  
  // Music States
  const [songs, setSongs] = useState<LoveSong[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddCustomSong, setIsAddCustomSong] = useState(false);

  // Player States
  const [currentSong, setCurrentSong] = useState<LoveSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Mặc định 3 phút nếu không lấy được length
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Custom Song Inputs
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState('');

  // Hobbies States
  const [hobbies, setHobbies] = useState<CoupleHobby[]>([]);
  const [isAddHobbyOpen, setIsAddHobbyOpen] = useState(false);
  const [hobbyCategory, setHobbyCategory] = useState<'Đá banh' | 'Máy tính gem' | 'Làm neo' | 'Ăn ún' | 'Khác'>('Đá banh');
  const [hobbyTitle, setHobbyTitle] = useState('');
  const [hobbyDesc, setHobbyDesc] = useState('');
  const [hobbyMediaUrl, setHobbyMediaUrl] = useState('');
  const [hobbyOwnerFilter, setHobbyOwnerFilter] = useState<'ALL' | 'GF' | 'BF'>('ALL');

  // Subscriptions
  useEffect(() => {
    const unsubSongs = dataService.subscribeSongs((items) => {
      setSongs(items);
    });

    const unsubHobbies = dataService.subscribeHobbies((items) => {
      setHobbies(items);
    });

    const unsubPlayer = dataService.subscribeMusicPlayer((state) => {
      if (state && state.currentSong) {
        setCurrentSong(state.currentSong);
        setIsPlaying(state.isPlaying);
      }
    });

    return () => {
      unsubSongs();
      unsubHobbies();
      unsubPlayer();
    };
  }, []);

  // Realtime Audio Play/Pause Effect & Progress Timer
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          setCurrentTime(Math.floor(audioRef.current.currentTime));
          setDuration(Math.floor(audioRef.current.duration));
        } else {
          setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
        }
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle Search Music (Tìm qua YouTube Full Songs)
  const handleSearchMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/music-search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.warn('Lỗi tìm nhạc:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Add Song from Search
  const handleAddSearchResult = async (item: any) => {
    const timeStr = formatDateTime();
    const newSong: Omit<LoveSong, 'id'> = {
      title: item.title,
      artist: item.artist,
      coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      audioUrl: item.audioUrl || '',
      youtubeId: item.youtubeId || item.id,
      addedBy: currentRole === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙',
      addedAt: timeStr,
    };
    await dataService.addSong(newSong);
    const msg = `🎵 ${currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu'} vừa thêm bài hát mới: ${item.title}`;
    await dataService.sendNudge(currentRole, msg);
    confetti({ particleCount: 60, spread: 60 });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Add Custom Song MP3
  const handleAddCustomSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customAudioUrl) return;
    const timeStr = formatDateTime();
    await dataService.addSong({
      title: customTitle,
      artist: customArtist || 'Yêu Thích',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
      audioUrl: customAudioUrl,
      addedBy: currentRole === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙',
      addedAt: timeStr,
    });
    setCustomTitle('');
    setCustomArtist('');
    setCustomAudioUrl('');
    setIsAddCustomSong(false);
  };

  // Play Song & Sync Realtime to Partner
  const handlePlaySong = async (song: LoveSong) => {
    if (currentSong?.id === song.id) {
      const nextPlaying = !isPlaying;
      setIsPlaying(nextPlaying);
      if (audioRef.current) {
        if (nextPlaying) {
          audioRef.current.play().catch(e => console.warn('Play error:', e));
        } else {
          audioRef.current.pause();
        }
      }
      await dataService.syncMusicPlayer({
        currentSong: song,
        isPlaying: nextPlaying,
        playedSeconds: audioRef.current?.currentTime || 0,
        updatedAt: Date.now(),
      });
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl || '';
        audioRef.current.play().catch(e => console.warn('Play error:', e));
      }
      await dataService.syncMusicPlayer({
        currentSong: song,
        isPlaying: true,
        playedSeconds: 0,
        updatedAt: Date.now(),
      });
    }
  };

  // Add Hobby
  const handleAddHobbySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hobbyTitle.trim()) return;
    const timeStr = formatDateTime();
    await dataService.addHobby({
      owner: currentRole,
      category: hobbyCategory,
      title: hobbyTitle,
      description: hobbyDesc,
      imageUrl: hobbyMediaUrl.includes('.jpg') || hobbyMediaUrl.includes('.png') || hobbyMediaUrl.includes('data:image') ? hobbyMediaUrl : undefined,
      videoUrl: hobbyMediaUrl.includes('youtube') || hobbyMediaUrl.includes('tiktok') || hobbyMediaUrl.includes('.mp4') ? hobbyMediaUrl : undefined,
      addedAt: timeStr,
    });

    const msg = `✨ ${currentRole === 'GF' ? 'Bé Yêu' : 'Anh Iu'} vừa thêm sở thích mới: ${hobbyCategory} - ${hobbyTitle}`;
    await dataService.sendNudge(currentRole, msg);
    confetti({ particleCount: 80, spread: 70 });

    setHobbyTitle('');
    setHobbyDesc('');
    setHobbyMediaUrl('');
    setIsAddHobbyOpen(false);
  };

  // Icon Helper for Hobbies
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Đá banh': return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'Máy tính gem': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'Làm neo': return <Scissors className="w-4 h-4 text-pink-400" />;
      case 'Ăn ún': return <Utensils className="w-4 h-4 text-amber-400" />;
      default: return <Sparkles className="w-4 h-4 text-rose-400" />;
    }
  };

  const filteredHobbies = hobbies.filter(h => {
    if (hobbyOwnerFilter === 'ALL') return true;
    return h.owner === hobbyOwnerFilter;
  });

  return (
    <div className="space-y-4 pb-28">
      {/* Sub Navigation */}
      <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setActiveSubTab('music')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'music'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Nhạc Yêu Thích 🎶</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hobbies')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'hobbies'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Góc Sở Thích ⚽💅</span>
        </button>
      </div>

      {/* --- TAB 1: MUSIC & REALTIME PLAYER --- */}
      {activeSubTab === 'music' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900/40 via-rose-900/30 to-pink-900/40 border border-pink-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
                YouTube Full Songs 🎧
              </span>
              <h2 className="text-sm font-bold text-white mt-1">Playlist Của 2 Đứa 💕</h2>
              <p className="text-[11px] text-slate-300">Nghe full bài Sơn Tùng, Đen, Vũ, Remix...</p>
            </div>
            <Radio className="w-7 h-7 text-pink-400 animate-pulse shrink-0 ml-2" />
          </div>

          {/* Music Search Bar */}
          <form onSubmit={handleSearchMusic} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm tên bài hát hoặc ca sĩ yêu thích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors shrink-0 flex items-center space-x-1.5 min-w-[65px] justify-center"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Tìm...</span>
                </>
              ) : (
                <span>Tìm</span>
              )}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 max-h-64 overflow-y-auto">
              <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-300">Kết quả tìm kiếm ({searchResults.length})</span>
                <button onClick={() => setSearchResults([])} className="text-[10px] text-slate-400 hover:text-white">Đóng ✕</button>
              </div>

              {searchResults.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl hover:bg-slate-800/80 transition-colors">
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <img 
                      src={item.coverUrl} 
                      alt={item.title} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-100 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddSearchResult(item)}
                    className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg ml-2 flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Songs List Header */}
          <div className="flex justify-between items-center pt-1">
            <h3 className="text-xs font-bold text-slate-300">Danh Sách Bài Hát ({songs.length})</h3>
            <button
              onClick={() => setIsAddCustomSong(!isAddCustomSong)}
              className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>{isAddCustomSong ? 'Đóng' : 'Thêm mp3 bằng link'}</span>
            </button>
          </div>

          {/* Add Custom MP3 Form */}
          {isAddCustomSong && (
            <form onSubmit={handleAddCustomSongSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 animate-in fade-in">
              <input
                type="text"
                placeholder="Tên bài hát *"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Tên ca sĩ"
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="url"
                placeholder="Đường link MP3 audio *"
                value={customAudioUrl}
                onChange={(e) => setCustomAudioUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
              <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2 rounded-xl">
                Lưu Bài Hát
              </button>
            </form>
          )}

          {/* Song Cards List */}
          {songs.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
              <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Chưa có bài hát nào trong Playlist 2 đứa!</p>
              <p className="text-[10px] text-slate-500 mt-1">Gõ tên bài hát ở ô trên để tìm bài hát yêu thích nhé 💕</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => {
                const isThisPlaying = currentSong?.id === song.id && isPlaying;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      currentSong?.id === song.id
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative group shrink-0">
                        <img src={song.coverUrl} alt={song.title} className="w-11 h-11 rounded-xl object-cover border border-slate-800" />
                        <button
                          onClick={() => handlePlaySong(song)}
                          className="absolute inset-0 bg-black/40 group-hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors"
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 text-white animate-pulse" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold truncate ${currentSong?.id === song.id ? 'text-rose-300' : 'text-slate-100'}`}>
                          {song.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Bởi {song.addedBy}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          isThisPlaying
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isThisPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => dataService.deleteSong(song.id)}
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: HOBBIES (Đá banh, Máy tính gem, Làm neo, Ăn ún...) --- */}
      {activeSubTab === 'hobbies' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-900/30 via-rose-900/30 to-purple-900/30 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Gu & Sở Thích Của Nhau ⚽💅
              </span>
              <h2 className="text-sm font-bold text-white mt-1">Sở Thích 2 Đứa 💕</h2>
              <p className="text-[11px] text-slate-300">Đá banh, Máy tính gem, Làm neo, Ăn ún...</p>
            </div>
            <Sparkles className="w-7 h-7 text-amber-400 shrink-0 ml-2" />
          </div>

          {/* Filter & Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setHobbyOwnerFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg ${hobbyOwnerFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setHobbyOwnerFilter('GF')}
                className={`px-2.5 py-1 rounded-lg ${hobbyOwnerFilter === 'GF' ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400'}`}
              >
                Bé Yêu 🎀
              </button>
              <button
                onClick={() => setHobbyOwnerFilter('BF')}
                className={`px-2.5 py-1 rounded-lg ${hobbyOwnerFilter === 'BF' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'}`}
              >
                Anh Iu 💙
              </button>
            </div>

            <button
              onClick={() => setIsAddHobbyOpen(!isAddHobbyOpen)}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Sở Thích</span>
            </button>
          </div>

          {/* Add Hobby Modal / Form */}
          {isAddHobbyOpen && (
            <form onSubmit={handleAddHobbySubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Thêm Sở Thích / Món Đồ Yêu Thích ✨</span>
              </h4>

              {/* Category Selector */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Danh mục sở thích</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Đá banh', 'Máy tính gem', 'Làm neo', 'Ăn ún', 'Khác'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setHobbyCategory(cat)}
                      className={`p-2 rounded-xl text-[11px] font-bold border flex items-center justify-center space-x-1 transition-all ${
                        hobbyCategory === cat
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Tên sở thích / món đồ (VD: Giày đá bóng, Máy tính gaming...)"
                value={hobbyTitle}
                onChange={(e) => setHobbyTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />

              <textarea
                placeholder="Mô tả ngắn hoặc lời nhắn..."
                value={hobbyDesc}
                onChange={(e) => setHobbyDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white h-16 resize-none"
              />

              <input
                type="url"
                placeholder="Link ảnh / Video minh họa (tùy chọn)"
                value={hobbyMediaUrl}
                onChange={(e) => setHobbyMediaUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />

              <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md">
                Lưu Vào Góc Sở Thích 💖
              </button>
            </form>
          )}

          {/* Hobbies Cards List */}
          {filteredHobbies.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Chưa có sở thích nào được thêm!</p>
              <p className="text-[10px] text-slate-500 mt-1">Bấm nút "Thêm Sở Thích" để chia sẻ đồ đá banh, máy tính gem, làm neo... nhé 💕</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredHobbies.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 space-y-2 shadow-md relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        {getCategoryIcon(item.category)}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Của {item.owner === 'GF' ? 'Bé Yêu 🎀' : 'Anh Iu 💙'}
                      </span>
                    </div>

                    <button
                      onClick={() => dataService.deleteHobby(item.id)}
                      className="text-slate-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>

                  {item.description && (
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                      {item.description}
                    </p>
                  )}

                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover rounded-xl border border-slate-800" />
                  )}

                  {item.videoUrl && (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Xem Video Minh Họa</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- RESPONSIVE STICKY REALTIME MUSIC PLAYER BAR (PWA iOS SAFE AUDIO ENGINE) --- */}
      {currentSong && (
        <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-40 bg-slate-900/95 border border-pink-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl space-y-2 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between space-x-2.5">
            <img src={currentSong.coverUrl} alt={currentSong.title} className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0" />

            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'} shrink-0`} />
                <p className="text-xs font-bold text-white truncate leading-tight">{currentSong.title}</p>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentSong.artist}</p>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {currentSong.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${currentSong.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-[10px] font-bold flex items-center gap-1 transition"
                  title="Nghe trên YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Mở YouTube</span>
                </a>
              )}
            </div>
          </div>

          {/* HTML5 Audio Element cho MP3 Links */}
          {currentSong.audioUrl && (
            <audio
              ref={audioRef}
              src={currentSong.audioUrl}
              controls
              playsInline
              className="w-full h-8 rounded-lg text-xs accent-rose-500"
            />
          )}

          {/* Embedded YouTube Player cho PWA iOS */}
          {currentSong.youtubeId && (
            <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-800 bg-black mt-1">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${currentSong.youtubeId}?playsinline=1&enablejsapi=1`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
