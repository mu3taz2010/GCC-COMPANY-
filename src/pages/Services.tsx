import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Shield, Wind, Zap, Bell, CheckCircle, Video, FileText, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

import firefightingImg from '../assets/images/firefighting_systems_thumbnail_1779179053671.png';
import hvacImg from '../assets/images/hvac_cooling_thumbnail_1779179069525.png';
import generatorsImg from '../assets/images/generators_power_thumbnail_1779179086020.png';
import alarmsImg from '../assets/images/smart_alarms_thumbnail_1779179101533.png';
import cctvImg from '../assets/images/cctv_security_thumbnail_1779181586579.png';

export default function Services() {
  const { t } = useTranslation();
  const [catalogUrl, setCatalogUrl] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCatalog = async () => {
      const snap = await getDoc(doc(db, 'settings', 'about'));
      if (snap.exists()) {
        setCatalogUrl(snap.data().catalogUrl || '');
      }
      setLoading(false);
    };
    fetchCatalog();
  }, []);

  const detailedServices = [
    {
      id: "firefighting",
      title: t('firefighting'),
      icon: Shield,
      image: firefightingImg,
      features: [
        t('fire_f1', { defaultValue: "Hydrant and sprinkler systems design" }),
        t('fire_f2', { defaultValue: "Installation of FM200 and CO2 gas systems" }),
        t('fire_f3', { defaultValue: "Pump room execution and certification" }),
        t('fire_f4', { defaultValue: "Civil Defense approved certification" })
      ]
    },
    {
      id: "hvac",
      title: t('hvac'),
      icon: Wind,
      image: hvacImg,
      features: [
        t('hvac_f1', { defaultValue: "Central Air Conditioning & Chillers" }),
        t('hvac_f2', { defaultValue: "Duct design and manufacturing" }),
        t('hvac_f3', { defaultValue: "Exhaust and ventilation systems" }),
        t('hvac_f4', { defaultValue: "Regular preventative maintenance" })
      ]
    },
    {
      id: "generators",
      title: t('generators'),
      icon: Zap,
      image: generatorsImg,
      features: [
        t('gen_f1', { defaultValue: "Supplying heavy-duty diesel generators" }),
        t('gen_f2', { defaultValue: "Automatic Transfer Switches (ATS)" }),
        t('gen_f3', { defaultValue: "Soundproof enclosures and fuel systems" }),
        t('gen_f4', { defaultValue: "On-site load bank testing" })
      ]
    },
    {
      id: "alarms",
      title: t('alarms'),
      icon: Bell,
      image: alarmsImg,
      features: [
        t('alarm_f1', { defaultValue: "Addressable fire alarm systems" }),
        t('alarm_f2', { defaultValue: "Integration with suppression systems" }),
        t('alarm_f3', { defaultValue: "Remote monitoring and alerts" }),
        t('alarm_f4', { defaultValue: "Maintenance and sensors calibration" })
      ]
    },
    {
      id: "cctv",
      title: t('cctv'),
      icon: Video,
      image: cctvImg,
      features: [
        t('cctv_f1', { defaultValue: "IP Camera networks and NVR storage" }),
        t('cctv_f2', { defaultValue: "AI-powered motion detection & analytics" }),
        t('cctv_f3', { defaultValue: "Fiber optic transmission for long distances" }),
        t('cctv_f4', { defaultValue: "Integrated security control rooms" })
      ]
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
             <div className="w-12 h-[2px] bg-red-600"></div>
             <span className="text-red-600 font-mono text-xs uppercase tracking-[0.4em] font-black">{t('capabilities') || 'Capabilities'}</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black text-slate-950 mb-8 tracking-tighter uppercase italic">{t('nav_services')}</h1>
          <p className="text-xl text-slate-600 max-w-3xl font-medium leading-relaxed">
            {t('services_intro_p', { defaultValue: "Professional engineering delivery across mechanical, electrical, and safety domains. We build the systems that protect and empower the modern world." })}
          </p>
        </div>

        <div className="space-y-40">
          {detailedServices.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col lg:flex-row items-stretch gap-16 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-[0.3em]">Module_{idx + 1} // Technical Specifications</div>
                <div className="flex items-center space-x-5 rtl:space-x-reverse mb-8">
                   <div className="p-4 bg-slate-900 text-white rounded-none">
                      <service.icon size={36} strokeWidth={1} />
                   </div>
                   <h2 className="text-4xl font-display font-black text-slate-900 uppercase tracking-tighter">{service.title}</h2>
                </div>
                <div className="space-y-5 mb-10 pl-4 border-l-2 border-red-600/50">
                  {service.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="mt-2 w-1.5 h-1.5 bg-red-600 shrink-0"></div>
                      <span className="text-slate-700 text-lg font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => catalogUrl && window.open(catalogUrl, '_blank')}
                  className={cn(
                    "w-fit px-10 py-4 rounded-none font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 group flex items-center",
                    catalogUrl ? "bg-slate-950 text-white hover:bg-red-600" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <span>{catalogUrl ? t('catalog_download') : "Catalog Offline"}</span>
                  <div className={cn("ml-3 w-4 h-[1px] group-hover:w-8 transition-all", catalogUrl ? "bg-white" : "bg-slate-300")}></div>
                </button>
              </div>
              <div className="flex-1 w-full h-[450px] relative">
                <div className="absolute inset-0 border border-slate-950/10 translate-x-4 translate-y-4 -z-10"></div>
                <div className="w-full h-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                   <img src={service.image} alt={service.title} className="w-full h-full object-cover scale-105 hover:scale-100 transition-all duration-700" />
                </div>
                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 p-4 border-t border-l border-white/40 text-white z-10 pointer-events-none">
                   <div className="text-[9px] font-mono uppercase tracking-widest">Sys_Check::OK</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
