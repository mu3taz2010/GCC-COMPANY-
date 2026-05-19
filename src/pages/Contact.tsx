import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Contact() {
  const { t } = useTranslation();
  const [formState, setFormState] = React.useState({ name: '', email: '', message: '', service: '' });
  const [status, setStatus] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormState({ name: '', email: '', message: '', service: '' });
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="pt-40 min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint-dark animate-blueprint opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Contact Info */}
          <div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
               <div className="w-10 h-1 h-px bg-red-600"></div>
               <span className="text-red-500 font-mono text-xs uppercase tracking-[0.4em] font-black">Transmission Point</span>
            </div>
            <h1 className="text-6xl font-display font-black mb-10 tracking-tighter uppercase italic">{t('nav_contact')}</h1>
            <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-md font-medium">
              Start your industrial transformation. Contact our centralized engineering desk for technical consultation.
            </p>
            
            <div className="space-y-10">
              {[
                { icon: Phone, title: "Operations Desk", value: "055 030 7003", isPhone: true },
                { icon: Phone, title: "Technical Support", value: "050 333 0283", isPhone: true },
                { icon: Mail, title: "Support Intake", value: "GCC@gccgr.com" },
                { icon: MapPin, title: "Coordinates", value: "Abha - Khamis Mushait, Southern Region" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-8 rtl:space-x-reverse group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 text-red-600 flex items-center justify-center transition-all group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600">
                    <item.icon size={26} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display font-black uppercase text-xs tracking-widest text-slate-500 mb-2">{item.title}</h3>
                    <p className={cn("text-xl font-bold text-white", item.isPhone && "font-sans")} dir={item.isPhone ? "ltr" : "auto"}>{item.value}</p>
                  </div>
                </div>
              ))}
              
              <a 
                href="https://wa.me/966550307003"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-4 rtl:space-x-reverse bg-green-600 hover:bg-green-700 text-white p-6 font-black uppercase tracking-widest text-sm shadow-xl shadow-green-900/20 transition-all active:scale-95 group"
              >
                <MessageCircle size={24} />
                <span>Start Direct HQ WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            {/* Tracking Section */}
            <div className="bg-slate-800 p-8 border border-white/5 relative">
              <div className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-[0.3em] mb-4">Request Status Tracker</div>
              <div className="flex gap-4">
                <input 
                  type="text" placeholder="GCC-2026-XXXX"
                  className="flex-1 bg-white/5 border border-white/10 p-4 font-mono text-sm focus:border-red-600 outline-none text-white"
                  id="trackingId"
                />
                <button 
                  onClick={() => {
                    const id = (document.getElementById('trackingId') as HTMLInputElement).value;
                    if(id) alert(`Protocol ${id} is currently: VERIFYING SPECIFICATIONS`);
                  }}
                  className="bg-red-600 px-6 py-4 font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all text-white"
                >
                  Check
                </button>
              </div>
            </div>

            <div className="bg-white p-10 md:p-16 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
              <div className="mb-10">
                 <h2 className="text-slate-900 text-3xl font-display font-black uppercase tracking-tighter mb-2">Service Request Interface</h2>
                 <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Ready for deployment.</p>
              </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">Client Identifier</label>
                  <input 
                    type="text" 
                    required 
                    value={formState.name}
                    onChange={e => setFormState({...formState, name: e.target.value})}
                    className="w-full bg-slate-50 border-b-2 border-slate-200 focus:border-red-600 px-0 py-3 text-slate-900 font-bold focus:outline-none transition-colors"
                    placeholder="Full Business Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">Communication Channel</label>
                  <input 
                    type="email" 
                    required 
                    value={formState.email}
                    onChange={e => setFormState({...formState, email: e.target.value})}
                    className="w-full bg-slate-50 border-b-2 border-slate-200 focus:border-red-600 px-0 py-3 text-slate-900 font-bold focus:outline-none transition-colors"
                    placeholder="official@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">Target Sector</label>
                <select 
                  value={formState.service}
                  onChange={e => setFormState({...formState, service: e.target.value})}
                  className="w-full bg-slate-50 border-b-2 border-slate-200 focus:border-red-600 px-0 py-3 text-slate-900 font-bold focus:outline-none transition-colors"
                >
                  <option value="">Operational Domains</option>
                  <option value="firefighting">{t('firefighting')}</option>
                  <option value="hvac">{t('hvac')}</option>
                  <option value="generators">{t('generators')}</option>
                  <option value="alarms">{t('alarms')}</option>
                  <option value="cctv">{t('cctv')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">Project Specifications</label>
                <textarea 
                  rows={4} 
                  required 
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                  className="w-full bg-slate-50 border-b-2 border-slate-200 focus:border-red-600 px-0 py-3 text-slate-900 font-bold focus:outline-none transition-colors resize-none"
                  placeholder="Detailed requirements and objectives..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-red-600 hover:bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] py-6 flex items-center justify-center space-x-3 rtl:space-x-reverse transition-all transform active:scale-95 disabled:opacity-50 shadow-xl shadow-red-600/20"
              >
                {status === 'sending' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Execute Send Command</span>
                    <Send size={18} />
                  </>
                )}
              </button>
              {status === 'success' && <p className="text-green-600 font-mono text-[10px] uppercase tracking-widest text-center mt-4">Command Successfully Dispatched.</p>}
              {status === 'error' && <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest text-center mt-4">Buffer Overflow or Signal Loss. Retry Required.</p>}
            </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
