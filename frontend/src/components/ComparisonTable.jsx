// ============================================================
//  components/ComparisonTable.jsx
//  Side-by-side metric comparison of all 3 models
// ============================================================
import React from 'react';
import ScoreBar from './ScoreBar';
import { Clock } from 'lucide-react';

const MODELS = [
  { key: 'gpt',    label: 'ChatGPT',      icon: '🤖', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'gemini', label: 'Gemini',   icon: '✦',  color: 'text-blue-600 dark:text-blue-400' },
  { key: 'claude', label: 'Claude', icon: '◆',  color: 'text-orange-600 dark:text-orange-400' },
];

const METRICS = [
  { key: 'correctness',         label: 'Correctness',         desc: 'Factual accuracy & code functionality' },
  { key: 'clarity',             label: 'Clarity',             desc: 'Readability & explanation quality' },
  { key: 'complexity_handling', label: 'Complexity Handling', desc: 'Time/space complexity analysis' },
  { key: 'overall',             label: 'Overall Score',       desc: 'Weighted composite score' },
];

function formatMs(ms) {
  if (!ms && ms !== 0) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export default function ComparisonTable({ scores = {}, latency = {}, winner }) {
  return (
    <div className="card overflow-hidden animate-slide-up">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="section-heading text-lg">Performance Comparison</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Scored 0–10 by the AI Judge across four evaluation axes
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-40">
                Metric
              </th>
              {MODELS.map((m) => (
                <th key={m.key} className="px-4 py-3 text-center">
                  <div className={`font-bold ${m.color} flex items-center justify-center gap-1`}>
                    <span>{m.icon}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </div>
                  {winner === m.key && (
                    <span className="text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-medium">
                      winner
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, i) => (
              <tr
                key={metric.key}
                className={`border-b border-gray-50 dark:border-gray-800/50 ${
                  metric.key === 'overall'
                    ? 'bg-brand-50/50 dark:bg-brand-900/10 font-semibold'
                    : i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/20'
                }`}
              >
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{metric.label}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{metric.desc}</div>
                </td>
                {MODELS.map((m) => {
                  const val = scores[m.key]?.[metric.key];
                  return (
                    <td key={m.key} className="px-4 py-3">
                      {val !== undefined ? (
                        <ScoreBar value={val} modelKey={m.key} />
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs pl-1">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Latency row */}
            <tr className="bg-gray-50/80 dark:bg-gray-800/30">
              <td className="px-6 py-3">
                <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Clock size={13} />
                  Response Time
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Actual API latency</div>
              </td>
              {MODELS.map((m) => (
                <td key={m.key} className="px-4 py-3 text-center">
                  <span className={`text-sm font-mono font-semibold ${m.color}`}>
                    {formatMs(latency[m.key])}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
