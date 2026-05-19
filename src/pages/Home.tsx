import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Shield, Wind, Zap, Bell, ChevronRight, MessageSquare, Send, X, Edit2, Video, FileText, Download, Eye, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AnimatePresence } from 'motion/react';

import firefightingImg from '../assets/images/firefighting_systems_thumbnail_1779179053671.png';
import hvacImg from '../assets/images/hvac_cooling_thumbnail_1779179069525.png';
import generatorsImg from '../assets/images/generators_power_thumbnail_1779179086020.png';
import alarmsImg from '../assets/images/smart_alarms_thumbnail_1779179101533.png';
import cctvImg from '../assets/images/cctv_security_thumbnail_1779181586579.png';
import heroImg from '../assets/images/gcc_hero_engineering_1779179031521.png';

const ServiceCard = ({ id, icon: Icon, title, description, image, colorClass }: any) => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-none overflow-hidden shadow-soft border border-slate-200 group relative flex flex-col h-full"
    >
      <div className="h-56 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
        <div className={cn("absolute top-0 right-0 p-4 text-white shadow-xl flex items-center justify-center", colorClass)}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
        {isAdmin && (
          <Link to="/admin" className="absolute bottom-4 left-4 bg-blue-600 text-white p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 size={16} />
          </Link>
        )}
      </div>
      <div className="p-8 flex-1 flex flex-col bg-white">
        <div className="text-[10px] font-mono text-red-600 font-bold mb-2 tracking-[0.2em] uppercase">Engineering Dept.</div>
        <h3 className="text-2xl font-display font-black mb-4 text-slate-900 leading-none uppercase tracking-tighter">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">{description}</p>
        <Link to={`/request-quote?system=${id}`} className="inline-flex items-center space-x-2 rtl:space-x-reverse text-slate-900 font-black text-xs uppercase tracking-widest border-b-2 border-slate-900/10 hover:border-red-600 pb-1 w-fit transition-all group-hover:text-red-600">
          <span>{t('request_quote')}</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      {/* Decorative corner tag */}
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-600/20 group-hover:bg-red-600/100 transition-colors"></div>
    </motion.div>
  );
};

// Utility function to merge classes if not imported
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function Home() {
  const { t, i18n } = useTranslation();
  const { isAdmin, user } = useAuth();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'settings', 'about'));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };
    fetchProfile();
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setPrompt('');
    setChatHistory(prev => [...prev, {role: 'user', text: userMsg}]);
    setLoading(true);

    try {
      const res = await fetch('/api/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, {role: 'ai', text: data.response}]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      id: 'firefighting',
      icon: Shield,
      title: t('firefighting'),
      description: t('firefighting_desc'),
      image: firefightingImg,
      colorClass: "bg-red-600"
    },
    {
      id: 'hvac',
      icon: Wind,
      title: t('hvac'),
      description: t('hvac_desc'),
      image: hvacImg,
      colorClass: "bg-blue-600"
    },
    {
      id: 'generators',
      icon: Zap,
      title: t('generators'),
      description: t('generators_desc'),
      image: generatorsImg,
      colorClass: "bg-yellow-600"
    },
    {
      id: 'alarms',
      icon: Bell,
      title: t('alarms'),
      description: t('alarms_desc'),
      image: alarmsImg,
      colorClass: "bg-indigo-600"
    },
    {
      id: 'cctv',
      icon: Video,
      title: t('cctv'),
      description: t('cctv_desc'),
      image: cctvImg,
      colorClass: "bg-emerald-600"
    }
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center pt-20 overflow-hidden bg-slate-900 lg:bg-transparent">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Engineering Hero" 
            className="w-full h-full object-cover opacity-60 lg:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent rtl:bg-gradient-to-l"></div>
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 bg-blueprint-dark animate-blueprint opacity-20 pointer-events-none"></div>
        </div>
        
        {isAdmin && (
          <div className="absolute top-24 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <motion.div 
                 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 p-2 text-[10px] font-mono text-blue-400 font-bold uppercase tracking-[0.3em] inline-flex items-center space-x-2 rtl:space-x-reverse pointer-events-auto"
               >
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 <span>Administrator Recon Active: {user?.email}</span>
                 <Link to="/admin" className="underline hover:text-white ml-4">Launch Dashboard</Link>
               </motion.div>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
               <div className="h-1 w-12 bg-red-600 rounded-full"></div>
               <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.4em] text-red-500 font-black">Abha - Khamis Mushait</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black mb-6 leading-[0.9] tracking-tighter uppercase italic">
              {t('hero_title').split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 0 ? "block" : "text-red-600 italic block"}>{word} </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl mb-10 text-slate-300 max-w-xl leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link to="/request-quote" className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-none font-bold text-lg transition-all shadow-2xl hover:shadow-red-900/40 transform hover:-translate-y-1 active:scale-95 flex items-center group">
                <span>{t('request_quote')}</span>
                <ChevronRight className="ml-2 rtl:mr-2 rtl:rotate-180 transition-transform group-hover:translate-x-1" size={20} />
              </Link>
              <Link to="/services" className="text-white hover:text-red-500 font-bold transition-colors flex items-center space-x-2 rtl:space-x-reverse uppercase tracking-wider text-sm border-b-2 border-white/20 hover:border-red-600 pb-1">
                {t('our_services')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Industrial Elements */}
        <div className="absolute top-24 right-12 hidden xl:block pointer-events-none">
           <div className="w-[1px] h-64 bg-gradient-to-b from-red-600 to-transparent"></div>
           <div className="mt-4 text-[10px] font-mono text-white/30 rotate-90 origin-left">EST. 2024 - GCC ENG.</div>
        </div>
      </section>

      {/* Stats Section with blueprint feel */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-l border-gray-100">
            {[ 
              { label: t('years_experience'), value: i18n.language === 'ar' ? t('years_val') : "2" },
              { label: t('projects_completed'), value: "350+" },
              { label: t('expert_engineers'), value: "25+" },
              { label: t('stats_safety'), value: t('stats_safety_val') }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="pl-8 border-r border-gray-100"
              >
                <div className="text-5xl md:text-7xl font-display font-black text-black mb-2 leading-none">{stat.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-600 font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid with Industrial Styling */}
      <section className="py-32 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="w-8 h-[2px] bg-red-600"></div>
              <span className="text-red-600 font-mono text-xs uppercase tracking-widest font-bold">What we do</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 mb-4 uppercase tracking-tighter">{t('our_services')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((s, idx) => (
              <ServiceCard key={idx} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Company Profile Section */}
      {profile && profile.catalogUrl && (
        <section className="py-32 bg-white relative overflow-hidden">
           {/* Technical Grid Overlay */}
           <div className="absolute inset-0 bg-blueprint opacity-30 pointer-events-none"></div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                 <div className="flex-1 w-full max-w-xl">
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="relative"
                    >
                       {/* Background decoration */}
                       <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/5 -z-10"></div>
                       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-900/5 -z-10"></div>
                       
                       <div className="aspect-[3/4] bg-slate-100 shadow-2xl relative overflow-hidden group">
                          {profile.profileCover ? (
                            <img src={profile.profileCover} alt="Company Profile Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-slate-900">
                               <FileText size={80} className="text-red-600 mb-6" />
                               <div className="text-center">
                                  <div className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-2">GCC COMPANY</div>
                                  <div className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">Official Profile 2026</div>
                               </div>
                            </div>
                          )}
                          
                          {/* Profile Metadata Badge */}
                          <div className="absolute bottom-10 inset-x-10 p-6 bg-white/95 backdrop-blur-md shadow-xl border-l-4 border-red-600">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{t('total_pages')}</div>
                                   <div className="text-xl font-display font-black text-slate-900">{profile.profilePageCount || '24'}</div>
                                </div>
                                <div>
                                   <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{t('file_load')}</div>
                                   <div className="text-xl font-display font-black text-slate-900">{profile.profileFileSize || '12.5 MB'}</div>
                                </div>
                             </div>
                          </div>
                          
                          {/* Technical PDF Icon */}
                          <div className="absolute top-6 left-6 p-3 bg-red-600 text-white shadow-lg">
                             <FileDown size={24} />
                          </div>
                       </div>
                    </motion.div>
                 </div>
                 
                 <div className="flex-1">
                    <div className="mb-10">
                       <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                          <div className="w-12 h-px bg-red-600"></div>
                          <span className="text-red-600 font-mono text-xs uppercase tracking-[0.4em] font-black">{t('official_documentation')}</span>
                       </div>
                       <h2 className="text-4xl md:text-7xl font-display font-black text-slate-950 mb-8 uppercase tracking-tighter leading-none italic">
                          {t('know_more_about_us').split(' ').map((word, i) => (
                            <span key={i} className={word === 'الشركة' || word === 'Us' ? "text-red-600" : ""}>{word} </span>
                          ))}
                       </h2>
                       <p className="text-xl text-slate-600 leading-relaxed font-bold">
                          {profile.profileDescription || t('profile_default_desc')}
                       </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                       <button 
                         onClick={() => window.open(profile.catalogUrl, '_blank')}
                         className="flex-1 bg-slate-950 text-white px-10 py-5 rounded-none font-black uppercase text-sm tracking-widest hover:bg-red-600 transition-all shadow-xl group flex items-center justify-center"
                       >
                          <Eye size={18} className="mr-3 rtl:ml-3" />
                          <span>{t('view_profile')}</span>
                       </button>
                       <a 
                         href={profile.catalogUrl}
                         download="GCC_Company_Profile.pdf"
                         className="flex-1 bg-white text-slate-950 border-2 border-slate-950 px-10 py-5 rounded-none font-black uppercase text-sm tracking-widest hover:bg-slate-950 hover:text-white transition-all group flex items-center justify-center"
                       >
                          <Download size={18} className="mr-3 rtl:ml-3" />
                          <span>{t('download_pdf')}</span>
                       </a>
                    </div>
                    
                    <div className="mt-12 flex items-center space-x-6 rtl:space-x-reverse opacity-40 grayscale group hover:grayscale-0 transition-all bg-slate-50 p-6 border border-slate-100">
                       <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Compliant_With:</div>
                       <div className="flex space-x-4 rtl:space-x-reverse items-center">
                          <span className="text-xs font-black uppercase tracking-tighter border-r border-slate-300 pr-4 rtl:pl-4 rtl:border-r-0 rtl:border-l">SASO</span>
                          <span className="text-xs font-black uppercase tracking-tighter border-r border-slate-300 pr-4 rtl:pl-4 rtl:border-r-0 rtl:border-l">ISO 9001</span>
                          <span className="text-xs font-black uppercase tracking-tighter">Civil Defense</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Smart Consultant Fab */}
      <div className="fixed bottom-24 right-8 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </motion.button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-20 right-0 w-80 md:w-96 bg-slate-950 rounded-none shadow-2xl border border-white/10 overflow-hidden flex flex-col"
              style={{ height: '520px' }}
            >
              <div className="bg-red-600 p-4 text-white font-black flex justify-between items-center text-xs uppercase tracking-[0.2em]">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                   <span>Expert System v1.0</span>
                </div>
                <button onClick={() => setChatOpen(false)}><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-blueprint-dark animate-blueprint">
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Initial Link Established... OK</div>
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn("text-[9px] font-mono uppercase tracking-widest mb-1", msg.role === 'user' ? "text-red-500" : "text-white/40")}>
                        {msg.role === 'user' ? 'Client Request' : 'GCC Response'}
                    </div>
                    <div className={cn(
                      "max-w-[90%] p-4 rounded-none text-sm font-medium leading-relaxed",
                      msg.role === 'user' ? "bg-red-600 text-white shadow-lg" : "bg-white/5 text-slate-100 border border-white/10"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                     <span className="text-[10px] font-mono text-white/30 animate-pulse uppercase tracking-widest">Processing request...</span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-900 border-t border-white/5 flex items-center space-x-2 rtl:space-x-reverse">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('consultant_placeholder')}
                  className="flex-1 bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors font-mono"
                />
                <button 
                  onClick={handleSend}
                  className="bg-red-600 text-white p-3 rounded-none hover:bg-red-700 transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
