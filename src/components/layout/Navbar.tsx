import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../App';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, signIn, logout, isAdmin, isOwner } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الخدمات', path: '/services' },
    { name: 'الأطباء', path: '/dentists' },
    { name: 'الاستشارات', path: '/consultations' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
            O
          </div>
          <span className="text-2xl font-extrabold text-primary tracking-tight">اورافيكس</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.path) ? 'text-primary' : 'text-gray-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth / Account */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                  title="لوحة التحكم"
                >
                  <Settings size={20} />
                </Link>
              )}
              <Link
                to="/dashboard"
                className="p-2 text-gray-500 hover:text-primary transition-colors"
                title="حسابي"
              >
                <LayoutDashboard size={20} />
              </Link>
              <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                <img
                  src={profile?.photoURL || undefined}
                  alt={profile?.displayName}
                  className="w-8 h-8 rounded-full border border-gray-100"
                />
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <LogOut size={16} />
                  خروج
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20"
            >
              <LogIn size={18} />
              دخول
            </button>
          )}

          <Link
            to="/booking"
            className="px-6 py-2.5 bg-accent text-primary rounded-full text-sm font-bold hover:bg-accent/80 transition-all"
          >
            احجز الآن
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-xl md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium ${
                    isActive(link.path) ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-gray-600"
                  >
                    <LayoutDashboard size={20} />
                    حسابي
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-gray-600"
                    >
                      <Settings size={20} />
                      لوحة التحكم
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 text-lg font-medium text-red-500"
                  >
                    <LogOut size={20} />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    signIn();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 text-lg font-medium text-primary"
                >
                  <LogIn size={20} />
                  تسجيل الدخول
                </button>
              )}
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-primary text-white rounded-xl text-center font-bold"
              >
                احجز الآن
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
