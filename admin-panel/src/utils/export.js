/**
 * Utility to export table data as CSV
 */
import { saveAs } from 'file-saver';

/**
 * Convert array of objects to CSV and trigger download
 * @param {Array} data - Array of row objects
 * @param {Array} columns - Column definitions [{key, label}]
 * @param {string} filename - Output filename (without extension)
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) return;

  // Build CSV header row
  const headers = columns.map(col => `"${col.label || col.key}"`).join(',');

  // Build CSV data rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      // Handle nested/rendered values
      if (col.render) {
        // For complex renders, try to extract text
        value = row[col.raw] ?? row[col.key] ?? '';
      }
      // Handle objects
      if (typeof value === 'object' && value !== null) {
        value = value._id || value.name || value.phone || JSON.stringify(value);
      }
      // Stringify and escape quotes
      const str = String(value ?? '').replace(/"/g, '""');
      return `"${str}"`;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
};

/**
 * Extract flat data from rows for CSV export (handles populated fields)
 */
export const flattenForExport = (rows, fields) => {
  return rows.map(row => {
    const flat = {};
    fields.forEach(({ key, label }) => {
      let value = row[key];
      if (value && typeof value === 'object') {
        value = value.name || value.franchiseName || value.vehicleNumber || 
                `${value.firstName || ''} ${value.lastName || ''}`.trim() || value.phone || 
                value._id;
      }
      if (value instanceof Date) value = value.toLocaleDateString();
      flat[label || key] = value ?? '';
    });
    return flat;
  });
};
