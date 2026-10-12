import React from 'react';
import { SaleOrder } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Tag } from 'lucide-react';

interface CategoryBreakdownCardProps {
  orders: SaleOrder[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  orders,
  selectedCategory,
  onSelectCategory,
}) => {
  const categoryStats = React.useMemo(() => {
    const map = new Map<string, { revenue: number; quantity: number; count: number }>();

    orders.forEach((o) => {
      const cur = map.get(o.category) || { revenue: 0, quantity: 0, count: 0 };
      cur.revenue += o.totalRevenue;
      cur.quantity += o.quantity;
      cur.count += 1;
      map.set(o.category, cur);
    });

    const totalRev = orders.reduce((sum, o) => sum + o.totalRevenue, 0);

    const list = Array.from(map.entries()).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      quantity: data.quantity,
      count: data.count,
      percent: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
    }));

    // Sort descending by revenue
    list.sort((a, b) => b.revenue - a.revenue);
    return list;
  }, [orders]);

  const maxRevenue = categoryStats.length > 0 ? Math.max(...categoryStats.map((c) => c.revenue)) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-500" />
            <span>Pendapatan per Kategori Produk</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Urut dari kategori dengan penjualan tertinggi ke terendah
          </p>
        </div>
        {selectedCategory !== 'ALL' && (
          <button
            onClick={() => onSelectCategory('ALL')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            Lihat Semua
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3 font-sans">
        {categoryStats.map((item, idx) => {
          const isSelected = selectedCategory.toLowerCase() === item.category.toLowerCase();
          const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

          return (
            <div
              key={item.category}
              onClick={() => onSelectCategory(isSelected ? 'ALL' : item.category)}
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
                    {item.category}
                  </span>
                  <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    · {item.count} transaksi ({formatNumber(item.quantity)} unit)
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
                    isSelected ? 'bg-emerald-400' : 'bg-indigo-600'
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
