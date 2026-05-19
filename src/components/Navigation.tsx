import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Phone, Building2, Shield, Info, Briefcase, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

import logo from '../assets/images/gcc_corporate_logo_1779179556841.png';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const toggleLang = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navItems = [
    { name: t('nav_home'), path: '/', icon: Building2 },
    { name: t('nav_about'), path: '/about', icon: Info },
    { name: t('nav_services'), path: '/services', icon: Shield },
    { name: t('nav_projects'), path: '/projects', icon: Briefcase },
    { name: t('nav_contact'), path: '/contact', icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-24">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
              <img 
                src={logo} 
                alt="GCC Logo" 
                className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl text-slate-900 tracking-tighter leading-none">{t('app_name')}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-600 font-bold leading-none mt-1">Engineering Hub</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav - Centered */}
          <div className="hidden lg:flex flex-1 justify-center items-center space-x-2 rtl:space-x-reverse px-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative group flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  location.pathname === item.path 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon size={14} className={cn("transition-transform group-hover:scale-110", location.pathname === item.path ? "text-red-500" : "text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            <button 
              onClick={toggleLang}
              className="flex items-center space-x-2 rtl:space-x-reverse text-slate-400 hover:text-red-600 transition-colors py-2 px-3 hover:bg-red-50 rounded-lg"
            >
              <Globe size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <Link 
              to="/request-quote"
              className="bg-red-600 hover:bg-slate-950 text-white px-8 py-3.5 rounded-none font-black text-xs uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-red-600/20"
            >
              {t('request_quote')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4 rtl:space-x-reverse">
            <button onClick={toggleLang} className="text-gray-600">
               <Globe size={22} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-12 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-4 rtl:space-x-reverse px-4 py-4 rounded-xl transition-all",
                    location.pathname === item.path ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={20} className={location.pathname === item.path ? "text-red-500" : "text-slate-400"} />
                  <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
                </Link>
              ))}
              <div className="pt-6">
                 <Link 
                  to="/request-quote"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-red-600 text-white text-center py-5 rounded-none font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-red-600/20"
                >
                  {t('request_quote')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center space-x-4 rtl:space-x-reverse mb-8">
              <img 
                src={logo} 
                alt="GCC Logo" 
                className="w-14 h-14 object-contain brightness-0 invert opacity-90"
              />
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tighter leading-none">{t('app_name')}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-500 font-bold leading-none mt-1">Industrial Excellence</span>
              </div>
            </div>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              {t('hero_subtitle')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-6">{t('nav_services')}</h3>
            <ul className="space-y-4 text-gray-400">
              <li>{t('firefighting')}</li>
              <li>{t('hvac')}</li>
              <li>{t('generators')}</li>
              <li>{t('alarms')}</li>
              <li>{t('cctv')}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-6">{t('contact_us')}</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone size={18} />
                <span dir="ltr">055 030 7003</span>
              </li>
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone size={18} />
                <span dir="ltr">050 333 0283</span>
              </li>
              <li>GCC@gccgr.com</li>
              <li>Abha - Khamis Mushait, Saudi Arabia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm flex flex-col items-center">
          <p>© {new Date().getFullYear()} {t('footer_rights')}</p>
          <Link to="/admin" className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-700 hover:text-red-600 transition-colors">System Access</Link>
        </div>
      </div>
    </footer>
  );
};

export const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/966550307003"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 left-8 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-110 flex items-center justify-center"
    >
      <Phone size={24} />
    </a>
  );
};
