import React, { useState, useEffect } from 'react';
import { SaleOrder, OrderStatus } from '../types/sales';
import { formatCurrency, getNextOrderId } from '../utils/formatters';
import { X, Check, DollarSign, Calculator, MapPin, Tag, User, Package } from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: SaleOrder) => void;
  existingOrders: SaleOrder[];
  availableRegions: string[];
  availableCategories: string[];
  availableSalesReps: string[];
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddOrder,
  existingOrders,
  availableRegions,
  availableCategories,
  availableSalesReps,
}) => {
  const [orderId, setOrderId] = useState('');
  const [date, setDate] = useState('');
  const [region, setRegion] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const [salesRep, setSalesRep] = useState('');
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number | string>(50.0);
  const [status, setStatus] = useState<OrderStatus>('Selesai');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setOrderId(getNextOrderId(existingOrders));
      setDate(new Date().toISOString().slice(0, 10));
      setRegion(availableRegions[0] || 'Jawa');
      setCustomRegion('');
      setSalesRep(availableSalesReps[0] || 'Budi');
      setCategory(availableCategories[0] || 'Elektronik');
      setProductName('');
      setQuantity(1);
      setUnitPrice(50.0);
      setStatus('Selesai');
      setErrors({});
    }
  }, [isOpen, existingOrders]);

  if (!isOpen) return null;

  const numPrice = typeof unitPrice === 'number' ? unitPrice : parseFloat(unitPrice) || 0;
  const totalRevenue = quantity * numPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!orderId.trim()) newErrors.orderId = 'Order ID wajib diisi';
    if (!productName.trim()) newErrors.productName = 'Nama produk wajib diisi';
    if (quantity <= 0) newErrors.quantity = 'Kuantitas minimal 1';
    if (numPrice <= 0) newErrors.unitPrice = 'Harga satuan harus lebih dari 0';

    const finalRegion = region === 'OTHER' ? customRegion.trim() : region;
    if (!finalRegion) newErrors.region = 'Pilih atau isi daerah penjualan';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newOrder: SaleOrder = {
      id: orderId.trim(),
      date,
      region: finalRegion,
      salesRep,
      category,
      productName: productName.trim(),
      quantity,
      unitPrice: numPrice,
      totalRevenue,
      status,
    };

    onAddOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Input Data Transaksi Baru</h2>
            <p className="text-xs text-slate-500">
              Data yang diinput otomatis ditambahkan ke spreadsheet dan disinkronkan ke grafik.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order ID & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="ORD-1016"
              />
              {errors.orderId && <p className="text-[11px] text-rose-600 mt-1">{errors.orderId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Region (Daerah) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Daerah / Wilayah</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {availableRegions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
                <option value="OTHER">+ Tambah Daerah Lain...</option>
              </select>

              {region === 'OTHER' ? (
                <input
                  type="text"
                  value={customRegion}
                  onChange={(e) => setCustomRegion(e.target.value)}
                  placeholder="Ketik nama daerah..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              ) : (
                <div className="px-3 py-2 text-xs text-slate-500 bg-slate-100 rounded-lg flex items-center">
                  Wilayah: {region}
                </div>
              )}
            </div>
            {errors.region && <p className="text-[11px] text-rose-600 mt-1">{errors.region}</p>}
          </div>

          {/* Sales Rep & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Sales Representative</span>
              </label>
              <input
                type="text"
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Budi, Siti, Andi..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Kategori Produk</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Produk</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Contoh: Mechanical Keyboard RGB, Speaker Bluetooth..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {errors.productName && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.productName}</p>
            )}
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity (Unit)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-right font-semibold"
              />
              {errors.quantity && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Satuan ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-right font-semibold"
                placeholder="25.00"
              />
              {errors.unitPrice && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Pemenuhan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Selesai', 'Dikirim', 'Retur'] as OrderStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    status === st
                      ? st === 'Selesai'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : st === 'Dikirim'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 font-semibold'
                        : 'bg-rose-50 border-rose-500 text-rose-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Live Calculated Total Revenue Preview */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-xs font-semibold text-emerald-950 block">
                  Total Pendapatan Terhitung
                </span>
                <span className="text-[11px] text-emerald-700">
                  {quantity} unit × {formatCurrency(numPrice)}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-emerald-800 font-mono-numbers">
              {formatCurrency(totalRevenue)}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Sinkronkan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
