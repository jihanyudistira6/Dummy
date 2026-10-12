import React, { useState, useRef } from 'react';
import { SaleOrder, OrderStatus } from '../types/sales';
import {
  formatCurrency,
  formatNumber,
  exportOrdersToCSV,
  parseCSVToOrders,
} from '../utils/formatters';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Search,
  AlertCircle,
  Copy,
  Table,
  Filter,
  X,
} from 'lucide-react';

interface SpreadsheetViewProps {
  orders: SaleOrder[]; // Rows to display (already filtered)
  allOrders: SaleOrder[]; // Master orders list
  totalAllOrdersCount: number;
  currentStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onUpdateRow: (id: string, field: keyof SaleOrder, value: string | number) => void;
  onAddNewRow: () => void;
  onDuplicateRow: (order: SaleOrder) => void;
  onDeleteRow: (id: string) => void;
  onReplaceAllOrders: (newOrders: SaleOrder[]) => void;
  onOpenNewModal: () => void;
  onResetData: () => void;
  availableRegions: string[];
  availableCategories: string[];
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  orders,
  allOrders,
  totalAllOrdersCount,
  currentStatusFilter,
  onSelectStatusFilter,
  onUpdateRow,
  onAddNewRow,
  onDuplicateRow,
  onDeleteRow,
  onReplaceAllOrders,
  onOpenNewModal,
  onResetData,
  availableRegions,
  availableCategories,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = exportOrdersToCSV(allOrders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecommerce-sales-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import CSV text
  const handleImportSubmit = () => {
    try {
      setImportError('');
      const parsed = parseCSVToOrders(importText);
      if (parsed.length === 0) {
        setImportError('Format CSV tidak valid atau tidak ada baris data ditemukan.');
        return;
      }
      onReplaceAllOrders(parsed);
      setShowImportModal(false);
      setImportText('');
    } catch (err: any) {
      setImportError('Gagal memproses CSV: ' + err.message);
    }
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSVToOrders(text);
        if (parsed.length > 0) {
          onReplaceAllOrders(parsed);
        } else {
          alert('Format CSV tidak dikenali.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Local search filter inside spreadsheet view
  const displayedOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      o.productName.toLowerCase().includes(term) ||
      o.region.toLowerCase().includes(term) ||
      o.salesRep.toLowerCase().includes(term) ||
      o.category.toLowerCase().includes(term)
    );
  });

  const totalQuantity = displayedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = displayedOrders.reduce((sum, o) => sum + o.totalRevenue, 0);

  // Status counts in master database
  const statusCounts = {
    selesai: allOrders.filter((o) => (o.status || '').toLowerCase() === 'selesai').length,
    dikirim: allOrders.filter((o) => (o.status || '').toLowerCase() === 'dikirim').length,
    retur: allOrders.filter((o) => (o.status || '').toLowerCase() === 'retur').length,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Spreadsheet Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Spreadsheet Data Penjualan E-Commerce
                </h2>
                <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  {displayedOrders.length} dari {totalAllOrdersCount} Baris
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ketik langsung pada sel spreadsheet untuk mengedit data. Total pendapatan dan grafik otomatis tersinkronisasi.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddNewRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              title="Tambahkan baris baru langsung ke lembar spreadsheet"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Baris Langsung</span>
            </button>

            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <span>Formulir Cepat</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              title="Download Data sebagai CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              title="Import data CSV baru"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Reset ke data bawaan awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Quick In-Spreadsheet Status Filter Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-slate-500 pl-2 pr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Status:</span>
            </span>
            <button
              onClick={() => onSelectStatusFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                currentStatusFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({totalAllOrdersCount})
            </button>
            <button
              onClick={() =>
                onSelectStatusFilter(currentStatusFilter.toLowerCase() === 'selesai' ? 'ALL' : 'Selesai')
              }
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                currentStatusFilter.toLowerCase() === 'selesai'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span>Selesai</span>
              <span className="font-mono-numbers text-[10px] opacity-80">({statusCounts.selesai})</span>
            </button>
            <button
              onClick={() =>
                onSelectStatusFilter(currentStatusFilter.toLowerCase() === 'dikirim' ? 'ALL' : 'Dikirim')
              }
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                currentStatusFilter.toLowerCase() === 'dikirim'
                  ? 'bg-amber-700 text-white font-semibold shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span>Dikirim</span>
              <span className="font-mono-numbers text-[10px] opacity-80">({statusCounts.dikirim})</span>
            </button>
            <button
              onClick={() =>
                onSelectStatusFilter(currentStatusFilter.toLowerCase() === 'retur' ? 'ALL' : 'Retur')
              }
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                currentStatusFilter.toLowerCase() === 'retur'
                  ? 'bg-rose-700 text-white font-semibold shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              <span>Retur</span>
              <span className="font-mono-numbers text-[10px] opacity-80">({statusCounts.retur})</span>
            </button>
          </div>

          {/* In-sheet search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari dalam spreadsheet..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Filter Alert Banner if status is active */}
        {currentStatusFilter !== 'ALL' && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
            <span>
              Menyaring baris dengan status: <strong className="text-slate-900 font-semibold">{currentStatusFilter}</strong> ({displayedOrders.length} transaksi ditampilkan)
            </span>
            <button
              onClick={() => onSelectStatusFilter('ALL')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tampilkan Semua Status</span>
            </button>
          </div>
        )}
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="overflow-x-auto max-h-[600px] relative">
        <table className="w-full text-xs text-left border-collapse font-sans">
          {/* Column Letter Coordinate Row (Excel style) */}
          <thead className="bg-slate-100 text-slate-500 uppercase font-mono-numbers sticky top-0 z-10 border-b border-slate-300">
            <tr>
              <th className="w-10 px-2 py-1.5 text-center border-r border-slate-200 bg-slate-200/60 font-semibold text-[10px]">
                #
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold">
                A <span className="font-normal text-slate-400 ml-1">· Order ID</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold">
                B <span className="font-normal text-slate-400 ml-1">· Tanggal</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold">
                C <span className="font-normal text-slate-400 ml-1">· Daerah</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold">
                D <span className="font-normal text-slate-400 ml-1">· Sales Rep</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold">
                E <span className="font-normal text-slate-400 ml-1">· Kategori</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold min-w-[160px]">
                F <span className="font-normal text-slate-400 ml-1">· Nama Produk</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold text-right w-20">
                G <span className="font-normal text-slate-400 ml-1">· Qty</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold text-right w-28">
                H <span className="font-normal text-slate-400 ml-1">· Harga ($)</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-emerald-800 font-bold text-right w-32 bg-emerald-50/50">
                I <span className="font-normal text-emerald-600 ml-1">· Total ($) [fx]</span>
              </th>
              <th className="px-3 py-1.5 border-r border-slate-200 text-slate-600 font-semibold w-28">
                J <span className="font-normal text-slate-400 ml-1">· Status</span>
              </th>
              <th className="px-3 py-1.5 text-center text-slate-500 font-semibold w-16">
                Aksi
              </th>
            </tr>
          </thead>

          {/* Table Data Rows */}
          <tbody className="divide-y divide-slate-200 font-mono-numbers">
            {displayedOrders.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400 font-sans">
                  <p className="font-medium text-sm text-slate-600">Tidak ada baris data yang cocok dengan filter saat ini</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba ganti filter status atau klik tombol di bawah untuk menambahkan baris baru.
                  </p>
                  <button
                    onClick={onAddNewRow}
                    className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Baru</span>
                  </button>
                </td>
              </tr>
            ) : (
              displayedOrders.map((order, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={order.id}
                    className={`group transition-colors ${
                      isEven ? 'bg-white' : 'bg-slate-50/40'
                    } hover:bg-sky-50/60`}
                  >
                    {/* Row Number */}
                    <td className="px-2 py-2 text-center text-[11px] text-slate-400 border-r border-slate-200 bg-slate-100/50 select-none">
                      {idx + 1}
                    </td>

                    {/* A: Order ID */}
                    <td className="px-2 py-1.5 border-r border-slate-200">
                      <input
                        type="text"
                        value={order.id}
                        onChange={(e) => onUpdateRow(order.id, 'id', e.target.value)}
                        className="w-full bg-transparent font-semibold text-slate-900 text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* B: Tanggal */}
                    <td className="px-2 py-1.5 border-r border-slate-200">
                      <input
                        type="date"
                        value={order.date}
                        onChange={(e) => onUpdateRow(order.id, 'date', e.target.value)}
                        className="w-full bg-transparent text-slate-700 text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* C: Daerah (Region) */}
                    <td className="px-2 py-1.5 border-r border-slate-200">
                      <select
                        value={order.region}
                        onChange={(e) => onUpdateRow(order.id, 'region', e.target.value)}
                        className="w-full bg-transparent text-slate-800 font-sans font-medium text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                      >
                        {availableRegions.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* D: Sales Rep */}
                    <td className="px-2 py-1.5 border-r border-slate-200">
                      <input
                        type="text"
                        value={order.salesRep}
                        onChange={(e) => onUpdateRow(order.id, 'salesRep', e.target.value)}
                        className="w-full bg-transparent font-sans text-slate-700 text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* E: Kategori */}
                    <td className="px-2 py-1.5 border-r border-slate-200">
                      <select
                        value={order.category}
                        onChange={(e) => onUpdateRow(order.id, 'category', e.target.value)}
                        className="w-full bg-transparent font-sans text-slate-700 text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        {!availableCategories.includes(order.category) && (
                          <option value={order.category}>{order.category}</option>
                        )}
                      </select>
                    </td>

                    {/* F: Nama Produk */}
                    <td className="px-2 py-1.5 border-r border-slate-200 font-sans">
                      <input
                        type="text"
                        value={order.productName}
                        onChange={(e) => onUpdateRow(order.id, 'productName', e.target.value)}
                        className="w-full bg-transparent text-slate-900 font-medium text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* G: Quantity */}
                    <td className="px-2 py-1.5 border-r border-slate-200 text-right">
                      <input
                        type="number"
                        min="1"
                        value={order.quantity}
                        onChange={(e) => onUpdateRow(order.id, 'quantity', e.target.value)}
                        className="w-full text-right bg-transparent text-slate-900 font-semibold text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* H: Unit Price ($) */}
                    <td className="px-2 py-1.5 border-r border-slate-200 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={order.unitPrice}
                        onChange={(e) => onUpdateRow(order.id, 'unitPrice', e.target.value)}
                        className="w-full text-right bg-transparent text-slate-900 text-xs px-1.5 py-1 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* I: Total Revenue ($) [Auto-calculated] */}
                    <td className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50/40">
                      <span className="font-bold text-emerald-700 text-xs">
                        {formatCurrency(order.totalRevenue)}
                      </span>
                    </td>

                    {/* J: Status */}
                    <td className="px-2 py-1.5 border-r border-slate-200">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateRow(order.id, 'status', e.target.value as OrderStatus)
                        }
                        className={`w-full font-sans text-xs px-2 py-1 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer ${
                          order.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : order.status === 'Dikirim'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <option value="Selesai">Selesai</option>
                        <option value="Dikirim">Dikirim</option>
                        <option value="Retur">Retur</option>
                      </select>
                    </td>

                    {/* Actions: Duplicate, Delete */}
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDuplicateRow(order)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Duplikat baris"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRow(order.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer Row (Excel formula style) */}
          <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 font-mono-numbers sticky bottom-0 z-10">
            <tr>
              <td className="px-2 py-2 text-center text-slate-400 text-[10px] bg-slate-200/80">
                ∑
              </td>
              <td colSpan={5} className="px-3 py-2 text-slate-700 text-xs">
                Total Ringkasan ({displayedOrders.length} Transaksi)
              </td>
              <td className="px-3 py-2 text-right text-slate-900 border-r border-slate-200">
                {formatNumber(totalQuantity)}
              </td>
              <td className="px-3 py-2 text-right text-slate-400 border-r border-slate-200">
                -
              </td>
              <td className="px-3 py-2 text-right text-emerald-800 bg-emerald-100/60 border-r border-slate-200 text-sm">
                {formatCurrency(totalRevenue)}
              </td>
              <td colSpan={2} className="px-3 py-2 text-xs text-slate-500 font-sans font-normal">
                Tersinkron ke grafik
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Spreadsheet Bottom Action & Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={onAddNewRow}
            className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Baris Berikutnya</span>
          </button>
          <span>·</span>
          <span>Ketik langsung di sel tabel untuk mengubah nilai secara langsung.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Formula I = G * H aktif</span>
        </div>
      </div>

      {/* Hidden file input for CSV upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Import Data Spreadsheet (CSV)</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Tempelkan (paste) teks format CSV penjualan Anda di bawah ini, atau unggah file CSV langsung.
            </p>

            <div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Order ID,Date,Region,Sales Rep,Category,Product Name,Quantity,Unit Price ($),Total Revenue ($),Status&#10;ORD-1016,2026-02-01,Jawa,Budi,Elektronik,Mousepad RGB,2,$20,00,$40,00,Selesai"
                className="w-full h-44 p-3 font-mono-numbers text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
              >
                Pilih file CSV dari komputer
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Terapkan & Sinkronkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
