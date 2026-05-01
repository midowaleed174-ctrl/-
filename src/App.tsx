import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile } from './types';

// Pages
import Home from './pages/Home';
import Dentists from './pages/Dentists';
import Booking from './pages/Booking';
import Consultations from './pages/Consultations';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

const AuthContext = createContext<{
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  isOwner: boolean;
  isAdmin: boolean;
}>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  logout: async () => {},
  isOwner: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

const OWNER_EMAIL = 'wmido976@gmail.com';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync user profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let role: 'user' | 'admin' | 'owner' = 'user';
        if (user.email === OWNER_EMAIL) {
          role = 'owner';
        } else {
          // Check if admin
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            role = adminDoc.data().role || 'admin';
          }
        }

        const profileData: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role,
          createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date(),
        };

        if (!userDoc.exists()) {
          await setDoc(userDocRef, profileData);
        } else {
          // Update profile if role changed
          await setDoc(userDocRef, { ...profileData }, { merge: true });
        }

        setProfile(profileData);
        setIsOwner(user.email === OWNER_EMAIL);
        setIsAdmin(role === 'admin' || role === 'owner');
      } else {
        setProfile(null);
        setIsOwner(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, isOwner, isAdmin }}>
      <Router>
        <div className="flex flex-col min-h-screen" dir="rtl">
          <Navbar />
          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={isOwner ? <Admin /> : <Home />} />
              <Route path="/dentists" element={<Dentists />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
