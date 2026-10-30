import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import FilterSelect from '../components/ui/FilterSelect.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import ChartContainer from '../components/ui/ChartContainer.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_TODAY } from '../data/demoData.js';
import { DEFECT_CATEGORIES } from '../constants/statuses.js';
import { OPEN_STATUSES, sumBy, percent, formatPercent, rejectionRate, firstPassYield } from '../utils/metrics.js';
import { isPositiveNumber, isNonNegativeNumber, hasErrors } from '../utils/validation.js';
import { formatNumber, formatDate } from '../utils/format.js';
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, COLORS } from '../utils/chartTheme.js';

const EMPTY_FORM = {
  orderId: '',
  batch: '',
  inspected: '',
  passed: '',
  rejected: '0',
  rework: '0',
  defect: '',
  inspector: '',
  date: DEMO_TODAY,
};

function QualityContent({ data }) {
  const { orders } = data;
  const { notify } = useApp();
  const [inspections, setInspections] = useState(data.inspections);
  const [orderFilter, setOrderFilter] = useState('');
  const [defectFilter, setDefectFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const visible = inspections
    .filter(({ orderId, defect }) => (!orderFilter || orderId === orderFilter) && (!defectFilter || defect === defectFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  // ---- Metrics for the records currently shown ----
  const inspectedTotal = sumBy(visible, ({ inspected }) => inspected);
  const reworkTotal = sumBy(visible, ({ rework }) => rework);
  const openIssues = visible.filter(({ resolved, rework }) => !resolved && rework > 0).length;

  const defectChartData = DEFECT_CATEGORIES.map((defect) => {
    const matching = visible.filter((inspection) => inspection.defect === defect);
    return {
      defect,
      rejected: sumBy(matching, ({ rejected }) => rejected),
      rework: sumBy(matching, ({ rework }) => rework),
    };
  });

  // Rejection rate of each inspection over time
  const trendData = [...visible]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, rejected, inspected }) => ({
      date: formatDate(date).slice(0, 6),
      rate: Number(percent(rejected, inspected).toFixed(2)),
    }));

  const columns = [
    { key: 'id', header: 'Inspection' },
    { key: 'orderId', header: 'Order' },
    { key: 'batch', header: 'Batch' },
    { key: 'date', header: 'Date', render: ({ date }) => formatDate(date) },
    { key: 'inspected', header: 'Inspected', align: 'right', render: ({ inspected }) => formatNumber(inspected) },
    { key: 'passed', header: 'Passed', align: 'right', render: ({ passed }) => formatNumber(passed) },
    { key: 'rejected', header: 'Rejected', align: 'right', render: ({ rejected }) => formatNumber(rejected) },
    { key: 'rework', header: 'Rework', align: 'right', render: ({ rework }) => formatNumber(rework) },
    { key: 'rate', header: 'Rejection', align: 'right', render: ({ rejected, inspected }) => formatPercent(percent(rejected, inspected)) },
    { key: 'defect', header: 'Defect category' },
    { key: 'inspector', header: 'Inspector' },
    {
      key: 'resolved',
      header: 'Status',
      render: ({ resolved, rework }) =>
        resolved || rework === 0 ? <StatusBadge status="Resolved" tone="success" /> : <StatusBadge status="Rework open" tone="warning" />,
    },
  ];

  // ---- Record an inspection ----
  const openModal = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const inspected = Number(form.inspected);
    const passed = Number(form.passed);
    const rejected = Number(form.rejected);
    const rework = Number(form.rework);

    if (!form.orderId) found.orderId = 'Choose an order';
    if (!form.batch.trim()) found.batch = 'Enter the production batch';
    if (!isPositiveNumber(form.inspected)) found.inspected = 'Enter the inspected quantity above 0';
    if (!isNonNegativeNumber(form.passed)) found.passed = 'Enter the passed quantity';
    if (!isNonNegativeNumber(form.rejected)) found.rejected = 'Enter the rejected quantity';
    if (!isNonNegativeNumber(form.rework)) found.rework = 'Enter the rework quantity';
    if (!form.defect) found.defect = 'Choose a defect category';
    if (!form.inspector.trim()) found.inspector = 'Enter the inspector name';
    if (!form.date) found.date = 'Choose a date';
    // Passed + rejected + rework must add up to the inspected quantity
    if (!found.inspected && !found.passed && !found.rejected && !found.rework && passed + rejected + rework !== inspected) {
      found.passed = `Passed + rejected + rework is ${formatNumber(passed + rejected + rework)}, but inspected is ${formatNumber(inspected)}`;
    }
    setErrors(found);
    if (hasErrors(found)) return;

    const inspection = {
      id: `Q-${String(inspections.length + 1).padStart(3, '0')}`,
      orderId: form.orderId,
      batch: form.batch.trim(),
      inspected,
      passed,
      rejected,
      rework,
      defect: form.defect,
      inspector: form.inspector.trim(),
      date: form.date,
      resolved: rework === 0,
    };
    setInspections((current) => [...current, inspection]);
    setIsModalOpen(false);
    notify('success', `Inspection ${inspection.id} recorded`);
  };

  const orderOptions = orders.filter(({ status }) => OPEN_STATUSES.includes(status)).map(({ id }) => id);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pieces inspected" value={formatNumber(inspectedTotal)} hint={`${visible.length} inspections`} />
        <KpiCard label="Rejection rate" value={formatPercent(rejectionRate(visible))} tone="warning" hint="Rejected / inspected" />
        <KpiCard label="First-pass yield" value={formatPercent(firstPassYield(visible))} tone="success" hint="Passed first time / inspected" />
        <KpiCard label="Open rework" value={openIssues} tone={openIssues > 0 ? 'danger' : 'success'} hint={`${formatNumber(reworkTotal)} pieces need rework`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Defects by category" description="Rejected and rework pieces">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defectChartData}>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="defect" tick={{ ...AXIS_TICK, fontSize: 10 }} interval={0} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-slate-100)' }} />
              <Legend />
              <Bar dataKey="rejected" name="Rejected" stackId="d" fill={COLORS.danger} />
              <Bar dataKey="rework" name="Rework" stackId="d" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Rejection rate trend" description="Per inspection, in date order (%)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="date" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="rate" name="Rejection rate (%)" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Inspection history</h2>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect id="q-order" label="Order" value={orderFilter} onChange={setOrderFilter} options={orders.map(({ id }) => id)} />
            <FilterSelect id="q-defect" label="Defect" value={defectFilter} onChange={setDefectFilter} options={DEFECT_CATEGORIES} />
            <Button onClick={openModal}>
              <Plus size={16} aria-hidden="true" /> Record inspection
            </Button>
          </div>
        </div>
        <DataTable columns={columns} rows={visible} emptyMessage="Try another order or defect category." />
      </section>

      <Modal
        isOpen={isModalOpen}
        title="Record inspection"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="inspection-form">Save inspection</Button>
          </>
        }
      >
        <form id="inspection-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormInput id="q-f-order" label="Order" value={form.orderId} onChange={setField('orderId')} options={orderOptions} error={errors.orderId} required />
          <FormInput id="q-f-batch" label="Production batch" value={form.batch} onChange={setField('batch')} error={errors.batch} required />
          <FormInput id="q-f-inspected" label="Inspected quantity" type="number" min="0" value={form.inspected} onChange={setField('inspected')} error={errors.inspected} required />
          <FormInput id="q-f-passed" label="Passed quantity" type="number" min="0" value={form.passed} onChange={setField('passed')} error={errors.passed} required />
          <FormInput id="q-f-rejected" label="Rejected quantity" type="number" min="0" value={form.rejected} onChange={setField('rejected')} error={errors.rejected} required />
          <FormInput id="q-f-rework" label="Rework quantity" type="number" min="0" value={form.rework} onChange={setField('rework')} error={errors.rework} required />
          <FormInput id="q-f-defect" label="Defect category" value={form.defect} onChange={setField('defect')} options={DEFECT_CATEGORIES} error={errors.defect} required />
          <FormInput id="q-f-inspector" label="Inspector" value={form.inspector} onChange={setField('inspector')} error={errors.inspector} required />
          <FormInput id="q-f-date" label="Inspection date" type="date" value={form.date} onChange={setField('date')} error={errors.date} required />
        </form>
      </Modal>
    </>
  );
}

export default function QualityPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Quality Control"
        description="Inspection results, rejection rate and first-pass yield. Passed + rejected + rework must equal the inspected quantity."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <QualityContent data={data} />}
      </DataState>
    </>
  );
}
