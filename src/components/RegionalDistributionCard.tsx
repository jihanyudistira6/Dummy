import React from 'react';
import { SaleOrder } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { MapPin, ArrowRight } from 'lucide-react';

interface RegionalDistributionCardProps {
  orders: SaleOrder[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const RegionalDistributionCard: React.FC<RegionalDistributionCardProps> = ({
  orders,
  selectedRegion,
  onSelectRegion,
}) => {
  // Aggregate by region
  const regionStats = React.useMemo(() => {
    const map = new Map<string, { revenue: number; quantity: number; count: number }>();

    orders.forEach((o) => {
      const cur = map.get(o.region) || { revenue: 0, quantity: 0, count: 0 };
      cur.revenue += o.totalRevenue;
      cur.quantity += o.quantity;
      cur.count += 1;
      map.set(o.region, cur);
    });

    const totalRev = orders.reduce((sum, o) => sum + o.totalRevenue, 0);

    const list = Array.from(map.entries()).map(([region, data]) => ({
      region,
      revenue: data.revenue,
      quantity: data.quantity,
      count: data.count,
      percent: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
    }));

    // Sort descending by revenue
    list.sort((a, b) => b.revenue - a.revenue);
    return list;
  }, [orders]);

  const maxRevenue = regionStats.length > 0 ? Math.max(...regionStats.map((r) => r.revenue)) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>Distribusi Penjualan per Daerah</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik daerah di bawah untuk memfilter grafik pendapatan
          </p>
        </div>
        {selectedRegion !== 'ALL' && (
          <button
            onClick={() => onSelectRegion('ALL')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            Lihat Semua
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3 font-sans">
        {regionStats.map((item, idx) => {
          const isSelected = selectedRegion.toLowerCase() === item.region.toLowerCase();
          const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

          return (
            <div
              key={item.region}
              onClick={() => onSelectRegion(isSelected ? 'ALL' : item.region)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center font-mono-numbers ${
                      isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.region}
                  </span>
                  <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    · {item.count} order ({formatNumber(item.quantity)} unit)
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono-numbers">
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(item.revenue)}
                  </span>
                  <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    ({item.percent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isSelected ? 'bg-slate-800' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    isSelected ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                  style={{ width: `${Math.max(barWidth, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
