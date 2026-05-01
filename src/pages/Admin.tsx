import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, deleteDoc, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Appointment, Inquiry, UserProfile, Service, Dentist, OffDay, ClinicSettings, Notification } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MessageSquare, Users, CheckCircle2, XCircle, Send, LogOut, Shield, ShieldCheck, DollarSign, Settings, Plus, Trash2, Edit3, Save, Clock, AlertCircle, Camera, Bell } from 'lucide-react';

export default function Admin() {
  const { profile, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appUsers, setAppUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries' | 'users' | 'services' | 'doctors' | 'schedule' | 'settings'>('appointments');
  const [responseMsg, setResponseMsg] = useState<{ [key: string]: string }>({});

  // Service Edit State
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ title: '', description: '', price: 0, features: [] as string[] });
  const [newFeature, setNewFeature] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Doctor Management State
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '', experience: '', photo: '' });

  // Cancellation State
  const [cancellingAppId, setCancellingAppId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Off-Day State
  const [isAddingOffDay, setIsAddingOffDay] = useState(false);
  const [newOffDay, setNewOffDay] = useState({ day: '', reason: '' });

  // Clinic Settings Edit State
  const [editingAddress, setEditingAddress] = useState('');
  const [editingHours, setEditingHours] = useState<ClinicSettings['workingHours']>({});
  const [editingTemplates, setEditingTemplates] = useState<ClinicSettings['templates']>({
    appointmentConfirmed: '',
    appointmentPostponed: '',
    appointmentCancelled: '',
    inquiryResponded: ''
  });

  // Appointment Edit State
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [tempDay, setTempDay] = useState('');
  const [tempTime, setTempTime] = useState('');

  const OWNER_EMAIL = 'wmido976@gmail.com';
  const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحجز نهائياً من السجلات؟')) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  useEffect(() => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) return;

    // Automatic Cleanup Logic
    const cleanupOldAppointments = async () => {
      const now = new Date();
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // 1. Delete if date is past
      const qPastDate = query(collection(db, 'appointments'), where('date', '<', todayString));
      const snapshotPast = await getDocs(qPastDate);
      snapshotPast.forEach(async (document) => {
        await deleteDoc(doc(db, 'appointments', document.id));
      });

      // 2. Fallback: Delete if createdAt is > 7 days old (for legacy or untracked dates)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const qFallback = query(collection(db, 'appointments'), where('createdAt', '<', sevenDaysAgo));
      const snapshotFallback = await getDocs(qFallback);
      snapshotFallback.forEach(async (document) => {
        await deleteDoc(doc(db, 'appointments', document.id));
      });
    };

    cleanupOldAppointments();

    const unsubApp = onSnapshot(query(collection(db, 'appointments'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });

    const unsubInq = onSnapshot(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAppUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    });

    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('order', 'asc')), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    const unsubDentists = onSnapshot(query(collection(db, 'dentists'), orderBy('name', 'asc')), (snapshot) => {
      setDentists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dentist)));
    });

    const unsubOffDays = onSnapshot(query(collection(db, 'offDays'), orderBy('day', 'asc')), (snapshot) => {
      setOffDays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OffDay)));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'clinic'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ClinicSettings;
        setSettings(data);
        setEditingAddress(data.address);
        setEditingHours(data.workingHours);
        setEditingTemplates(data.templates || {
          appointmentConfirmed: '',
          appointmentPostponed: '',
          appointmentCancelled: '',
          inquiryResponded: ''
        });
      }
      setLoading(false);
    });

    return () => {
      unsubApp();
      unsubInq();
      unsubUsers();
      unsubServices();
      unsubDentists();
      unsubOffDays();
      unsubSettings();
    };
  }, [profile]);

  const sendNotification = async (userId: string, title: string, message: string, type: 'appointment' | 'inquiry' | 'system' = 'system') => {
    await setDoc(doc(collection(db, 'notifications')), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
  };

  const handleUpdateAppointment = async (id: string, status: 'approved' | 'rejected' | 'cancelled') => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    if (status === 'cancelled') {
      if (!cancellationReason) {
        setCancellingAppId(id);
        return;
      }
      await updateDoc(doc(db, 'appointments', id), { 
        status: 'cancelled',
        cancellationReason: cancellationReason
      });

      // Send notification
      const msg = settings?.templates.appointmentCancelled?.replace('{service}', app.serviceTitle || '')?.replace('{reason}', cancellationReason) || `تم إلغاء موعدك لخدمة ${app.serviceTitle}. السبب: ${cancellationReason}`;
      await sendNotification(app.userId, 'تم إلغاء موعدك', msg, 'appointment');

      setCancellingAppId(null);
      setCancellationReason('');
    } else {
      await updateDoc(doc(db, 'appointments', id), { status });
      
      if (status === 'approved') {
        const msg = settings?.templates.appointmentConfirmed?.replace('{service}', app.serviceTitle || '')?.replace('{time}', `${app.day} ${app.time}`) || `تم تأكيد موعدك لخدمة ${app.serviceTitle} في يوم ${app.day} الساعة ${app.time}`;
        await sendNotification(app.userId, 'تم تأكيد موعدك', msg, 'appointment');
      }
    }
  };

  const handleSaveAppointmentEdit = async (appId: string) => {
    const app = appointments.find(a => a.id === appId);
    if (!app) return;

    await updateDoc(doc(db, 'appointments', appId), {
      day: tempDay,
      time: tempTime
    });

    // Send notification for postponement/change
    const msg = settings?.templates.appointmentPostponed?.replace('{service}', app.serviceTitle || '')?.replace('{time}', `${tempDay} ${tempTime}`) || `تم التعديل على موعدك لخدمة ${app.serviceTitle} ليصبح يوم ${tempDay} الساعة ${tempTime}`;
    await sendNotification(app.userId, 'تم تعديل موعدك', msg, 'appointment');

    setEditingAppId(null);
  };

  const handleAddService = async () => {
    if (!newService.title || (newService.price < 0)) return;
    const serviceRef = doc(collection(db, 'services'));
    await setDoc(serviceRef, {
      ...newService,
      order: services.length,
      createdAt: serverTimestamp()
    });
    setNewService({ title: '', description: '', price: 0, features: [] });
    setIsAddingService(false);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      await deleteDoc(doc(db, 'services', id));
    }
  };

  const handleUpdateServicePrice = async (serviceId: string, price: number) => {
    await updateDoc(doc(db, 'services', serviceId), { price });
    setEditingServiceId(null);
  };

  const seedDefaultServices = async () => {
    const defaults = [
      { title: 'تنظيف أسنان', description: 'تنظيف شامل للأسنان وإزالة التصبغات والترسبات الجيرية.', price: 500, order: 0 },
      { title: 'تبييض أسنان', description: 'تبييض احترافي باستخدام أحدث الليزر والتقنيات العالمية.', price: 2500, order: 1 },
      { title: 'زراعة أسنان', description: 'تعويض الأسنان المفقودة بأفضل الزرعات الألمانية والسويسرية.', price: 8000, order: 2 },
      { title: 'تقويم أسنان', description: 'تصحيح اصطفاف الأسنان باستخدام تقنيات التقويم المختلفة.', price: 0, order: 3 }, // 0 means custom
      { title: 'خلع ضرس', description: 'خلع آمن وبدون ألم باستخدام أحدث تقنيات تخدير الأسنان.', price: 400, order: 4 },
    ];

    for (const s of defaults) {
      await setDoc(doc(collection(db, 'services')), { ...s, createdAt: serverTimestamp() });
    }
  };

  const seedInitialSettings = async () => {
    const defaultHours: any = {};
    DAYS_OF_WEEK.forEach(day => {
      defaultHours[day] = { start: '09:00', end: '17:00', closed: day === 'الجمعة' };
    });

    await setDoc(doc(db, 'settings', 'clinic'), {
      address: 'القاهرة، مدينة نصر، شارع الطيران',
      workingHours: defaultHours,
      templates: {
        appointmentConfirmed: 'تم تأكيد موعدكم لخدمة {service} في يوم {time}. نحن بانتظاركم.',
        appointmentPostponed: 'نظراً لظروف طارئة، تم تعديل موعدكم لخدمة {service} ليصبح {time}. نعتذر عن الإزعاج.',
        appointmentCancelled: 'نعتذر، تم إلغاء موعدكم لخدمة {service}. السبب: {reason}.',
        inquiryResponded: 'تم الرد على استفساركم من قبل الفريق الطبي. يرجى مراجعة حسابكم.'
      }
    });
    alert('تم ضبط الإعدادات الافتراضية بنجاح');
  };

  const handleAddOffDay = async () => {
    if (!newOffDay.day) return;
    await setDoc(doc(collection(db, 'offDays')), { ...newOffDay, createdAt: serverTimestamp() });
    setNewOffDay({ day: '', reason: '' });
    setIsAddingOffDay(false);
  };

  const handleDeleteOffDay = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا اليوم من قائمة الإجازات؟')) {
      await deleteDoc(doc(db, 'offDays', id));
    }
  };

  const handleSaveSettings = async () => {
    await setDoc(doc(db, 'settings', 'clinic'), {
      address: editingAddress,
      workingHours: editingHours,
      templates: editingTemplates
    });
    alert('تم حفظ الإعدادات بنجاح');
  };

  const totalProfits = appointments
    .filter(app => app.status === 'approved')
    .reduce((sum, app) => sum + (app.price || 0), 0);

  const handleRespondToInquiry = async (id: string) => {
    const response = responseMsg[id];
    if (!response) return;

    const inq = inquiries.find(i => i.id === id);
    if (!inq) return;

    await updateDoc(doc(db, 'inquiries', id), {
      response,
      respondedAt: serverTimestamp()
    });

    // Send notification
    const msg = settings?.templates.inquiryResponded || 'تم الرد على استفسارك من قبل إدارة العيادة.';
    await sendNotification(inq.userId, 'رد جديد على استفسارك', msg, 'inquiry');

    setResponseMsg({ ...responseMsg, [id]: '' });
  };

  const toggleAdmin = async (userToUpdate: UserProfile) => {
    if (userToUpdate.email === OWNER_EMAIL) return; // Main owner is protected
    
    if (userToUpdate.role === 'owner') {
       alert('لا يمكن تغيير رتبة مالك العيادة بعد الترقية.');
       return;
    }

    let nextRole: 'admin' | 'owner' = 'admin';
    if (userToUpdate.role === 'admin') nextRole = 'owner';

    const confirmMsg = nextRole === 'owner' 
      ? `هل أنت متأكد من ترقية ${userToUpdate.displayName} ليكون مالكاً؟ لا يمكن التراجع عن هذا القرار لاحقاً.`
      : `هل أنت متأكد من ترقية ${userToUpdate.displayName} ليكون مديراً؟`;

    if (!confirm(confirmMsg)) return;

    await updateDoc(doc(db, 'users', userToUpdate.uid), { role: nextRole });
    await setDoc(doc(db, 'admins', userToUpdate.uid), {
      email: userToUpdate.email,
      role: nextRole,
      addedAt: serverTimestamp()
    });
  };

  const handleDemoteAdmin = async (userToUpdate: UserProfile) => {
    if (userToUpdate.role === 'owner') return;
    if (confirm(`هل أنت متأكد من سحب صلاحيات الإدارة من ${userToUpdate.displayName}؟`)) {
      await updateDoc(doc(db, 'users', userToUpdate.uid), { role: 'user' });
      await deleteDoc(doc(db, 'admins', userToUpdate.uid));
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.photo) {
      alert('يجب ملء اسم الطبيب وإضافة صورته الشخصية.');
      return;
    }
    await setDoc(doc(collection(db, 'dentists')), { ...newDoctor, createdAt: serverTimestamp() });
    setNewDoctor({ name: '', specialization: '', experience: '', photo: '' });
    setIsAddingDoctor(false);
  };

  const handleDeleteDoctor = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب من النظام؟')) {
      await deleteDoc(doc(db, 'dentists', id));
    }
  };

  const handleDoctorPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDoctor({ ...newDoctor, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">جاري تحميل بيانات لوحة التحكم...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">لوحة تحكم المدير</h1>
            <p className="text-gray-500 font-bold">مرحباً {profile?.displayName}، أنت تدير عيادة اورافيكس الآن.</p>
          </div>
          <button onClick={logout} className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center gap-2">
            <LogOut size={18} />
            تسجيل خروج
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">الحجوزات</p>
              <p className="text-2xl font-black text-gray-900">{appointments.length}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-accent/20 text-primary rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">الاستفسارات</p>
              <p className="text-2xl font-black text-gray-900">{inquiries.length}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">المستخدمين</p>
              <p className="text-2xl font-black text-gray-900">{appUsers.length}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-green-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">إجمالي الأرباح</p>
              <p className="text-xl font-black text-green-600 font-mono">{totalProfits} ج.م</p>
            </div>
          </div>
        </div>

            <div className="flex bg-white p-2 rounded-[24px] shadow-sm border border-gray-100 mb-10 w-full md:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'appointments' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            إدارة الحجوزات
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'inquiries' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            الرد على الاستفسارات
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'services' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            الخدمات والأسعار
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'doctors' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            إدارة الأطباء
          </button>
          {profile?.email === OWNER_EMAIL && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400'}`}
            >
              إدارة الصلاحيات
            </button>
          )}
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'schedule' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            جدول الإجازات
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            إعدادات العيادة
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'appointments' && (
            <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {appointments.map(app => (
                <div key={app.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group">
                  <div className="flex gap-6 items-center flex-grow w-full">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Calendar size={28} className="text-gray-400" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xl font-black text-gray-900">{app.patientName} | {app.serviceTitle || app.serviceId}</h4>
                        <span className="text-primary font-black bg-primary/5 px-3 py-1 rounded-lg text-sm">
                          {app.price === 0 ? 'حسب الحالة' : `${app.price || 0} ج.م`}
                        </span>
                      </div>
                      <p className="text-xs text-primary font-bold mb-3">البريد: {app.userEmail}</p>
                      
                      {editingAppId === app.id ? (
                        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-2xl">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">اليوم</label>
                            <select className="bg-white border-none rounded-lg font-bold text-sm px-3 py-1" value={tempDay} onChange={e => setTempDay(e.target.value)}>
                              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">الوقت</label>
                            <input type="time" className="bg-white border-none rounded-lg font-bold text-sm px-3 py-1" value={tempTime} onChange={e => setTempTime(e.target.value)} />
                          </div>
                          <div className="flex gap-2 mr-auto">
                             <button onClick={() => handleSaveAppointmentEdit(app.id)} className="p-2 bg-primary text-white rounded-lg hover:bg-secondary"><Save size={18} /></button>
                             <button onClick={() => setEditingAppId(null)} className="p-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300"><XCircle size={18} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 items-center">
                          <span className="flex items-center gap-1">📅 {app.day}</span>
                          <span className="flex items-center gap-1">⏰ {app.time}</span>
                          <span className="flex items-center gap-1">📞 {app.patientPhone}</span>
                          <button 
                            onClick={() => {
                              setEditingAppId(app.id);
                              setTempDay(app.day);
                              setTempTime(app.time);
                            }}
                            className="p-1 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                      
                      {app.notes && <p className="mt-4 text-sm text-gray-400 italic">ملاحظات: {app.notes}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    {app.status === 'pending' ? (
                      <>
                        <button onClick={() => handleUpdateAppointment(app.id, 'approved')} className="flex-1 md:flex-none px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 text-sm">
                          <CheckCircle2 size={18} /> تأكيد
                        </button>
                        <button onClick={() => handleUpdateAppointment(app.id, 'rejected')} className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all text-sm">
                          <XCircle size={18} /> رفض
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className={`w-full text-center px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 text-sm ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          app.status === 'cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                        }`}>
                          {app.status === 'approved' ? 'موعد مؤكد' : app.status === 'cancelled' ? 'ملغي' : 'تم الرفض'}
                        </div>
                        {app.status === 'approved' && (
                          <button 
                            onClick={() => setCancellingAppId(app.id)}
                            className="text-[10px] text-red-400 font-bold hover:text-red-500 underline text-center"
                          >
                            إلغاء الموعد المؤكد
                          </button>
                        )}
                        {app.cancellationReason && (
                          <p className="text-[10px] text-red-400 font-bold text-center max-w-[150px]">السبب: {app.cancellationReason}</p>
                        )}
                        <button 
                          onClick={() => handleDeleteAppointment(app.id)}
                          className="mt-2 p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-lg flex items-center justify-center gap-1 text-[10px] font-black"
                        >
                          <Trash2 size={12} /> حذف من السجلات
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cancellation Reason Modal Overlay */}
                  <AnimatePresence>
                    {cancellingAppId === app.id && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                      >
                        <motion.div 
                          initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                          className="bg-white p-8 rounded-[32px] w-full max-w-md space-y-6 shadow-2xl"
                        >
                          <div className="flex items-center gap-3 text-red-500">
                             <AlertCircle size={28} />
                             <h3 className="text-2xl font-black">إلغاء الموعد</h3>
                          </div>
                          <p className="font-bold text-gray-500">يرجى كتابة سبب الإلغاء ليصل للمريض:</p>
                          <textarea 
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl h-32 focus:ring-2 focus:ring-red-500 transition-all font-bold"
                            placeholder="مثال: نعتذر، هناك ظروف طارئة بالعيادة في هذا اليوم..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                          />
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleUpdateAppointment(app.id, 'cancelled')}
                              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all"
                            >
                              إلغاء الموعد نهائياً
                            </button>
                            <button 
                              onClick={() => { setCancellingAppId(null); setCancellationReason(''); }}
                              className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black"
                            >
                              تراجع
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-gray-900">إدارة الخدمات والأسعار</h3>
                <button 
                  onClick={() => setIsAddingService(!isAddingService)} 
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20"
                >
                  <Plus size={18} /> إضافة خدمة جديدة
                </button>
              </div>

              {isAddingService && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-dashed border-primary/20 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input 
                      className="p-4 bg-gray-50 border-none rounded-xl font-bold" 
                      placeholder="اسم الخدمة" 
                      value={newService.title}
                      onChange={e => setNewService({...newService, title: e.target.value})}
                    />
                    <input 
                      className="p-4 bg-gray-50 border-none rounded-xl font-bold" 
                      placeholder="وصف الخدمة" 
                      value={newService.description}
                      onChange={e => setNewService({...newService, description: e.target.value})}
                    />
                    <input 
                      type="number"
                      className="p-4 bg-gray-50 border-none rounded-xl font-bold" 
                      placeholder="السعر (ج.م) - اكتب 0 إذا كان السعر حسب الحالة" 
                      value={newService.price}
                      onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-400">مميزات الخدمة</label>
                    <div className="flex gap-2">
                       <input 
                        className="flex-grow p-4 bg-gray-50 border-none rounded-xl font-bold text-sm" 
                        placeholder="إلى المميزات (مثلاً: بدون ألم)" 
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (setNewService({...newService, features: [...newService.features, newFeature]}), setNewFeature(''))}
                      />
                      <button 
                        onClick={() => {
                          if (newFeature) {
                            setNewService({...newService, features: [...newService.features, newFeature]});
                            setNewFeature('');
                          }
                        }}
                        className="px-6 bg-gray-100 rounded-xl font-bold"
                      >
                        إضافة
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newService.features.map((f, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold flex items-center gap-2">
                          {f}
                          <button onClick={() => setNewService({...newService, features: newService.features.filter((_, idx) => idx !== i)})}><XCircle size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleAddService} className="px-8 py-3 bg-primary text-white rounded-xl font-black">حفظ الخدمة</button>
                    <button onClick={() => setIsAddingService(false)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black">إلغاء</button>
                  </div>
                </div>
              )}

              {services.length === 0 && (
                <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                  <p className="text-gray-400 mb-6 font-bold">لا يوجد خدمات حالياً، هل تود استعادة الخدمات الافتراضية؟</p>
                  <button onClick={seedDefaultServices} className="px-8 py-4 bg-primary text-white rounded-2xl font-black">استعادة الخدمات الافتراضية</button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {services.map(service => (
                  <div key={service.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-gray-900 mb-1">{service.title}</h4>
                      <p className="text-sm font-bold text-gray-400 mb-2">{service.description}</p>
                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[10px] font-bold border border-gray-100">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      {editingServiceId === service.id ? (
                        <div className="flex items-center gap-2">
                           <input 
                             type="number"
                             className="w-24 p-2 bg-gray-50 rounded-lg text-center font-mono font-bold"
                             defaultValue={service.price}
                             onBlur={(e) => handleUpdateServicePrice(service.id, Number(e.target.value))}
                             autoFocus
                           />
                           <span className="text-xs font-black text-gray-400">ج.م</span>
                        </div>
                      ) : (
                        <div onClick={() => setEditingServiceId(service.id)} className="flex items-center gap-2 cursor-pointer group">
                          <span className="text-lg font-black text-primary font-mono">{service.price} ج.م</span>
                          <Edit3 size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      )}
                      <button onClick={() => handleDeleteService(service.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'inquiries' && (
            <motion.div key="inqs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {inquiries.map(inq => (
                <div key={inq.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900">{inq.userEmail}</h4>
                        <p className="text-gray-500 mt-2 leading-relaxed">{inq.message}</p>
                        {inq.imageUrl && (
                          <a href={inq.imageUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-xs font-bold text-primary underline">مشاهدة الصورة المرفقة</a>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{new Date(inq.createdAt?.seconds * 1000).toLocaleString('ar-EG')}</span>
                  </div>

                  {inq.response ? (
                    <div className="p-6 bg-green-50 text-green-700 rounded-2xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2 font-black text-sm">
                        <ShieldCheck size={16} /> رد العيادة:
                      </div>
                      <p className="font-medium">{inq.response}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <textarea
                        placeholder="اكتب ردك هنا..."
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all resize-none font-bold"
                        value={responseMsg[inq.id] || ''}
                        onChange={(e) => setResponseMsg({ ...responseMsg, [inq.id]: e.target.value })}
                      />
                      <button
                        onClick={() => handleRespondToInquiry(inq.id)}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-black w-fit flex items-center gap-2 hover:bg-secondary transition-all"
                      >
                        <Send size={18} />
                        إرسال الرد للعميل
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'users' && profile?.email === OWNER_EMAIL && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 p-6">
                    <tr>
                      <th className="p-6 text-sm font-black text-gray-400">المستخدم</th>
                      <th className="p-6 text-sm font-black text-gray-400 text-center">الصلاحية</th>
                      <th className="p-6 text-sm font-black text-gray-400 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appUsers.map(user => (
                      <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={user.photoURL || undefined} className="w-10 h-10 rounded-full border border-gray-100" />
                            <div>
                              <p className="font-black text-gray-900">{user.displayName}</p>
                              <p className="text-xs text-gray-500 font-bold">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'owner' ? 'bg-purple-100 text-purple-700' : 
                            user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {user.role === 'owner' ? 'المالك الرئيسي' : user.role === 'admin' ? 'مدير نظام' : 'مستخدم عادي'}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          {user.email !== OWNER_EMAIL && (
                            <div className="flex items-center justify-center gap-6">
                              <div className="flex items-center gap-3">
                                <button
                                  disabled={user.role === 'owner'}
                                  onClick={() => toggleAdmin(user)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${
                                    user.role === 'owner' ? 'bg-purple-600' : user.role === 'admin' ? 'bg-primary' : 'bg-gray-200'
                                  } ${user.role === 'owner' ? 'opacity-100' : 'cursor-pointer'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      user.role === 'owner' ? 'translate-x-1' : user.role === 'admin' ? 'translate-x-1' : 'translate-x-6'
                                    }`}
                                  />
                                </button>
                                <span className="text-sm font-bold text-gray-700">ترقية</span>
                              </div>
                              
                              {user.role === 'admin' && (
                                <button 
                                  onClick={() => handleDemoteAdmin(user)}
                                  className="text-xs text-red-400 font-bold hover:text-red-600 underline"
                                >
                                  سحب الصلاحية
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'doctors' && (
            <motion.div key="doctors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900">إدارة الطاقم الطبي</h3>
                <button onClick={() => setIsAddingDoctor(true)} className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2">
                  <Plus size={18} /> إضافة طبيب
                </button>
              </div>

              {isAddingDoctor && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-dashed border-primary/20 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input className="p-4 bg-gray-50 border-none rounded-xl font-bold" placeholder="اسم الطبيب" value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} />
                    <input className="p-4 bg-gray-50 border-none rounded-xl font-bold" placeholder="التخصص" value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} />
                    <input className="p-4 bg-gray-50 border-none rounded-xl font-bold" placeholder="الخبرة" value={newDoctor.experience} onChange={e => setNewDoctor({...newDoctor, experience: e.target.value})} />
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-black text-gray-400 mr-2">صورة الطبيب (إجباري)</label>
                       <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all border-none">
                          <Camera size={18} />
                          {newDoctor.photo ? 'تغيير الصورة' : 'اختر صورة'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleDoctorPhotoChange} />
                        </label>
                        {newDoctor.photo && <img src={newDoctor.photo} className="w-12 h-12 rounded-xl object-cover" />}
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleAddDoctor} className="px-8 py-3 bg-primary text-white rounded-xl font-black">حفظ الطبيب</button>
                    <button onClick={() => setIsAddingDoctor(false)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black">إلغاء</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dentists.map(dentist => (
                  <div key={dentist.id} className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={dentist.photo} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                      <div>
                        <h4 className="font-black text-gray-900 text-lg">{dentist.name}</h4>
                        <p className="text-xs text-primary font-bold italic">{dentist.specialization}</p>
                        <p className="text-xs text-gray-400 font-bold mt-1">الخبرة: {dentist.experience}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteDoctor(dentist.id)} className="p-3 text-red-300 hover:text-red-500 transition-colors bg-red-50 rounded-xl">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900">تأجيل أيام العمل / الإجازات</h3>
                <button onClick={() => setIsAddingOffDay(true)} className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center gap-2">
                  <Calendar size={18} /> إغلاق يوم معين
                </button>
              </div>

              {isAddingOffDay && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-dashed border-red-200 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <select className="p-4 bg-gray-50 border-none rounded-xl font-bold" value={newOffDay.day} onChange={e => setNewOffDay({...newOffDay, day: e.target.value})}>
                      <option value="">-- اختر اليوم --</option>
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input className="p-4 bg-gray-50 border-none rounded-xl font-bold" placeholder="السبب (اختياري)" value={newOffDay.reason} onChange={e => setNewOffDay({...newOffDay, reason: e.target.value})} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleAddOffDay} className="px-8 py-3 bg-red-500 text-white rounded-xl font-black">حفظ الموعد كإجازة</button>
                    <button onClick={() => setIsAddingOffDay(false)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black">إلغاء</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {offDays.map(off => (
                  <div key={off.id} className="bg-white p-6 rounded-[32px] border border-red-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-black">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900">{off.day}</h4>
                        <p className="text-xs text-red-400 font-bold">{off.reason || 'إجازة أسبوعية / تأجيل عمل'}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteOffDay(off.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div>
                   <h3 className="text-2xl font-black text-gray-900">البيانات الأساسية للعيادة</h3>
                   <p className="text-gray-400 font-medium">هذه البيانات تظهر للمرضى في صفحة تواصل معنا والحجز.</p>
                </div>
                <div className="flex gap-4">
                  {!settings && (
                    <button onClick={seedInitialSettings} className="px-6 py-3 bg-accent text-primary rounded-2xl font-black hover:bg-accent/80 transition-all text-sm">
                      ضبط الإعدادات الافتراضية
                    </button>
                  )}
                  <button onClick={handleSaveSettings} className="px-10 py-3 bg-primary text-white rounded-2xl font-black hover:bg-secondary transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                    <Save size={18} /> حفظ كافة التغييرات
                  </button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={24} className="text-primary" />
                    عنوان العيادة
                  </h4>
                  <input 
                    className="w-full p-6 bg-gray-50 border-none rounded-2xl font-bold text-gray-700" 
                    placeholder="مثلاً: القاهرة، التجمع الخامس، شارع التسعين" 
                    value={editingAddress} 
                    onChange={e => setEditingAddress(e.target.value)} 
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Clock size={24} className="text-primary" />
                    مواعيد العمل الأسبوعية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between gap-4">
                        <span className="font-black text-gray-700 w-20">{day}</span>
                        <div className="flex items-center gap-2 flex-grow justify-center">
                          <input 
                            type="time" 
                            className="bg-white border-none rounded-lg p-2 text-xs font-bold" 
                            value={editingHours[day]?.start || '09:00'} 
                            onChange={e => setEditingHours({...editingHours, [day]: {...(editingHours[day] || {start:'09:00', end:'17:00', closed:false}), start: e.target.value}})}
                          />
                          <span className="text-gray-400 font-bold">-</span>
                          <input 
                            type="time" 
                            className="bg-white border-none rounded-lg p-2 text-xs font-bold" 
                            value={editingHours[day]?.end || '17:00'} 
                            onChange={e => setEditingHours({...editingHours, [day]: {...(editingHours[day] || {start:'09:00', end:'17:00', closed:false}), end: e.target.value}})}
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded text-primary" 
                            checked={editingHours[day]?.closed || false} 
                            onChange={e => setEditingHours({...editingHours, [day]: {...(editingHours[day] || {start:'09:00', end:'17:00', closed:false}), closed: e.target.checked}})}
                           />
                           <span className="text-xs font-bold text-gray-500">مغلق</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Bell size={24} className="text-primary" />
                    قوالب الإشعارات (تخصيص الرسائل)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { key: 'appointmentConfirmed', label: 'تأكيد الحجز', help: '{service} لاسم الخدمة، {time} للوقت' },
                      { key: 'appointmentPostponed', label: 'تعديل/تأجيل موعد', help: '{service} للاسم، {time} للوقت الجديد' },
                      { key: 'appointmentCancelled', label: 'إلغاء موعد', help: '{service} للاسم، {reason} للسبب' },
                      { key: 'inquiryResponded', label: 'الرد على استفسار', help: 'رسالة تنبيه بوجود رد جديد' },
                    ].map(tpl => (
                      <div key={tpl.key} className="space-y-2">
                        <label className="text-sm font-black text-gray-700">{tpl.label}</label>
                        <p className="text-[10px] text-gray-400 font-bold mb-2">استخدم: {tpl.help}</p>
                        <textarea
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold h-24 focus:ring-2 focus:ring-primary transition-all"
                          value={(editingTemplates as any)[tpl.key]}
                          onChange={e => setEditingTemplates({...editingTemplates, [tpl.key]: e.target.value})}
                          placeholder="اكتب قالب الرسالة هنا..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-secondary transition-all shadow-xl shadow-primary/20"
                >
                  حفظ كافة التعديلات
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
