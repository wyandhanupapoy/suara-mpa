"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  Search,
  ShieldCheck,
  Send,
  FileText,
  User,
  Lock,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Inbox,
  Scale,
  Filter,
  Trash2,
  Instagram,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Settings,
  Mail
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION & INIT ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

const appId = (typeof __app_id !== 'undefined' ? __app_id : null) || process.env.NEXT_PUBLIC_APP_ID || 'mpa-himakom';

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// --- UTILITY FUNCTIONS ---
const generateTrackingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MPA-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(date);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'received': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'verified': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'process': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'followed_up': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'finished': return 'bg-green-100 text-green-700 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getStatusLabel = (status) => {
  const labels = {
    received: 'Diterima',
    verified: 'Diverifikasi',
    process: 'Dalam Proses',
    followed_up: 'Ditindaklanjuti',
    finished: 'Selesai',
    rejected: 'Ditolak/Spam'
  };
  return labels[status] || status;
};

// --- ANIMATED BACKGROUND COMPONENT ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }

      draw() {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = dx * dx + dy * dy;

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            let opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = 'rgba(148, 163, 184,' + opacityValue * 0.3 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-60"
    />
  );
};

// --- COMPONENTS ---

const Header = ({ currentView, setView, isAdmin, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-500 rounded-[2rem] border ${scrolled ? 'bg-white/85 backdrop-blur-xl border-white/40 shadow-xl' : 'bg-transparent border-transparent'} h-20 flex justify-between items-center px-6`}>
          
          <div className="flex items-center gap-4 cursor-pointer group active:scale-95 transition-transform" onClick={() => !isAdmin && setView('landing')}>
            <div className="relative group-hover:rotate-6 transition-transform duration-500">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-card flex items-center justify-center relative z-20 overflow-hidden ring-4 ring-white/50">
                  <img src="/Logo_MPA.png" alt="MPA" className="w-full h-full object-cover p-0.5" onError={(e) => e.target.style.display = 'none'} />
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full premium-gradient flex items-center justify-center relative z-10 overflow-hidden ring-4 ring-white/50">
                  <img src="/Logo_HIMAKOM.png" alt="HIM" className="w-full h-full object-cover p-1" onError={(e) => e.target.style.display = 'none'} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-sm md:text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                MPA HIMAKOM
              </h1>
              <span className="text-[10px] text-slate-500 font-extrabold tracking-[0.2em] uppercase hidden md:block mt-1">
                Politeknik Negeri Bandung
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 p-1.5 glass-card rounded-2xl">
            {isAdmin ? (
              <div className="flex items-center gap-2 px-1">
                <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2.5 rounded-xl border border-blue-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-black text-blue-900 uppercase tracking-wider">Admin Dashboard</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white hover:bg-red-600 transition-all px-4 py-2.5 rounded-xl uppercase tracking-wider"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            ) : (
              <>
                {[
                  { id: 'landing', label: 'Beranda', icon: <LayoutDashboard size={14} /> },
                  { id: 'form', label: 'Aspirasi', icon: <Megaphone size={14} /> },
                  { id: 'tracking', label: 'Cek Status', icon: <Search size={14} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      currentView === item.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button 
                  onClick={() => setView('login')} 
                  className="px-4 py-2.5 text-slate-400 hover:text-slate-900 transition-all"
                  title="Admin Login"
                >
                  <Lock size={16} />
                </button>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="glass-card p-3 rounded-2xl hover:bg-blue-50 transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 mt-2">
          <div className="glass-dark rounded-[2rem] p-4 flex flex-col gap-2 animate-slide-down">
            {isAdmin ? (
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="p-4 text-left font-black text-red-100 bg-red-500/10 rounded-2xl flex items-center gap-3 uppercase text-xs tracking-widest"
              >
                <LogOut size={20} /> Logout Admin
              </button>
            ) : (
              <>
                <button onClick={() => { setView('landing'); setIsMenuOpen(false); }} className="p-4 text-left font-black text-white hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-all uppercase text-xs tracking-widest">
                  <LayoutDashboard size={20} className="text-blue-400" /> Beranda
                </button>
                <button onClick={() => { setView('form'); setIsMenuOpen(false); }} className="p-4 text-left font-black text-white hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-all uppercase text-xs tracking-widest">
                  <Megaphone size={20} className="text-blue-400" /> Kirim Aspirasi
                </button>
                <button onClick={() => { setView('tracking'); setIsMenuOpen(false); }} className="p-4 text-left font-black text-white hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-all uppercase text-xs tracking-widest">
                  <Search size={20} className="text-blue-400" /> Cek Status
                </button>
                <div className="h-px bg-white/10 my-2"></div>
                <button onClick={() => { setView('login'); setIsMenuOpen(false); }} className="p-4 text-left font-black text-slate-400 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-all uppercase text-xs tracking-widest">
                  <Lock size={20} /> Login Admin
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const PublicAspirationsTable = ({ db, appId, user }) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: null,
    status: null,
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Import search utilities at component level
  const processAspirations = (aspirations, { searchQuery, filters, sortBy }) => {
    let processed = aspirations;

    // Search
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase().trim();
      processed = processed.filter(asp => {
        const searchFields = [
          asp.title || '',
          asp.description || '',
          asp.category || '',
          asp.tracking_code || ''
        ].map(field => field.toLowerCase());
        return searchFields.some(field => field.includes(lowerQuery));
      });
    }

    // Filter by category
    if (filters.category) {
      processed = processed.filter(asp => asp.category === filters.category);
    }

    // Filter by status  
    if (filters.status) {
      processed = processed.filter(asp => asp.status === filters.status);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        processed.sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        processed.sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return dateA - dateB;
        });
        break;
      case 'most_voted':
        processed.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        break;
    }

    return processed;
  };

  useEffect(() => {
    if (!db || !user) return;

    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'),
      orderBy('created_at', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Map database fields to component expected fields
        title: doc.data().title,
        description: doc.data().description,
        category: doc.data().category,
        status: doc.data().status,
        tracking_code: doc.data().tracking_code,
        created_at: doc.data().created_at
      }));
      setData(docs);
    }, (error) => {
      console.log("Waiting for permissions...", error.code);
    });
    return () => unsubscribe();
  }, [db, appId, user]);

  // Process data with search, filter, and sort
  const processedData = processAspirations(data, {
    searchQuery,
    filters,
    sortBy: filters.sortBy
  });

  // Paginate results
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="mt-10 max-w-7xl mx-auto px-4 pb-32 animate-fade-in-up [animation-delay:1000ms]">
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/40 shadow-2xl">
        {/* Table Header with Search & Filter */}
        <div className="p-8 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Inbox size={22} />
                </div>
                Aspirasi Terbaru
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 ml-13">
                {processedData.length} aspirasi ditemukan
              </p>
            </div>
          </div>

          {/* Search Bar - Import component inline for now */}
          <div className="relative w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aspirasi berdasarkan judul, kategori, atau kode tracking..."
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white shadow-sm transition-all duration-200
                         placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 
                           hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel - Simplified inline version */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <select
                value={filters.category || 'Semua Kategori'}
                onChange={(e) => handleFilterChange({ 
                  ...filters, 
                  category: e.target.value === 'Semua Kategori' ? null : e.target.value 
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white cursor-pointer text-sm font-medium"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Akademik">Akademik</option>
                <option value="Organisasi">Organisasi</option>
                <option value="Fasilitas">Fasilitas</option>
                <option value="Kebijakan">Kebijakan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex-1">
              <select
                value={filters.status || 'Semua Status'}
                onChange={(e) => handleFilterChange({ 
                  ...filters, 
                  status: e.target.value === 'Semua Status' ? null : e.target.value 
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white cursor-pointer text-sm font-medium"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="received">Diterima</option>
                <option value="verified">Diverifikasi</option>
                <option value="process">Dalam Proses</option>
                <option value="followed_up">Ditindaklanjuti</option>
                <option value="finished">Selesai</option>
                <option value="rejected">Ditolak/Spam</option>
              </select>
            </div>

            <div className="flex-1">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white cursor-pointer text-sm font-medium"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Waktu</th>
                <th className="px-8 py-5">Kategori</th>
                <th className="px-8 py-5">Topik Aspirasi</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-all cursor-default">
                  <td className="px-8 py-6 whitespace-nowrap text-slate-500 font-medium">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm group-hover:border-blue-200 transition-colors">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 max-w-sm">
                    <div className="font-black text-slate-800 truncate group-hover:text-blue-700 transition-colors">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">#{item.tracking_code}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(item.status)}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Inbox size={32} />
                      </div>
                      <p className="text-slate-400 font-bold">
                        {user ? (searchQuery || filters.category || filters.status ? "Tidak menemukan hasil yang sesuai." : "Belum ada aspirasi yang masuk.") : "Menghubungkan ke sistem..."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, processedData.length)} dari {processedData.length} aspirasi
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show first page, last page, current page, and pages around current
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all
                          ${currentPage === page 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'border border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {processedData.length > 0 && (
          <div className="bg-slate-50/50 p-4 text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🛡️ Semua Identitas Mahasiswa Disembunyikan</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Hero = ({ setView, user, db, appId }) => (
  <>
    <div className="relative pt-40 pb-20 lg:pt-56 lg:pb-40 overflow-hidden flex flex-col justify-center">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-[-10%] w-[60%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse-soft" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] bg-sky-400/10 rounded-full blur-[100px] -z-10 animate-float" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-card border-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.2em] mb-10 animate-fade-in-up">
          <ShieldCheck size={18} className="animate-pulse" />
          <span>Anonim & Terpercaya</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 animate-fade-in-up [animation-delay:200ms] leading-[0.9]">
          Suarakan Aspirasi <br className="hidden md:block" />
          <span className="text-gradient">Tanpa Takut.</span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed animate-fade-in-up [animation-delay:400ms]">
          MPA HIMAKOM hadir menjaga suaramu. Sampaikan kritik dan pengalamanmu untuk <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-4">HIMAKOM yang lebih baik</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up [animation-delay:600ms]">
          <button
            onClick={() => setView('form')}
            className="w-full sm:w-auto px-10 py-5 premium-gradient hover:brightness-110 text-white font-black rounded-3xl premium-shadow border-t border-white/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            <Megaphone size={22} className="group-hover:rotate-12 transition-transform" />
            Kirim Aspirasi
          </button>
          <button
            onClick={() => setView('tracking')}
            className="w-full sm:w-auto px-10 py-5 glass-card hover:bg-white text-slate-700 border-2 border-slate-100 font-black rounded-3xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
          >
            <Search size={22} className="group-hover:scale-110 transition-transform" />
            Lacak Status
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fade-in-up [animation-delay:800ms]">
          {[
            { label: 'Privasi', val: '100%', sub: 'E2E Anonymous' },
            { label: 'Respon', val: '< 3 Hari', sub: 'Tanggapan Resmi' },
            { label: 'Aktif', val: '24/7', sub: 'Sistem Terbuka' },
            { label: 'Total', val: '500+', sub: 'Aspirasi Masuk' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-[2.5rem] border-white/60 hover:border-blue-200 transition-all hover:-translate-y-2">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-black text-blue-800 tracking-tighter">{stat.val}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <PublicAspirationsTable db={db} appId={appId} user={user} />
  </>
);

const AspirationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    category: 'Akademik',
    title: '',
    message: '',
    image: null // base64 image string
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);

  // Get quota info on component mount
  useEffect(() => {
    const fetchQuotaInfo = async () => {
      try {
        // Get IP
        const ipResponse = await fetch('/api/get-ip');
        const ipData = await ipResponse.json();
        const userIP = ipData.ip || 'unknown';

        const hashIP = (ip) => {
          let hash = 0;
          for (let i = 0; i < ip.length; i++) {
            const char = ip.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          return Math.abs(hash).toString(16);
        };

        const ipHash = hashIP(userIP);

        // Get settings
        const settingsRef = doc(db, 'artifacts', appId, 'admin', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        const settings = settingsSnap.exists() 
          ? settingsSnap.data()
          : { cooldown_days: 7, cooldown_enabled: true, max_aspirations_per_period: 1 };

        // Get IP tracking
        const ipTrackingRef = doc(db, 'artifacts', appId, 'ip_tracking', ipHash);
        const ipTrackingSnap = await getDoc(ipTrackingRef);
        
        let remainingQuota = settings.max_aspirations_per_period || 1;
        let nextResetDate = null;

        if (ipTrackingSnap.exists() && settings.cooldown_enabled) {
          const ipData = ipTrackingSnap.data();
          const lastSubmission = ipData.last_submission_at?.toDate();
          
          if (lastSubmission) {
            const cooldownMs = settings.cooldown_days * 24 * 60 * 60 * 1000;
            const timeSinceLastSubmission = Date.now() - lastSubmission.getTime();
            
            if (timeSinceLastSubmission < cooldownMs) {
              const submissionCount = ipData.submission_count_in_period || 0;
              remainingQuota = Math.max(0, settings.max_aspirations_per_period - submissionCount);
              nextResetDate = new Date(lastSubmission.getTime() + cooldownMs);
            }
          }
        }

        setQuotaInfo({
          ip: userIP,
          remainingQuota,
          maxQuota: settings.max_aspirations_per_period,
          nextResetDate,
          cooldownEnabled: settings.cooldown_enabled,
          cooldownDays: settings.cooldown_days
        });
      } catch (error) {
        console.error('Error fetching quota info:', error);
      }
    };

    fetchQuotaInfo();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar. Maksimal 2MB.');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar.');
      e.target.value = '';
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, image: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-32 max-w-4xl mx-auto px-4">
      <div className="glass-card rounded-[3rem] shadow-2xl overflow-hidden border-white/50 animate-fade-in-up">
        {/* Form Header */}
        <div className="premium-gradient p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-[-5%] w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Megaphone size={28} />
                </div>
                Suarakan Aspirasimu
              </h2>
              <p className="font-medium text-blue-50 opacity-90 max-w-md leading-relaxed">Sampaikan aspirasi, keluhan, atau saran Anda dengan aman dan anonim melalui sistem resmi MPA HIMAKOM.</p>
            </div>
            
            {quotaInfo && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Quota Perangkat</p>
                  <p className="text-xl font-black">{quotaInfo.remainingQuota}/{quotaInfo.maxQuota}</p>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <ShieldCheck size={28} className="text-blue-100" />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 focus-within:translate-x-1 transition-transform">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Filter size={14} className="text-blue-500" /> Kategori Aspirasi
              </label>
              <div className="relative group">
                <select
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] appearance-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-black text-slate-700 shadow-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {['Akademik', 'Organisasi', 'Fasilitas', 'Kebijakan', 'Lainnya'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                  <ChevronRight className="rotate-90" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-3 focus-within:translate-x-1 transition-transform">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText size={14} className="text-blue-500" /> Judul Topik
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Perbaikan AC Lab..."
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3 focus-within:translate-x-1 transition-transform">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MessageCircle size={14} className="text-blue-500" /> Pesan Aspirasi
            </label>
            <textarea
              required
              rows={6}
              placeholder="Jelaskan aspiramu secara lengkap, objektif dan jelas agar kami dapat memprosesnya dengan baik..."
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-medium text-slate-700 shadow-sm leading-relaxed"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock size={14} className="text-blue-500" /> Lampiran Bukti (Opsional)
            </label>
            <div className="relative group">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full p-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all active:scale-[0.99]">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:shadow-md transition-all mb-4">
                    <Send size={24} className="rotate-45" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-600">Klik untuk upload lampiran foto</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Maksimal 2MB (JPG/PNG)</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden group shadow-xl">
                  <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-96" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-500 text-white p-4 rounded-2xl hover:bg-red-600 transition-all font-black"
                    >
                      Hapus Lampiran
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex gap-4 items-start shadow-inner">
            <div className="w-10 h-10 bg-blue-100/50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-blue-900 mb-1 leading-tight">Privasi Anda Prioritas Kami</p>
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                Kami tidak merekam nama, NIM, atau data pribadi lainnya. Laporan Anda tercatat secara anonim dan hanya diidentifikasi melalui kode tracking unik.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-6 premium-gradient hover:brightness-110 text-white font-black rounded-3xl premium-shadow border-t border-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 text-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                Mengirim...
              </div>
            ) : (
              <>
                <Megaphone size={24} />
                Kirim Aspirasi Sekarang
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// SUCCESS MODAL COMPONENT
const SuccessModal = ({ trackingCode, onClose }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSendEmail = async () => {
    if (!email) {
      alert('Masukkan email Anda terlebih dahulu');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email tidak valid');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, trackingCode })
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        alert('Gagal mengirim email. Coba lagi.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Gagal mengirim email. Coba lagi.');
    }
    setSending(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Kode tracking aspirasi MPA saya: ${trackingCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in relative flex flex-col max-h-[90vh]">
        {/* Close Button X */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-slate-600"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 sm:p-8 text-white text-center shrink-0">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 ring-4 ring-white/10 shrink-0">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-tight mb-2">Aspirasi Terkirim!</h2>
          <p className="text-green-50 text-sm font-medium opacity-90">Terima kasih telah menyuarakan pendapat Anda</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          {/* Tracking Code Area */}
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kode Tracking Anda</span>
            <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 transition-all group hover:border-blue-500">
              <span className="text-3xl sm:text-4xl font-black text-blue-900 tracking-widest font-mono break-all leading-none">{trackingCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full py-3 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 rounded-xl text-sm font-bold text-slate-600 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              {copied ? <><Check size={18} className="text-green-500" /> Tersalin!</> : <><Copy size={18} /> Salin Kode</>}
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Email Form */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dapatkan Bukti di Email</span>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium transition-all"
              />
              <button
                onClick={handleSendEmail}
                disabled={sending || sent}
                className={`w-full py-4 rounded-xl font-black text-white text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  sent ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-70 active:scale-95`}
              >
                {sent ? <><Check size={18} /> Berhasil Terkirim</> : sending ? 'Sedang Mengirim...' : <><Mail size={18} /> Kirim ke Email</>}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full py-4 bg-[#25D366] hover:bg-[#22c35e] text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-900/10 active:scale-95"
            >
              <MessageCircle size={22} />
              Bagikan ke WhatsApp
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl active:scale-95"
            >
              Selesai
            </button>
          </div>

          {/* Warning/Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900">
            <AlertCircle size={20} className="shrink-0 mt-0.5 opacity-60" />
            <p className="text-[11px] leading-relaxed font-medium">
              <span className="font-black">Penting:</span> Simpan kode ini baik-baik. Tanpa kode ini, Anda tidak dapat melacak status aspirasi Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- LOCAL HISTORY COMPONENT ---
const LocalHistory = ({ onSelect, currentCode }) => {
  const [history, setHistory] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('aspirationHistory') || '[]');
    setHistory(saved);
  }, []);

  const handleCopy = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const removeHistoryItem = (e, code) => {
    e.stopPropagation();
    const updated = history.filter(item => item.code !== code);
    setHistory(updated);
    localStorage.setItem('aspirationHistory', JSON.stringify(updated));
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-12 animate-fade-in [animation-delay:200ms]">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Clock size={14} className="text-blue-500" /> Riwayat Pencarian Lokal
        </h3>
        <button 
          onClick={() => { if(confirm('Hapus semua riwayat di perangkat ini?')) { localStorage.removeItem('aspirationHistory'); setHistory([]); } }}
          className="text-[10px] font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
        >
          Bersihkan Semua
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.slice(0, 4).map((item) => (
          <div 
            key={item.code}
            onClick={() => onSelect(item.code)}
            className={`group p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between ${
              currentCode === item.code 
                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'
            }`}
          >
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`font-mono font-black text-sm tracking-widest ${currentCode === item.code ? 'text-white' : 'text-blue-900'}`}>
                  {item.code}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider ${currentCode === item.code ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                  {item.category}
                </span>
              </div>
              <p className={`text-[11px] font-bold truncate ${currentCode === item.code ? 'text-blue-100' : 'text-slate-500'}`}>
                {item.title}
              </p>
            </div>
            <div className="flex items-center gap-1.5 translate-x-2 group-hover:translate-x-0 transition-transform">
              <button
                onClick={(e) => handleCopy(e, item.code)}
                className={`p-2.5 rounded-xl transition-all ${
                  currentCode === item.code 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-blue-50 text-blue-600'
                }`}
                title="Salin Kode"
              >
                {copiedCode === item.code ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <button
                onClick={(e) => removeHistoryItem(e, item.code)}
                className={`p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${
                  currentCode === item.code 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-red-50 text-red-500'
                }`}
                title="Hapus"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackingView = ({ db, appId, user }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [allAspirations, setAllAspirations] = useState([]);

  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllAspirations(docs);
    }, (error) => {
      console.log("Waiting for tracking permissions...", error.code);
    });
    return () => unsubscribe();
  }, [db, appId, user]);

  const handleTrack = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const found = allAspirations.find(a => a.tracking_code === code.trim().toUpperCase());
      if (found) {
        setResult(found);
      } else {
        setError('Kode aspirasi tidak ditemukan. Mohon periksa kembali.');
        setResult(null);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="pt-40 pb-32 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-[2rem] text-blue-700 mb-8 shadow-inner ring-8 ring-blue-50/50">
            <Search size={32} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">Lacak Status</h2>
          <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto leading-relaxed">Lihat perkembangan dan transparansi tindak lanjut dari setiap aspirasi yang Anda kirimkan.</p>
        </div>

        {/* Input Card */}
        <div className="glass-card rounded-[3rem] p-3 mb-12 shadow-2xl border-white/60 animate-fade-in-up [animation-delay:100ms]">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="CONTOH: MPA-X92F"
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-mono font-black uppercase text-xl text-center md:text-left text-blue-900 transition-all shadow-inner tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:block opacity-20">
                <Clock size={24} />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-12 py-5 premium-gradient text-white font-black rounded-[2rem] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search size={22} />
                  Cek Sekarang
                </>
              )}
            </button>
          </form>
        </div>

        {/* Local History Section */}
        <LocalHistory onSelect={(c) => { setCode(c); }} currentCode={code} />

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] border-2 border-red-100 flex items-center gap-4 animate-shake shadow-lg mb-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
              <AlertCircle size={24} />
            </div>
            <span className="font-black text-sm uppercase tracking-wider">{error}</span>
          </div>
        )}

        {result && (
          <div className="glass-card rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-white/60 overflow-hidden animate-fade-in-up [animation-delay:300ms]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm ${getStatusColor(result.status)}`}>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                    {getStatusLabel(result.status)}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{result.category}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-[1.1] tracking-tight">{result.title}</h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-2">
                  <Clock size={14} className="text-blue-500" /> Dikirim pada {formatDate(result.created_at)}
                </div>
              </div>
              <div className="text-left md:text-right bg-white p-5 rounded-3xl border border-slate-100 shadow-lg ring-1 ring-slate-50 ring-offset-4">
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Kode Tracking</div>
                <div className="font-mono font-black text-3xl text-blue-800 tracking-tighter">{result.tracking_code}</div>
              </div>
            </div>

            <div className="p-10 md:p-14 space-y-16">
              {result.image && (
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-1 h-3 premium-gradient rounded-full"></div>
                    Lampiran Foto Bukti
                  </h4>
                  <div className="group relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white cursor-zoom-in transition-transform hover:scale-[1.02]" onClick={() => window.open(result.image, '_blank')}>
                    <img src={result.image} alt="Lampiran" className="w-full object-cover max-h-[500px]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs uppercase tracking-widest">
                      Klik untuk memperbesar
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-1 h-3 premium-gradient rounded-full"></div>
                  Rincian Aspirasi
                </h4>
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 text-slate-700 font-medium text-lg leading-relaxed shadow-inner">
                  {result.message}
                </div>
              </div>

              {/* Reply Section */}
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1.5 premium-gradient rounded-full opacity-30"></div>
                {result.admin_reply ? (
                  <div className="pl-8 space-y-6">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-10 h-10 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Megaphone size={18} />
                      </div>
                      Tanggapan Resmi MPA
                    </h4>
                    <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white font-bold leading-relaxed shadow-2xl shadow-blue-600/20 relative group">
                      <div className="absolute -top-3 -left-3 w-10 h-10 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                      {result.admin_reply}
                    </div>
                  </div>
                ) : (
                  <div className="pl-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                        <Clock size={18} />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menunggu Tanggapan</h4>
                    </div>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center">
                      <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed italic">Tim MPA sedang mengalisis aspirasi ini. Mohon periksa kembali secara berkala.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminLogin = ({ auth, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError('Login gagal. Periksa email dan password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg rotate-3 hover:rotate-0 transition-all duration-500">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Admin Portal</h2>
          <p className="text-slate-500 text-sm mt-2">Area terbatas untuk pengurus MPA.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Email Institusi</label>
            <input
              type="email"
              required
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 transition-all"
              placeholder="admin@himakom..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Password</label>
            <input
              type="password"
              required
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98]">
            Masuk Dashboard
          </button>
        </form>
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">Lupa akses? Hubungi Koordinator MPA.</p>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = ({ db, appId, user }) => {
  const [settings, setSettings] = useState({
    cooldown_days: 7,
    cooldown_enabled: true,
    max_aspirations_per_period: 1,
    allowed_categories: ['Akademik', 'Organisasi', 'Fasilitas', 'Kebijakan', 'Lainnya']
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const allCategories = ['Akademik', 'Organisasi', 'Fasilitas', 'Kebijakan', 'Lainnya'];

  useEffect(() => {
    if (!db || !user) return;
    const settingsRef = doc(db, 'artifacts', appId, 'admin', 'settings');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings({
          cooldown_days: data.cooldown_days || 7,
          cooldown_enabled: data.cooldown_enabled !== undefined ? data.cooldown_enabled : true,
          max_aspirations_per_period: data.max_aspirations_per_period || 1,
          allowed_categories: data.allowed_categories || allCategories
        });
      }
    });
    return () => unsubscribe();
  }, [db, appId, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'admin', 'settings');
      await setDoc(settingsRef, {
        ...settings,
        updated_at: serverTimestamp(),
        updated_by: user.email || user.uid
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan');
    }
    setLoading(false);
  };

  const toggleCategory = (category) => {
    const currentCategories = settings.allowed_categories || [];
    if (currentCategories.includes(category)) {
      // Remove category
      setSettings({
        ...settings,
        allowed_categories: currentCategories.filter(c => c !== category)
      });
    } else {
      // Add category
      setSettings({
        ...settings,
        allowed_categories: [...currentCategories, category]
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <Settings size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Pengaturan Sistem</h3>
      </div>

      <div className="space-y-6">
        {/* Cooldown Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex-1">
            <label className="text-sm font-bold text-slate-700 mb-1 block">Status Cooldown</label>
            <p className="text-xs text-slate-500">Aktifkan pembatasan waktu pengiriman aspirasi</p>
          </div>
          <div 
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.cooldown_enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            onClick={() => setSettings({ ...settings, cooldown_enabled: !settings.cooldown_enabled })}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${settings.cooldown_enabled ? 'translate-x-6' : ''}`} />
          </div>
        </div>

        {settings.cooldown_enabled && (
          <>
            {/* Cooldown Days */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
              <label className="text-sm font-bold text-slate-700 mb-3 block">Durasi Cooldown (hari)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.cooldown_days}
                  onChange={(e) => setSettings({ ...settings, cooldown_days: parseInt(e.target.value) || 1 })}
                  className="w-24 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-bold text-lg"
                />
                <span className="text-sm text-slate-600">hari (1 minggu = 7 hari)</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Setiap IP hanya bisa mengirim aspirasi setiap {settings.cooldown_days} hari
              </p>
            </div>

            {/* Max Aspirations */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
              <label className="text-sm font-bold text-slate-700 mb-3 block">Maksimal Aspirasi per Periode</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.max_aspirations_per_period}
                  onChange={(e) => setSettings({ ...settings, max_aspirations_per_period: parseInt(e.target.value) || 1 })}
                  className="w-24 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-bold text-lg"
                />
                <span className="text-sm text-slate-600">aspirasi per {settings.cooldown_days} hari</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Jumlah maksimal aspirasi yang bisa dikirim dalam satu periode cooldown
              </p>
            </div>

            {/* Category Restrictions */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
              <label className="text-sm font-bold text-slate-700 mb-3 block">Kategori yang Diizinkan</label>
              <div className="space-y-2">
                {allCategories.map(category => {
                  const isAllowed = (settings.allowed_categories || []).includes(category);
                  return (
                    <div
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isAllowed
                          ? 'bg-blue-50 border-blue-500 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category}</span>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isAllowed ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                        }`}>
                          {isAllowed && <Check size={14} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                {settings.allowed_categories?.length === allCategories.length
                  ? 'Semua kategori diizinkan'
                  : `${settings.allowed_categories?.length || 0} dari ${allCategories.length} kategori diizinkan`}
              </p>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-800 text-white hover:bg-blue-900 shadow-lg shadow-blue-900/10'
            } disabled:opacity-70`}
          >
            {saved ? (
              <>
                <Check size={20} />
                Tersimpan!
              </>
            ) : loading ? (
              'Menyimpan...'
            ) : (
              <>
                <Send size={20} />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ db, appId, user }) => {
  const [aspirations, setAspirations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('aspirations'); // 'aspirations' or 'settings'

  useEffect(() => {
    if (!db || !user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'),
      orderBy('created_at', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAspirations(docs);
    });
    return () => unsubscribe();
  }, [db, appId, user]);

  const filteredItems = filter === 'all'
    ? aspirations
    : aspirations.filter(a => a.status === filter);

  const handleUpdateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aspirations', id), {
      status: newStatus
    });
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  const handleSendReply = async () => {
    if (!selectedItem || !replyText) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aspirations', selectedItem.id), {
      admin_reply: replyText,
      status: 'followed_up'
    });
    setSelectedItem(prev => ({ ...prev, admin_reply: replyText, status: 'followed_up' }));
    setReplyText('');
    alert("Tanggapan berhasil dikirim!");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus aspirasi ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aspirations', id));
        setSelectedItem(null);
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Gagal menghapus data.");
      }
    }
  }

  const handleSelect = (item) => {
    setSelectedItem(item);
    setReplyText(item.admin_reply || '');
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen pb-10">
      <div className="max-w-[1600px] mx-auto flex flex-col">

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('aspirations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'aspirations'
                ? 'bg-blue-800 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            Aspirasi
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{aspirations.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-800 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings size={20} />
            Pengaturan
          </button>
        </div>

        {/* Settings View */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <AdminSettings db={db} appId={appId} user={user} />
          </div>
        )}

        {/* Aspirations View */}
        {activeTab === 'aspirations' && (
          <div className="h-[calc(100vh-12rem)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><LayoutDashboard size={24} /></div>
                Dashboard Aspirasi
                <span className="text-sm font-normal text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{aspirations.length} Total</span>
              </h2>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                {['all', 'received', 'process', 'finished'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm ${filter === f ? 'bg-blue-800 text-white ring-2 ring-blue-300 ring-offset-1' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {f === 'all' ? 'Semua' : getStatusLabel(f)}
                  </button>
                ))}
              </div>
            </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden h-full">

          <div className={`lg:w-1/3 w-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${selectedItem ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Daftar Masuk</span>
              <Filter size={14} className="text-slate-400" />
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative ${selectedItem?.id === item.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.tracking_code}</span>
                  </div>
                  <h3 className={`font-bold text-sm line-clamp-2 mb-1 group-hover:text-blue-700 ${selectedItem?.id === item.id ? 'text-blue-800' : 'text-slate-800'}`}>{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100/50">
                    <span className="bg-slate-100 px-2 py-1 rounded flex items-center gap-1"><FileText size={10} /> {item.category}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Tidak ada aspirasi ditemukan</p>
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col ${selectedItem ? 'flex' : 'hidden lg:flex'}`}>
            {selectedItem ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4 bg-slate-50/30">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="lg:hidden mb-4 text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-blue-600"
                      >
                        <ChevronRight className="rotate-180" size={14} /> Kembali
                      </button>
                      <button
                        onClick={() => handleDelete(selectedItem.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Hapus Aspirasi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{selectedItem.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><User size={14} /> {selectedItem.isAnonymous ? 'Anonim' : selectedItem.name}</span>
                      {selectedItem.generation && <span className="bg-slate-100 px-2 py-1 rounded">Angkatan {selectedItem.generation}</span>}
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium text-xs">{selectedItem.category}</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <select
                      value={selectedItem.status}
                      onChange={(e) => handleUpdateStatus(selectedItem.id, e.target.value)}
                      className="w-full sm:w-auto text-xs font-bold p-2.5 rounded-lg bg-slate-50 border-none outline-none cursor-pointer hover:bg-slate-100 transition-colors text-slate-700"
                    >
                      <option value="received">Diterima</option>
                      <option value="verified">Diverifikasi</option>
                      <option value="process">Dalam Proses</option>
                      <option value="followed_up">Ditindaklanjuti</option>
                      <option value="finished">Selesai</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Isi Aspirasi</h4>
                    <p className="text-slate-800 text-base md:text-lg whitespace-pre-line leading-relaxed">{selectedItem.message}</p>
                  </div>

                  {selectedItem.image && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lampiran Foto</h4>
                      <img
                        src={selectedItem.image}
                        alt="Lampiran aspirasi"
                        className="w-full rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.open(selectedItem.image, '_blank')}
                      />
                      <p className="text-xs text-slate-500 mt-2 text-center">Klik gambar untuk melihat ukuran penuh</p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-blue-100 rounded text-blue-700"><Megaphone size={16} /></div>
                      Tanggapan Resmi Admin
                    </h4>
                    <div className="relative">
                      <textarea
                        className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[150px] shadow-inner bg-slate-50 focus:bg-white"
                        placeholder="Tulis tanggapan resmi di sini... (Akan terlihat oleh pengirim)"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleSendReply}
                          className="bg-blue-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95"
                        >
                          <Send size={16} /> Kirim Tanggapan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 p-8">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <LayoutDashboard size={40} className="opacity-30" />
                </div>
                <h3 className="text-lg font-bold text-slate-600">Belum ada aspirasi dipilih</h3>
                <p className="text-sm text-center max-w-xs mt-2">Pilih salah satu aspirasi dari daftar di sebelah kiri untuk melihat detail dan memberikan tanggapan.</p>
              </div>
            )}
          </div>

          </div>

        </div>
        )}

      </div>
    </div>
  );
}

const Footer = () => (
  <footer className="relative bg-slate-900 pt-32 pb-16 overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-sky-500/10 rounded-full blur-[100px]"></div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
        {/* Brand Section */}
        <div className="md:col-span-5 space-y-8">
          <div className="flex items-center gap-4 group">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg transform group-hover:-rotate-6 transition-transform">
                <img src="/Logo_MPA.png" alt="MPA" className="w-8 h-8 object-contain" />
              </div>
              <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                <img src="/Logo_HIMAKOM.png" alt="HIM" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <div>
              <h3 className="text-white text-xl font-black tracking-tighter">MPA HIMAKOM</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Sistem Aspirasi Terpadu</p>
            </div>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
            Menjadi jembatan aspirasi mahasiswa yang aman, transparan, dan terpercaya demi kemajuan HIMAKOM Politeknik Negeri Bandung.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/himakompolban" target="_blank" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-xl group">
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-green-600 hover:border-green-500 transition-all shadow-xl group">
              <Phone size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="mailto:mpahimakom@gmail.com" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all shadow-xl group">
              <Mail size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-8">
          <h4 className="text-white text-xs font-black uppercase tracking-[0.3em]">Navigasi</h4>
          <ul className="space-y-5">
            {[
              { label: 'Beranda Utama', icon: <LayoutDashboard size={14} /> },
              { label: 'Formulir Aspirasi', icon: <Megaphone size={14} /> },
              { label: 'Tracking Status', icon: <Search size={14} /> },
              { label: 'Portal Pengurus', icon: <Lock size={14} /> }
            ].map((link, i) => (
              <li key={i}>
                <a href="#" className="text-slate-400 hover:text-blue-400 font-bold text-sm transition-colors flex items-center gap-3 group">
                  <span className="text-blue-500/50 group-hover:text-blue-500 transition-colors">{link.icon}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="md:col-span-4 space-y-8">
          <h4 className="text-white text-xs font-black uppercase tracking-[0.3em]">Dukungan Sistem</h4>
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Ada kendala dalam penggunaan sistem? Hubungi pengembang kami.
            </p>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
              <MessageCircle size={16} /> Bantuan Teknis
            </a>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} MPA HIMAKOM POLITEKNIK NEGERI BANDUNG
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest">Privacy Policy</a>
          <a href="#" className="text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function Page() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastTrackingCode, setLastTrackingCode] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Simple logic for admin detection - check if email exists
        // (In production, use Custom Claims or dedicated admins collection)
        setIsAdmin(!!u.email);
        if (!!u.email) setView('admin');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Sign in anonymously for public users to read aspirations
    signInAnonymously(auth).catch(err => {
      console.error("❌ Anonymous Authentication Error:", err);
      console.error("📋 Error Code:", err.code);
      console.error("📝 Error Message:", err.message);
      
      // Provide helpful guidance based on error type
      if (err.code === 'auth/operation-not-allowed') {
        console.error("\n🔧 FIX REQUIRED:");
        console.error("Anonymous Authentication is not enabled in Firebase Console.");
        console.error("\nSteps to fix:");
        console.error("1. Go to https://console.firebase.google.com/");
        console.error("2. Select your project");
        console.error("3. Go to Authentication → Sign-in method");
        console.error("4. Enable 'Anonymous' provider");
        console.error("5. Refresh this page\n");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setUser(null);
    setView('landing');
  };

  const handleAspirationSubmit = async (data) => {
    if (!user) return;

    try {
      // Step 1: Get user's IP address
      const ipResponse = await fetch('/api/get-ip');
      const ipData = await ipResponse.json();
      const userIP = ipData.ip || 'unknown';

      // Hash IP for storage
      const hashIP = (ip) => {
        let hash = 0;
        for (let i = 0; i < ip.length; i++) {
          const char = ip.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
      };

      const ipHash = hashIP(userIP);

      // Step 2: Check cooldown (CLIENT-SIDE)
      try {
        // Get admin settings
        const settingsRef = doc(db, 'artifacts', appId, 'admin', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        
        const settings = settingsSnap.exists() 
          ? settingsSnap.data() 
          : { 
              cooldown_days: 7, 
              cooldown_enabled: true,
              max_aspirations_per_period: 1,
              allowed_categories: ['Akademik', 'Organisasi', 'Fasilitas', 'Kebijakan', 'Lainnya']
            };

        // If cooldown is enabled, check restrictions
        if (settings.cooldown_enabled) {
          // Check category restriction
          if (settings.allowed_categories && !settings.allowed_categories.includes(data.category)) {
            alert(`❌ Kategori "${data.category}" tidak diizinkan saat ini.`);
            return;
          }

          // Check IP tracking
          const ipTrackingRef = doc(db, 'artifacts', appId, 'ip_tracking', ipHash);
          const ipTrackingSnap = await getDoc(ipTrackingRef);

          if (ipTrackingSnap.exists()) {
            const ipData = ipTrackingSnap.data();
            
            // Skip check if whitelisted
            if (!ipData.is_whitelisted) {
              const lastSubmission = ipData.last_submission_at?.toDate();
              
              if (lastSubmission) {
                const cooldownMs = settings.cooldown_days * 24 * 60 * 60 * 1000;
                const timeSinceLastSubmission = Date.now() - lastSubmission.getTime();
                
                // Check if still in cooldown period
                if (timeSinceLastSubmission < cooldownMs) {
                  const submissionCount = ipData.submission_count_in_period || 0;
                  const maxSubmissions = settings.max_aspirations_per_period || 1;
                  
                  if (submissionCount >= maxSubmissions) {
                    const timeRemaining = cooldownMs - timeSinceLastSubmission;
                    const days = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
                    const hours = Math.ceil(timeRemaining / (60 * 60 * 1000));
                    const timeUnit = days > 0 ? `${days} hari` : `${hours} jam`;
                    
                    alert(
                      `⏰ Batas maksimal tercapai!\n\n` +
                      `Anda sudah mengirim ${submissionCount} dari ${maxSubmissions} aspirasi yang diizinkan.\n\n` +
                      `Mohon tunggu ${timeUnit} lagi untuk mengirim aspirasi baru.`
                    );
                    return;
                  }
                }
              }
            }
          }
        }
      } catch (cooldownError) {
        console.error('Error checking cooldown:', cooldownError);
        // If cooldown check fails, continue with warning
        const confirmed = confirm(
          '⚠️ Tidak dapat memeriksa cooldown.\n\n' +
          'Lanjutkan submit aspirasi?'
        );
        if (!confirmed) return;
      }

      // Step 3: Generate tracking code and prepare submission
      const code = generateTrackingCode();

      const payload = {
        ...data,
        tracking_code: code,
        status: 'received',
        admin_reply: null,
        created_at: serverTimestamp(),
        user_uid: user.uid,
        ip_address: ipHash,
        isAnonymous: true
      };

      // Step 4: Submit aspiration
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'), payload);

      // Step 5: Update IP tracking
      const ipTrackingRef = doc(db, 'artifacts', appId, 'ip_tracking', ipHash);
      const ipTrackingSnap = await getDoc(ipTrackingRef);
      
      // Get current period info
      const now = new Date();
      let submissionCountInPeriod = 1;
      let periodStartedAt = now;
      
      if (ipTrackingSnap.exists()) {
        const existingData = ipTrackingSnap.data();
        const lastSubmission = existingData.last_submission_at?.toDate();
        
        // Check if still in same period
        if (lastSubmission) {
          const settingsSnap = await getDoc(doc(db, 'artifacts', appId, 'admin', 'settings'));
          const settings = settingsSnap.exists() ? settingsSnap.data() : { cooldown_days: 7 };
          const cooldownMs = settings.cooldown_days * 24 * 60 * 60 * 1000;
          const timeSinceLastSubmission = now.getTime() - lastSubmission.getTime();
          
          if (timeSinceLastSubmission < cooldownMs) {
            // Still in same period, increment count
            submissionCountInPeriod = (existingData.submission_count_in_period || 0) + 1;
            periodStartedAt = lastSubmission;
          }
        }
      }
      
      const totalCount = ipTrackingSnap.exists() ? (ipTrackingSnap.data().submission_count || 0) + 1 : 1;
      
      await setDoc(ipTrackingRef, {
        ip_address: ipHash,
        ip_raw: userIP,
        last_submission_at: serverTimestamp(),
        last_tracking_code: code,
        submission_count: totalCount,
        submission_count_in_period: submissionCountInPeriod,
        period_started_at: periodStartedAt
      });

      setLastTrackingCode(code);

      // Save to local history
      const history = JSON.parse(localStorage.getItem('aspirationHistory') || '[]');
      const newHistoryItem = {
        code,
        title: data.title,
        category: data.category,
        date: new Date().toISOString()
      };
      // Keep only the last 10 items
      const updatedHistory = [newHistoryItem, ...history.filter(h => h.code !== code)].slice(0, 10);
      localStorage.setItem('aspirationHistory', JSON.stringify(updatedHistory));

    } catch (e) {
      console.error("Error submitting:", e);
      alert("Gagal mengirim aspirasi. Silakan coba lagi.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-blue-100 flex flex-col pt-20">
      <ParticleBackground />
      <Header currentView={view} setView={setView} isAdmin={isAdmin} handleLogout={handleLogout} />
      
      <main className="flex-1 relative z-10">
        {view === 'landing' && <Hero setView={setView} user={user} db={db} appId={appId} />}
        {view === 'form' && <AspirationForm onSubmit={handleAspirationSubmit} />}
        {view === 'tracking' && <TrackingView db={db} appId={appId} user={user} />}
        {view === 'login' && <AdminLogin auth={auth} onLoginSuccess={() => setView('admin')} />}
        {view === 'admin' && isAdmin && <AdminDashboard db={db} appId={appId} user={user} />}
      </main>

      <Footer />

      {lastTrackingCode && (
        <SuccessModal
          trackingCode={lastTrackingCode}
          onClose={() => { setLastTrackingCode(null); setView('landing'); }}
        />
      )}
    </div>
  );
}