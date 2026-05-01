import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Facebook, Twitter, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                O
              </div>
              <span className="text-2xl font-extrabold text-primary tracking-tight">اورافيكس</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              نحن هنا لنعتني بابتسامتك. أورا فيكس هي عيادة أسنان مودرن تقدم أفضل خدمات تجميل وزراعة الأسنان بأحدث التقنيات العالمية.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-4">
              <li><Link to="/services" className="text-gray-500 hover:text-primary text-sm transition-colors">خدماتنا</Link></li>
              <li><Link to="/dentists" className="text-gray-500 hover:text-primary text-sm transition-colors">طاقم الأطباء</Link></li>
              <li><Link to="/booking" className="text-gray-500 hover:text-primary text-sm transition-colors">احجز موعداً</Link></li>
              <li><Link to="/consultations" className="text-gray-500 hover:text-primary text-sm transition-colors">استشارة أونلاين</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">اتصل بنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Phone size={18} className="text-primary" />
                <span>+20 101 197 3704</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Mail size={18} className="text-primary" />
                <span>wmido976@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <MapPin size={18} className="text-primary" />
                <span>القاهرة، مصر</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">ساعات العمل</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex justify-between">
                <span>السبت - الخميس</span>
                <span className="font-medium text-gray-900 text-left">10:00 ص - 10:00 م</span>
              </li>
              <li className="flex justify-between">
                <span>الجمعة</span>
                <span className="font-medium text-gray-900 text-left">مغلق</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs text-center md:text-right">
            © {new Date().getFullYear()} اورافيكس. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 text-xs hover:text-primary transition-colors">سياسة الخصوصية</a>
            <a href="#" className="text-gray-400 text-xs hover:text-primary transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
