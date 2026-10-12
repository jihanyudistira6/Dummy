import React from 'react';
import { SaleOrder } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { DollarSign, PackageCheck, ShoppingBag, TrendingUp } from 'lucide-react';

interface MetricCardsProps {
  orders: SaleOrder[];
  allOrdersCount: number;
  filteredRegion: string;
  currentStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  orders,
  allOrdersCount,
  filteredRegion,
  currentStatusFilter = 'ALL',
  onSelectStatus,
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalRevenue, 0);
  const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const selesaiCount = orders.filter((o) => o.status === 'Selesai').length;
  const dikirimCount = orders.filter((o) => o.status === 'Dikirim').length;
  const returCount = orders.filter((o) => o.status === 'Retur').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Pendapatan</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 font-mono-numbers">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{orderCount} transaksi</span>
            {filteredRegion !== 'ALL' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700 font-medium">{filteredRegion}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Total Units Sold */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Unit Terjual</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 font-mono-numbers">
            {formatNumber(totalQuantity)} <span className="text-base font-normal text-slate-500">unit</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Rata-rata {(orderCount > 0 ? (totalQuantity / orderCount).toFixed(1) : '0')} unit/order</span>
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Rata-rata Nilai Order</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 font-mono-numbers">
            {formatCurrency(avgOrderValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Dari {orderCount} transaksi terfilter</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Status Pemenuhan</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <button
              onClick={() => onSelectStatus && onSelectStatus(currentStatusFilter === 'Selesai' ? 'ALL' : 'Selesai')}
              className={`px-1.5 py-0.5 rounded text-left transition-colors flex items-baseline gap-1 ${
                currentStatusFilter === 'Selesai'
                  ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400 font-bold'
                  : 'hover:bg-slate-100 text-slate-900'
              }`}
              title="Filter status Selesai"
            >
              <span className="text-xl font-bold font-mono-numbers">{selesaiCount}</span>
              <span className="text-[11px] text-slate-500">Selesai</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => onSelectStatus && onSelectStatus(currentStatusFilter === 'Dikirim' ? 'ALL' : 'Dikirim')}
              className={`px-1.5 py-0.5 rounded text-left transition-colors flex items-baseline gap-1 ${
                currentStatusFilter === 'Dikirim'
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Filter status Dikirim"
            >
              <span className="text-xl font-bold font-mono-numbers">{dikirimCount}</span>
              <span className="text-[11px] text-slate-500">Kirim</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => onSelectStatus && onSelectStatus(currentStatusFilter === 'Retur' ? 'ALL' : 'Retur')}
              className={`px-1.5 py-0.5 rounded text-left transition-colors flex items-baseline gap-1 ${
                currentStatusFilter === 'Retur'
                  ? 'bg-rose-100 text-rose-900 ring-1 ring-rose-400 font-bold'
                  : 'hover:bg-slate-100 text-rose-600'
              }`}
              title="Filter status Retur"
            >
              <span className="text-xl font-bold font-mono-numbers">{returCount}</span>
              <span className="text-[11px] text-rose-600">Retur</span>
            </button>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${orderCount ? (selesaiCount / orderCount) * 100 : 0}%` }}
              title={`Selesai: ${selesaiCount}`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${orderCount ? (dikirimCount / orderCount) * 100 : 0}%` }}
              title={`Dikirim: ${dikirimCount}`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${orderCount ? (returCount / orderCount) * 100 : 0}%` }}
              title={`Retur: ${returCount}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
