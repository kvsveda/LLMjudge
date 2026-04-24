// ============================================================
//  pages/SignupPage.jsx
// ============================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Cpu, Eye, EyeOff, Sun, Moon, UserPlus, CheckCircle } from 'lucide-react';

const PERKS = [
  'Unlimited prompt analysis sessions',
  'Side-by-side model comparison',
  'AI judge evaluation',
  'Real latency measurements',
];

export default function SignupPage() {
  const { login }   = useAuth();
  const { dark, toggle } = useTheme();
  const navigate    = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [step, setStep]       = useState(1);
  const [otp, setOtp]         = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address.';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', form);
      toast.success('Verification code sent to your email!');
      if (res.data.previewUrl) {
        console.log('Dev Ethereal Email Link:', res.data.previewUrl);
        toast('Testing mode: Check console for the email link', { icon: '🛠️' });
      }
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send verification code. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp-and-signup', { ...form, otp });
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/analyze');
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed. Please try again.';
      toast.error(msg);
      setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center animate-fade-in">

        {/* Left — value prop */}
        <div className="hidden md:block">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              LLM<span className="text-brand-600">Judge</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Find the best AI model<br />for your exact use case
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Stop guessing which AI to use. Submit a prompt once and let three models compete — with an independent judge delivering the final score.
          </p>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <Cpu size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                LLM<span className="text-brand-600">Judge</span>
              </span>
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start analysing AI models for free</p>

            <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} noValidate className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Name */}
                  <div>
                    <label className="form-label">Full name</label>
                    <input
                      type="text"
                      className={`input ${errors.name ? 'border-red-400 dark:border-red-600 focus:ring-red-400' : ''}`}
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={handleChange('name')}
                      autoFocus
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className={`input ${errors.email ? 'border-red-400 dark:border-red-600 focus:ring-red-400' : ''}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange('email')}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="form-label">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        className={`input pr-10 ${errors.password ? 'border-red-400 dark:border-red-600 focus:ring-red-400' : ''}`}
                        placeholder="Min. 6 characters"
                        value={form.password}
                        onChange={handleChange('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
                    {loading ? <span className="spinner" /> : <UserPlus size={18} />}
                    {loading ? 'Sending code…' : 'Send Verification Code'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="form-label">Verification Code</label>
                    <input
                      type="text"
                      className={`input ${errors.otp ? 'border-red-400 dark:border-red-600 focus:ring-red-400' : ''}`}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value); setErrors(er => ({...er, otp: ''})) }}
                      autoFocus
                    />
                    {errors.otp && <p className="mt-1.5 text-xs text-red-500">{errors.otp}</p>}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We sent a code to {form.email}.</p>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
                    {loading ? <span className="spinner" /> : <CheckCircle size={18} />}
                    {loading ? 'Verifying…' : 'Verify & Create Account'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-3"
                    disabled={loading}
                  >
                    Back to edit details
                  </button>
                </>
              )}

              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                By signing up you agree to use this app responsibly with your own API keys.
              </p>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
