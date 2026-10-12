import React from 'react';
import { FilterState, SortDimension } from '../types/sales';
import { Search, MapPin, X, ArrowDownWideNarrow, Layers, CheckCircle2 } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  availableRegions: string[];
  availableCategories: string[];
  statusCounts: { selesai: number; dikirim: number; retur: number };
  totalFilteredOrders: number;
  totalAllOrders: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  availableRegions,
  availableCategories,
  statusCounts,
  totalFilteredOrders,
  totalAllOrders,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filter.region !== 'ALL' ||
    filter.category !== 'ALL' ||
    filter.status !== 'ALL' ||
    filter.searchQuery.trim() !== '';

  const dimensionLabels: Record<SortDimension, string> = {
    product: 'Produk',
    category: 'Kategori',
    region: 'Daerah',
    salesRep: 'Sales Rep',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
      {/* Top row: Search + Sort dimension + Quick Reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Cari produk, order ID, sales rep..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right controls: Dimension Selector + Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dimension Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-xs font-medium text-slate-500 pl-2 pr-1 flex items-center gap-1">
              <ArrowDownWideNarrow className="w-3.5 h-3.5 text-slate-400" />
              <span>Urutkan:</span>
            </span>
            {(['product', 'category', 'region', 'salesRep'] as SortDimension[]).map((dim) => (
              <button
                key={dim}
                onClick={() => setFilter((prev) => ({ ...prev, dimension: dim }))}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  filter.dimension === dim
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dimensionLabels[dim]}
              </button>
            ))}
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
              title="Reset semua filter ke kondisi awal"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Prominent Filter Status Buttons */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Status:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter((prev) => ({ ...prev, status: 'ALL' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                filter.status === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>Semua Status</span>
              <span className="font-mono-numbers text-[10px] opacity-75">({totalAllOrders})</span>
            </button>

            <button
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  status: prev.status.toLowerCase() === 'selesai' ? 'ALL' : 'Selesai',
                }))
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                filter.status.toLowerCase() === 'selesai'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs ring-1 ring-emerald-800'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>Selesai</span>
              <span
                className={`font-mono-numbers text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  filter.status.toLowerCase() === 'selesai'
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-emerald-200/70 text-emerald-900'
                }`}
              >
                {statusCounts.selesai}
              </span>
            </button>

            <button
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  status: prev.status.toLowerCase() === 'dikirim' ? 'ALL' : 'Dikirim',
                }))
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                filter.status.toLowerCase() === 'dikirim'
                  ? 'bg-amber-700 text-white font-semibold shadow-xs ring-1 ring-amber-800'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>Dikirim</span>
              <span
                className={`font-mono-numbers text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  filter.status.toLowerCase() === 'dikirim'
                    ? 'bg-amber-800 text-amber-100'
                    : 'bg-amber-200/70 text-amber-900'
                }`}
              >
                {statusCounts.dikirim}
              </span>
            </button>

            <button
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  status: prev.status.toLowerCase() === 'retur' ? 'ALL' : 'Retur',
                }))
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                filter.status.toLowerCase() === 'retur'
                  ? 'bg-rose-700 text-white font-semibold shadow-xs ring-1 ring-rose-800'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>Retur</span>
              <span
                className={`font-mono-numbers text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  filter.status.toLowerCase() === 'retur'
                    ? 'bg-rose-800 text-rose-100'
                    : 'bg-rose-200/70 text-rose-900'
                }`}
              >
                {statusCounts.retur}
              </span>
            </button>
          </div>

          <div className="sm:ml-auto text-xs text-slate-500 whitespace-nowrap shrink-0">
            Hasil saring: <span className="font-semibold text-slate-900 font-mono-numbers">{totalFilteredOrders}</span> dari{' '}
            <span className="font-mono-numbers">{totalAllOrders}</span> pesanan
          </div>
        </div>
      </div>

      {/* Row 3: Core requirement: Region Filter Bar */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Daerah:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter((prev) => ({ ...prev, region: 'ALL' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filter.region === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              Semua Daerah
            </button>

            {availableRegions.map((region) => {
              const isSelected = filter.region.toLowerCase() === region.toLowerCase();
              return (
                <button
                  key={region}
                  onClick={() =>
                    setFilter((prev) => ({
                      ...prev,
                      region: isSelected ? 'ALL' : region,
                    }))
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary filter: Category tabs */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
          <Layers className="w-3.5 h-3.5" />
          <span>Kategori:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter((prev) => ({ ...prev, category: 'ALL' }))}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filter.category === 'ALL'
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  category: prev.category === cat ? 'ALL' : cat,
                }))
              }
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter.category === cat
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
