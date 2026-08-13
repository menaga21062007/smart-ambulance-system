import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CareLinkLogo } from '../components/CareLinkLogo';
import { Button } from '../components/ui/Button';
import { User } from '../types';
import { Eye, EyeOff, ShieldCheck, CheckCircle2, Lock, Mail, Users } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { demoAccounts, loginAsDemoUser } = useAuth();
  const [email, setEmail] = useState('admin@hospital.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Find matching demo account or login
      const match = demoAccounts.find((a) => a.email === email);
      if (match) {
        await loginAsDemoUser(match);
      } else if (demoAccounts.length > 0) {
        await loginAsDemoUser(demoAccounts[0]);
      }
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = async (acc: User) => {
    setLoading(true);
    try {
      await loginAsDemoUser(acc);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-bg dark:bg-navy-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Column (Desktop Hero Image & Tagline) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-navy-900 text-white p-10 flex-col justify-between overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80')`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-hospital-700/60"></div>

          <div className="relative z-10">
            <CareLinkLogo size="lg" light />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Staff Authorization</span>
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">
              Connected Care. <br />
              Faster Response. <br />
              Better Outcomes.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unified emergency infrastructure platform for Paramedics, ER Hospital Staff, Doctors, Ward Managers, Cleaners, and Traffic Controllers.
            </p>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400">
            CareLink Medical Center System v2.6
          </div>
        </div>

        {/* Right Column (Login Form & Demo Role Switcher) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="lg:hidden">
                <CareLinkLogo size="md" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-navy-700 px-3 py-1 rounded-full">
                Staff Authentication
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-extrabold text-navy-800 dark:text-white">Welcome Back</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Log in with your clinical credentials or select a quick demo user role below.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 text-emergencyred border border-red-200 p-3 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Custom Login Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-slate-200 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-slate-200 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-navy-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-100 dark:bg-navy-900 border-slate-300 text-hospital-500"
                  />
                  <span>Remember Session</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('For demo, use any pre-seeded demo role below!'); }} className="text-hospital-600 dark:text-hospital-400 font-bold hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full shadow-lg"
              >
                Sign In to Platform
              </Button>
            </form>
          </div>

          {/* Quick Demo Access Grid */}
          <div className="border-t border-slate-100 dark:border-navy-700 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-navy-800 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-hospital-500" /> One-Click Demo Role Access
              </span>
              <span className="text-[10px] text-slate-400">Pre-seeded Credentials</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleQuickDemoSelect(acc)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:border-hospital-500 dark:hover:border-hospital-500 bg-slate-50/50 dark:bg-navy-900/50 text-left transition-all hover:-translate-y-0.5 group"
                >
                  <div className="font-extrabold text-xs text-navy-800 dark:text-white group-hover:text-hospital-600 dark:group-hover:text-hospital-400 truncate">
                    {acc.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {acc.role_name}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
