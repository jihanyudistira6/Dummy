import { SaleOrder, OrderStatus } from '../types/sales';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function parsePriceString(val: string): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Clean $, spaces, dots, and convert comma to dot if applicable
  const cleaned = val
    .replace(/\$/g, '')
    .trim()
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function getNextOrderId(orders: SaleOrder[]): string {
  let maxNum = 1000;
  orders.forEach((o) => {
    const match = o.id.match(/ORD-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return `ORD-${maxNum + 1}`;
}

export function exportOrdersToCSV(orders: SaleOrder[]): string {
  const headers = [
    'Order ID',
    'Date',
    'Region',
    'Sales Rep',
    'Category',
    'Product Name',
    'Quantity',
    'Unit Price ($)',
    'Total Revenue ($)',
    'Status',
  ];

  const rows = orders.map((o) => [
    o.id,
    o.date,
    o.region,
    o.salesRep,
    o.category,
    `"${o.productName.replace(/"/g, '""')}"`,
    o.quantity,
    `"$${o.unitPrice.toFixed(2).replace('.', ',')}"`,
    `"$${o.totalRevenue.toFixed(2).replace('.', ',')}"`,
    o.status,
  ]);

  const totalQty = orders.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRev = orders.reduce((acc, curr) => acc + curr.totalRevenue, 0);

  const summaryRow = [
    '',
    '',
    '',
    '',
    'Total Summary:',
    totalQty,
    '',
    `"$${totalRev.toFixed(2).replace('.', ',')}"`,
    '',
    '',
  ];

  return [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow.join(',')].join('\n');
}

export function parseCSVToOrders(csvText: string): SaleOrder[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: SaleOrder[] = [];

  for (const line of lines) {
    // skip title / header lines
    if (
      line.toUpperCase().includes('E-COMMERCE') ||
      line.toUpperCase().includes('ORDER ID,DATE') ||
      line.toUpperCase().includes('TOTAL SUMMARY')
    ) {
      continue;
    }

    // CSV line parser taking quotes into account
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    tokens.push(current.trim());

    if (tokens.length >= 7) {
      const id = tokens[0] || `ORD-${Date.now().toString().slice(-4)}`;
      const date = tokens[1] || new Date().toISOString().split('T')[0];
      const region = tokens[2] || 'Lainnya';
      const salesRep = tokens[3] || 'Umum';
      const category = tokens[4] || 'Umum';
      const productName = tokens[5]?.replace(/^"|"$/g, '') || 'Produk';
      const quantity = parseInt(tokens[6], 10) || 1;
      
      const priceRaw = tokens[7] || '0';
      const unitPrice = parsePriceString(priceRaw);
      
      const revRaw = tokens[8] || '0';
      let totalRevenue = parsePriceString(revRaw);
      if (totalRevenue === 0 && unitPrice > 0) {
        totalRevenue = quantity * unitPrice;
      }

      const statusRaw = (tokens[9] || 'Selesai').trim();
      const status: OrderStatus =
        statusRaw === 'Dikirim' || statusRaw === 'Retur' ? statusRaw : 'Selesai';

      results.push({
        id,
        date,
        region,
        salesRep,
        category,
        productName,
        quantity,
        unitPrice,
        totalRevenue,
        status,
      });
    }
  }

  return results;
}
