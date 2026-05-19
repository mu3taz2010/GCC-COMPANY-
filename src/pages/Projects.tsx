import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Layout, Eye, X, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  duration?: string;
  client?: string;
}

const ProjectModal = ({ project, onClose }: { project: Project, onClose: () => void }) => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const categoryKeys: any = {
    'Firefighting Systems': 'firefighting',
    'HVAC & Cooling': 'hvac',
    'Power Generators': 'generators',
    'Alarm & Control Systems': 'alarms',
    'CCTV & Security Cameras': 'cctv'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
      >
        <div className="absolute top-6 right-6 md:right-8 z-20 flex space-x-4 rtl:space-x-reverse">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="bg-blue-600 text-white p-2 rounded-none hover:bg-blue-700 transition-colors"
              title="Edit in Admin Panel"
            >
              <Edit2 size={24} />
            </Link>
          )}
          <button onClick={onClose} className="text-white md:text-slate-400 hover:text-red-600 transition-colors bg-slate-900/50 md:bg-transparent p-2 md:p-0">
            <X size={32} />
          </button>
        </div>
        
        <div className="flex-1 h-1/2 md:h-auto overflow-hidden">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
             <div className="w-8 h-px bg-red-600"></div>
             <span className="text-red-600 font-mono text-[10px] uppercase font-bold tracking-[0.3em]">{t(categoryKeys[project.category] || project.category)}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 uppercase tracking-tighter mb-8 leading-tight">{project.title}</h2>
          
          <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center text-slate-400 text-[10px] font-mono uppercase font-bold tracking-widest mb-2">
                <Calendar size={12} className="mr-2 rtl:ml-2" /> {t('project_date')}
              </div>
              <div className="text-slate-900 font-black text-lg">{project.duration || 'N/A'}</div>
            </div>
            <div>
              <div className="flex items-center text-slate-400 text-[10px] font-mono uppercase font-bold tracking-widest mb-2">
                <User size={12} className="mr-2 rtl:ml-2" /> {t('primary_client') || 'Primary Client'}
              </div>
              <div className="text-slate-900 font-black text-lg">{project.client || 'N/A'}</div>
            </div>
          </div>
          
          <div className="mb-10">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-widest mb-4">[ Operational Summary ]</h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {project.description}
            </p>
          </div>

          <button className="bg-red-600 text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center shadow-lg shadow-red-600/20">
            Register for similar scope
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function Projects() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore loading error:", err);
      // Fallback or empty state
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const defaultProjects = [
    { id: '1', title: "Aramco Facility Pump Expansion", category: "Firefighting Systems", image: "/src/assets/images/firefighting_systems_thumbnail_1779179053671.png", description: "Design and deployment of critical infrastructure.", duration: "12 Months", client: "Saudi Aramco" },
    { id: '2', title: "Riyadh Metro HVAC Phase 2", category: "HVAC & Cooling", image: "/src/assets/images/hvac_cooling_thumbnail_1779179069525.png", description: "Tunnel ventilation and station cooling systems installation.", duration: "18 Months", client: "ADA" },
    { id: '3', title: "NEOM Grid Power Backup", category: "Power Generators", image: "/src/assets/images/generators_power_thumbnail_1779179086020.png", description: "Installation of 50MW backup diesel generators array.", duration: "8 Months", client: "NEOM" }
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  const categoryKeys: any = {
    'Firefighting Systems': 'firefighting',
    'HVAC & Cooling': 'hvac',
    'Power Generators': 'generators',
    'Alarm & Control Systems': 'alarms',
    'CCTV & Security Cameras': 'cctv'
  };

  return (
    <div className="pt-32 pb-40 min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint opacity-20 animate-blueprint"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
               <div className="w-12 h-1 bg-red-600"></div>
               <span className="text-red-600 font-mono text-xs uppercase tracking-[0.4em] font-black">{t('category')}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-slate-950 mb-8 tracking-tighter uppercase italic">{t('nav_projects')}</h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed">
              {t('projects_desc', { defaultValue: 'Industrial benchmarks across the Kingdom. Each project represents a technical victory in safety and engineering excellence.' })}
            </p>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Status: Operational</div>
             <div className="text-2xl font-display font-black text-slate-900 leading-none">{displayProjects.length} Verified Records</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {displayProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className="group relative h-[500px] rounded-none overflow-hidden cursor-pointer shadow-xl"
            >
              <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-10 flex flex-col justify-end translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                <div className="text-[10px] font-mono text-red-500 font-bold mb-3 tracking-[0.2em] uppercase">Project_Ref: 0x{idx+100}</div>
                <h3 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter leading-none">{project.title}</h3>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-white/50 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-6">
                   <Layout size={14} className="text-red-600" />
                   <span>{t(categoryKeys[project.category] || project.category)}</span>
                </div>
                <div className="w-12 h-1 bg-red-600 group-hover:w-20 transition-all duration-500"></div>
                
                <div className="absolute top-8 right-8 flex space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                   {isAdmin && (
                     <div className="bg-blue-600 p-2 text-white shadow-lg" title="Admin Control Active">
                        <Edit2 size={18} />
                     </div>
                   )}
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 text-white">
                      <Eye size={20} />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

