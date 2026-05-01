import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { MessageCircle, Send, Camera, MessageSquare, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Consultations() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    message: '',
    imageUrl: '',
  });

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic size check
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'inquiries'), {
        userId: user.uid,
        userEmail: user.email,
        message: formData.message,
        imageUrl: formData.imageUrl,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الاستشارة. يرجى المحاولة مرة أخرى.');
      handleFirestoreError(err, OperationType.CREATE, 'inquiries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">استشارات أونلاين</h1>
          <p className="text-gray-500">أرسل استفسارك وسيقوم أطباؤنا بالرد عليك في أقرب وقت.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">شكراً لثقتك بنا</h3>
                <p className="text-gray-500">تم إرسال استفسارك بنجاح. يمكنك متابعة الرد في لوحة تحكم حسابك.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
                <div className="space-y-4">
                  <label className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-primary" />
                    صف لنا حالتك أو استفسارك
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="اكتب هنا كل ما ترغب في معرفته عن حالتك الصحية..."
                    className="w-full p-6 bg-gray-50 border-none rounded-[32px] text-gray-900 focus:ring-2 focus:ring-primary transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Camera size={20} className="text-primary" />
                    ارفق صورة (اختياري)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full p-8 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 bg-gray-50 group-hover:border-primary/30 transition-all">
                       {formData.imageUrl ? (
                         <div className="relative">
                           <img src={formData.imageUrl} className="w-32 h-32 object-cover rounded-2xl shadow-lg" alt="preview" />
                           <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1"><CheckCircle2 size={16} /></div>
                         </div>
                       ) : (
                         <>
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm">
                             <Camera size={32} />
                           </div>
                           <p className="text-sm font-bold text-gray-400">{uploading ? 'جاري التحميل...' : 'اضغط هنا لرفع صورة من هاتفك'}</p>
                         </>
                       )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-2 pr-4">
                    <Info size={14} />
                    يساعدنا رؤية صور الأشعة أو مكان الألم في تقديم استشارة أدق.
                  </p>
                </div>

                {!user && (
                  <div className="p-6 bg-accent/20 rounded-[32px] border border-accent/30 flex flex-col items-center gap-4 text-center">
                    <p className="text-gray-800 font-bold">يجب تسجيل الدخول لإرسال الاستشارة</p>
                    <button
                      type="button"
                      onClick={signIn}
                      className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all"
                    >
                      دخول بجوجل
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 text-sm font-bold">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !user}
                  className={`w-full py-5 bg-primary text-white rounded-[32px] text-xl font-black shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 ${
                    loading || !user ? 'opacity-70 cursor-not-allowed' : 'hover:bg-secondary active:scale-[0.98]'
                  }`}
                >
                  <Send size={24} />
                  إرسال الاستشارة
                </button>
              </form>
            )}
          </div>

          {/* WhatsApp & Info */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-8 rounded-[40px] text-white shadow-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">تواصل مباشر</h3>
              <p className="text-white/80 mb-8 leading-relaxed">
                هل تحتاج إلى رد فوري؟ يمكنك التحدث مباشرة مع طاقمنا عبر الواتساب في أي وقت.
              </p>
              <a
                href="https://wa.me/201011973704"
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-white text-[#128C7E] rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
              >
                فتح واتساب
              </a>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h4 className="text-xl font-black text-gray-900 mb-6">تعليمات الاستشارة</h4>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                  <p className="text-sm text-gray-500 font-medium">اشرح حالتك بكل دقة وتفصيل (مكان الألم، طبيعته، مدته).</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                  <p className="text-sm text-gray-500 font-medium">إذا كان لديك حساسية من أي دواء يرجى ذكره.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                  <p className="text-sm text-gray-500 font-medium">الاستشارة أونلاين لا تغني عن الزيارة الفعلية للعيادة في الحالات الحرجة.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
