import React, { useState, useEffect, useMemo } from 'react';
import { SaleOrder, FilterState } from './types/sales';
import {
  INITIAL_SALES_DATA,
  DEFAULT_REGIONS,
  DEFAULT_CATEGORIES,
  DEFAULT_SALES_REPS,
} from './data/initialData';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { RevenueChart } from './components/RevenueChart';
import { SpreadsheetView } from './components/SpreadsheetView';
import { RegionalDistributionCard } from './components/RegionalDistributionCard';
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard';
import { NewTransactionModal } from './components/NewTransactionModal';
import { getNextOrderId } from './utils/formatters';
import { Sparkles, ArrowRight, Table } from 'lucide-react';

const STORAGE_KEY = 'ecommerce_sales_ledger_data_v1';

export default function App() {
  // Load data from localStorage or fallback to INITIAL_SALES_DATA
  const [orders, setOrders] = useState<SaleOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    return INITIAL_SALES_DATA;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'spreadsheet'>('dashboard');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    region: 'ALL',
    category: 'ALL',
    status: 'ALL',
    searchQuery: '',
    sortByRevenueDesc: true,
    dimension: 'product',
  });

  // Persist orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }, [orders]);

  // Derived available dropdown options
  const availableRegions = useMemo(() => {
    const set = new Set<string>(DEFAULT_REGIONS);
    orders.forEach((o) => {
      if (o.region?.trim()) set.add(o.region.trim());
    });
    return Array.from(set);
  }, [orders]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    orders.forEach((o) => {
      if (o.category?.trim()) set.add(o.category.trim());
    });
    return Array.from(set);
  }, [orders]);

  const availableSalesReps = useMemo(() => {
    const set = new Set<string>(DEFAULT_SALES_REPS);
    orders.forEach((o) => {
      if (o.salesRep?.trim()) set.add(o.salesRep.trim());
    });
    return Array.from(set);
  }, [orders]);

  // Status counts across all orders
  const statusCounts = useMemo(() => {
    return {
      selesai: orders.filter((o) => (o.status || '').trim().toLowerCase() === 'selesai').length,
      dikirim: orders.filter((o) => (o.status || '').trim().toLowerCase() === 'dikirim').length,
      retur: orders.filter((o) => (o.status || '').trim().toLowerCase() === 'retur').length,
    };
  }, [orders]);

  // Robust filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Region filter
      if (filter.region !== 'ALL') {
        const orderRegion = (order.region || '').trim().toLowerCase();
        const filterRegion = filter.region.trim().toLowerCase();
        if (orderRegion !== filterRegion) return false;
      }

      // Category filter
      if (filter.category !== 'ALL') {
        const orderCategory = (order.category || '').trim().toLowerCase();
        const filterCategory = filter.category.trim().toLowerCase();
        if (orderCategory !== filterCategory) return false;
      }

      // Status filter
      if (filter.status !== 'ALL') {
        const orderStatus = (order.status || '').trim().toLowerCase();
        const filterStatus = filter.status.trim().toLowerCase();
        if (orderStatus !== filterStatus) return false;
      }

      // Search query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.trim().toLowerCase();
        const match =
          (order.id || '').toLowerCase().includes(query) ||
          (order.productName || '').toLowerCase().includes(query) ||
          (order.salesRep || '').toLowerCase().includes(query) ||
          (order.region || '').toLowerCase().includes(query) ||
          (order.category || '').toLowerCase().includes(query) ||
          (order.status || '').toLowerCase().includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [orders, filter]);

  // Safe row updating without deleting unfiltered rows
  const handleUpdateRow = (
    id: string,
    field: keyof SaleOrder,
    value: string | number
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;

        const updated = { ...order };
        if (field === 'quantity') {
          const qty = parseInt(String(value), 10) || 0;
          updated.quantity = qty;
          updated.totalRevenue = qty * updated.unitPrice;
        } else if (field === 'unitPrice') {
          const price = parseFloat(String(value)) || 0;
          updated.unitPrice = price;
          updated.totalRevenue = updated.quantity * price;
        } else if (field === 'totalRevenue') {
          updated.totalRevenue = parseFloat(String(value)) || 0;
        } else {
          (updated as any)[field] = value;
        }

        return updated;
      })
    );
  };

  const handleAddNewRow = () => {
    const newId = getNextOrderId(orders);
    const newRow: SaleOrder = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      region: filter.region !== 'ALL' ? filter.region : availableRegions[0] || 'Jawa',
      salesRep: 'Budi',
      category: filter.category !== 'ALL' ? filter.category : availableCategories[0] || 'Elektronik',
      productName: 'Produk Baru',
      quantity: 1,
      unitPrice: 50.0,
      totalRevenue: 50.0,
      status: filter.status !== 'ALL' ? (filter.status as any) : 'Selesai',
    };
    setOrders((prev) => [newRow, ...prev]);
  };

  const handleDuplicateRow = (order: SaleOrder) => {
    const newId = getNextOrderId(orders);
    const duplicated: SaleOrder = {
      ...order,
      id: newId,
      date: new Date().toISOString().split('T')[0],
    };
    setOrders((prev) => [duplicated, ...prev]);
  };

  const handleDeleteRow = (id: string) => {
    if (orders.length <= 1) {
      alert('Minimal harus ada 1 transaksi dalam sistem!');
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleAddOrder = (newOrder: SaleOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleReplaceAllOrders = (newOrders: SaleOrder[]) => {
    setOrders(newOrders);
  };

  const handleResetData = () => {
    if (window.confirm('Kembalikan data ke 15 transaksi awal standar?')) {
      setOrders(INITIAL_SALES_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SALES_DATA));
      setFilter({
        region: 'ALL',
        category: 'ALL',
        status: 'ALL',
        searchQuery: '',
        sortByRevenueDesc: true,
        dimension: 'product',
      });
    }
  };

  const handleResetFilters = () => {
    setFilter((prev) => ({
      ...prev,
      region: 'ALL',
      category: 'ALL',
      status: 'ALL',
      searchQuery: '',
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onResetData={handleResetData}
        orderCount={orders.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome & Live Sync Kicker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Dashboard Pendapatan E-Commerce
              </h1>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Spreadsheet Terintegrasi Real-Time</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi grafik penjualan berurut dari nominal tertinggi ke terendah dengan filter daerah & status interaktif.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'dashboard' ? (
              <button
                onClick={() => setActiveTab('spreadsheet')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Buka Lembar Spreadsheet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Lihat Visualisasi Grafik</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Filter Bar (Status, Daerah, Kategori, Search, Urutan) */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          availableRegions={availableRegions}
          availableCategories={availableCategories}
          statusCounts={statusCounts}
          totalFilteredOrders={filteredOrders.length}
          totalAllOrders={orders.length}
          onResetFilters={handleResetFilters}
        />

        {/* Tab 1: Dashboard & Visual Charts */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Metric Summary Strip with interactive status filter clicks */}
            <MetricCards
              orders={filteredOrders}
              allOrdersCount={orders.length}
              filteredRegion={filter.region}
              currentStatusFilter={filter.status}
              onSelectStatus={(status) => setFilter((prev) => ({ ...prev, status }))}
            />

            {/* Primary Ranked Revenue Chart (Highest to Lowest) */}
            <RevenueChart
              orders={filteredOrders}
              dimension={filter.dimension}
              setDimension={(dim) => setFilter((prev) => ({ ...prev, dimension: dim }))}
              selectedRegion={filter.region}
            />

            {/* Regional & Category Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RegionalDistributionCard
                orders={filteredOrders}
                selectedRegion={filter.region}
                onSelectRegion={(reg) => setFilter((prev) => ({ ...prev, region: reg }))}
              />
              <CategoryBreakdownCard
                orders={filteredOrders}
                selectedCategory={filter.category}
                onSelectCategory={(cat) => setFilter((prev) => ({ ...prev, category: cat }))}
              />
            </div>

            {/* Mini Embedded Spreadsheet Section in Dashboard */}
            <div className="pt-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Data Spreadsheet Langsung
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ketik langsung pada tabel di bawah ini untuk mengupdate grafik di atas secara real-time.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  + Tambah Baris Baru
                </button>
              </div>

              <SpreadsheetView
                orders={filteredOrders}
                allOrders={orders}
                totalAllOrdersCount={orders.length}
                currentStatusFilter={filter.status}
                onSelectStatusFilter={(status) => setFilter((prev) => ({ ...prev, status }))}
                onUpdateRow={handleUpdateRow}
                onAddNewRow={handleAddNewRow}
                onDuplicateRow={handleDuplicateRow}
                onDeleteRow={handleDeleteRow}
                onReplaceAllOrders={handleReplaceAllOrders}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                onResetData={handleResetData}
                availableRegions={availableRegions}
                availableCategories={availableCategories}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Full Spreadsheet View */}
        {activeTab === 'spreadsheet' && (
          <div className="space-y-4">
            <SpreadsheetView
              orders={filteredOrders}
              allOrders={orders}
              totalAllOrdersCount={orders.length}
              currentStatusFilter={filter.status}
              onSelectStatusFilter={(status) => setFilter((prev) => ({ ...prev, status }))}
              onUpdateRow={handleUpdateRow}
              onAddNewRow={handleAddNewRow}
              onDuplicateRow={handleDuplicateRow}
              onDeleteRow={handleDeleteRow}
              onReplaceAllOrders={handleReplaceAllOrders}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              onResetData={handleResetData}
              availableRegions={availableRegions}
              availableCategories={availableCategories}
            />
          </div>
        )}
      </main>

      {/* New Transaction Form Modal */}
      <NewTransactionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddOrder={handleAddOrder}
        existingOrders={orders}
        availableRegions={availableRegions}
        availableCategories={availableCategories}
        availableSalesReps={availableSalesReps}
      />

      {/* Clean quiet footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>E-Commerce Sales Revenue Dashboard · Tersinkronisasi Otomatis</span>
          <span className="font-mono-numbers text-slate-400">
            Total Transaksi Tercatat: {orders.length}
          </span>
        </div>
      </footer>
    </div>
  );
}
