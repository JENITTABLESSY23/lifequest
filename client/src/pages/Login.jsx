import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Swords, Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GameWorldBackground from '../components/GameWorldBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* 1. Global Atmospheric World Background */}
      <GameWorldBackground />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md game-panel p-6 sm:p-8 z-10 space-y-6"
      >
        {/* Header: Gateway to the Realm */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-br from-amber-500/20 to-indigo-600/30 border border-amber-500/40 rounded-2xl text-amber-400 shadow-md shadow-amber-500/10 mb-2">
            <Swords className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-cinzel tracking-wider">
            ENTER THE REALM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Authenticate to continue your LifeQuest journey
          </p>
        </div>

        {formError && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl text-rose-300 text-xs sm:text-sm flex items-start gap-2.5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{formError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Adventurer Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@lifequest.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Secret Passphrase
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] text-xs sm:text-sm tracking-widest uppercase font-mono"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Authenticating Hero...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>[ ENTER THE REALM ]</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Uninscribed Adventurer?{' '}
          <Link
            to="/register"
            className="text-amber-400 hover:text-amber-300 font-bold transition underline decoration-amber-400/30 underline-offset-4"
          >
            Inscribe New Hero
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
