// ============================================================
//  pages/DashboardPage.jsx — Main analysis workspace
// ============================================================
import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import ModelCard from '../components/ModelCard';
import ComparisonTable from '../components/ComparisonTable';
import JudgePanel from '../components/JudgePanel';
import LoadingOverlay from '../components/LoadingOverlay';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Send, RotateCcw, Lightbulb, ChevronDown, ChevronUp,
  Cpu, Sparkles
} from 'lucide-react';

// Example prompts to help users get started
const EXAMPLE_PROMPTS = [
  {
    label: '🐍 Python — Two Sum',
    text: 'Write an optimised Python function that finds all pairs in an array that sum to a given target value. Include time and space complexity analysis.',
  },
  {
    label: '⚡ Algorithm — Sorting',
    text: 'Explain merge sort and quick sort. When should you use each? Provide Python implementations and compare their time complexities.',
  },
  {
    label: '🌐 System Design',
    text: 'Design a URL shortener service like bit.ly. Describe the architecture, database schema, API endpoints, and how you would handle 100M requests per day.',
  },
  {
    label: '🤔 Reasoning',
    text: 'A bat and a ball cost $1.10 in total. The bat costs $1 more than the ball. How much does the ball cost? Explain your reasoning step by step.',
  },
  {
    label: '✍️ Creative Writing',
    text: 'Write a short story (200 words) about an AI that discovers it has been living in a simulation. Make it thought-provoking and end with a twist.',
  },
  {
    label: '📊 Data Science',
    text: 'Explain the bias-variance tradeoff in machine learning. Provide concrete examples and suggest when to use regularisation techniques like L1 vs L2.',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const resultsRef = useRef(null);

  const [prompt, setPrompt]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 4000;

  const handlePromptChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setPrompt(val);
      setCharCount(val.length);
    }
  };

  const handleExampleClick = (text) => {
    setPrompt(text);
    setCharCount(text.length);
    setShowExamples(false);
  };

  const handleRun = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) { toast.error('Please enter a prompt.'); return; }
    if (trimmed.length < 5) { toast.error('Prompt is too short.'); return; }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/analysis/run', { prompt: trimmed });
      setResult(res.data);
      toast.success('Analysis complete!');
      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      const msg = err.response?.data?.error || 'Analysis failed. Please check your API keys and try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPrompt('');
    setCharCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRun();
  };

  // Derive winner from judge data
  const winner = result?.judge?.winner;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Welcome bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Cpu size={22} className="text-brand-600" />
              Analyze
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Hello, {user?.name}! Enter a prompt below to benchmark all three models.
            </p>
          </div>
          {result && (
            <button onClick={handleReset} className="btn-secondary flex items-center gap-1.5 text-sm">
              <RotateCcw size={14} />
              New Analysis
            </button>
          )}
        </div>

        {/* Prompt input card */}
        {!loading && !result && (
          <div className="card p-6 animate-fade-in">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-500" />
                Your prompt
              </h2>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                <Lightbulb size={13} />
                Example prompts
                {showExamples ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Example prompts dropdown */}
            {showExamples && (
              <div className="mb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 animate-fade-in">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleExampleClick(ex.text)}
                    className="text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800
                               bg-gray-50 dark:bg-gray-800/50 hover:border-brand-200 dark:hover:border-brand-700
                               hover:bg-brand-50 dark:hover:bg-brand-900/20
                               transition text-xs text-gray-600 dark:text-gray-400 font-medium"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              rows={7}
              placeholder="Enter any prompt — coding, creative writing, reasoning, system design, data science...&#10;&#10;Tip: Press Ctrl+Enter to run the analysis."
              className="input resize-none font-sans text-sm leading-relaxed"
            />

            {/* Footer row */}
            <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
              <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {charCount} / {MAX_CHARS} characters
              </span>
              <button
                onClick={handleRun}
                disabled={loading || !prompt.trim()}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                <Send size={15} />
                Run Analysis
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingOverlay />}

        {/* Results */}
        {result && !loading && (
          <div ref={resultsRef} className="space-y-8 animate-slide-up">

            {/* Prompt recap */}
            <div className="card p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Send size={11} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Analysed prompt
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                  {result.prompt}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(result.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* 3 Model cards */}
            <div>
              <h2 className="section-heading mb-4">Model Responses</h2>
              <div className="grid lg:grid-cols-3 gap-5">
                <ModelCard modelKey="gpt"    data={result.models.gpt}    score={result.judge?.scores?.gpt?.overall}    isWinner={winner === 'gpt'} />
                <ModelCard modelKey="gemini" data={result.models.gemini} score={result.judge?.scores?.gemini?.overall} isWinner={winner === 'gemini'} />
                <ModelCard modelKey="claude" data={result.models.claude} score={result.judge?.scores?.claude?.overall} isWinner={winner === 'claude'} />
              </div>
            </div>

            {/* Comparison table */}
            <ComparisonTable
              scores={result.judge?.scores}
              latency={result.judge?.latency}
              winner={winner}
            />

            {/* Judge panel */}
            <JudgePanel judge={result.judge} />

            {/* Run again button */}
            <div className="text-center pb-4">
              <button onClick={handleReset} className="btn-secondary mx-auto">
                <RotateCcw size={15} />
                Run another analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
