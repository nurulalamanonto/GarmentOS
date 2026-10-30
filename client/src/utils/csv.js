// Turns rows into CSV text and downloads it in the browser.
const escapeCell = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (columns, rows) =>
  [columns.map(({ header }) => escapeCell(header)).join(','), ...rows.map((row) => columns.map(({ key }) => escapeCell(row[key])).join(','))].join('\n');

export const downloadCsv = (filename, columns, rows) => {
  const blob = new Blob([toCsv(columns, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
