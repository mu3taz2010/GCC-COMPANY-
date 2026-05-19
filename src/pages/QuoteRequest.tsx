import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Wind, Zap, Bell, Video, ChevronRight, ChevronLeft, CheckCircle2, Loader2, Upload, Phone, Mail, User, MapPin } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

type Step = 'SYSTEM' | 'DETAILS' | 'CUSTOMER' | 'REVIEW' | 'SUCCESS';

interface QuotationData {
  system: string;
  details: any;
  customer: {
    name: string;
    phone: string;
    email: string;
    city: string;
    notes: string;
  };
}

import { useSearchParams } from 'react-router-dom';

export default function QuoteRequest() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSystem = searchParams.get('system');
  
  const [step, setStep] = React.useState<Step>(initialSystem ? 'DETAILS' : 'SYSTEM');
  const [loading, setLoading] = React.useState(false);
  const [quoteId, setQuoteId] = React.useState('');
  const [data, setData] = React.useState<QuotationData>({
    system: initialSystem || '',
    details: {},
    customer: { name: '', phone: '', email: '', city: '', notes: '' }
  });

  const systems = [
    { id: 'firefighting', title: t('firefighting'), icon: Shield, color: 'bg-red-600', desc: t('firefighting_desc', { defaultValue: 'Active and passive fire suppression systems.' }) },
    { id: 'alarms', title: t('alarms'), icon: Bell, color: 'bg-indigo-600', desc: t('alarms_desc', { defaultValue: 'Detection, panels, and early warning units.' }) },
    { id: 'generators', title: t('generators'), icon: Zap, color: 'bg-amber-600', desc: t('generators_desc', { defaultValue: 'Continuous power and backup energy arrays.' }) },
    { id: 'hvac', title: t('hvac'), icon: Wind, color: 'bg-blue-600', desc: t('hvac_desc', { defaultValue: 'Central cooling, VRF, and ventilation ducting.' }) },
    { id: 'cctv', title: t('cctv'), icon: Video, color: 'bg-emerald-600', desc: t('cctv_desc', { defaultValue: 'Surveillance, IP cameras, and monitoring nodes.' }) },
  ];

  const handleSelectSystem = (id: string) => {
    setData({ ...data, system: id, details: {} });
    setStep('DETAILS');
  };

  const handleToggleDetail = (key: string, value: string) => {
    const current = data.details[key] || [];
    const next = current.includes(value) 
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setData({ ...data, details: { ...data.details, [key]: next } });
  };

  const handleSetDetail = (key: string, value: any) => {
    setData({ ...data, details: { ...data.details, [key]: value } });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'quotations'), {
        ...data,
        status: 'New',
        createdAt: serverTimestamp(),
      });
      const generatedId = `GCC-${new Date().getFullYear()}-${docRef.id.slice(0, 4).toUpperCase()}`;
      setQuoteId(generatedId);
      setStep('SUCCESS');
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("Submission failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50 relative">
      <div className="absolute inset-0 bg-blueprint-dark opacity-5 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Progress Bar */}
        {step !== 'SUCCESS' && (
          <div className="flex justify-between mb-12">
            {['SYSTEM', 'DETAILS', 'CUSTOMER', 'REVIEW'].map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1 relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-500",
                  step === s ? "bg-red-600 border-red-600 text-white" : "bg-white border-slate-200 text-slate-400"
                )}>
                  {i + 1}
                </div>
                <span className={cn(
                  "mt-2 text-[10px] font-mono font-bold uppercase tracking-widest",
                  step === s ? "text-red-600" : "text-slate-400"
                )}>
                  {s === 'SYSTEM' ? t('select_system') : 
                   s === 'DETAILS' ? t('system_config') : 
                   s === 'CUSTOMER' ? t('customer_info') : 
                   t('review_submit')}
                </span>
                {i < 3 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'SYSTEM' && (
            <motion.div 
              key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter text-slate-900 mb-4 italic">{t('select_system')}</h1>
                <p className="text-slate-500 font-medium tracking-tight">{t('hero_subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systems.map((sys) => (
                  <button 
                    key={sys.id}
                    onClick={() => handleSelectSystem(sys.id)}
                    className="group bg-white border-2 border-slate-200 p-8 text-left hover:border-red-600 transition-all flex items-center space-x-6 rtl:space-x-reverse"
                  >
                    <div className={cn("p-4 text-white transition-transform group-hover:scale-110", sys.color)}>
                      <sys.icon size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-black uppercase tracking-tighter text-slate-900 mb-1">{sys.title}</h3>
                      <p className="text-slate-400 text-xs font-medium">{sys.desc}</p>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-red-600 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'DETAILS' && (
            <motion.div 
              key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-8">
                <button onClick={() => setStep('SYSTEM')} className="p-2 text-slate-400 hover:text-slate-900 focus:outline-none">
                  <ChevronLeft size={24} className="rtl:rotate-180" />
                </button>
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">{t('system_config')} ({t(data.system)})</h2>
              </div>

              <div className="bg-white border-2 border-slate-200 p-10 space-y-12">
                {/* CCTV DETAILED PATH */}
                {data.system === 'cctv' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4">1. Camera Logistics</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Indoor Cam', 'Outdoor Cam', 'IP Cameras', 'Thermal Cam', 'DVR/NVR', 'Cloud Service'].map(v => (
                          <label key={v} className={cn("border-2 p-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-2", data.details.cameras?.includes(v) ? "border-red-600 bg-red-50" : "border-slate-100 hover:border-slate-200")}>
                            <input type="checkbox" className="hidden" onChange={() => handleToggleDetail('cameras', v)} />
                            <span className="text-xs font-black uppercase tracking-tighter">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Facility Profile</label>
                        <select className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('siteType', e.target.value)}>
                          <option>Resident / Villa</option>
                          <option>Corporate Office</option>
                          <option>Heavy Factory</option>
                          <option>Storage Warehouse</option>
                          <option>Retail Mall</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Camera Node Count</label>
                        <input type="number" className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('nodeCount', e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {/* ALARMS DETAILED PATH */}
                {data.system === 'alarms' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4">1. Control Logic</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Fire Alarm', 'Theft Alert', 'Access Control', 'Biometrics', 'Smart Home', 'Gate Barrier'].map(v => (
                          <label key={v} className={cn("border-2 p-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-2", data.details.alarmTypes?.includes(v) ? "border-red-600 bg-red-50" : "border-slate-100 hover:border-slate-200")}>
                            <input type="checkbox" className="hidden" onChange={() => handleToggleDetail('alarmTypes', v)} />
                            <span className="text-xs font-black uppercase tracking-tighter">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Zone Count</label>
                         <input type="number" className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('zones', e.target.value)} />
                       </div>
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Entry Points</label>
                         <input type="number" className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('doors', e.target.value)} />
                       </div>
                    </div>
                  </>
                )}

                {/* GENERATORS DETAILED PATH */}
                {data.system === 'generators' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4">1. Power Engine Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Diesel Generator', 'Standby Power', 'ATS Automatic', 'Transfer Panels', 'Industrial Array'].map(v => (
                          <label key={v} className={cn("border-2 p-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-2", data.details.genTypes?.includes(v) ? "border-red-600 bg-red-50" : "border-slate-100 hover:border-slate-200")}>
                            <input type="checkbox" className="hidden" onChange={() => handleToggleDetail('genTypes', v)} />
                            <span className="text-xs font-black uppercase tracking-tighter">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Capacity Required (KVA)</label>
                         <input type="text" className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" placeholder="e.g. 250 KVA" onChange={e => handleSetDetail('kva', e.target.value)} />
                       </div>
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Soundproofing</label>
                         <select className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('soundproof', e.target.value)}>
                            <option>Standard / Open</option>
                            <option>Silent Canopy</option>
                            <option>Super Silent</option>
                         </select>
                       </div>
                    </div>
                  </>
                )}

                {/* HVAC DETAILED PATH */}
                {data.system === 'hvac' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4">1. Thermodynamic Strategy</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Split Unit', 'Central HVAC', 'VRF Multi-Split', 'Ductless Package', 'Industrial Chiller'].map(v => (
                          <label key={v} className={cn("border-2 p-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-2", data.details.hvacTypes?.includes(v) ? "border-red-600 bg-red-50" : "border-slate-100 hover:border-slate-200")}>
                            <input type="checkbox" className="hidden" onChange={() => handleToggleDetail('hvacTypes', v)} />
                            <span className="text-xs font-black uppercase tracking-tighter">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Floors</label>
                         <input type="number" className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('floors', e.target.value)} />
                       </div>
                       <div className="col-span-2">
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Smart Control Linked?</label>
                         <select className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('smartControl', e.target.value)}>
                            <option>No / Local Only</option>
                            <option>Yes / WiFi Linked</option>
                            <option>BMS Integrated</option>
                         </select>
                       </div>
                    </div>
                  </>
                )}

                {/* FIREFIGHTING DETAILED PATH */}
                {data.system === 'firefighting' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4">1. Suppression Components</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Sprinklers', 'FM200 Gas', 'CO2 Storage', 'Hose Reels', 'Fire Pump Room', 'Hydrant System'].map(v => (
                          <label key={v} className={cn("border-2 p-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-2", data.details.fireTypes?.includes(v) ? "border-red-600 bg-red-50" : "border-slate-100 hover:border-slate-200")}>
                            <input type="checkbox" className="hidden" onChange={() => handleToggleDetail('fireTypes', v)} />
                            <span className="text-xs font-black uppercase tracking-tighter">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Total Surface (M2)</label>
                         <input type="number" className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('m2', e.target.value)} />
                       </div>
                       <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Occupancy Class</label>
                         <select className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none" onChange={e => handleSetDetail('occupancy', e.target.value)}>
                            <option>Residential High-Rise</option>
                            <option>Industrial Hazard</option>
                            <option>Storage / Logistical</option>
                            <option>Educational / Public</option>
                         </select>
                       </div>
                    </div>
                  </>
                )}

                <button 
                  onClick={() => setStep('CUSTOMER')}
                  className="w-full bg-slate-950 text-white py-5 font-black uppercase tracking-[0.2em] text-sm hover:bg-red-600 transition-colors flex items-center justify-center space-x-4 rtl:space-x-reverse"
                >
                  <span>Proceed to Identity Check</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'CUSTOMER' && (
            <motion.div 
              key="customer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-8">
                <button onClick={() => setStep('DETAILS')} className="p-2 text-slate-400 hover:text-slate-900"><ChevronLeft size={24} /></button>
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Stakeholder Information</h2>
              </div>

              <div className="bg-white border-2 border-slate-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="relative">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">{t('project_name')}</label>
                    <div className="relative">
                      <User className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" className="w-full border-2 border-slate-100 pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-4 font-bold bg-slate-50 focus:border-red-600 outline-none"
                        onChange={e => setData({...data, customer: {...data.customer, name: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">{t('phone') || 'Phone'}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="tel" className="w-full border-2 border-slate-100 pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-4 font-bold bg-slate-50 focus:border-red-600 outline-none font-sans"
                        onChange={e => setData({...data, customer: {...data.customer, phone: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">{t('email') || 'Email'}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" className="w-full border-2 border-slate-100 pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-4 font-bold bg-slate-50 focus:border-red-600 outline-none"
                        onChange={e => setData({...data, customer: {...data.customer, email: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">{t('location')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" className="w-full border-2 border-slate-100 pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-4 font-bold bg-slate-50 focus:border-red-600 outline-none"
                        placeholder="Riyadh / Riyadh..."
                        onChange={e => setData({...data, customer: {...data.customer, city: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 text-center cursor-pointer hover:border-red-600 transition-colors">
                   <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                   <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Attach Technical Blueprints (PDF/DWG)</p>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Operational Notes</label>
                  <textarea 
                    rows={4} className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none resize-none"
                    onChange={e => setData({...data, customer: {...data.customer, notes: e.target.value}})}
                  />
                </div>

                <button 
                  onClick={() => setStep('REVIEW')}
                  className="w-full bg-slate-950 text-white py-6 font-black uppercase tracking-[0.3em] text-sm hover:bg-red-600 transition-all flex items-center justify-center"
                >
                  Confirm Specifications
                </button>
              </div>
            </motion.div>
          )}

          {step === 'REVIEW' && (
            <motion.div 
              key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                 <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter text-slate-900 mb-2">Audit Transmission</h2>
                 <p className="text-slate-500 font-medium">Final review of system parameters before board approval.</p>
              </div>

              <div className="bg-white border-2 border-slate-200 p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                     <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4 border-b border-red-200 pb-2">Target System</label>
                     <p className="text-2xl font-display font-black uppercase italic">{data.system}</p>
                     
                     <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mt-8 mb-4 border-b border-red-200 pb-2">Technical Matrix</label>
                     <div className="space-y-2">
                        {Object.entries(data.details).map(([k, v]: any) => (
                          <div key={k} className="flex justify-between text-sm">
                            <span className="text-slate-400 uppercase font-mono text-[10px]">{k}</span>
                            <span className="font-bold text-slate-700">{Array.isArray(v) ? v.join(', ') : v}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                   <div>
                     <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-4 border-b border-red-200 pb-2">Stakeholder Identity</label>
                     <p className="text-2xl font-display font-black uppercase mb-4">{data.customer.name}</p>
                     <div className="space-y-2 text-sm">
                        <p className="flex justify-between"><span className="text-slate-400 font-mono text-[10px]">LOC</span> <span className="font-bold uppercase">{data.customer.city}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400 font-mono text-[10px]">TEL</span> <span className="font-sans font-bold">{data.customer.phone}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400 font-mono text-[10px]">MAIL</span> <span className="font-bold">{data.customer.email}</span></p>
                     </div>
                   </div>
                 </div>

                 <div className="bg-slate-50 p-6 border-2 border-slate-100">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Briefing Logs</label>
                    <p className="text-slate-600 italic text-sm">{data.customer.notes || "None provided."}</p>
                 </div>

                 <div className="flex gap-4">
                   <button onClick={() => setStep('CUSTOMER')} className="flex-1 border-2 border-slate-900 py-6 font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all">Re-Edit Matrix</button>
                   <button 
                    onClick={handleSubmit} disabled={loading}
                    className="flex-[2] bg-red-600 text-white py-6 font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-red-600/30 hover:bg-slate-950 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin mr-3" /> : <Shield className="mr-3" />}
                    DISPATCH QUOTE REQUEST
                  </button>
                 </div>
              </div>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div 
              key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white border-2 border-slate-200 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                 <CheckCircle2 size={64} />
              </div>
              <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-slate-900 mb-4">Transmission Successful</h2>
              <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">
                Your request has been logged into our secure mainframe. Our technical board will review the specifications immediately.
              </p>
              <div className="inline-block bg-slate-50 px-8 py-6 border-2 border-slate-100 mb-12">
                 <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.4em] mb-2">Protocol Reference ID</div>
                 <div className="text-3xl font-display font-black text-slate-900 tracking-widest italic">{quoteId}</div>
              </div>
              <div>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-slate-900 text-white px-10 py-4 font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                >
                  Return to Headquarters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
           <div className="relative w-48 h-48 mb-12">
              <motion.div 
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-red-600/30 rounded-full"
              ></motion.div>
              <motion.div 
                animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-4 border-b-4 border-red-600 rounded-full flex items-center justify-center"
              >
                 <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-4xl font-display font-black tracking-tighter italic">GCC</span>
              </div>
           </div>
           
           <div className="text-center space-y-4">
              <div className="overflow-hidden h-1 w-64 bg-white/10 mx-auto rounded-full">
                 <motion.div 
                  initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="h-full w-full bg-red-600"
                 />
              </div>
              <motion.h3 
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-xl font-mono uppercase tracking-[0.3em] font-bold"
              >
                Syncing Execution Logs...
              </motion.h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Bridging Secure Uplink to GCC HQ</p>
           </div>
        </div>
      )}
    </div>
  );
}
