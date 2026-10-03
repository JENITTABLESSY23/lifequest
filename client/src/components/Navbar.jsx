import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Swords, Shield, Coins, LogOut, Menu, X, User, ShoppingBag, Castle } from 'lucide-react';
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

  // Step 6: RPG Game Navigation Menu
  const navLinks = [
    { to: '/dashboard', label: 'REALM', glyph: '🏰', id: 'dashboard' },
    { to: '/quests', label: 'QUESTS', glyph: '⚔', id: 'quests' },
    { to: '/rewards', label: 'SHOP', glyph: '🛒', id: 'rewards' },
    { to: '/profile', label: 'CHARACTER', glyph: '🧙', id: 'profile' },
  ];

  const isCurrent = (path, id) => {
    if (activePage) return activePage === id;
    return location.pathname === path;
  };

  return (
    <nav
      className="w-full border-b border-indigo-950/60 bg-[#090D16]/90 backdrop-blur-xl px-4 sm:px-6 py-2.5 sm:py-3 z-30 relative select-none"
      role="navigation"
      aria-label="Realm Game Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl p-1 group"
            aria-label="LifeQuest - The Realm of You"
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/20 to-indigo-600/30 border border-amber-500/40 rounded-xl text-amber-400 shadow-sm shadow-amber-500/20 group-hover:border-amber-400 transition-colors">
              <Swords className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-widest font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 leading-none">
                LIFEQUEST
              </span>
              <span className="text-[9px] font-mono tracking-wider text-indigo-300/80 font-bold uppercase mt-0.5">
                The Realm of You
              </span>
            </div>
          </Link>

          {/* Desktop RPG Navigation Menu */}
          <div className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider">
            {navLinks.map((link) => {
              const active = isCurrent(link.to, link.id);
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 min-h-[44px] flex items-center gap-2 relative ${
                    active
                      ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <span className="text-sm opacity-90" aria-hidden="true">{link.glyph}</span>
                  <span>{link.label}</span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Status Badges & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Gold Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-bold min-h-[38px] shadow-sm"
            aria-label={`${user?.gold ?? 0} Gold`}
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" aria-hidden="true" />
            <span className="text-yellow-300 font-mono font-black">{user?.gold ?? 0}</span>
            <span className="hidden xs:inline text-[10px] text-amber-400/80 uppercase font-semibold">
              GOLD
            </span>
          </div>

          {/* Player Name Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/70 border border-indigo-900/40 px-3 py-1.5 rounded-xl text-xs font-semibold max-w-[140px] truncate shadow-sm">
            <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
            <span className="text-slate-200 truncate">{user?.name}</span>
          </div>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            aria-label="Log out of LifeQuest"
            className="hidden sm:flex px-3 py-2 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/50 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-bold tracking-wider uppercase transition items-center gap-1.5 min-h-[40px] focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Leave Realm</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden mt-3 pt-3 border-t border-indigo-950/60 space-y-2"
          role="menu"
          aria-label="Realm Mobile Menu"
        >
          {navLinks.map((link) => {
            const active = isCurrent(link.to, link.id);
            return (
              <Link
                key={link.id}
                to={link.to}
                role="menuitem"
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold min-h-[44px] transition ${
                  active
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base" aria-hidden="true">{link.glyph}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={handleLogout}
              role="menuitem"
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 min-h-[44px] transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Realm (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
