import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Target, Eye, Award, Users, Loader2, CheckCircle, Shield } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function About() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchContent = async () => {
      const snap = await getDoc(doc(db, 'settings', 'about'));
      if (snap.exists()) {
        setContent(snap.data());
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  const values = [
    { icon: Target, title: "Our Mission", desc: content?.mission || "To provide innovative and sustainable engineering solutions that exceed client expectations in safety and efficiency." },
    { icon: Eye, title: "Our Vision", desc: content?.vision || "To be the leading engineering firm in Saudi Arabia, recognized for technical excellence and uncompromising safety standards." },
    { icon: Award, title: "Quality First", desc: "We adhere to ISO standards and local civil defense regulations to ensure the highest level of system reliability." },
    { icon: Users, title: "Expert Team", desc: "Our strength lies in our multi-disciplinary team of certified engineers and technicians with decades of field experience." }
  ];

  if (loading) return (
    <div className="pt-40 flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="pt-32 pb-20 overflow-hidden bg-blueprint animate-blueprint">
      {/* Introduction */}
      <section className="mb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                 <div className="w-10 h-[2px] bg-red-600"></div>
                 <span className="text-red-600 font-mono text-xs uppercase tracking-[0.4em] font-bold">{t('nav_about')}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 mb-8 leading-tight tracking-tighter uppercase">{t('about_us_title')}</h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                {content?.aboutOverview || t('about_us_desc')}
              </p>
              <div className="grid grid-cols-2 gap-12 py-10 border-t border-slate-200">
                <div>
                  <div className="text-5xl md:text-7xl font-display font-black text-black mb-1 leading-none">{t('years_val')}</div>
                  <div className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">{t('years_experience')}</div>
                </div>
                <div>
                  <div className="text-5xl md:text-7xl font-display font-black text-black mb-1 leading-none">500+</div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{t('industry_audits') || 'Industry Audits'}</div>
                </div>
              </div>
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative lg:pl-10"
            >
              <div className="relative z-10 rounded-none border-[12px] border-white shadow-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop" alt="Industrial Facility" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              {/* Technical annotation */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 z-20 font-mono text-[10px] uppercase tracking-widest hidden md:block">
                 <div className="mb-2 text-red-500">[ MISSION_SECTOR ]</div>
                 <div>GCC_REGIONAL_HUB</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-dark animate-blueprint opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {values.map((v, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-none flex items-center justify-center text-red-600 mb-8 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <v.icon size={32} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-4">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                 <div className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-[0.4em] mb-4">{t('verification_log') || 'Verification_Log'}</div>
                 <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-8 leading-none">{t('certified_excellence') || 'Certified Excellence & Industry Standards'}</h2>
                 <p className="text-slate-600 mb-8 leading-relaxed">
                    {t('about_regulatory') || 'GCC Company operates under strict regulatory frameworks. We hold multiple classifications from the Saudi Ministry of Interior and HQ Civil Defense, ensuring every system we deploy meets the rigid safety protocols required in the Kingdom.'}
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["ISO 9001:2015", "Civil Defense Approved", "Ministry of Commerce Certified", "Engineering Council Member"].map(c => (
                      <div key={c} className="flex items-center space-x-3 rtl:space-x-reverse bg-white p-4 border border-slate-200">
                         <CheckCircle className="text-green-500" size={18} />
                         <span className="text-xs font-black uppercase tracking-widest text-slate-700">{c}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                 <div className="aspect-square bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center p-8 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                    <Award size={64} className="text-slate-400" />
                 </div>
                 <div className="aspect-square bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center p-8 opacity-80 animate-pulse">
                    <Shield size={64} className="text-red-600" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Team Section */}
      {content?.team?.length > 0 && (
        <section className="py-32 bg-white">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-[0.4em] mb-4">Leadership Matrix</div>
              <h2 className="text-5xl font-display font-black uppercase tracking-tighter mb-20">The GCC Taskforce</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                 {content.team.map((member: any, i: number) => (
                   <motion.div 
                    key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                   >
                     <div className="w-32 h-32 bg-slate-100 rounded-full mb-6 border-4 border-slate-50 flex items-center justify-center text-slate-300">
                        <Users size={48} />
                     </div>
                     <h4 className="text-lg font-black uppercase tracking-tight">{member.name}</h4>
                     <p className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mt-1">{member.role}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>
      )}
    </div>
  );
}
