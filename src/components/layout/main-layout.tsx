import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaList, FaClock, FaStickyNote, FaPray, FaChartLine, FaCog } from 'react-icons/fa';
import { useAppSettings } from '@/context/app-settings-context';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { settings, toggleAdvancedMode } = useAppSettings();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`sidebar w-20 ${
          settings.advancedMode
            ? 'bg-gradient-to-b from-advanced-primary to-advanced-secondary'
            : 'bg-gradient-to-b from-indigo-600 to-purple-700'
        } flex flex-col items-center py-8 fixed left-0 top-0 h-full z-10 shadow-xl`}
      >
        <div className="flex flex-col items-center justify-center mb-10">
          <div
            className={`w-14 h-14 flex items-center justify-center shadow-md rounded-full overflow-hidden ${
              settings.advancedMode ? 'bg-slate-800 p-0.5' : 'bg-white p-0.5'
            }`}
          >
            <Image
              src="/images/logo.png"
              alt="Muslim Task Manager"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <span className="text-white text-xs mt-2 opacity-75">Tasks</span>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <Link href="/">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-1 flex items-center justify-center text-white ${
                pathname === '/'
                  ? 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Task Manager"
            >
              <FaList size={20} />
            </button>
            <span className="text-white/70 text-xs">Tasks</span>
          </Link>

          <Link href="/pomodoro" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-1 flex items-center justify-center text-white ${
                pathname === '/pomodoro'
                  ? 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Pomodoro Timer"
            >
              <FaClock size={20} />
            </button>
            <span className="text-white/70 text-xs">Pomodoro</span>
          </Link>

          <Link href="/worship-tasks" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-1 flex items-center justify-center text-white ${
                pathname === '/worship-tasks'
                  ? 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Muslim's Worship Tasks"
            >
              <FaPray size={20} />
            </button>
            <span className="text-white/70 text-xs">Worship</span>
          </Link>

          <Link href="/notes" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-1 flex items-center justify-center text-white ${
                pathname === '/notes'
                  ? 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Notes"
            >
              <FaStickyNote size={20} />
            </button>
            <span className="text-white/70 text-xs">Notes</span>
          </Link>

          <Link href="/mithaq" className="flex flex-col items-center">
            <button
              className={`sidebar-btn w-12 h-12 rounded-xl mb-1 flex items-center justify-center text-white ${
                pathname === '/mithaq'
                  ? 'bg-white/20 shadow-lg scale-110 border border-white/20'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Mithaq Al-Tatwir"
            >
              <FaChartLine size={20} />
            </button>
            <span className="text-white/70 text-xs">Mithaq</span>
          </Link>

          {/* Advanced Mode Toggle */}
          <div className="flex flex-col items-center mt-8">
            <button
              onClick={toggleAdvancedMode}
              className={`sidebar-btn w-12 h-12 rounded-xl mb-1 flex items-center justify-center text-white ${
                settings.advancedMode
                  ? 'bg-blue-600 shadow-lg scale-110 border border-blue-400'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Toggle Advanced Mode"
            >
              <FaCog size={20} className={settings.advancedMode ? 'animate-spin-slow' : ''} />
            </button>
            <span className="text-white/70 text-xs">{settings.advancedMode ? 'Advanced' : 'Basic'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 pl-20 ${settings.advancedMode ? 'bg-slate-900' : 'bg-gray-50'} min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
