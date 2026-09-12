import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Swords, Shield, Coins, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Overview', id: 'dashboard' },
    { to: '/quests', label: 'Quest Log', id: 'quests' },
    { to: '/rewards', label: 'Rewards', id: 'rewards' },
    { to: '/profile', label: 'Character', id: 'profile' },
  ];

  const isCurrent = (path, id) => {
    if (activePage) return activePage === id;
    return location.pathname === path;
  };

  return (
    <nav
      className="w-full border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 z-20 relative"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl p-1"
            aria-label="LifeQuest Home"
          >
            <div className="p-1.5 sm:p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-amber-400">
              <Swords className="w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 to-indigo-400 bg-clip-text text-transparent">
              LIFEQUEST
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isCurrent(link.to, link.id);
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-2 rounded-xl transition min-h-[44px] flex items-center ${
                    active
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Badges, Mobile Menu Toggle & Logout */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Gold counter */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm font-bold min-h-[36px]">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="text-yellow-300 font-mono">{user?.gold ?? 0}</span>
            <span className="hidden xs:inline text-[10px] sm:text-xs text-slate-500 font-semibold">GOLD</span>
          </div>

          {/* User Name Pill (hidden on smallest screens) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold max-w-[140px] truncate">
            <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-slate-200 truncate">{user?.name}</span>
          </div>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            aria-label="Log out of LifeQuest"
            className="hidden sm:flex px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/70 text-rose-300 hover:text-rose-200 rounded-xl text-xs sm:text-sm font-medium transition items-center gap-1.5 min-h-[40px] focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-950/60 border border-slate-800 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden mt-3 pt-3 border-t border-slate-800/80 space-y-1.5"
          role="menu"
          aria-label="Mobile Navigation Menu"
        >
          {navLinks.map((link) => {
            const active = isCurrent(link.to, link.id);
            return (
              <Link
                key={link.id}
                to={link.to}
                role="menuitem"
                aria-current={active ? 'page' : undefined}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold min-h-[44px] transition ${
                  active
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 truncate py-1">
              <User className="w-4 h-4 text-purple-400" />
              <span className="truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/70 text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
