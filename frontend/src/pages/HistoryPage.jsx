import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Clock, Send, Award } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analysis/history');
        setHistory(res.data);
      } catch (err) {
        toast.error('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center gap-2">
          <Clock size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500">You have no past prompts. Go to Analyze to get started!</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <Send size={14} className="text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-brand-600 font-semibold mb-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 line-clamp-3">
                      {item.prompt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      {item.judgeData?.winner && item.judgeData.winner !== 'unknown' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
                          <Award size={12} />
                          Winner: <span className="font-semibold capitalize">{item.judgeData.winner}</span>
                        </div>
                      )}
                      <div className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700">
                        {Object.keys(item.modelsData || {}).length} models ran
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
