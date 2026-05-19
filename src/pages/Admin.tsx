import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, loginWithGoogle, logout } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, LogIn, LogOut, Loader2, X, Image as ImageIcon, ClipboardList, Package, CheckCircle, Clock, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  duration?: string;
  client?: string;
}

export default function Admin() {
  const { t } = useTranslation();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'projects' | 'quotations' | 'profile' | 'settings'>('projects');
  const [isUploading, setIsUploading] = React.useState<{[key: string]: boolean}>({});
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [quotations, setQuotations] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>({
    aboutOverview: '',
    vision: '',
    mission: '',
    catalogUrl: '',
    profileCover: '',
    profileDescription: '',
    profilePageCount: '',
    profileFileSize: '',
    team: []
  });
  const [projectsLoading, setProjectsLoading] = React.useState(true);
  const [quotesLoading, setQuotesLoading] = React.useState(true);
  const [settingsLoading, setSettingsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    category: 'Firefighting Systems',
    image: '',
    description: '',
    duration: '',
    client: ''
  });

  React.useEffect(() => {
    if (isAdmin) {
      const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const unsubProjects = onSnapshot(qProjects, (snapshot) => {
        setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
        setProjectsLoading(false);
      });

      const qQuotes = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
      const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
        setQuotations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setQuotesLoading(false);
      });

      const unsubSettings = onSnapshot(doc(db, 'settings', 'about'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings({
            ...data,
            profileCover: data.profileCover || '',
            profileDescription: data.profileDescription || '',
            profilePageCount: data.profilePageCount || '',
            profileFileSize: data.profileFileSize || ''
          });
        }
        setSettingsLoading(false);
      });

      return () => { unsubProjects(); unsubQuotes(); unsubSettings(); };
    } else {
      setProjectsLoading(false);
      setQuotesLoading(false);
      setSettingsLoading(false);
    }
  }, [isAdmin]);

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'settings', 'about'), settings).catch(async () => {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'about'), settings);
      });
      alert("Settings updated successfully.");
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to update settings.");
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'quotations', id), { status });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("File is too large. Max 20MB for PDF.");
        return;
      }
      setIsUploading({ ...isUploading, catalog: true });
      try {
        const storageRef = ref(storage, `profiles/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setSettings({ 
          ...settings, 
          catalogUrl: downloadURL, 
          profileFileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB' 
        });
      } catch (err) {
        console.error("Upload error:", err);
        alert("فشل رفع الملف. حاول مرة أخرى.");
      } finally {
        setIsUploading({ ...isUploading, catalog: false });
      }
    }
  };

  const handleProfileCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading({ ...isUploading, cover: true });
      try {
        const storageRef = ref(storage, `covers/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setSettings({ ...settings, profileCover: downloadURL });
      } catch (err) {
        console.error("Upload error:", err);
        alert("فشل رفع الصورة.");
      } finally {
        setIsUploading({ ...isUploading, cover: false });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setModalOpen(false);
      setEditingProject(null);
      setFormData({ title: '', category: 'Firefighting Systems', image: '', description: '', duration: '', client: '' });
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Failed to save. Check your permissions.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      await deleteDoc(doc(db, 'projects', id));
    }
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      category: p.category,
      image: p.image,
      description: p.description,
      duration: p.duration || '',
      client: p.client || ''
    });
    setModalOpen(true);
  };

  if (authLoading || (isAdmin && projectsLoading)) return (
    <div className="pt-40 flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  if (!isAdmin) return (
    <div className="pt-40 text-center px-4">
      <h1 className="text-4xl font-display font-black text-slate-900 mb-8 uppercase">Admin Access Required</h1>
      <p className="text-slate-500 mb-8">This area is reserved for authorized personnel. Please login with a verified administrator account.</p>
      <button 
        onClick={loginWithGoogle}
        className="bg-slate-950 text-white px-10 py-4 rounded-none font-black uppercase text-sm flex items-center mx-auto hover:bg-red-600 transition-colors"
      >
        <LogIn className="mr-3 rtl:ml-3" size={20} />
        Login with Administrative Account
      </button>
    </div>
  );

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="text-red-600 font-mono text-xs uppercase tracking-widest font-bold mb-2">Control Panel</div>
            <h1 className="text-5xl font-display font-black text-slate-950 uppercase tracking-tighter">Operations Hub</h1>
            <div className="flex mt-6 border-b border-slate-200">
               <button 
                onClick={() => setActiveTab('projects')}
                className={cn(
                  "px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all",
                  activeTab === 'projects' ? "border-b-4 border-red-600 text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
               >
                 Projects_Matrix
               </button>
               <button 
                onClick={() => setActiveTab('quotations')}
                className={cn(
                  "px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative",
                  activeTab === 'quotations' ? "border-b-4 border-red-600 text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
               >
                 Quote_Requests
                 {quotations.filter(q => q.status === 'New').length > 0 && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                 )}
               </button>
               <button 
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all",
                  activeTab === 'profile' ? "border-b-4 border-red-600 text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
               >
                 Company_Profile
               </button>
               <button 
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all",
                  activeTab === 'settings' ? "border-b-4 border-red-600 text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
               >
                 Site_Parameters
               </button>
            </div>
          </div>
          <div className="flex space-x-4 rtl:space-x-reverse">
             {activeTab === 'projects' && (
               <button 
                onClick={() => { setEditingProject(null); setModalOpen(true); }}
                className="bg-red-600 text-white px-6 py-3 rounded-none font-bold uppercase text-xs tracking-widest flex items-center hover:bg-red-700 transition-colors"
                >
                  <Plus size={18} className="mr-2 rtl:ml-2" /> Add Project
                </button>
             )}
            <button 
              onClick={logout}
              className="border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-none font-bold uppercase text-xs tracking-widest flex items-center hover:bg-slate-900 hover:text-white transition-all"
            >
              <LogOut size={18} className="mr-2 rtl:ml-2" /> Logout
            </button>
          </div>
        </div>

        {activeTab === 'projects' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <div key={p.id} className="bg-white border-2 border-slate-200 group relative">
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute top-4 right-4 flex space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="bg-white p-2 text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="bg-white p-2 text-red-600 hover:bg-red-50 transition-colors shadow-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-mono text-red-600 uppercase font-bold tracking-widest">{p.category}</span>
                  <h3 className="text-xl font-display font-black uppercase tracking-tighter text-slate-900 mt-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm mt-4 line-clamp-2">{p.description}</p>
                </div>
              </div>
            ))}
            {projects.length === 0 && !projectsLoading && (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-200 text-slate-400 font-display font-black uppercase text-2xl">
                No Projects Found. Add your first execution.
              </div>
            )}
          </div>
        ) : activeTab === 'quotations' ? (
          <div className="space-y-6">
             {quotations.map((q) => (
               <div key={q.id} className="bg-white border-2 border-slate-200 p-8 flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                       <span className={cn(
                         "px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest",
                         q.status === 'New' ? "bg-red-100 text-red-600" : 
                         q.status === 'Under Review' ? "bg-amber-100 text-amber-600" :
                         "bg-green-100 text-green-600"
                       )}>
                         {q.status}
                       </span>
                       <span className="text-slate-400 font-mono text-[10px]">{new Date(q.createdAt?.seconds * 1000).toLocaleString()}</span>
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-slate-900 mb-2">{q.customer.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 font-medium">
                       <div>System: <span className="text-slate-900 uppercase">{q.system}</span></div>
                       <div>City: <span className="text-slate-900">{q.customer.city}</span></div>
                       <div>Phone: <span className="text-slate-900 font-sans">{q.customer.phone}</span></div>
                       <div>Email: <span className="text-slate-900">{q.customer.email}</span></div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                       {Object.entries(q.details || {}).map(([key, val]: any) => (
                          <div key={key} className="bg-slate-50 border border-slate-100 p-2">
                             <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</span>
                             <span className="text-[10px] font-bold text-slate-900 truncate block">{Array.isArray(val) ? val.join(', ') : val}</span>
                          </div>
                       ))}
                    </div>

                    <div className="mt-4 p-4 bg-slate-50 border border-slate-100 text-slate-600 text-sm italic">
                       {q.customer.notes || "No additional logs found."}
                    </div>
                  </div>
                  <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Execution Status</label>
                           <select 
                             value={q.status}
                             onChange={(e) => updateQuoteStatus(q.id, e.target.value)}
                             className="w-full border-2 border-slate-100 p-2 font-bold bg-slate-50 outline-none text-xs"
                           >
                              <option value="New">New</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Priced">Priced</option>
                              <option value="Completed">Completed</option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Cost (SAR)</label>
                           <div className="relative">
                              <input 
                                type="text"
                                defaultValue={q.price || ''}
                                onBlur={async (e) => {
                                  await updateDoc(doc(db, 'quotations', q.id), { price: e.target.value });
                                }}
                                className="w-full border-2 border-slate-100 p-2 font-black bg-slate-50 outline-none text-xs text-red-600"
                                placeholder="0.00"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-300">SAR</span>
                           </div>
                        </div>

                        <button 
                          onClick={() => {
                            updateQuoteStatus(q.id, 'Priced');
                            alert(`Proposal for ${q.customer.name} status updated to PRICED.`);
                          }}
                          className="w-full bg-slate-900 text-white py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                           <Package size={14} className="mr-2 rtl:ml-2" /> Launch Proposal
                        </button>
                     </div>
                  </div>
               </div>
             ))}
             {quotations.length === 0 && !quotesLoading && (
               <div className="py-20 text-center border-4 border-dashed border-slate-200 text-slate-400 font-display font-black uppercase text-2xl">
                 No active requests detected.
               </div>
             )}
          </div>
        ) : activeTab === 'profile' ? (
          <div className="max-w-4xl mx-auto bg-white border-2 border-slate-200 p-10">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-8">
               <ImageIcon className="text-red-600" size={24} />
               <h2 className="text-3xl font-display font-black uppercase tracking-tighter">إدارة بروفايل الشركة</h2>
            </div>
            
            <form onSubmit={updateSettings} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">رفع ملف البروفايل (PDF)</label>
                        <div className="relative group">
                           <input 
                              type="file" accept=".pdf" onChange={handleCatalogUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           <div className="border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center bg-slate-50 group-hover:border-red-600 transition-colors">
                              {isUploading.catalog ? (
                                <Loader2 className="animate-spin text-red-600 mb-3" size={32} />
                              ) : (
                                <Upload className="text-slate-400 group-hover:text-red-600 mb-3" size={32} />
                              )}
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">
                                 {settings.catalogUrl ? "تم اختيار ملف PDF" : "اختر ملف PDF من الجهاز"}
                              </span>
                              {settings.profileFileSize && (
                                <span className="text-[10px] font-mono text-slate-400 mt-2">الحجم: {settings.profileFileSize}</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">صورة الغلاف الاحترافية</label>
                        <div className="relative group">
                           <input 
                              type="file" accept="image/*" onChange={handleProfileCoverUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           {settings.profileCover ? (
                             <div className="relative aspect-video border-2 border-slate-200 overflow-hidden">
                                <img src={settings.profileCover} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   {isUploading.cover ? <Loader2 className="animate-spin text-white" size={32} /> : <Upload className="text-white" size={32} />}
                                </div>
                             </div>
                           ) : (
                             <div className="border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center bg-slate-50 group-hover:border-red-600 transition-colors aspect-video">
                                {isUploading.cover ? (
                                  <Loader2 className="animate-spin text-red-600 mb-3" size={32} />
                                ) : (
                                  <ImageIcon className="text-slate-400 group-hover:text-red-600 mb-3" size={32} />
                                )}
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">رفع صورة الغلاف</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">وصف مختصر للبروفايل</label>
                        <textarea 
                           rows={4} value={settings.profileDescription}
                           onChange={e => setSettings({...settings, profileDescription: e.target.value})}
                           className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none resize-none text-sm"
                           placeholder="اكتب نبذة مختصرة عن ما يحتويه البروفايل..."
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">عدد الصفحات</label>
                           <input 
                              type="text" value={settings.profilePageCount}
                              onChange={e => setSettings({...settings, profilePageCount: e.target.value})}
                              className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none text-sm"
                              placeholder="مثلاً: 24 صفحة"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">حجم الملف</label>
                           <input 
                              type="text" value={settings.profileFileSize}
                              onChange={e => setSettings({...settings, profileFileSize: e.target.value})}
                              className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none text-sm"
                              placeholder="يتم حسابه تلقائياً..."
                           />
                        </div>
                     </div>
                     <div className="pt-4">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-none">
                           <div className="flex items-start space-x-3 rtl:space-x-reverse">
                              <CheckCircle className="text-red-600 mt-1" size={16} />
                              <p className="text-[10px] font-bold text-red-900 leading-relaxed uppercase tracking-widest">
                                 سيتم عرض هذا القسم تلقائياً في الصفحة الرئيسية للعملاء تحت مسمى "تعرف على الشركة".
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-5 font-black uppercase text-sm tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center justify-center group"
               >
                  <span>تحديث وحفظ بيانات البروفايل</span>
                  <div className="mr-4 w-4 h-[1px] bg-white group-hover:w-8 transition-all"></div>
               </button>
            </form>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white border-2 border-slate-200 p-10">
             <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-8">Global Site Configuration</h2>
             <form onSubmit={updateSettings} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Company Overview (About)</label>
                        <textarea 
                          rows={4} value={settings.aboutOverview} 
                          onChange={e => setSettings({...settings, aboutOverview: e.target.value})}
                          className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none resize-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Company Vision</label>
                        <textarea 
                          rows={2} value={settings.vision} 
                          onChange={e => setSettings({...settings, vision: e.target.value})}
                          className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none resize-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Company Mission</label>
                        <textarea 
                          rows={2} value={settings.mission} 
                          onChange={e => setSettings({...settings, mission: e.target.value})}
                          className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none resize-none text-sm"
                        />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Digital Catalog URL (PDF)</label>
                        <input 
                          type="url" value={settings.catalogUrl} 
                          onChange={e => setSettings({...settings, catalogUrl: e.target.value})}
                          className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none text-sm"
                          placeholder="https://example.com/catalog.pdf"
                        />
                      </div>
                      <div>
                         <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Leadership Team Matrix</label>
                         <p className="text-[10px] text-slate-400 mb-4">Add members in "Name: Role" format, one per line.</p>
                         <textarea 
                          rows={6} 
                          value={settings.teamText || settings.team?.map((m: any) => `${m.name}: ${m.role}`).join('\n')} 
                          onChange={e => {
                            const text = e.target.value;
                            const lines = text.split('\n').filter(l => l.includes(':'));
                            const team = lines.map(l => {
                              const [name, role] = l.split(':').map(s => s.trim());
                              return { name, role };
                            });
                            setSettings({...settings, team, teamText: text});
                          }}
                          className="w-full border-2 border-slate-100 p-4 font-mono font-bold bg-slate-50 focus:border-red-600 outline-none resize-none text-xs"
                          placeholder="John Doe: Technical Director"
                        />
                      </div>
                   </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-950 text-white py-5 font-black uppercase text-sm tracking-widest hover:bg-red-600 transition-all shadow-xl"
                >
                  Synchronize Master Parameters
                </button>
             </form>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl shadow-2xl p-8 md:p-12"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                title="Close"
              >
                <X size={28} />
              </button>

              <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-8">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Project Designation</label>
                  <input 
                    required type="text" value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none transition-colors"
                    placeholder="e.g. Riyadh Central suppression"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Operational Sector</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none transition-colors"
                    >
                      <option value="Firefighting Systems">{t('firefighting')}</option>
                      <option value="HVAC & Cooling">{t('hvac')}</option>
                      <option value="Power Generators">{t('generators')}</option>
                      <option value="Alarm & Control Systems">{t('alarms')}</option>
                      <option value="CCTV & Security Cameras">{t('cctv')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">{t('upload_image')}</label>
                    <div className="flex flex-col space-y-4">
                      {formData.image && (
                        <div className="relative w-full h-32 bg-slate-100 border-2 border-slate-100 overflow-hidden">
                           <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                           <button 
                            type="button" onClick={() => setFormData({...formData, image: ''})}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 shadow-lg hover:bg-slate-900 transition-colors"
                           >
                             <X size={14} />
                           </button>
                        </div>
                      )}
                      <div className="relative group cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center bg-slate-50 group-hover:border-red-600 transition-colors">
                           <Upload className="text-slate-400 group-hover:text-red-600 mb-2" size={24} />
                           <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-red-600">{formData.image ? 'Change File' : 'Select Local Image'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono font-bold uppercase text-slate-300">Or Paste Image URL</label>
                        <input 
                          type="url" value={formData.image.startsWith('data:') ? '' : formData.image} 
                          onChange={e => setFormData({...formData, image: e.target.value})}
                          className="w-full border-2 border-slate-100 p-3 text-xs font-bold bg-slate-50 focus:border-red-600 outline-none transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Execution Period</label>
                     <input 
                        type="text" value={formData.duration} 
                        onChange={e => setFormData({...formData, duration: e.target.value})}
                        className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none transition-colors"
                        placeholder="e.g. 4 Months"
                      />
                  </div>
                  <div>
                     <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Stakeholder</label>
                     <input 
                        type="text" value={formData.client} 
                        onChange={e => setFormData({...formData, client: e.target.value})}
                        className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none transition-colors"
                        placeholder="Client Name"
                      />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Technical Summary</label>
                  <textarea 
                    required rows={4} value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border-2 border-slate-100 p-4 font-bold bg-slate-50 focus:border-red-600 outline-none transition-colors resize-none"
                    placeholder="Project details..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-red-600 text-white py-5 font-black uppercase text-sm tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center"
                >
                  Confirm Execution Logic
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
