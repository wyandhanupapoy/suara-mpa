import React, { useState, useEffect } from 'react';
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
  Award,
  Scale
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
// In a real Vercel deployment, these would come from process.env
const firebaseConfig = {
  apiKey: "AIzaSyAraMRc8w3Fst9kX4_c8uEJHeK6KKoCOMg",
  authDomain: "suara-mpa.firebaseapp.com",
  projectId: "suara-mpa",
  storageBucket: "suara-mpa.firebasestorage.app",
  messagingSenderId: "543383148892",
  appId: "1:543383148892:web:88737965ec5fc0bacd4999",
  measurementId: "G-SFCFQV53R1"
};
const appId = 'suara-mpa';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UTILITY FUNCTIONS ---
const generateTrackingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
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

// --- COMPONENTS ---

const Header = ({ currentView, setView, isAdmin, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setView('landing')}
          >
            <div className="flex space-x-2 items-center">
              {/* Logo Placeholders using Icons */}
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white shadow-lg" title="MPA">
                <Scale size={20} />
              </div>
              <div className="hidden md:flex w-10 h-10 bg-sky-600 rounded-full items-center justify-center text-white shadow-md opacity-80 group-hover:opacity-100 transition-all" title="HIMAKOM">
                <FileText size={20} />
              </div>
              <div className="hidden md:flex w-10 h-10 bg-orange-500 rounded-full items-center justify-center text-white shadow-md opacity-80 group-hover:opacity-100 transition-all" title="POLBAN">
                <Award size={20} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-lg leading-tight">SUARA MPA</span>
              <span className="text-xs text-slate-500 font-medium tracking-wider">HIMAKOM POLBAN</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => setView('landing')} className={`text-sm font-medium transition-colors ${currentView === 'landing' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Beranda</button>
            <button onClick={() => setView('form')} className={`text-sm font-medium transition-colors ${currentView === 'form' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Kirim Aspirasi</button>
            <button onClick={() => setView('tracking')} className={`text-sm font-medium transition-colors ${currentView === 'tracking' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Cek Status</button>
            {isAdmin ? (
              <div className="flex items-center space-x-4 ml-4">
                <button onClick={() => setView('admin')} className="text-sm font-bold text-blue-900 bg-blue-100 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors">
                  Dashboard
                </button>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={() => setView('login')} className="text-sm font-medium text-slate-400 hover:text-blue-700 flex items-center gap-1">
                <Lock size={14} /> Admin
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <button onClick={() => { setView('landing'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg">Beranda</button>
            <button onClick={() => { setView('form'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg">Kirim Aspirasi</button>
            <button onClick={() => { setView('tracking'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg">Cek Status</button>
            {isAdmin ? (
              <button onClick={() => { setView('admin'); setIsMenuOpen(false); }} className="p-3 text-left font-bold text-blue-700 bg-blue-50 rounded-lg">Dashboard Admin</button>
            ) : (
              <button onClick={() => { setView('login'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-400">Login Admin</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const Hero = ({ setView }) => (
  <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10" />
    <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-900/5 skew-x-12 blur-3xl -z-10" />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-8 animate-fade-in-up">
        <ShieldCheck size={16} />
        <span>Anonim & Terpercaya</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
        Suarakan Aspirasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-500">Tanpa Takut.</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
        MPA HIMAKOM hadir menjaga suaramu. Sampaikan kritik, saran, dan aspirasi untuk kemajuan bersama. Identitasmu aman bersama kami.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={() => setView('form')}
          className="w-full sm:w-auto px-8 py-4 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <Megaphone size={20} />
          Kirim Aspirasi Sekarang
        </button>
        <button 
          onClick={() => setView('tracking')}
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Search size={20} />
          Lacak Aspirasi
        </button>
      </div>

      {/* Stats Mockup */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-4xl font-bold text-blue-700 mb-2">100%</div>
          <div className="text-sm text-slate-500 font-medium">Privasi Terjaga</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-4xl font-bold text-blue-700 mb-2">24/7</div>
          <div className="text-sm text-slate-500 font-medium">Waktu Penerimaan</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-4xl font-bold text-blue-700 mb-2">Respon</div>
          <div className="text-sm text-slate-500 font-medium">Tanggapan Resmi MPA</div>
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
    // Simulate delay or processing
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-8 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <FileText /> Form Aspirasi
          </h2>
          <p className="opacity-90">Silakan isi formulir di bawah ini. Gunakan bahasa yang sopan dan jelas.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Aspirasi</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Akademik">Akademik</option>
              <option value="Organisasi">Organisasi</option>
              <option value="Fasilitas">Fasilitas</option>
              <option value="Kebijakan">Kebijakan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Aspirasi</label>
            <input 
              type="text"
              required
              placeholder="Contoh: Kendala AC di Ruang Lab 1"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Isi Aspirasi</label>
            <textarea 
              required
              rows={5}
              placeholder="Jelaskan aspirasimu secara detail..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          {/* Identity Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div 
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.isAnonymous ? 'bg-blue-600' : 'bg-slate-300'}`}
              onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${formData.isAnonymous ? 'translate-x-6' : ''}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {formData.isAnonymous ? 'Kirim sebagai Anonim (Identitas Disembunyikan)' : 'Sertakan Identitas Saya'}
            </span>
          </div>

          {/* Optional Identity Fields */}
          {!formData.isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text"
                  placeholder="Nama Anda"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Angkatan</label>
                <input 
                  type="text"
                  placeholder="20xx"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.generation}
                  onChange={(e) => setFormData({...formData, generation: e.target.value})}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Mengirim...' : <><Send size={18} /> Kirim Aspirasi</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const SuccessModal = ({ trackingCode, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl animate-scale-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
        <CheckCircle size={40} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Aspirasi Terkirim!</h3>
      <p className="text-slate-600 mb-6">Terima kasih telah bersuara. Aspirasimu akan segera kami proses.</p>
      
      <div className="bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Kode Tracking Anda</p>
        <div className="text-3xl font-mono font-bold text-blue-800 tracking-wider select-all">{trackingCode}</div>
        <p className="text-xs text-slate-400 mt-2">Simpan kode ini untuk mengecek status aspirasi.</p>
      </div>

      <button onClick={onClose} className="w-full py-3 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 transition-colors">
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

  // Fetch all for client-side filtering (See logic in reasoning)
  useEffect(() => {
     // In a real app with proper security rules, we would query strictly by ID.
     // For this prototype/setup where we can't deploy custom backend indexes easily,
     // we fetch the collection and filter client side.
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
    
    // Simulate network delay
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
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Lacak Status Aspirasi</h2>
          <p className="text-slate-600">Masukkan kode tracking unik yang Anda dapatkan saat mengirim aspirasi.</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-8">
          <input 
            type="text" 
            placeholder="Masukkan Kode (cth: MPA-X92F)" 
            className="flex-1 p-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button type="submit" disabled={loading} className="bg-blue-800 text-white px-6 rounded-xl font-bold hover:bg-blue-900 transition-colors disabled:opacity-70">
            {loading ? '...' : <Search />}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-shake">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${getStatusColor(result.status)}`}>
                  {getStatusLabel(result.status)}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{result.title}</h3>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Clock size={14} /> {formatDate(result.created_at)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Kode</div>
                <div className="font-mono font-bold text-slate-700">{result.tracking_code}</div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Pesan Anda:</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-6">{result.message}</p>
              
              {result.admin_reply ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Megaphone size={14} /> Tanggapan MPA:
                  </h4>
                  <p className="text-slate-700 text-sm">{result.admin_reply}</p>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm italic">
                  Belum ada tanggapan resmi. Mohon menunggu.
                </div>
              )}
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola aspirasi MPA.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-800 text-white py-3 rounded-lg font-bold hover:bg-blue-900">
            Masuk
          </button>
        </form>
        <div className="mt-4 text-center">
             <p className="text-xs text-slate-400">Belum punya akun? Hubungi Super Admin atau buat user di Firebase Console.</p>
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

  useEffect(() => {
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
      status: 'followed_up' // Auto update status on reply
    });
    setSelectedItem(null);
    setReplyText('');
  };

  return (
    <div className="pt-24 px-4 sm:px-8 bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 md:mb-0 flex items-center gap-2">
            <LayoutDashboard /> Dashboard Aspirasi
          </h2>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['all', 'received', 'process', 'finished'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                {f === 'all' ? 'Semua' : getStatusLabel(f)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Section */}
          <div className="lg:col-span-1 space-y-4">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedItem?.id === item.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.tracking_code}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.message}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="bg-slate-100 px-2 py-1 rounded">{item.category}</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <Inbox size={32} className="mx-auto mb-2 opacity-50"/>
                <p>Tidak ada data</p>
              </div>
            )}
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedItem.title}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><User size={14}/> {selectedItem.isAnonymous ? 'Anonim' : selectedItem.name}</span>
                      <span>•</span>
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs">{selectedItem.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select 
                      value={selectedItem.status}
                      onChange={(e) => handleUpdateStatus(selectedItem.id, e.target.value)}
                      className="text-xs font-bold p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
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

                <div className="bg-slate-50 p-4 rounded-xl mb-6">
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{selectedItem.message}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Megaphone size={16}/> Tanggapan Resmi
                  </h3>
                  <textarea 
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    placeholder="Tulis tanggapan untuk aspirator..."
                    defaultValue={selectedItem.admin_reply || ''}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end">
                    <button 
                      onClick={handleSendReply}
                      className="bg-blue-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition-colors flex items-center gap-2"
                    >
                      <Send size={16} /> Kirim / Update Tanggapan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                <div className="text-center">
                  <LayoutDashboard className="mx-auto mb-2 opacity-50" size={48} />
                  <p>Pilih aspirasi dari daftar untuk melihat detail</p>
                </div>
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
  const [view, setView] = useState('landing'); // landing, form, tracking, admin, login
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastTrackingCode, setLastTrackingCode] = useState(null);

  // Auth Handling
  useEffect(() => {
    const initAuth = async () => {
        // First, check if we have a custom token from the environment (Provided by Gemini/System)
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
             await signInWithCustomToken(auth, __initial_auth_token);
        } else {
             // Fallback for public users: sign in anonymously so they can read/write according to "auth != null" rules
             await signInAnonymously(auth);
        }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Basic check: if email exists, treat as admin. 
      // In production, use Custom Claims or a Firestore 'admins' collection check.
      setIsAdmin(currentUser && currentUser.email ? true : false);
    });
    return () => unsubscribe();
  }, []);

  const handleAspirationSubmit = async (data) => {
    if (!user) return; // Should be logged in anonymously by now
    
    const code = generateTrackingCode();
    const payload = {
      ...data,
      tracking_code: code,
      status: 'received',
      admin_reply: null,
      created_at: serverTimestamp(),
      user_uid: user.uid // Internal reference
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
    // Auto sign back in anonymously for public view
    await signInAnonymously(auth);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Header currentView={view} setView={setView} isAdmin={isAdmin} handleLogout={handleLogout} />
      
      <main>
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
           isAdmin ? <AdminDashboard db={db} appId={appId} /> : <div className="pt-32 text-center">Access Denied</div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white font-bold">
            <Scale size={20} /> MPA HIMAKOM
          </div>
          <p className="mb-4 text-sm max-w-md mx-auto">
            Media aspirasi resmi Majelis Perwakilan Anggota HIMAKOM POLBAN.
            Dibangun dengan transparansi dan kepercayaan.
          </p>
          <div className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} MPA HIMAKOM POLBAN. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}