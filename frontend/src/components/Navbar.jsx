// ============================================================
//  components/Navbar.jsx — Top navigation bar with Sidebar
// ============================================================
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, Cpu, LogOut, LayoutDashboard, Home, History } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 glass border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left side: Hamburger & Logo */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition"
                aria-label="Open sidebar"
              >
                <Menu size={28} />
              </button>

              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Cpu size={16} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl leading-tight">
                  LLM<span className="text-brand-600">Judge</span>
                </span>
              </Link>
            </div>

            {/* Right side: Theme and Auth */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle theme"
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-gray-200 dark:border-gray-800 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-gray-900 dark:text-white text-xl">
            Menu
          </span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold transition ${
              isActive('/')
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 box-border'
            }`}
          >
            <Home size={28} />
            Home
          </Link>

          {user && (
            <>
              <Link
                to="/analyze"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold transition ${
                  isActive('/analyze')
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 box-border'
                }`}
              >
                <LayoutDashboard size={28} />
                Analysis
              </Link>

              <Link
                to="/history"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold transition ${
                  isActive('/history')
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 box-border'
                }`}
              >
                <History size={28} />
                History
              </Link>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-lg font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut size={28} />
              Log Out
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="btn-secondary text-lg py-3 flex justify-center"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setSidebarOpen(false)}
                className="btn-primary text-lg py-3 flex justify-center"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
