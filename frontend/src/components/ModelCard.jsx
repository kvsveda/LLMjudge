// ============================================================
//  components/ModelCard.jsx
//  Displays a single model's response with metadata
// ============================================================
import React, { useState } from 'react';
import { Clock, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const MODEL_STYLES = {
  gpt: {
    strip: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    icon: '🤖',
    label: 'ChatGPT',
    accent: 'border-emerald-200 dark:border-emerald-800',
  },
  gemini: {
    strip: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    icon: '✦',
    label: 'Gemini',
    accent: 'border-blue-200 dark:border-blue-800',
  },
  claude: {
    strip: 'bg-gradient-to-r from-orange-500 to-red-500',
    badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    icon: '◆',
    label: 'Claude',
    accent: 'border-orange-200 dark:border-orange-800',
  },
};

function formatLatency(ms) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ModelCard({ modelKey, data, score, isWinner }) {
  const [copied, setCopied]     = useState(false);
  const [expanded, setExpanded] = useState(true);
  const style = MODEL_STYLES[modelKey] || MODEL_STYLES.gpt;

  const handleCopy = async () => {
    if (!data?.content) return;
    await navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`card flex flex-col overflow-hidden transition-all duration-200 ${
      isWinner ? 'ring-2 ring-brand-500 shadow-lg shadow-brand-500/10' : ''
    }`}>
      {/* Colour strip header */}
      <div className={`${style.strip} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">{style.icon}</span>
          <span className="font-semibold text-white text-sm">{data?.name || style.label}</span>
          {isWinner && (
            <span className="ml-1 px-2 py-0.5 bg-white/25 rounded-full text-white text-xs font-bold">
              👑 Winner
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`score-badge ${style.badge} text-xs`}>
            {score !== undefined ? `${score}/10` : '—'}
          </span>
          <button onClick={() => setExpanded(!expanded)} className="text-white/80 hover:text-white transition">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Latency bar */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              Response time: <strong className="text-gray-700 dark:text-gray-200">{formatLatency(data?.latency)}</strong>
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-brand-600 transition"
              title="Copy response"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {data?.success === false ? (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{data?.error || 'This model did not respond.'}</span>
              </div>
            ) : data?.content ? (
              <pre className="response-prose text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto max-h-96 text-xs leading-relaxed">
                {data.content}
              </pre>
            ) : (
              <p className="text-sm text-gray-400 italic">No response received.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
