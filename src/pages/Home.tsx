import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Star, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Home() {
  const services = [
    { title: 'تنظيف الأسنان', desc: 'إزالة الرواسب الجيرية وتلميع الأسنان بأحدث الأجهزة.', icon: '🦷' },
    { title: 'تبييض الأسنان', desc: 'ابتسامة ناصعة البياض في جلسة واحدة فقط.', icon: '✨' },
    { title: 'زراعة الأسنان', desc: 'تعويض الأسنان المفقودة بأجود أنواع الزرعات الألمانية.', icon: '🏥' },
    { title: 'تقويم الأسنان', desc: 'تصحيح اصطفاف الأسنان للحصول على مظهر متناسق.', icon: '📏' },
  ];

  const features = [
    { title: 'تقنيات حديثة', desc: 'نستخدم أحدث الأجهزة الرقمية لضمان أفضل النتائج.', icon: <ShieldCheck className="text-secondary" /> },
    { title: 'خطة علاجية مخصصة', desc: 'كل مريض يحصل على خطة تناسب حالته الصحية وميزانيته.', icon: <CheckCircle2 className="text-secondary" /> },
    { title: 'بيئة آمنة ومعقمة', desc: 'نلتزم بأعلى معايير التعقيم العالمية لسلامتك.', icon: <ShieldCheck className="text-secondary" /> },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-10 pb-20 px-4">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4" />

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/30 text-primary rounded-full text-sm font-bold mb-8">
              <Star size={16} fill="currentColor" />
              أفضل عيادة أسنان في المنطقة
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
              ابتسامتك <span className="text-primary italic">تبدأ</span> من هنا
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl mb-10">
              نحن نؤمن بأن الابتسامة الجميلة هي مفتاح الثقة. احصل على أفضل رعاية صحية لأسنانك بلمسة فنية وخبرة طبية واسعة في اورافيكس.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/booking"
                className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl text-lg font-bold hover:bg-secondary transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 group"
              >
                احجز الآن
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/consultations"
                className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl text-lg font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
              >
                استشارة أونلاين
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="w-full aspect-square rounded-[40px] overflow-hidden bg-gray-100 shadow-2xl relative z-10">
               <img 
                 src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60" 
                 alt="Modern Dental Clinic" 
                 className="w-full h-full object-cover"
               />
            </div>
            {/* Floating Cards */}
            <div className="absolute -right-8 top-1/4 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 animate-bounce-slow">
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-primary">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">مواعيد متاحة</p>
                <p className="text-sm font-bold text-gray-800">احجز اليوم</p>
              </div>
            </div>

            <div className="absolute -left-8 bottom-1/4 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 animate-bounce-slow delay-700">
              <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">دعم مباشر</p>
                <p className="text-sm font-bold text-gray-800">تواصل واتساب</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-6">خدماتنا المتميزة</h2>
            <p className="text-gray-500">نقدم مجموعة متكاملة من خدمات طب وترميم الأسنان لنضمن لك الابتسامة التي تحلم بها.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="text-4xl mb-6">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{service.desc}</p>
                <Link to="/services" className="text-primary font-bold text-xs flex items-center gap-2">
                  اقرأ المزيد 
                  <ArrowLeft size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="w-full rounded-[40px] overflow-hidden shadow-2xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?w=800&auto=format&fit=crop&q=60" 
                  alt="Specialist Doctors" 
                  className="w-full h-full object-cover aspect-video hover:scale-105 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-9xl font-black opacity-10 z-0 pointer-events-none">
                ORAVIX
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-8">لماذا تختار عيادة اورافيكس؟</h2>
              <div className="space-y-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 ring-4 ring-gray-100/50">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 mt-12 text-primary font-bold hover:translate-x-[-8px] transition-transform"
              >
                تواصل معنا الآن 
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-primary rounded-[50px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-[-50%] -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-x-[-30%] translate-y-1/2" />

            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 relative z-10">
              ابتسامة أحلامك على بعد ضغطة زر
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto relative z-10">
              لا تؤجل رعاية أسنانك. احجز موعدك اليوم واحصل على فحص شامل مجاني في زيارتك الأولى.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link
                to="/booking"
                className="w-full sm:w-auto px-12 py-5 bg-white text-primary rounded-2xl text-xl font-black hover:bg-accent transition-all shadow-xl"
              >
                احجز موعد الآن
              </Link>
              <a
                href="https://wa.me/201011973704"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-12 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl text-xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <MessageSquare />
                واتساب
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
