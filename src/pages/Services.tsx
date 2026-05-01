import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {ArrowLeft, CheckCircle2, ChevronRight, Stethoscope} from 'lucide-react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const q = query(collection(db, 'services'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      setLoading(false);
    };
    fetchServices();
  }, []);

  return (
    <div className="py-20 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/5"
          >
            <Stethoscope size={40} />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">خدماتنا التخصصية والأسعار</h1>
          <p className="text-xl text-gray-500 leading-relaxed">نحن نؤمن بالشفافية والوضوح، نوفر لك أرقى الخدمات العلاجية والتجميلية بأفضل الأسعار التنافسية.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group lg:min-h-[300px] flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="bg-primary/5 px-4 py-2 rounded-2xl">
                    <span className="text-xl font-black text-primary font-mono">
                      {service.price === 0 ? 'حسب الحالة' : `${service.price} ج.م`}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{service.description}</p>
                
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8 flex-grow">
                    {service.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100 italic">
                        # {feature}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link
                  to={`/booking?service=${service.id}`}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-2xl group/btn hover:bg-primary hover:text-white transition-all font-bold"
                >
                  حجز هذا الموعد
                  <ArrowLeft size={20} className="group-hover/btn:translate-x-[-4px] transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-20 p-12 bg-primary rounded-[50px] text-white text-center shadow-2xl shadow-primary/20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 italic">جاهز لابتسامتك الجديدة؟</h2>
            <p className="text-primary-foreground/80 mb-10 text-xl font-medium">احجز استشارتك اليوم وابدأ رحلة التغيير نحو الأفضل.</p>
            <Link to="/booking" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-2xl font-black hover:bg-gray-50 transition-all text-xl shadow-xl">
              احجز موعدك الآن
              <ArrowLeft size={24} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
