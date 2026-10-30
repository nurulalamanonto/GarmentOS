// Small display helpers so every page formats numbers, money and dates the same way.

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(value),
      )
    : '-';
