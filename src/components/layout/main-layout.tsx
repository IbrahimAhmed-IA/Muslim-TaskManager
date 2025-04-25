import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaList, FaClock, FaStickyNote, FaPray, FaChartLine, FaCog } from 'react-icons/fa';
import { useAppSettings } from '@/context/app-settings-context';
import SidebarTimerIndicator from './sidebar-timer-indicator';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { settings, toggleAdvancedMode } = useAppSettings();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Enhanced with better styling */}
      <div
        className={`sidebar w-20 fixed left-0 top-0 h-full z-10 shadow-xl transition-all duration-300 ease-in-out ${
          settings.advancedMode
            ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-blue-900/20'
            : 'bg-gradient-to-b from-indigo-600 to-purple-700'
        }`}
      >
        <div className="flex flex-col items-center justify-center mt-8 mb-12">
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-full overflow-hidden ${
              settings.advancedMode
                ? 'bg-gradient-to-br from-slate-700 to-slate-900 p-0.5 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-white p-0.5 shadow-md'
            }`}
          >
            <Image
              src="/images/logo.png"
              alt="Muslim Task Manager"
              width={48}
              height={48}
              className="rounded-full transition-transform hover:scale-110 duration-300"
            />
          </div>
          <span className={`text-white text-xs mt-3 tracking-wide font-medium ${settings.advancedMode ? 'opacity-90' : 'opacity-75'}`}>
            {settings.advancedMode ? 'Advanced Mode' : 'Task Manager'}
          </span>
        </div>

        <div className="flex flex-col items-center space-y-7">
          <Link href="/" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white transition-all duration-200 ${
                pathname === '/'
                  ? settings.advancedMode
                    ? 'bg-blue-600/30 shadow-lg scale-110 border border-blue-500/30 shadow-blue-500/20'
                    : 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : settings.advancedMode
                    ? 'hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-blue-500/20'
                    : 'hover:bg-white/10'
              }`}
              aria-label="Task Manager"
            >
              <FaList size={20} className={pathname === '/' && settings.advancedMode ? 'text-blue-400' : ''} />
            </button>
            <span className={`text-white text-xs transition-all duration-200 ${
              pathname === '/'
                ? settings.advancedMode ? 'text-blue-400 font-medium' : 'text-white'
                : settings.advancedMode ? 'text-white/70 hover:text-blue-400' : 'text-white/70'
            }`}>
              Tasks
            </span>
          </Link>

          <Link href="/pomodoro" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white transition-all duration-200 ${
                pathname === '/pomodoro'
                  ? settings.advancedMode
                    ? 'bg-purple-600/30 shadow-lg scale-110 border border-purple-500/30 shadow-purple-500/20'
                    : 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : settings.advancedMode
                    ? 'hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-purple-500/20'
                    : 'hover:bg-white/10'
              }`}
              aria-label="Pomodoro Timer"
            >
              <FaClock size={20} className={pathname === '/pomodoro' && settings.advancedMode ? 'text-purple-400' : ''} />
            </button>
            <span className={`text-white text-xs transition-all duration-200 ${
              pathname === '/pomodoro'
                ? settings.advancedMode ? 'text-purple-400 font-medium' : 'text-white'
                : settings.advancedMode ? 'text-white/70 hover:text-purple-400' : 'text-white/70'
            }`}>
              Pomodoro
            </span>
          </Link>

          <Link href="/worship-tasks" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white transition-all duration-200 ${
                pathname === '/worship-tasks'
                  ? settings.advancedMode
                    ? 'bg-green-600/30 shadow-lg scale-110 border border-green-500/30 shadow-green-500/20'
                    : 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : settings.advancedMode
                    ? 'hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-green-500/20'
                    : 'hover:bg-white/10'
              }`}
              aria-label="Muslim's Worship Tasks"
            >
              <FaPray size={20} className={pathname === '/worship-tasks' && settings.advancedMode ? 'text-green-400' : ''} />
            </button>
            <span className={`text-white text-xs transition-all duration-200 ${
              pathname === '/worship-tasks'
                ? settings.advancedMode ? 'text-green-400 font-medium' : 'text-white'
                : settings.advancedMode ? 'text-white/70 hover:text-green-400' : 'text-white/70'
            }`}>
              Worship
            </span>
          </Link>

          <Link href="/notes" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white transition-all duration-200 ${
                pathname === '/notes'
                  ? settings.advancedMode
                    ? 'bg-amber-600/30 shadow-lg scale-110 border border-amber-500/30 shadow-amber-500/20'
                    : 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : settings.advancedMode
                    ? 'hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-amber-500/20'
                    : 'hover:bg-white/10'
              }`}
              aria-label="Notes"
            >
              <FaStickyNote size={20} className={pathname === '/notes' && settings.advancedMode ? 'text-amber-400' : ''} />
            </button>
            <span className={`text-white text-xs transition-all duration-200 ${
              pathname === '/notes'
                ? settings.advancedMode ? 'text-amber-400 font-medium' : 'text-white'
                : settings.advancedMode ? 'text-white/70 hover:text-amber-400' : 'text-white/70'
            }`}>
              Notes
            </span>
          </Link>

          <Link href="/mithaq" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white transition-all duration-200 ${
                pathname === '/mithaq'
                  ? settings.advancedMode
                    ? 'bg-cyan-600/30 shadow-lg scale-110 border border-cyan-500/30 shadow-cyan-500/20'
                    : 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : settings.advancedMode
                    ? 'hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-cyan-500/20'
                    : 'hover:bg-white/10'
              }`}
              aria-label="Mithaq Al-Tatwir"
            >
              <FaChartLine size={20} className={pathname === '/mithaq' && settings.advancedMode ? 'text-cyan-400' : ''} />
            </button>
            <span className={`text-white text-xs transition-all duration-200 ${
              pathname === '/mithaq'
                ? settings.advancedMode ? 'text-cyan-400 font-medium' : 'text-white'
                : settings.advancedMode ? 'text-white/70 hover:text-cyan-400' : 'text-white/70'
            }`}>
              Mithaq
            </span>
          </Link>

          {/* Advanced Mode Toggle - Enhanced */}
          <div className="flex flex-col items-center mt-8">
            <button
              onClick={toggleAdvancedMode}
              className={`sidebar-btn w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white transition-all duration-300 ${
                settings.advancedMode
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg scale-110 border border-blue-400/30'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Toggle Advanced Mode"
            >
              <FaCog size={20} className={settings.advancedMode ? 'animate-spin-slow text-white' : ''} />
            </button>
            <span className={`text-white text-xs font-medium ${settings.advancedMode ? 'text-blue-300' : 'text-white/70'}`}>
              {settings.advancedMode ? 'Advanced' : 'Basic'}
            </span>
          </div>
        </div>

        {/* Timer Indicator that shows when a timer is running */}
        <SidebarTimerIndicator />
      </div>

      {/* Main Content - Enhanced styling for advanced mode */}
      <main className={`flex-1 pl-20 min-h-screen transition-colors duration-300 ${
        settings.advancedMode
          ? 'bg-gradient-to-b from-slate-900 to-slate-950 text-white'
          : 'bg-gray-50'
      }`}>
        {children}
      </main>
    </div>
  );
}
