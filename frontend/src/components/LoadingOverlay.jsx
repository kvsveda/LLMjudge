// ============================================================
//  components/LoadingOverlay.jsx — Animated analysis progress
// ============================================================
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Sending prompt to ChatGPT, Gemini & Claude simultaneously…' },
  { id: 2, label: 'Waiting for model responses…' },
  { id: 3, label: 'All responses received — forwarding to AI Judge…' },
  { id: 4, label: 'Judge evaluating correctness, clarity & complexity…' },
  { id: 5, label: 'Compiling final verdict…' },
];

export default function LoadingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let step = 0;
    const delays = [0, 2500, 8000, 12000, 17000];

    const timers = delays.map((delay, i) =>
      setTimeout(() => setCurrentStep(i + 1), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="card p-8 flex flex-col items-center text-center animate-fade-in">
      {/* Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center">
          <Loader2 size={28} className="text-white animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full animate-pulse" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        Analysing with 4 AI Models
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        Sending your prompt to all models simultaneously, then judging the results.
      </p>

      {/* Steps */}
      <div className="w-full max-w-md space-y-3 text-left">
        {STEPS.map((step) => {
          const done   = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                done
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : active
                  ? 'border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 opacity-40'
              }`}
            >
              {done ? (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              ) : active ? (
                <Loader2 size={16} className="text-brand-500 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                done    ? 'text-green-700 dark:text-green-300' :
                active  ? 'text-brand-700 dark:text-brand-300 font-medium' :
                          'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        This may take 20–45 seconds depending on model availability
      </p>
    </div>
  );
}
