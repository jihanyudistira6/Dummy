import React, { useState } from 'react';
import { SaleOrder, SortDimension, DimensionRevenueItem } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { ArrowDownAZ, BarChart2, TrendingUp, Trophy, HelpCircle } from 'lucide-react';

interface RevenueChartProps {
  orders: SaleOrder[];
  dimension: SortDimension;
  setDimension: (dim: SortDimension) => void;
  selectedRegion: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  orders,
  dimension,
  setDimension,
  selectedRegion,
}) => {
  const [viewStyle, setViewStyle] = useState<'horizontal' | 'vertical'>('horizontal');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group orders by the selected dimension and calculate revenue
  const groupedData: DimensionRevenueItem[] = React.useMemo(() => {
    const map = new Map<string, {
      revenue: number;
      quantity: number;
      orderCount: number;
      category?: string;
      region?: string;
    }>();

    orders.forEach((order) => {
      let key = '';
      if (dimension === 'product') {
        key = order.productName;
      } else if (dimension === 'category') {
        key = order.category;
      } else if (dimension === 'region') {
        key = order.region;
      } else if (dimension === 'salesRep') {
        key = order.salesRep;
      }

      const existing = map.get(key) || {
        revenue: 0,
        quantity: 0,
        orderCount: 0,
        category: order.category,
        region: order.region,
      };

      existing.revenue += order.totalRevenue;
      existing.quantity += order.quantity;
      existing.orderCount += 1;
      map.set(key, existing);
    });

    const totalFilteredRevenue = orders.reduce((sum, o) => sum + o.totalRevenue, 0);

    const items: DimensionRevenueItem[] = Array.from(map.entries()).map(([key, val]) => ({
      key,
      label: key,
      revenue: val.revenue,
      quantity: val.quantity,
      orderCount: val.orderCount,
      percentage: totalFilteredRevenue > 0 ? (val.revenue / totalFilteredRevenue) * 100 : 0,
      category: val.category,
      region: val.region,
    }));

    // CRITICAL: Sort strictly in descending order (highest revenue to lowest revenue)
    items.sort((a, b) => b.revenue - a.revenue);

    return items;
  }, [orders, dimension]);

  const maxRevenue = groupedData.length > 0 ? Math.max(...groupedData.map((d) => d.revenue)) : 1;
  const totalRevenue = groupedData.reduce((sum, d) => sum + d.revenue, 0);

  const dimensionTitleMap: Record<SortDimension, string> = {
    product: 'Pendapatan Berdasarkan Produk',
    category: 'Pendapatan Berdasarkan Kategori',
    region: 'Pendapatan Berdasarkan Daerah / Wilayah',
    salesRep: 'Pendapatan Berdasarkan Sales Representative',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {dimensionTitleMap[dimension]}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <ArrowDownAZ className="w-3 h-3" />
              <span>Urut Terbanyak → Terkecil</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {selectedRegion !== 'ALL'
              ? `Data tersaring khusus daerah ${selectedRegion} · `
              : 'Menampilkan seluruh wilayah · '}
            {groupedData.length} item diperingkat otomatis berdasarkan total penjualan
          </p>
        </div>

        {/* View style toggle & quick dimension toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setViewStyle('horizontal')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewStyle === 'horizontal'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Bar Horizontal Berperingkat"
            >
              Horizontal (Ranking)
            </button>
            <button
              onClick={() => setViewStyle('vertical')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewStyle === 'vertical'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kolom Vertikal"
            >
              Kolom Vertikal
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      {groupedData.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada data yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Coba sesuaikan filter daerah atau kata kunci pencarian Anda untuk melihat grafik pendapatan.
          </p>
        </div>
      ) : viewStyle === 'horizontal' ? (
        /* HORIZONTAL RANKED BAR CHART (Descending) */
        <div className="mt-5 space-y-3">
          {groupedData.map((item, index) => {
            const barWidthPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            const isTopRank = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group p-2.5 rounded-lg border transition-all ${
                  hoveredIndex === index
                    ? 'border-slate-300 bg-slate-50/80 shadow-xs'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded shrink-0 font-mono-numbers ${
                        isTopRank
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isSecond
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : isThird
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="font-semibold text-slate-900 truncate">
                      {item.label}
                    </span>

                    {/* Metadata tags */}
                    {dimension === 'product' && item.category && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        · {item.category}
                      </span>
                    )}
                  </div>

                  {/* Numbers: Revenue + Share */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      {formatNumber(item.quantity)} unit ({item.orderCount} pesanan)
                    </span>
                    <span className="font-bold text-slate-900 text-sm font-mono-numbers">
                      {formatCurrency(item.revenue)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 w-12 text-right font-mono-numbers">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bar visualization */}
                <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden relative">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${
                      isTopRank
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        : isSecond
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600'
                        : isThird
                        ? 'bg-gradient-to-r from-sky-500 to-sky-600'
                        : 'bg-gradient-to-r from-slate-400 to-slate-500'
                    }`}
                    style={{ width: `${Math.max(barWidthPercent, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VERTICAL COLUMN CHART (Descending) */
        <div className="mt-6">
          <div className="h-64 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-200 overflow-x-auto px-2">
            {groupedData.map((item, index) => {
              const barHeightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const isTop = index === 0;

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 min-w-[42px] max-w-[72px] flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md whitespace-nowrap font-mono-numbers">
                    {item.label}: {formatCurrency(item.revenue)} ({item.percentage.toFixed(1)}%)
                  </div>

                  {/* Top value */}
                  <div className="text-[10px] font-semibold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity font-mono-numbers text-center">
                    {formatCurrency(item.revenue).replace('.00', '')}
                  </div>

                  {/* Column Bar */}
                  <div className="w-full bg-slate-100 rounded-t-md relative flex items-end overflow-hidden" style={{ height: '180px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isTop
                          ? 'bg-emerald-600'
                          : index < 3
                          ? 'bg-indigo-600'
                          : 'bg-slate-400 group-hover:bg-slate-500'
                      }`}
                      style={{ height: `${Math.max(barHeightPercent, 4)}%` }}
                    />
                  </div>

                  {/* Label underneath */}
                  <div className="mt-2 text-[10px] text-slate-700 font-medium truncate w-full text-center" title={item.label}>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
            <span>Paling Banyak ({groupedData[0]?.label})</span>
            <span>Paling Sedikit ({groupedData[groupedData.length - 1]?.label})</span>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>
            Pendapatan Tertinggi:{' '}
            <strong className="text-slate-800 font-semibold font-mono-numbers">
              {groupedData[0]?.label} ({formatCurrency(groupedData[0]?.revenue || 0)})
            </strong>
          </span>
        </div>
        <div>
          Total Pendapatan Terfilter:{' '}
          <strong className="text-slate-900 font-mono-numbers">
            {formatCurrency(totalRevenue)}
          </strong>
        </div>
      </div>
    </div>
  );
};
