import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ClinicSettings } from '../types';

export default function Contact() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'clinic'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as ClinicSettings);
      }
    });
  }, []);

  return (
    <div className="py-20 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">تواصل معنا</h1>
          <p className="text-xl text-gray-500">نحن هنا للإجابة على استفساراتكم في أي وقت.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">معلومات الاتصال</h2>
              
              <div className="space-y-6">
                <a href="https://wa.me/201011973704" className="flex items-center gap-6 group p-4 rounded-3xl hover:bg-gray-50 transition-all">
                  <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">واتساب</p>
                    <p className="text-xl font-black text-gray-900 font-mono" dir="ltr">+20 101 197 3704</p>
                  </div>
                </a>

                <a href="mailto:wmido976@gmail.com" className="flex items-center gap-6 group p-4 rounded-3xl hover:bg-gray-50 transition-all">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={32} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">البريد الإلكتروني</p>
                    <p className="text-xl font-black text-gray-900">wmido976@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-6 p-4">
                  <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">العنوان</p>
                    <p className="text-xl font-black text-gray-900">{settings?.address || 'القاهرة، مدينة نصر، شارع الطيران'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="bg-primary rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <h3 className="text-2xl font-black mb-4">ساعات العمل</h3>
              <p className="text-white/80 mb-6">نحن بانتظاركم دائماً في أوقات العمل الرسمية.</p>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="font-bold">{day}</span>
                    <span className="font-mono text-lg">
                      {settings?.workingHours[day]?.closed 
                        ? 'مغلق' 
                        : `${settings?.workingHours[day]?.start || '09:00'} - ${settings?.workingHours[day]?.end || '17:00'}`
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-8">أرسل لنا رسالة</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block pr-4">الاسم</label>
                  <input type="text" placeholder="اسمك الكريم" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block pr-4">رقم الهاتف</label>
                  <input type="tel" placeholder="01x xxxx xxxx" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block pr-4">الموضوع</label>
                <input type="text" placeholder="كيف يمكننا مساعدتك؟" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block pr-4">الرسالة</label>
                <textarea rows={5} placeholder="اكتب رسالتك هنا..." className="w-full p-4 bg-gray-50 border-none rounded-[32px] focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>
              <button
                type="button"
                className="w-full py-5 bg-primary text-white rounded-2xl text-xl font-black shadow-xl shadow-primary/30 hover:bg-secondary transition-all flex items-center justify-center gap-3"
              >
                إرسال الآن 
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
