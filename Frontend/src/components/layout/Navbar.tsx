import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Code2, 
  User, 
  LogOut, 
  Settings,
  Users,
  BookOpen,
  Zap,
  Loader2,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../lib/auth';
import { useMatchStore } from '../../lib/matchStore';
import { useRequestsStore } from '../../lib/requestsStore';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoverReveal, setHoverReveal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const searching = useMatchStore((s) => s.searching);
  const unreadIncoming = useRequestsStore((s) => s.unreadIncomingCount);
  const notifications = useRequestsStore((s) => s.notifications);
  const markAllRead = useRequestsStore((s) => s.markAllRead);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  // Elevate/blur navbar on scroll and track top position
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Dashboard', path: '/dashboard', icon: Settings, protected: true },
    { name: 'Find Matches', path: '/matches', icon: Users, protected: true },
    { name: 'Sessions', path: '/sessions', icon: BookOpen, protected: true },
    { name: 'Skills', path: '/skills', icon: Zap, protected: false },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isHome = location.pathname === '/';
  const shouldHideAtTop = isHome && !isScrolled && !hoverReveal && !isMobileMenuOpen;

  return (
    <>
      {/* Hover/Tap reveal zone at very top (visible only on Home when at top) */}
      {isHome && !isScrolled && (
        <div
          className="fixed top-0 left-0 right-0 h-3 z-50"
          onMouseEnter={() => setHoverReveal(true)}
          onMouseLeave={() => setHoverReveal(false)}
          onTouchStart={() => setHoverReveal(true)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none transform ${
          isScrolled
            ? 'bg-[#0b0c0d]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
            : 'bg-[#0b0c0d]/70 backdrop-blur-md shadow-none'
        } ${shouldHideAtTop ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        onMouseEnter={() => setHoverReveal(true)}
        onMouseLeave={() => setHoverReveal(false)}
      >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group focus:outline-none focus-visible:outline-none">
            <div className="relative">
              <Code2 className="h-8 w-8 text-[#00ef68] transition-colors" />
              <div className="absolute -inset-1 bg-[#00ef68]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-white">
              DevSwap.live
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative px-3 py-2 text-sm font-medium transition-colors duration-200 transform-gpu will-change-transform hover:-translate-y-0.5 focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                    isActivePath(link.path) ? 'text-[#00ef68]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {link.icon && <link.icon className="h-4 w-4" />}
                    <span className="relative inline-flex items-center">
                      {link.name}
                      {link.path === '/matches' && unreadIncoming > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none h-4 min-w-[16px] px-1 rounded-full bg-[#00ef68] text-[#0b0c0d] font-bold">
                          {unreadIncoming > 99 ? '99+' : unreadIncoming}
                        </span>
                      )}
                      {link.path === '/matches' && searching && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-700/40 text-emerald-300 text-[10px] px-2 py-0.5">Searching</span>
                      )}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && searching && (
              <Link
                to="/matches"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/25 transition-colors"
                title="Now searching for a match"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Now searching…</span>
              </Link>
            )}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotifOpen((v) => !v);
                    if (!isNotifOpen) markAllRead();
                  }}
                  className="relative p-2 rounded-lg hover:bg-white/5 focus:outline-none focus-visible:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-white/80" />
                  {unreadIncoming > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-[#00ef68] rounded-full ring-2 ring-[#0b0c0d]" />
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0b0c0d] border border-[#25282c] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-2 border-b border-[#25282c] text-white/80 text-sm">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-white/60 text-sm">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 border-b border-[#25282c] last:border-b-0">
                            <div className="text-white text-sm font-medium">{n.title}</div>
                            <div className="text-white/70 text-xs mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 transform-gpu will-change-transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,239,104,0.15)] focus:outline-none focus-visible:outline-none"
                >
                  <div className="w-8 h-8 bg-[#00ef68] rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white/90 text-sm font-medium">{user?.name || 'Account'}</span>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#25282c] rounded-lg shadow-xl border border-[#25282c] py-2"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-white/80 hover:text-white focus:outline-none focus-visible:outline-none"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-white/80 hover:text-white"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="my-2 border-[#25282c]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-white/80 w-full text-left focus:outline-none focus-visible:outline-none"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 transform-gpu will-change-transform hover:-translate-y-0.5 focus:outline-none focus-visible:outline-none"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-[#00ef68] hover:bg-[#00ef68] text-[#0b0c0d] rounded-lg transition-all duration-200 transform-gpu will-change-transform hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(0,239,104,0.35)] active:translate-y-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors duration-200 transform-gpu will-change-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-white/80" />
            ) : (
              <Menu className="h-6 w-6 text-white/80" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (fixed overlay so it doesn't push content) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-[#0b0c0d]/95 backdrop-blur-md border-t border-[#25282c] shadow-lg"
          >
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-64px)] overflow-y-auto">
              {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 transform-gpu will-change-transform hover:translate-y-[-1px] focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                    isActivePath(link.path)
                      ? 'text-[#00ef68]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span className="relative inline-flex items-center">
                    {link.name}
                    {link.path === '/matches' && unreadIncoming > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none h-4 min-w-[16px] px-1 rounded-full bg-[#00ef68] text-[#0b0c0d] font-bold">
                        {unreadIncoming > 99 ? '99+' : unreadIncoming}
                      </span>
                    )}
                    {link.path === '/matches' && searching && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-700/40 text-emerald-300 text-[10px] px-2 py-0.5">Searching</span>
                    )}
                  </span>
                </Link>
              );
            })}
            
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotifOpen((v) => !v);
                    if (!isNotifOpen) markAllRead();
                  }}
                  className="relative p-2 rounded-lg hover:bg-white/5 focus:outline-none focus-visible:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-white/80" />
                  {unreadIncoming > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-[#00ef68] rounded-full ring-2 ring-[#0b0c0d]" />
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0b0c0d] border border-[#25282c] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-2 border-b border-[#25282c] text-white/80 text-sm">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-white/60 text-sm">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 border-b border-[#25282c] last:border-b-0">
                            <div className="text-white text-sm font-medium">{n.title}</div>
                            <div className="text-white/70 text-xs mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
              
              <hr className="my-4 border-[#25282c]" />
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 transform-gpu will-change-transform hover:translate-x-1 focus:outline-none focus-visible:outline-none"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white/80 w-full text-left transition-colors duration-200 transform-gpu will-change-transform hover:translate-x-1 focus:outline-none focus-visible:outline-none"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 transform-gpu will-change-transform hover:translate-x-1 focus:outline-none focus-visible:outline-none"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium bg-[#00ef68] hover:bg-[#00ef68] text-[#0b0c0d] text-center transition-all duration-200 transform-gpu will-change-transform hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,239,104,0.35)] active:translate-y-0"
                  >
                    Get Started
                  </Link>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
};

export default Navbar;
