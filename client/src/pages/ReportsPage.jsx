import { useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import FilterSelect from '../components/ui/FilterSelect.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import ChartContainer from '../components/ui/ChartContainer.jsx';
import Button from '../components/ui/Button.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { useApp } from '../context/AppContext.jsx';
import { ORDER_STATUSES, PRODUCTION_STAGES, SHIPMENT_STATUSES, DEFECT_CATEGORIES, RISK_LEVELS } from '../constants/statuses.js';
import {
  sumBy,
  percent,
  formatPercent,
  orderValue,
  daysLeft,
  isLowStock,
  rejectionRate,
  firstPassYield,
  missingDocuments,
  computeRisks,
} from '../utils/metrics.js';
import { isWithinRange } from '../utils/dates.js';
import { downloadCsv } from '../utils/csv.js';
import { formatNumber, formatCurrency, formatDate } from '../utils/format.js';
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, COLORS } from '../utils/chartTheme.js';

// Each report = rows + columns + the field used for the date filter and the status filter.
// The same columns are used for the on-screen table and the CSV file.
const buildReports = (data) => {
  const orders = data.orders.map((order) => ({ ...order, value: orderValue(order), daysLeft: daysLeft(order.deadline) }));
  const production = data.production.map((record) => ({
    ...record,
    good: record.actual - record.rejected,
    achievement: Number(percent(record.actual, record.planned).toFixed(1)),
  }));
  const inventory = data.materials.map((material) => ({
    ...material,
    value: Math.round(material.available * material.unitCost),
    stockStatus: isLowStock(material) ? 'Low stock' : 'In stock',
  }));
  const shipments = data.shipments.map((shipment) => ({
    ...shipment,
    missingDocs: missingDocuments(shipment).join('; ') || 'None',
  }));
  const delays = computeRisks(data).map((risk) => ({ ...risk, reasonsText: risk.reasons.join('; ') }));

  return [
    {
      key: 'orders',
      label: 'Order summary',
      rows: orders,
      dateField: 'orderDate',
      statusField: 'status',
      statusOptions: ORDER_STATUSES,
      columns: [
        { key: 'id', header: 'Order' },
        { key: 'customer', header: 'Customer' },
        { key: 'product', header: 'Product' },
        { key: 'quantity', header: 'Quantity' },
        { key: 'value', header: 'Order value (USD)', render: ({ value }) => formatCurrency(value) },
        { key: 'orderDate', header: 'Order date' },
        { key: 'deadline', header: 'Deadline' },
        { key: 'status', header: 'Status', render: ({ status }) => <StatusBadge status={status} /> },
      ],
      summary: (rows) => [
        { label: 'Orders', value: rows.length },
        { label: 'Total order value', value: formatCurrency(sumBy(rows, ({ value }) => value)) },
        { label: 'Total pieces', value: formatNumber(sumBy(rows, ({ quantity }) => quantity)) },
        { label: 'Cancelled', value: rows.filter(({ status }) => status === 'Cancelled').length },
      ],
    },
    {
      key: 'production',
      label: 'Production summary',
      rows: production,
      dateField: 'date',
      statusField: 'stage',
      statusOptions: PRODUCTION_STAGES,
      columns: [
        { key: 'id', header: 'Record' },
        { key: 'orderId', header: 'Order' },
        { key: 'line', header: 'Line' },
        { key: 'date', header: 'Date' },
        { key: 'stage', header: 'Stage' },
        { key: 'planned', header: 'Planned' },
        { key: 'actual', header: 'Actual' },
        { key: 'rejected', header: 'Rejected' },
        { key: 'achievement', header: 'Plan achieved (%)' },
      ],
      summary: (rows) => [
        { label: 'Records', value: rows.length },
        { label: 'Planned pieces', value: formatNumber(sumBy(rows, ({ planned }) => planned)) },
        { label: 'Actual pieces', value: formatNumber(sumBy(rows, ({ actual }) => actual)) },
        { label: 'Plan achieved', value: formatPercent(percent(sumBy(rows, ({ actual }) => actual), sumBy(rows, ({ planned }) => planned))) },
      ],
    },
    {
      key: 'inventory',
      label: 'Inventory summary',
      rows: inventory,
      dateField: null,
      statusField: 'stockStatus',
      statusOptions: ['Low stock', 'In stock'],
      columns: [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Material' },
        { key: 'category', header: 'Category' },
        { key: 'available', header: 'Available' },
        { key: 'unit', header: 'Unit' },
        { key: 'minStock', header: 'Minimum' },
        { key: 'supplier', header: 'Supplier' },
        { key: 'value', header: 'Stock value (USD)', render: ({ value }) => formatCurrency(value) },
        { key: 'stockStatus', header: 'Status', render: ({ stockStatus }) => <StatusBadge status={stockStatus} /> },
      ],
      summary: (rows) => [
        { label: 'Materials', value: rows.length },
        { label: 'Low stock', value: rows.filter(({ stockStatus }) => stockStatus === 'Low stock').length },
        { label: 'Inventory value', value: formatCurrency(sumBy(rows, ({ value }) => value)) },
        { label: 'Suppliers', value: new Set(rows.map(({ supplier }) => supplier)).size },
      ],
    },
    {
      key: 'quality',
      label: 'Quality report',
      rows: data.inspections,
      dateField: 'date',
      statusField: 'defect',
      statusOptions: DEFECT_CATEGORIES,
      columns: [
        { key: 'id', header: 'Inspection' },
        { key: 'orderId', header: 'Order' },
        { key: 'batch', header: 'Batch' },
        { key: 'date', header: 'Date' },
        { key: 'inspected', header: 'Inspected' },
        { key: 'passed', header: 'Passed' },
        { key: 'rejected', header: 'Rejected' },
        { key: 'rework', header: 'Rework' },
        { key: 'defect', header: 'Defect category' },
        { key: 'inspector', header: 'Inspector' },
      ],
      summary: (rows) => [
        { label: 'Pieces inspected', value: formatNumber(sumBy(rows, ({ inspected }) => inspected)) },
        { label: 'Rejection rate', value: formatPercent(rejectionRate(rows)) },
        { label: 'First-pass yield', value: formatPercent(firstPassYield(rows)) },
        { label: 'Rework pieces', value: formatNumber(sumBy(rows, ({ rework }) => rework)) },
      ],
    },
    {
      key: 'shipments',
      label: 'Shipment report',
      rows: shipments,
      dateField: 'plannedDate',
      statusField: 'status',
      statusOptions: SHIPMENT_STATUSES,
      columns: [
        { key: 'id', header: 'Shipment' },
        { key: 'orderId', header: 'Order' },
        { key: 'destination', header: 'Destination' },
        { key: 'quantity', header: 'Quantity' },
        { key: 'plannedDate', header: 'Planned date' },
        { key: 'dispatchDate', header: 'Dispatched' },
        { key: 'status', header: 'Status', render: ({ status }) => <StatusBadge status={status} /> },
        { key: 'missingDocs', header: 'Missing documents' },
      ],
      summary: (rows) => [
        { label: 'Shipments', value: rows.length },
        { label: 'Pieces', value: formatNumber(sumBy(rows, ({ quantity }) => quantity)) },
        { label: 'With missing documents', value: rows.filter(({ missingDocs }) => missingDocs !== 'None').length },
        { label: 'Delivered', value: rows.filter(({ status }) => status === 'Delivered').length },
      ],
    },
    {
      key: 'delay',
      label: 'Delivery-delay report',
      rows: delays,
      dateField: 'deadline',
      statusField: 'level',
      statusOptions: RISK_LEVELS,
      columns: [
        { key: 'orderId', header: 'Order' },
        { key: 'customer', header: 'Customer' },
        { key: 'deadline', header: 'Deadline' },
        { key: 'daysLeft', header: 'Days left' },
        { key: 'completion', header: 'Completion (%)' },
        { key: 'level', header: 'Risk', render: ({ level }) => <StatusBadge status={level} /> },
        { key: 'reasonsText', header: 'Reasons' },
        { key: 'action', header: 'Recommended action' },
      ],
      summary: (rows) => [
        { label: 'Open orders checked', value: rows.length },
        { label: 'High risk', value: rows.filter(({ level }) => level === 'High').length },
        { label: 'Medium risk', value: rows.filter(({ level }) => level === 'Medium').length },
        { label: 'Low risk', value: rows.filter(({ level }) => level === 'Low').length },
      ],
    },
  ];
};

function ReportsContent({ data }) {
  const { notify } = useApp();
  const reports = buildReports(data);
  const [reportKey, setReportKey] = useState('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const report = reports.find(({ key }) => key === reportKey);

  // Apply the date range and status filters to the chosen report
  const rows = report.rows.filter(
    (row) =>
      (!report.dateField || isWithinRange(row[report.dateField], dateFrom, dateTo)) &&
      (!statusFilter || row[report.statusField] === statusFilter),
  );

  // Chart: how many records fall under each status value
  const chartData = report.statusOptions
    .map((option) => ({ name: option, count: rows.filter((row) => row[report.statusField] === option).length }))
    .filter(({ count }) => count > 0);

  const handleReportChange = (key) => {
    setReportKey(key);
    setStatusFilter('');
  };

  const handleExport = () => {
    if (rows.length === 0) {
      notify('warning', 'There are no rows to export with these filters.');
      return;
    }
    downloadCsv(`garmentos-${report.key}-report.csv`, report.columns, rows);
    notify('success', `${report.label} exported as CSV`);
  };

  return (
    <>
      <div role="tablist" aria-label="Reports" className="flex flex-wrap gap-2">
        {reports.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === reportKey}
            onClick={() => handleReportChange(key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              key === reportKey ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section aria-label="Report filters" className="mt-4 flex flex-wrap items-end gap-3">
        {report.dateField && (
          <>
            <div className="w-40"><FormInput id="r-from" label="From date" type="date" value={dateFrom} onChange={setDateFrom} /></div>
            <div className="w-40"><FormInput id="r-to" label="To date" type="date" value={dateTo} onChange={setDateTo} /></div>
          </>
        )}
        <FilterSelect id="r-status" label="Filter" value={statusFilter} onChange={setStatusFilter} options={report.statusOptions} />
        <Button variant="secondary" onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter(''); }}>Clear filters</Button>
        <div className="ml-auto">
          <Button onClick={handleExport}>
            <Download size={16} aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {report.summary(rows).map(({ label, value }) => (
          <KpiCard key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <ChartContainer title="Records by status" description={report.label}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                <YAxis type="category" dataKey="name" width={120} tick={{ ...AXIS_TICK, fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-slate-100)' }} />
                <Bar dataKey="count" name="Records" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="min-w-0 xl:col-span-2">
          <DataTable columns={report.columns} rows={rows} emptyMessage="No records match the filters." />
        </div>
      </div>
    </>
  );
}

export default function ReportsPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Six reports calculated from the factory records, with filters and CSV export."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <ReportsContent data={data} />}
      </DataState>
    </>
  );
}
