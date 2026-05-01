import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Phone, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { Service, Appointment, ClinicSettings, Dentist } from '../types';

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const ARABIC_DAYS_MAP: { [key: string]: number } = {
  'الأحد': 0,
  'الاثنين': 1,
  'الثلاثاء': 2,
  'الأربعاء': 3,
  'الخميس': 4,
  'الجمعة': 5,
  'السبت': 6
};

function getNextDateForDay(arabicDay: string): string {
  const targetDay = ARABIC_DAYS_MAP[arabicDay];
  if (targetDay === undefined) return '';
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = (targetDay - currentDay + 7) % 7;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysUntil);
  
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const TIME_SLOTS = [
  '10:00 ص', '11:00 ص', '12:00 م', '01:00 م', '04:00 م', '05:00 م', '06:00 م', '07:00 م', '08:00 م', '09:00 م'
];

export default function Booking() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [offDays, setOffDays] = useState<string[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    serviceId: '',
    dentistId: '',
    day: '',
    time: '',
    patientName: '',
    patientPhone: '',
    notes: '',
  });

  // Fetch Data
  React.useEffect(() => {
    const fetchData = async () => {
      const sSnap = await getDocs(collection(db, 'services'));
      const oSnap = await getDocs(collection(db, 'offDays'));
      const stSnap = await getDocs(collection(db, 'settings'));
      const dSnap = await getDocs(collection(db, 'dentists'));
      
      setServices(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      setDentists(dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dentist)));
      setOffDays(oSnap.docs.map(doc => doc.data().day));
      
      const clinicSettings = stSnap.docs.find(d => d.id === 'clinic')?.data() as ClinicSettings;
      if (clinicSettings) setSettings(clinicSettings);
    };
    fetchData();
  }, []);

  // Fetch Booked Slots for selected day
  React.useEffect(() => {
    if (!formData.day) {
      setBookedSlots([]);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('day', '==', formData.day),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => (doc.data() as Appointment).time);
      setBookedSlots(slots);
    });

    return () => unsubscribe();
  }, [formData.day]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.serviceId || !formData.dentistId || !formData.day || !formData.time || !formData.patientName || !formData.patientPhone) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
       return;
    }

    if (bookedSlots.includes(formData.time)) {
      setError('هذا الموعد قد تم حجزه بالفعل، يرجى اختيار موعد آخر.');
      return;
    }

    if (offDays.includes(formData.day) || (settings?.workingHours[formData.day]?.closed)) {
      setError('نعتذر، العيادة مغلقة في هذا اليوم. يرجى اختيار يوم آخر.');
      return;
    }

    const selectedService = services.find(s => s.id === formData.serviceId);
    const selectedDentist = dentists.find(d => d.id === formData.dentistId);

    setLoading(true);
    setError('');

    try {
      const appointmentDate = getNextDateForDay(formData.day);
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        date: appointmentDate,
        serviceTitle: selectedService?.title || '',
        dentistName: selectedDentist?.name || '',
        price: selectedService?.price || 0,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء حجز الموعد. يرجى المحاولة مرة أخرى.');
      handleFirestoreError(err, OperationType.CREATE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-32 flex flex-col items-center justify-center container mx-auto px-4">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-primary mb-8">
          <User size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-6">يجب تسجيل الدخول للحجز</h1>
        <p className="text-gray-500 mb-10 text-center max-w-md">يرجى تسجيل الدخول باستخدام حساب جوجل لتمكن من حجز موعدك ومتابعة حالتك.</p>
        <button
          onClick={signIn}
          className="px-12 py-4 bg-primary text-white rounded-2xl text-lg font-black hover:bg-secondary transition-all shadow-xl shadow-primary/20"
        >
          تسجيل الدخول بجوجل
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-40 flex flex-col items-center justify-center container mx-auto px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30"
        >
          <CheckCircle2 size={50} />
        </motion.div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">تم إرسال طلب الحجز بنجاح!</h1>
        <p className="text-gray-500 text-xl">سيتم التواصل معك لتأكيد الموعد قريباً.</p>
        <p className="text-gray-400 mt-10">سيتم توجيهك إلى حسابك الآن...</p>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">احجز موعدك الآن</h1>
          <p className="text-gray-500">اختر الخدمة والوقت المناسب لك</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Service Info */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <ClipboardList className="text-primary" />
              تفاصيل الموعد
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">اختر الخدمة</label>
              <select
                required
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary transition-all"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              >
                <option value="">-- اختر الخدمة --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.price === 0 ? 'حسب الحالة' : `${s.price} ج.م`})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">اختر الطبيب المعالج</label>
              <select
                required
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary transition-all"
                value={formData.dentistId}
                onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
              >
                <option value="">-- اختر الطبيب --</option>
                {dentists.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">اختر اليوم</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  required
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary transition-all appearance-none"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value, time: '' })}
                >
                  <option value="">-- اختر اليوم --</option>
                  {DAYS_OF_WEEK.map(day => (
                    <option 
                      key={day} 
                      value={day}
                      disabled={offDays.includes(day) || settings?.workingHours[day]?.closed}
                    >
                      {day} {offDays.includes(day) || settings?.workingHours[day]?.closed ? '(مغلق)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">الوقت المفضل</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(slot => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`p-3 rounded-xl text-sm font-bold transition-all border-2 ${
                        formData.time === slot 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                        : isBooked
                        ? 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-100 text-gray-600 hover:border-primary/30'
                      }`}
                    >
                      {slot}
                      {isBooked && <span className="block text-[8px] mt-1 font-black underline">محجوز</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <User className="text-primary" />
              بيانات المريض
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">الاسم بالكامل</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="الاسم الثلاثي"
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary transition-all"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  placeholder="01234567890"
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary transition-all"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">ملاحظات إضافية (اختياري)</label>
              <textarea
                rows={4}
                placeholder="أخبرنا عن حالتك أو أي توضيحات آخرى..."
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary transition-all resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 text-sm font-bold">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 bg-primary text-white rounded-2xl text-xl font-black shadow-xl shadow-primary/30 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-secondary active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحجز...
                </div>
              ) : 'تأكيد الحجز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
