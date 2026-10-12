import React from 'react';
import { Plus, TableProperties, BarChart3, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'spreadsheet';
  setActiveTab: (tab: 'dashboard' | 'spreadsheet') => void;
  onOpenNewModal: () => void;
  onResetData: () => void;
  orderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewModal,
  onResetData,
  orderCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-800 transition-colors"
            >
              SalesPulse Analytics
            </a>
          </div>

          {/* Zone 2: Navigation Links / Single-line mode switch */}
          <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard & Grafik</span>
            </button>
            <button
              onClick={() => setActiveTab('spreadsheet')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'spreadsheet'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Spreadsheet Editor</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono-numbers">
                {orderCount}
              </span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quick Reset */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetData}
              title="Reset ke data awal"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Data</span>
            </button>

            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Input Data Baru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
