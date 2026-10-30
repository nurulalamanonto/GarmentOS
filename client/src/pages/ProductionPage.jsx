import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import FilterSelect from '../components/ui/FilterSelect.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import ChartContainer from '../components/ui/ChartContainer.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_TODAY } from '../data/demoData.js';
import { PRODUCTION_STAGES } from '../constants/statuses.js';
import {
  OPEN_STATUSES,
  sumBy,
  percent,
  formatPercent,
  completionPercent,
  scheduleVariance,
  isBehindSchedule,
} from '../utils/metrics.js';
import { isPositiveNumber, isNonNegativeNumber, hasErrors } from '../utils/validation.js';
import { formatNumber, formatDate } from '../utils/format.js';
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, COLORS } from '../utils/chartTheme.js';

const LINES = ['Line 1', 'Line 2', 'Line 3', 'Line 4'];
const SHIFTS = ['Day', 'Night'];
const EMPTY_FORM = {
  orderId: '',
  line: '',
  planned: '',
  actual: '',
  rejected: '0',
  date: DEMO_TODAY,
  shift: 'Day',
  stage: 'Sewing',
  notes: '',
};

function ProductionContent({ data }) {
  const { orders } = data;
  const { notify } = useApp();
  const [records, setRecords] = useState(data.production);
  const [orderFilter, setOrderFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  // ---- Numbers calculated from the records ----
  const plannedTotal = sumBy(records, ({ planned }) => planned);
  const actualTotal = sumBy(records, ({ actual }) => actual);
  const rejectedTotal = sumBy(records, ({ rejected }) => rejected);

  // One row per order that has production records, with progress worked out from them
  const progressRows = orders
    .filter(({ id }) => records.some(({ orderId }) => orderId === id))
    .map((order) => {
      const { variancePercent } = scheduleVariance(order.id, records);
      const orderRecords = records.filter(({ orderId }) => orderId === order.id);
      const latest = [...orderRecords].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
      return {
        id: order.id,
        customer: order.customer,
        quantity: order.quantity,
        completion: completionPercent(order, records),
        variancePercent,
        behind: isBehindSchedule(order.id, records),
        stage: latest.stage,
      };
    });
  const behindRows = progressRows.filter(({ behind }) => behind);

  // Planned vs actual per production line (for the chart and the performance cards)
  const lineStats = Object.values(
    records.reduce((groups, { line, planned, actual, rejected }) => {
      const group = groups[line] ?? { line, planned: 0, actual: 0, rejected: 0 };
      group.planned += planned;
      group.actual += actual;
      group.rejected += rejected;
      groups[line] = group;
      return groups;
    }, {}),
  ).sort((a, b) => a.line.localeCompare(b.line));

  const visibleRecords = records
    .filter(({ orderId, line }) => (!orderFilter || orderId === orderFilter) && (!lineFilter || line === lineFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  // ---- Table columns ----
  const progressColumns = [
    { key: 'id', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'quantity', header: 'Order qty', align: 'right', render: ({ quantity }) => formatNumber(quantity) },
    {
      key: 'completion',
      header: 'Completion',
      render: ({ completion, behind }) => <ProgressBar value={completion} tone={behind ? 'danger' : 'primary'} />,
    },
    { key: 'stage', header: 'Current stage', render: ({ stage }) => <StatusBadge status={stage} /> },
    {
      key: 'variancePercent',
      header: 'Schedule',
      render: ({ behind, variancePercent }) => (
        <span className="flex items-center gap-2">
          <StatusBadge status={behind ? 'Behind plan' : 'On plan'} />
          <span className="text-xs text-slate-500">{formatPercent(variancePercent, 0)}</span>
        </span>
      ),
    },
  ];

  const recordColumns = [
    { key: 'id', header: 'Record' },
    { key: 'orderId', header: 'Order' },
    { key: 'line', header: 'Line' },
    { key: 'date', header: 'Date', render: ({ date }) => formatDate(date) },
    { key: 'shift', header: 'Shift' },
    { key: 'stage', header: 'Stage', render: ({ stage }) => <StatusBadge status={stage} /> },
    { key: 'planned', header: 'Planned', align: 'right', render: ({ planned }) => formatNumber(planned) },
    { key: 'actual', header: 'Actual', align: 'right', render: ({ actual }) => formatNumber(actual) },
    { key: 'rejected', header: 'Rejected', align: 'right', render: ({ rejected }) => formatNumber(rejected) },
    { key: 'notes', header: 'Notes' },
  ];

  // ---- Create a production record ----
  const openModal = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (!form.orderId) found.orderId = 'Choose an order';
    if (!form.line) found.line = 'Choose a production line';
    if (!isPositiveNumber(form.planned)) found.planned = 'Enter a planned quantity above 0';
    if (!isNonNegativeNumber(form.actual)) found.actual = 'Enter the actual quantity (0 or more)';
    if (!isNonNegativeNumber(form.rejected)) found.rejected = 'Enter the rejected quantity (0 or more)';
    else if (Number(form.rejected) > Number(form.actual)) found.rejected = 'Rejected cannot be more than actual';
    if (!form.date) found.date = 'Choose a date';
    setErrors(found);
    if (hasErrors(found)) return;

    const record = {
      id: `P-${String(records.length + 1).padStart(3, '0')}`,
      orderId: form.orderId,
      line: form.line,
      planned: Number(form.planned),
      actual: Number(form.actual),
      rejected: Number(form.rejected),
      date: form.date,
      shift: form.shift,
      stage: form.stage,
      notes: form.notes.trim(),
    };
    setRecords((current) => [...current, record]);
    setIsModalOpen(false);
    notify('success', `Production record ${record.id} added. Order progress was recalculated.`);
  };

  const orderOptions = orders.filter(({ status }) => OPEN_STATUSES.includes(status)).map(({ id }) => id);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Planned output" value={formatNumber(plannedTotal)} hint="Pieces, all records" />
        <KpiCard label="Actual output" value={formatNumber(actualTotal)} tone="success" hint="Pieces, all records" />
        <KpiCard label="Rejected pieces" value={formatNumber(rejectedTotal)} tone="warning" hint={`${formatPercent(percent(rejectedTotal, actualTotal))} of output`} />
        <KpiCard label="Plan achievement" value={formatPercent(percent(actualTotal, plannedTotal))} tone={actualTotal >= plannedTotal * 0.9 ? 'success' : 'danger'} hint="Actual / planned" />
      </div>

      {behindRows.length > 0 && (
        <section
          role="alert"
          className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Production is behind schedule</p>
            <ul className="mt-1 list-disc pl-5">
              {behindRows.map(({ id, customer, variancePercent }) => (
                <li key={id}>
                  {id} ({customer}) is {Math.abs(Math.round(variancePercent))}% behind its planned output.
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Progress by order</h2>
        <DataTable columns={progressColumns} rows={progressRows} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Planned vs actual by line" description="Pieces, all records">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lineStats}>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="line" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-slate-100)' }} formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="planned" name="Planned" fill={COLORS.muted} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Line performance</h2>
          <p className="text-xs text-slate-500">Actual output as a share of planned output</p>
          <ul className="mt-4 space-y-4">
            {lineStats.map(({ line, planned, actual, rejected }) => {
              const achievement = Math.round(percent(actual, planned));
              return (
                <li key={line} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{line}</p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(actual)} of {formatNumber(planned)} pcs, {formatNumber(rejected)} rejected
                    </p>
                  </div>
                  <ProgressBar value={achievement} tone={achievement < 90 ? 'warning' : 'primary'} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Production records</h2>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect id="order-filter" label="Order" value={orderFilter} onChange={setOrderFilter} options={orders.map(({ id }) => id)} />
            <FilterSelect id="line-filter" label="Line" value={lineFilter} onChange={setLineFilter} options={LINES} />
            <Button onClick={openModal}>
              <Plus size={16} aria-hidden="true" /> Add record
            </Button>
          </div>
        </div>
        <DataTable columns={recordColumns} rows={visibleRecords} emptyMessage="Try another order or line." />
      </section>

      <Modal
        isOpen={isModalOpen}
        title="Add production record"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="production-form">
              Save record
            </Button>
          </>
        }
      >
        <form id="production-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormInput id="p-order" label="Order" value={form.orderId} onChange={setField('orderId')} options={orderOptions} error={errors.orderId} required />
          <FormInput id="p-line" label="Production line" value={form.line} onChange={setField('line')} options={LINES} error={errors.line} required />
          <FormInput id="p-planned" label="Planned quantity" type="number" min="0" value={form.planned} onChange={setField('planned')} error={errors.planned} required />
          <FormInput id="p-actual" label="Actual quantity" type="number" min="0" value={form.actual} onChange={setField('actual')} error={errors.actual} required />
          <FormInput id="p-rejected" label="Rejected quantity" type="number" min="0" value={form.rejected} onChange={setField('rejected')} error={errors.rejected} required />
          <FormInput id="p-date" label="Production date" type="date" value={form.date} onChange={setField('date')} error={errors.date} required />
          <FormInput id="p-shift" label="Shift" value={form.shift} onChange={setField('shift')} options={SHIFTS} />
          <FormInput id="p-stage" label="Current stage" value={form.stage} onChange={setField('stage')} options={PRODUCTION_STAGES} />
          <div className="sm:col-span-2">
            <FormInput id="p-notes" label="Notes" value={form.notes} onChange={setField('notes')} />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function ProductionPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Production Management"
        description="Output per line and order. Completion is calculated from the production records."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <ProductionContent data={data} />}
      </DataState>
    </>
  );
}
