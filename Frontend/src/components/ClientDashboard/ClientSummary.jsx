import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import Cricket from "../../assets/cricket.png";
import {
  Trophy,
  Users,
  Medal,
  X,
  MapPin,
  Calendar,
  ChevronRight,
  Zap,
  Target,
  ShieldCheck,
  Activity,
  BarChart3,
  Bell
} from "lucide-react";

// Helper: fallback image if none provided
const fallbackImage = Cricket;

/* ================= THEME UTILS ================= */
const getStatusBadgeClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "upcoming": return "text-amber-700 border-amber-200/70 bg-amber-50/60";
    case "ongoing": return "text-emerald-700 border-emerald-200/70 bg-emerald-50/60";
    case "completed": return "text-slate-500 border-slate-200 bg-slate-50";
    default: return "text-red-700 border-red-200/70 bg-red-50/60";
  }
};

const ClientSportsPlan = () => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  // New: State for client images
  const [clientImages, setClientImages] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Top-Level Lifted States for Zoom Modals
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [clientRes, annRes, perfRes, imagesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/public`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client/performance?userId=${user._id}`, { headers }),
          // New: Fetch client images (endpoint must exist in backend)
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client/images?userId=${user._id}`, { headers }).catch(() => ({ data: { images: [] } }))
        ]);
        const found = clientRes.data.clients.find((c) => c.userId?._id === user._id);
        setClient(found || null);
        setAnnouncements(annRes.data.announcements || []);
        setPerformanceData(perfRes.data.performance || []);
        setClientImages(imagesRes.data.images || []);
      } catch (err) {
        console.error("Connection Interrupted");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);


  // Gallery auto-advance (must be before any return)
  useEffect(() => {
    let interval;
    if (isGalleryOpen && clientImages.length > 1) {
      interval = setInterval(() => {
        setGalleryIndex((prev) => (prev + 1) % clientImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isGalleryOpen, clientImages.length]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
        <div className="absolute w-10 h-10 border-4 border-transparent border-b-red-400 rounded-full animate-spin reverse-spin opacity-40" />
      </div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Loading Environment...</p>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/30 p-6">
      <div className="text-center p-12 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-sm w-full">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
          <ShieldCheck size={28} className="text-slate-400" />
        </div>
        <h2 className="text-slate-900 font-bold text-xl tracking-tight">Access Pending</h2>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-wider font-semibold">Awaiting Dossier Assignment</p>
      </div>
    </div>
  );

  const plan = client.planType;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-red-200/60 relative">
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* MAIN: OPERATIONS (Left Side) */}
        <main className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-3xl relative border-r border-slate-200/60 shadow-[8px_0_32px_rgba(0,0,0,0.01)]">
          
          {/* HEADER HUD */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_20px_rgba(0,0,0,0.01)]">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Organization</p>
                <p className="text-lg font-extrabold text-slate-900 tracking-tight">{client?.userId?.name}</p>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block self-end mb-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tier Level</p>
                <p className="text-lg font-extrabold text-red-600 tracking-tight">{plan}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm self-start sm:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Status: Online</span>
            </div>
          </div>

          {/* MAIN SPACE WITH THE LEADERBOARD & IMAGES */}
          <div className="p-6 md:p-10 lg:p-12 max-w-5xl mx-auto space-y-12">
            {/* CLIENT-SPECIFIC IMAGE GALLERY SECTION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden hover:border-slate-300 transition-all mb-8">
              <button
                onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group bg-white hover:bg-slate-50/40 transition-colors"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {client?.userId?.name} Gallery
                  </h3>
                  <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                    {isGalleryOpen ? "Click to hide gallery" : "Click to expand client media gallery"}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isGalleryOpen ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-colors"
                >
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isGalleryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 border-t border-slate-100 pt-5 flex justify-center bg-slate-50/20">
                      {clientImages.length > 0 ? (
                        <div
                          onClick={() => setZoomImage(clientImages[galleryIndex])}
                          className="relative w-full max-w-lg h-72 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 cursor-pointer group/clientGallery"
                        >
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={galleryIndex}
                              src={clientImages[galleryIndex] || fallbackImage}
                              alt={`Client Gallery Image ${galleryIndex + 1}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="w-full h-full object-cover"
                            />
                          </AnimatePresence>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                            <span className="text-[9px] font-bold tracking-wider text-red-400 uppercase mb-0.5">Gallery Slideshow (5s)</span>
                            <h4 className="text-sm font-bold text-white">Gallery Image — #{galleryIndex + 1}</h4>
                            <p className="text-[11px] text-slate-300 font-medium mt-1 opacity-0 group-hover/clientGallery:opacity-100 transition-opacity duration-300">
                              Click image to view full size
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full max-w-lg h-72 flex items-center justify-center text-slate-400 bg-slate-100 rounded-xl border border-slate-200/60">
                          No images available for this client.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <PerformanceLeaderboard 
              teams={performanceData} 
              lastMonthImage={performanceData && performanceData.length > 0 && performanceData[0].lastMonthImage ? performanceData[0].lastMonthImage : null}
              onImageRequestZoom={(imgSrc) => setZoomImage(imgSrc)}
            />
          </div>
        </main>

        {/* SIDEBAR: INTEL FEED (Right Side) */}
        <aside className="w-full lg:w-[340px] bg-slate-50/60 backdrop-blur-3xl flex flex-col z-20 border-t lg:border-t-0 lg:border-l border-slate-200/60 h-[400px] lg:h-full">
          <div className="p-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                <Bell size={15} className="text-red-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Updates Feed</span>
            </div>
            {announcements.length > 0 && (
              <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {announcements.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {announcements.map((a) => (
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
                key={a._id}
                onClick={() => setActiveAnnouncement(a)}
                className="w-full text-left p-4.5 rounded-2xl bg-white border border-slate-200/60 hover:border-red-200 shadow-sm hover:shadow-md hover:shadow-red-950/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-red-500 transition-colors" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{a.date}</span>
                  <Zap size={13} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                </div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 pr-2">
                  {a.title}
                </p>
              </motion.button>
            ))}
          </div>
        </aside>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {activeAnnouncement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveAnnouncement(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-slate-100 z-10 flex flex-col max-h-[90vh]"
            >
              <div className="relative h-56 md:h-64 bg-slate-100 flex-shrink-0">
                {activeAnnouncement.image ? (
                  <img src={activeAnnouncement.image} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 to-slate-100 flex items-center justify-center">
                    <Activity size={40} className="text-red-200" />
                  </div>
                )}
                <button 
                  onClick={() => setActiveAnnouncement(null)} 
                  className="absolute top-5 right-5 p-2.5 bg-white/90 backdrop-blur border border-slate-200/80 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-md group"
                >
                  <X size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                </button>
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full bg-gradient-to-t from-white via-white/80 to-transparent">
                  <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(activeAnnouncement.status)} mb-3`}>
                    {activeAnnouncement.status}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{activeAnnouncement.title}</h3>
                </div>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div className="flex flex-wrap gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-5">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40"><Calendar size={13} className="text-red-500"/> {activeAnnouncement.date}</span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40"><MapPin size={13} className="text-red-500"/> {activeAnnouncement.venue}</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium text-base bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-inner">
                  "{activeAnnouncement.description}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIFTED GLOBAL FULL-SCREEN IMAGE MODAL */}
      <AnimatePresence>
        {zoomImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center rounded-2xl overflow-hidden z-10"
            >
              <img src={zoomImage} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="Enlarged view" />
              <button 
                onClick={() => setZoomImage(null)} 
                className="absolute top-4 right-4 p-2.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-xl transition-all border border-slate-700 shadow-xl"
              >
                <X size={18}/>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================= LEADERBOARD TABLE COMPONENT ================= */
const PerformanceLeaderboard = ({ teams = [], lastMonthImage, onImageRequestZoom }) => {
  const sortedTeams = [...teams].sort((a, b) => b.won - a.won);
  
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isMarchOpen, setIsMarchOpen] = useState(false);
  const [marchImageIndex, setMarchImageIndex] = useState(0);

  const imageGallery = [Cricket, lastMonthImage || Cricket, Cricket, Cricket];
  const marchGallery = [Cricket, Cricket, Cricket];

  useEffect(() => {
    let interval;
    if (isImagesOpen) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageGallery.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isImagesOpen, imageGallery.length]);

  useEffect(() => {
    let interval;
    if (isMarchOpen) {
      interval = setInterval(() => {
        setMarchImageIndex((prev) => (prev + 1) % marchGallery.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isMarchOpen, marchGallery.length]);

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return "bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-sm";
      case 1: return "bg-slate-400/10 text-slate-600 border border-slate-400/20 shadow-sm";
      case 2: return "bg-amber-700/10 text-amber-800 border border-amber-700/20 shadow-sm";
      default: return "bg-slate-50 text-slate-500 border border-slate-200/60";
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-red-600 pl-5">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Company <span className="text-red-600">Performance</span>
        </h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Live Standings Matrix</p>
      </div>

      {/* TABLE BOX */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-sm">
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-20">Rank</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Squad / Division</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-24">Played</th>
                <th className="py-4 px-4 text-[10px] font-bold text-emerald-600 uppercase tracking-wider text-center w-24 bg-emerald-50/40 border-x border-slate-200/40">Won</th>
                <th className="py-4 px-4 text-[10px] font-bold text-red-500 uppercase tracking-wider text-center w-24">Lost</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-900 uppercase tracking-wider text-right w-32">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTeams.map((team, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md ${getRankStyle(idx)}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-red-600 transition-colors">
                      {team.teamName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-slate-500">{team.played}</td>
                  <td className="py-4 px-4 text-center text-sm font-bold text-emerald-600 bg-emerald-50/10 border-x border-slate-100/60">{team.won}</td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-slate-400">{team.lost}</td>
                  <td className="py-4 px-6 text-right text-sm font-bold text-slate-900 tracking-tight">{team.points} PTS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOURNAMENT IMAGES SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden hover:border-slate-300 transition-all">
        <button 
          onClick={() => setIsImagesOpen(!isImagesOpen)}
          className="w-full flex items-center justify-between p-6 text-left focus:outline-none group bg-white hover:bg-slate-50/40 transition-colors"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              Last Month Tournament Images
            </h3>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">
              {isImagesOpen ? "Click header to hide gallery" : "Click header to expand media shelf"}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isImagesOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-colors"
          >
            <ChevronRight size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isImagesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="px-6 pb-6 border-t border-slate-100 pt-5 flex justify-center bg-slate-50/20">
                <div 
                  onClick={() => onImageRequestZoom(imageGallery[currentImageIndex])}
                  className="relative w-full max-w-lg h-72 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 cursor-pointer group/card"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentImageIndex}
                      src={imageGallery[currentImageIndex]} 
                      alt={`Tournament Frame ${currentImageIndex + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[9px] font-bold tracking-wider text-red-400 uppercase mb-0.5">Live Slideshow (6s)</span>
                    <h4 className="text-sm font-bold text-white">Tournament Asset Highlights — #{currentImageIndex + 1}</h4>
                    <p className="text-[11px] text-slate-300 font-medium mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      Click image to view absolute widescreen configuration
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= NEW MARCH SECTION BELOW ================= */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden hover:border-slate-300 transition-all">
        <button 
          onClick={() => setIsMarchOpen(!isMarchOpen)}
          className="w-full flex items-center justify-between p-6 text-left focus:outline-none group bg-white hover:bg-slate-50/40 transition-colors"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              March Highlights Section
            </h3>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">
              {isMarchOpen ? "Click header to hide March log" : "Click header to expand March gallery archive"}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isMarchOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-colors"
          >
            <ChevronRight size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isMarchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="px-6 pb-6 border-t border-slate-100 pt-5 flex justify-center bg-slate-50/20">
                <div 
                  onClick={() => onImageRequestZoom(marchGallery[marchImageIndex])}
                  className="relative w-full max-w-lg h-72 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 cursor-pointer group/marchCard"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={marchImageIndex}
                      src={marchGallery[marchImageIndex]} 
                      alt={`March Frame ${marchImageIndex + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[9px] font-bold tracking-wider text-red-400 uppercase mb-0.5">March Stream (6s)</span>
                    <h4 className="text-sm font-bold text-white">March Division Retrospective — #{marchImageIndex + 1}</h4>
                    <p className="text-[11px] text-slate-300 font-medium mt-1 opacity-0 group-hover/marchCard:opacity-100 transition-opacity duration-300">
                      Click image to expand full-scale preview board
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div> 
    </div>
  );
};

export default ClientSportsPlan;
