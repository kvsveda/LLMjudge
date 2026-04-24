// ============================================================
//  components/JudgePanel.jsx
//  Llama 3 Judge verdict section
// ============================================================
import React from 'react';
import { Award, CheckCircle, AlertTriangle, Lightbulb, Star } from 'lucide-react';

const WINNER_STYLES = {
  gpt:    { label: 'ChatGPT',      color: 'from-emerald-500 to-teal-600',   bg: 'bg-emerald-50 dark:bg-emerald-900/20',   text: 'text-emerald-700 dark:text-emerald-300',   border: 'border-emerald-200 dark:border-emerald-700' },
  gemini: { label: 'Gemini',   color: 'from-blue-500 to-indigo-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',         text: 'text-blue-700 dark:text-blue-300',         border: 'border-blue-200 dark:border-blue-700' },
  claude: { label: 'Claude',       color: 'from-orange-500 to-red-500',     bg: 'bg-orange-50 dark:bg-orange-900/20',     text: 'text-orange-700 dark:text-orange-300',     border: 'border-orange-200 dark:border-orange-700' },
};

const MODEL_LABELS = { gpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude' };

export default function JudgePanel({ judge }) {
  if (!judge) return null;

  const winnerStyle = WINNER_STYLES[judge.winner] || WINNER_STYLES.gpt;

  return (
    <div className="card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Award size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">AI Judge — Verdict</h3>
          <p className="text-purple-200 text-xs">Independent AI evaluation · {judge.latency ? `${(judge.latency/1000).toFixed(1)}s` : ''}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Winner announcement */}
        {judge.winner && judge.winner !== 'unknown' && (
          <div className={`flex items-center gap-4 p-4 rounded-2xl border ${winnerStyle.bg} ${winnerStyle.border}`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${winnerStyle.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <Star size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
                Best Performing Model
              </p>
              <p className={`text-2xl font-bold ${winnerStyle.text}`}>
                {winnerStyle.label}
              </p>
            </div>
          </div>
        )}

        {/* Overall verdict */}
        {judge.verdict && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mt-0.5">
              <Lightbulb size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Judge's Verdict
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {judge.verdict}
              </p>
            </div>
          </div>
        )}

        {/* Individual model analysis */}
        {judge.individual_analysis && Object.keys(judge.individual_analysis).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Per-Model Analysis
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(judge.individual_analysis).map(([key, text]) => {
                const style = WINNER_STYLES[key];
                const isW = judge.winner === key;
                return (
                  <div key={key} className={`p-3 rounded-xl border text-sm ${
                    isW
                      ? `${style?.bg} ${style?.border}`
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                  }`}>
                    <div className={`font-semibold mb-1 flex items-center gap-1.5 ${isW ? style?.text : 'text-gray-700 dark:text-gray-300'}`}>
                      {isW
                        ? <CheckCircle size={13} />
                        : <AlertTriangle size={13} className="text-gray-400" />
                      }
                      {MODEL_LABELS[key] || key}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final recommendation */}
        {judge.recommendation && (
          <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl flex gap-3">
            <CheckCircle size={18} className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-0.5">
                Recommendation
              </p>
              <p className="text-sm text-brand-900 dark:text-brand-200 leading-relaxed">
                {judge.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
