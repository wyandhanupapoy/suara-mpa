"use client"; // WAJIB ADA untuk Next.js App Router jika pakai useState/useEffect

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
  Filter
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
  serverTimestamp,
  orderBy
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

// Initialize Firebase only once
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
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse tracking
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Create particles
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }

      draw() {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; // Slate-400 with opacity
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * this.density * 0.6;
                const directionY = forceDirectionY * force * this.density * 0.6;
                
                // Gentle push away
                // this.x -= directionX;
                // this.y -= directionY;
            }
        }

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

                if (distance < (canvas.width/7) * (canvas.height/7)) {
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

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => !isAdmin && setView('landing')} // Disable click if admin? Or let it stay
          >
            <div className="flex space-x-2 items-center">
              <img 
                src="/Logo_MPA.png" 
                alt="MPA" 
                className="w-10 h-10 object-contain drop-shadow-md bg-white rounded-full"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/1e3a8a/FFF?text=MPA"; }} 
              />
              {/* Hide other logos on mobile to save space, show on larger screens */}
              <img 
                src="/Logo_HIMAKOM.png" 
                alt="HIMAKOM" 
                className="hidden lg:block w-10 h-10 object-contain drop-shadow-md bg-white rounded-full opacity-90 group-hover:opacity-100 transition-all"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/0284c7/FFF?text=HIMA"; }}
              />
              <img 
                src="/logo-polban.png" 
                alt="POLBAN" 
                className="hidden lg:block w-10 h-10 object-contain drop-shadow-md bg-white rounded-full opacity-90 group-hover:opacity-100 transition-all"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/f97316/FFF?text=POL"; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-lg leading-tight">SUARA MPA</span>
              <span className="text-xs text-slate-500 font-medium tracking-wider">HIMAKOM POLBAN</span>
            </div>
          </div>

          {/* Desktop Nav - CONDITIONAL RENDERING */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
                // --- ADMIN VIEW ---
                <div className="flex items-center gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-blue-900">Admin Mode</span>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Keluar
                    </button>
                </div>
            ) : (
                // --- PUBLIC VIEW ---
                <>
                    <button onClick={() => setView('landing')} className={`text-sm font-medium transition-colors ${currentView === 'landing' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Beranda</button>
                    <button onClick={() => setView('form')} className={`text-sm font-medium transition-colors ${currentView === 'form' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Kirim Aspirasi</button>
                    <button onClick={() => setView('tracking')} className={`text-sm font-medium transition-colors ${currentView === 'tracking' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Cek Status</button>
                    <button onClick={() => setView('login')} className="text-sm font-medium text-slate-400 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                        <Lock size={14} /> Admin
                    </button>
                </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-xl absolute w-full animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            {isAdmin ? (
                 // --- ADMIN MOBILE MENU ---
                 <>
                    <div className="p-3 bg-blue-50 rounded-lg mb-2 flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="font-bold text-blue-900">Dashboard Admin</span>
                    </div>
                    <button 
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                        className="p-3 text-left font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                        <LogOut size={18}/> Keluar
                    </button>
                 </>
            ) : (
                // --- PUBLIC MOBILE MENU ---
                <>
                    <button onClick={() => { setView('landing'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-3">
                        <LayoutDashboard size={18} className="opacity-50"/> Beranda
                    </button>
                    <button onClick={() => { setView('form'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-3">
                        <Megaphone size={18} className="opacity-50"/> Kirim Aspirasi
                    </button>
                    <button onClick={() => { setView('tracking'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-3">
                        <Search size={18} className="opacity-50"/> Cek Status
                    </button>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <button onClick={() => { setView('login'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-500 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                        <Lock size={18} className="opacity-50"/> Login Admin
                    </button>
                </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const Hero = ({ setView }) => (
  <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
    {/* Background Gradients */}
    <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 skew-x-12 blur-3xl -z-10" />
    <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-sky-400/5 -skew-x-12 blur-3xl -z-10" />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-blue-100 text-blue-800 text-sm font-semibold mb-8 animate-fade-in-up shadow-sm">
        <ShieldCheck size={16} />
        <span>Anonim & Terpercaya</span>
      </div>
      
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 drop-shadow-sm">
        Suarakan Aspirasi <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">Tanpa Takut.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
        MPA HIMAKOM hadir menjaga suaramu. Sampaikan kritik, saran, dan aspirasi untuk kemajuan bersama. Identitasmu aman bersama kami.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={() => setView('form')}
          className="w-full sm:w-auto px-8 py-4 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2"
        >
          <Megaphone size={20} />
          Kirim Aspirasi Sekarang
        </button>
        <button 
          onClick={() => setView('tracking')}
          className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 border border-slate-200 font-bold rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <Search size={20} />
          Lacak Aspirasi
        </button>
      </div>

      {/* Stats Mockup - Responsive Grid */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 hover:bg-white transition-all">
          <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">100%</div>
          <div className="text-sm text-slate-600 font-medium">Privasi Terjaga</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 hover:bg-white transition-all">
          <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">24/7</div>
          <div className="text-sm text-slate-600 font-medium">Waktu Penerimaan</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 hover:bg-white transition-all">
          <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">Respon</div>
          <div className="text-sm text-slate-600 font-medium">Tanggapan Resmi MPA</div>
        </div>
      </div>
    </div>
  </div>
);

const AspirationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    category: 'Akademik',
    title: '',
    message: '',
    name: '',
    generation: '',
    isAnonymous: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-5 -mb-5 blur-xl"></div>
          
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 relative z-10">
            <FileText className="text-blue-200"/> Form Aspirasi
          </h2>
          <p className="opacity-90 relative z-10 text-blue-100">Silakan isi formulir di bawah ini. Gunakan bahasa yang sopan dan jelas.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Kategori Aspirasi</label>
            <div className="relative">
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Organisasi">Organisasi</option>
                  <option value="Fasilitas">Fasilitas</option>
                  <option value="Kebijakan">Kebijakan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronRight className="rotate-90" size={18}/>
                </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Judul Aspirasi</label>
            <input 
              type="text"
              required
              placeholder="Contoh: Kendala AC di Ruang Lab 1"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium placeholder:font-normal"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Isi Aspirasi</label>
            <textarea 
              required
              rows={5}
              placeholder="Jelaskan aspirasimu secara detail..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          {/* Identity Toggle */}
          <div 
            className={`flex items-center space-x-4 p-5 rounded-2xl border transition-all cursor-pointer ${formData.isAnonymous ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
            onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
          >
            <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.isAnonymous ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${formData.isAnonymous ? 'translate-x-6' : ''}`} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                {formData.isAnonymous ? 'Mode Anonim Aktif' : 'Mode Publik Aktif'}
                </span>
                <span className="text-xs text-slate-500">
                {formData.isAnonymous ? 'Identitas Anda akan disembunyikan sepenuhnya.' : 'Nama Anda akan terlihat oleh admin.'}
                </span>
            </div>
          </div>

          {/* Optional Identity Fields */}
          {!formData.isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nama Lengkap</label>
                <input 
                  type="text"
                  placeholder="Nama Anda"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Angkatan</label>
                <input 
                  type="text"
                  placeholder="20xx"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.generation}
                  onChange={(e) => setFormData({...formData, generation: e.target.value})}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Mengirim...' : <><Send size={18} /> Kirim Aspirasi</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const SuccessModal = ({ trackingCode, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div className="bg-white rounded-[2rem] max-w-md w-full p-8 text-center shadow-2xl animate-scale-in border border-white/20">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
        <CheckCircle size={48} />
      </div>
      <h3 className="text-3xl font-bold text-slate-900 mb-2">Aspirasi Terkirim!</h3>
      <p className="text-slate-600 mb-8 leading-relaxed">Terima kasih telah bersuara. Aspirasimu telah kami terima dan akan segera diproses.</p>
      
      <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 border-dashed relative group cursor-pointer" onClick={() => {navigator.clipboard.writeText(trackingCode); alert("Kode disalin!")}}>
        <div className="absolute top-2 right-2 text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk salin</div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Kode Tracking Anda</p>
        <div className="text-4xl font-mono font-bold text-blue-800 tracking-wider break-all">{trackingCode}</div>
      </div>

      <button onClick={onClose} className="w-full py-4 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20">
        Kembali ke Beranda
      </button>
    </div>
  </div>
);

const TrackingView = ({ db, appId }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [allAspirations, setAllAspirations] = useState([]);

  useEffect(() => {
     if (!db) return;
     const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'));
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const docs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
       setAllAspirations(docs);
     });
     return () => unsubscribe();
  }, [db, appId]);

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
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Lacak Status Aspirasi</h2>
          <p className="text-slate-600 text-lg">Masukkan kode unik yang Anda dapatkan untuk melihat progress tindak lanjut.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white/50 mb-10">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
            <input 
                type="text" 
                placeholder="Masukkan Kode (cth: MPA-X92F)" 
                className="flex-1 p-4 rounded-xl border border-slate-200 shadow-inner focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase text-lg text-center sm:text-left bg-slate-50/50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button type="submit" disabled={loading} className="bg-blue-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-900 transition-colors disabled:opacity-70 flex justify-center items-center shadow-lg shadow-blue-900/20">
                {loading ? 'Searching...' : <Search />}
            </button>
            </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-shake shadow-sm">
            <AlertCircle size={24} className="shrink-0" /> <span className="font-medium">{error}</span>
          </div>
        )}

        {result && (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(result.status)}`}>
                    {result.status === 'finished' && <CheckCircle size={12}/>}
                    {getStatusLabel(result.status)}
                    </span>
                    <span className="text-xs text-slate-400">• {result.category}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">{result.title}</h3>
                <div className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                  <Clock size={14} /> Dikirim pada {formatDate(result.created_at)}
                </div>
              </div>
              <div className="text-left md:text-right bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kode Tracking</div>
                <div className="font-mono font-bold text-xl text-blue-700">{result.tracking_code}</div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Pesan Aspirasi</h4>
                <p className="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.message}
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
                {result.admin_reply ? (
                    <div className="pl-6">
                        <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                                <Megaphone size={16} /> 
                            </div>
                            Tanggapan Resmi MPA
                        </h4>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-slate-800 leading-relaxed shadow-sm">
                            {result.admin_reply}
                        </div>
                    </div>
                ) : (
                    <div className="pl-6">
                         <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2 opacity-70">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                <Clock size={16} /> 
                            </div>
                            Menunggu Tanggapan
                        </h4>
                        <div className="text-slate-400 text-sm italic bg-slate-50 border border-slate-100 border-dashed rounded-xl p-6">
                            Aspirasi Anda sedang ditinjau oleh tim MPA. Mohon menunggu update selanjutnya.
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
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
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

const AdminDashboard = ({ db, appId }) => {
  const [aspirations, setAspirations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For responsive layout

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'),
      orderBy('created_at', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setAspirations(docs);
    });
    return () => unsubscribe();
  }, [db, appId]);

  const filteredItems = filter === 'all' 
    ? aspirations 
    : aspirations.filter(a => a.status === filter);

  const handleUpdateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aspirations', id), {
      status: newStatus
    });
    if(selectedItem && selectedItem.id === id) {
        setSelectedItem({...selectedItem, status: newStatus});
    }
  };

  const handleSendReply = async () => {
    if (!selectedItem || !replyText) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aspirations', selectedItem.id), {
      admin_reply: replyText,
      status: 'followed_up'
    });
    // Update local state immediately for better UX
    setSelectedItem(prev => ({...prev, admin_reply: replyText, status: 'followed_up'}));
    setReplyText('');
    alert("Tanggapan berhasil dikirim!");
  };

  // Close sidebar on selection if on mobile
  const handleSelect = (item) => {
    setSelectedItem(item);
    setReplyText(item.admin_reply || '');
    // Scroll to top of detail view on mobile
    if (window.innerWidth < 1024) {
         window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen pb-10">
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><LayoutDashboard size={24}/></div>
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

        {/* Dashboard Content - Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden h-full">
          
          {/* List Section (Sidebar) */}
          <div className={`lg:w-1/3 w-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${selectedItem ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Daftar Masuk</span>
                <Filter size={14} className="text-slate-400"/>
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
                     <span className="bg-slate-100 px-2 py-1 rounded flex items-center gap-1"><FileText size={10}/> {item.category}</span>
                     <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <Inbox size={48} className="mx-auto mb-4 opacity-20"/>
                  <p className="text-sm">Tidak ada aspirasi ditemukan</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Section */}
          <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col ${selectedItem ? 'flex' : 'hidden lg:flex'}`}>
            {selectedItem ? (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4 bg-slate-50/30">
                  <div className="flex-1">
                    <button 
                        onClick={() => setSelectedItem(null)} 
                        className="lg:hidden mb-4 text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-blue-600"
                    >
                        <ChevronRight className="rotate-180" size={14}/> Kembali ke Daftar
                    </button>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{selectedItem.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><User size={14}/> {selectedItem.isAnonymous ? 'Anonim' : selectedItem.name}</span>
                      {selectedItem.generation && <span className="bg-slate-100 px-2 py-1 rounded">Angkatan {selectedItem.generation}</span>}
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium text-xs">{selectedItem.category}</span>
                    </div>
                  </div>
                  
                  {/* Status Control */}
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

                {/* Detail Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Isi Aspirasi</h4>
                    <p className="text-slate-800 text-base md:text-lg whitespace-pre-line leading-relaxed">{selectedItem.message}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-100 rounded text-blue-700"><Megaphone size={16}/></div> 
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
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastTrackingCode, setLastTrackingCode] = useState(null);

  useEffect(() => {
    if (!auth) return;
    
    const initAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
             await signInWithCustomToken(auth, __initial_auth_token);
        } else {
             await signInAnonymously(auth);
        }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const adminStatus = currentUser && currentUser.email ? true : false;
      setIsAdmin(adminStatus);
      
      // Auto-switch view if logged in as admin
      if (adminStatus) {
        setView('admin');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAspirationSubmit = async (data) => {
    if (!user) return; 
    
    const code = generateTrackingCode();
    const payload = {
      ...data,
      tracking_code: code,
      status: 'received',
      admin_reply: null,
      created_at: serverTimestamp(),
      user_uid: user.uid 
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'aspirations'), payload);
      setLastTrackingCode(code);
    } catch (e) {
      console.error("Error submitting:", e);
      alert("Gagal mengirim aspirasi. Silakan coba lagi.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setView('landing');
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      {/* Global Background Animation - Only visible on public pages */}
      {!isAdmin && <ParticleBackground />}

      <Header currentView={view} setView={setView} isAdmin={isAdmin} handleLogout={handleLogout} />
      
      <main className="relative z-10">
        {view === 'landing' && <Hero setView={setView} />}
        
        {view === 'form' && (
          lastTrackingCode ? (
            <SuccessModal 
              trackingCode={lastTrackingCode} 
              onClose={() => { setLastTrackingCode(null); setView('landing'); }} 
            />
          ) : (
            <AspirationForm onSubmit={handleAspirationSubmit} />
          )
        )}
        
        {view === 'tracking' && <TrackingView db={db} appId={appId} />}
        
        {view === 'login' && (
          <AdminLogin auth={auth} onLoginSuccess={() => setView('admin')} />
        )}
        
        {view === 'admin' && (
           isAdmin ? <AdminDashboard db={db} appId={appId} /> : <div className="pt-32 text-center text-red-500 font-bold">Access Denied. Please login.</div>
        )}
      </main>

      {!isAdmin && (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 relative z-10">
            <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-white font-bold text-xl">
                <Scale size={24} className="text-blue-500" /> MPA HIMAKOM
            </div>
            <p className="mb-6 text-sm max-w-md mx-auto leading-relaxed opacity-80">
                Media aspirasi resmi Majelis Perwakilan Anggota HIMAKOM POLBAN.
                Dibangun dengan transparansi, anonimitas, dan kepercayaan.
            </p>
            <div className="text-xs text-slate-600 font-mono">
                &copy; {new Date().getFullYear()} MPA HIMAKOM POLBAN. All rights reserved.
            </div>
            </div>
        </footer>
      )}
    </div>
  );
}