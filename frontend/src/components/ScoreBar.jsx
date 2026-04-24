// ============================================================
//  components/ScoreBar.jsx — Animated score progress bar
// ============================================================
import React, { useEffect, useState } from 'react';

const BAR_COLORS = {
  gpt:    'bg-emerald-500',
  gemini: 'bg-blue-500',
  claude: 'bg-orange-500',
};

export default function ScoreBar({ value, max = 10, modelKey }) {
  const [width, setWidth] = useState(0);
  const pct = Math.round((value / max) * 100);
  const color = BAR_COLORS[modelKey] || 'bg-brand-500';

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  const textColor =
    value >= 8 ? 'text-green-600 dark:text-green-400' :
    value >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                 'text-red-600 dark:text-red-400';

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${textColor}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
