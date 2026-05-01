import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Dentist } from '../types';
import { motion } from 'motion/react';
import { Award, Briefcase, Camera } from 'lucide-react';

export default function Dentists() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'dentists'), orderBy('name', 'asc')), (snapshot) => {
      setDentists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dentist)));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-20 text-center font-bold">جاري تحميل طاقم الأطباء...</div>;

  return (
    <div className="py-20 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-6">طاقم الأطباء</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            نخبة من أفضل استشاريي طب الأسنان في مصر، مكرسون لابتسامتكم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {dentists.map((dentist, idx) => (
            <motion.div
              key={dentist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-gray-100 group"
            >
              <div className="relative h-80">
                <img
                  src={dentist.photo}
                  alt={dentist.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 right-6 left-6">
                  <h3 className="text-2xl font-black text-white mb-2">{dentist.name}</h3>
                  <p className="text-primary text-sm font-bold italic">{dentist.specialization}</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">الخبرة</p>
                    <p className="text-sm font-bold text-gray-900">{dentist.experience}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
