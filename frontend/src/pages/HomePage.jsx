// ============================================================
//  pages/HomePage.jsx — Landing page
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Scale, BarChart3, Shield, ArrowRight,
  CheckCircle, Code2, Brain, Clock
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap size={22} className="text-brand-600 dark:text-brand-400" />,
    title: 'Simultaneous Execution',
    desc: 'Your prompt is sent to ChatGPT, Gemini, and Claude at the exact same moment using Promise.all — zero sequential wait.',
  },
  {
    icon: <Scale size={22} className="text-violet-600 dark:text-violet-400" />,
    title: 'LLM-as-a-Judge',
    desc: 'An AI Judge acts as an independent evaluator — scoring correctness, clarity, and complexity handling across all three responses.',
  },
  {
    icon: <BarChart3 size={22} className="text-emerald-600 dark:text-emerald-400" />,
    title: 'Quantified Metrics',
    desc: 'Every model gets scored 0–10 on four axes. Bar charts and a comparison table make differences instantly visible.',
  },
  {
    icon: <Clock size={22} className="text-orange-600 dark:text-orange-400" />,
    title: 'Real Latency Tracking',
    desc: 'The backend measures actual wall-clock response time for every model and passes it to the judge as part of the evaluation.',
  },
  {
    icon: <Brain size={22} className="text-pink-600 dark:text-pink-400" />,
    title: 'Any Prompt Type',
    desc: 'Coding, creative writing, factual Q&A, reasoning — the judge adapts its evaluation criteria to the prompt category.',
  },
  {
    icon: <Shield size={22} className="text-teal-600 dark:text-teal-400" />,
    title: 'Secure & Private',
    desc: 'JWT authentication, rate limiting, and CORS protection. Your prompts and results are scoped to your account only.',
  },
];

const MODELS = [
  { name: 'ChatGPT',     provider: 'OpenAI',  color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', icon: '🤖' },
  { name: 'Gemini',  provider: 'Google',  color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',           icon: '✦' },
  { name: 'Claude',      provider: 'Anthropic',color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',   icon: '◆' },
  { name: 'AI Judge',   provider: 'Independent',    color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',   icon: '⚖️' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-100 dark:bg-brand-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-100 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 rounded-full text-brand-600 dark:text-brand-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live — Free tier APIs connected
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Performance Analysis
            <br />
            <span className="text-gradient">of AI Models</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Submit a single prompt. Watch ChatGPT, Gemini, and Claude respond simultaneously.
            Then let <strong className="text-gray-900 dark:text-white">an AI Evaluator</strong> judge
            which model wins — and why.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link to="/analyze" className="btn-primary text-base px-8 py-3.5">
                Start Analyzing <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Models row */}
      <section className="py-12 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Models in the arena
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MODELS.map((m) => (
              <div key={m.name} className="card p-4 text-center">
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className={`score-badge ${m.color} mb-1.5`}>{m.provider}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              How it works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              A transparent, reproducible framework for benchmarking large language models on your own prompts.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to find your best model?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Create a free account and run your first analysis in under a minute.
          </p>
          {!user && (
            <Link to="/signup" className="btn-primary text-base px-10 py-3.5 mx-auto">
              Create free account <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} LLMJudge — Performance Analysis of AI Models
      </footer>
    </div>
  );
}
