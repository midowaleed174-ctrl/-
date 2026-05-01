import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Appointment, Inquiry, Notification } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MessageSquare, Bell, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment': return <Calendar size={20} />;
    case 'inquiry': return <MessageSquare size={20} />;
    default: return <Bell size={20} />;
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries'>('appointments');

  useEffect(() => {
    if (!user) return;

    // Cleanup old records
    const cleanupOld = async () => {
      const now = new Date();
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // 1. Delete past appointments by date
      const qPastDate = query(
        collection(db, 'appointments'), 
        where('userId', '==', user.uid),
        where('date', '<', todayString)
      );
      const snapshotPast = await getDocs(qPastDate);
      snapshotPast.forEach(async (d) => {
        await deleteDoc(doc(db, 'appointments', d.id));
      });

      // 2. Fallback: Delete if createdAt is > 7 days old
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const qFallback = query(
        collection(db, 'appointments'), 
        where('userId', '==', user.uid),
        where('createdAt', '<', sevenDaysAgo)
      );
      const snapshotFallback = await getDocs(qFallback);
      snapshotFallback.forEach(async (d) => {
        await deleteDoc(doc(db, 'appointments', d.id));
      });
    };
    cleanupOld();

    const qApp = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const qInq = query(
      collection(db, 'inquiries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const qNotif = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubApp = onSnapshot(qApp, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });

    const unsubInq = onSnapshot(qInq, (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry)));
    });

    const unsubNotif = onSnapshot(qNotif, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
      setLoading(false);
    });

    return () => {
      unsubApp();
      unsubInq();
      unsubNotif();
    };
  }, [user]);

  const handleCancelAppointment = async (id: string) => {
    if (confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'مؤكد';
      case 'rejected': return 'مرفوض';
      case 'cancelled': return 'ملغي';
      default: return 'قيد الانتظار';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 mb-12">
          <img src={user?.photoURL || undefined} alt={user?.displayName || ''} className="w-24 h-24 rounded-3xl border-4 border-gray-50 shadow-lg" />
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً، {user?.displayName}</h1>
            <p className="text-gray-500 font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-8 py-4 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 shrink-0 ${
                activeTab === 'appointments' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-gray-400 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Calendar size={20} />
              حجوزاتي
              <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === 'appointments' ? 'bg-white/20' : 'bg-gray-100'}`}>{appointments.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-8 py-4 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 shrink-0 ${
                activeTab === 'inquiries' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-gray-400 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              الاستشارات والتنبيهات
              <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === 'inquiries' ? 'bg-white/20' : 'bg-gray-100'}`}>
                {inquiries.length + notifications.filter(n => !n.read).length}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'appointments' ? (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {appointments.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center border border-gray-100">
                  <Calendar size={60} className="mx-auto text-gray-100 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">لا توجد حجوزات حتى الآن</h3>
                  <p className="text-gray-400 mb-8">ابدأ الآن وقم بحجز أول موعد لك في عيادتنا.</p>
                  <a href="/booking" className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary transition-all">احجز الآن</a>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map(app => (
                    <div key={app.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:translate-x-[-4px] transition-transform">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 bg-accent/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
                          <Clock size={32} />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xl font-black text-gray-900 mb-1">{app.serviceTitle}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-bold">
                            <span className="flex items-center gap-1"><Calendar size={14} className="text-primary" /> {app.day}</span>
                            <span className="flex items-center gap-1"><Clock size={14} className="text-primary" /> {app.time}</span>
                            {app.price !== undefined && (
                              <span className="text-primary font-black">
                                {app.price === 0 ? 'حسب الحالة' : `${app.price} ج.م`}
                              </span>
                            )}
                          </div>
                          {app.dentistName && <p className="text-[10px] text-gray-400 font-black mt-1">الطبيب: {app.dentistName}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col gap-2 w-full md:w-auto text-center">
                          <div className={`w-full md:w-auto text-center px-6 py-2 rounded-full text-sm font-black ${getStatusStyle(app.status)}`}>
                            {getStatusText(app.status)}
                          </div>
                          {app.status === 'cancelled' && app.cancellationReason && (
                            <p className="text-[10px] text-red-400 font-bold max-w-[200px]">
                              سبب الإلغاء: {app.cancellationReason}
                            </p>
                          )}
                          {(app.status === 'cancelled' || app.status === 'rejected') && (
                            <button 
                              onClick={() => handleDeleteAppointment(app.id)}
                              className="text-[10px] text-gray-300 hover:text-red-400 font-bold underline mt-1 flex items-center justify-center gap-1"
                            >
                              <Trash2 size={10} /> حذف السجل
                            </button>
                          )}
                        </div>
                        {(app.status === 'pending' || app.status === 'approved') && (
                          <button 
                            onClick={() => handleCancelAppointment(app.id)}
                            className="text-xs text-red-400 font-bold hover:text-red-600 transition-colors underline"
                          >
                            إلغاء الموعد
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inquiries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {inquiries.length === 0 && notifications.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center border border-gray-100">
                  <MessageSquare size={60} className="mx-auto text-gray-100 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">لا توجد استفسارات أو تنبيهات</h3>
                  <p className="text-gray-400 mb-8">هل لديك أي سؤال؟ طاقمنا الطبي جاهز للإجابة عليك.</p>
                  <a href="/consultations" className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary transition-all">اطلب استشارة</a>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Notifications Section */}
                  {notifications.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Bell size={18} className="text-primary" />
                        التنبيهات الأخيرة
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.read && handleMarkNotificationRead(notif.id)}
                            className={`p-6 rounded-[24px] border transition-all cursor-pointer ${notif.read ? 'bg-white border-gray-100 opacity-60' : 'bg-primary/5 border-primary/20 shadow-sm shadow-primary/5'}`}
                          >
                            <div className="flex gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-100 text-gray-400' : 'bg-primary text-white'}`}>
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-black text-gray-900">{notif.title}</h5>
                                  <span className="text-[10px] font-bold text-gray-400">
                                    {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : ''}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-gray-600 mb-0 leading-relaxed">{notif.message}</p>
                              </div>
                              {!notif.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0 animate-pulse" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inquiries Section */}
                  {inquiries.length > 0 && (
                    <div className="space-y-4">
                       <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare size={18} className="text-primary" />
                        الاستشارات السابقة
                      </h4>
                      <div className="space-y-4">
                        {inquiries.map(inq => (
                          <div key={inq.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
                            <div className="flex gap-4 items-start">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                <MessageSquare size={20} />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-black text-gray-900">سؤالك:</h4>
                                  <span className="text-[10px] text-gray-400 font-bold">
                                    {inq.createdAt?.seconds ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : ''}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{inq.message}</p>
                              </div>
                            </div>

                            {inq.response ? (
                              <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl relative">
                                <div className="absolute top-0 right-10 -translate-y-1/2 flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold">
                                  <CheckCircle2 size={12} />
                                  رد العيادة
                                </div>
                                <p className="text-primary font-bold text-sm leading-relaxed">
                                  {inq.response}
                                </p>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 text-xs text-gray-400 font-bold">
                                <Clock size={16} />
                                قيد الدراسة من قبل الفريق الطبي...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
