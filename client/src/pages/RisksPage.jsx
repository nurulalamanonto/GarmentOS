import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { computeRisks } from '../utils/metrics.js';
import { formatDate } from '../utils/format.js';

// The same rules that computeRisks() in utils/metrics.js applies, written out for readers.
const RULES = [
  { name: 'Time left vs completion', detail: 'Deadline passed: +4. 7 days or less and under 90% complete: +3. 14 days or less and under 60% complete: +2.' },
  { name: 'Production vs plan', detail: '25% or more behind planned output: +3. 10% or more behind: +2.' },
  { name: 'Material shortage', detail: 'Any material the order needs is not available in stock: +3.' },
  { name: 'Unresolved quality issues', detail: 'Inspections with rework still open: +2.' },
  { name: 'Shipment readiness', detail: 'Within 7 days of the deadline with no shipment, or with export documents missing: +2.' },
];

function RisksContent({ data }) {
  const risks = computeRisks(data);
  const count = (level) => risks.filter((risk) => risk.level === level).length;

  const columns = [
    { key: 'orderId', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'level', header: 'Risk', render: ({ level }) => <StatusBadge status={level} /> },
    { key: 'deadline', header: 'Deadline', render: ({ deadline, daysLeft }) => `${formatDate(deadline)} (${daysLeft} days)` },
    { key: 'completion', header: 'Completion', render: ({ completion }) => <ProgressBar value={completion} /> },
    {
      key: 'reasons',
      header: 'Reasons',
      render: ({ reasons }) => (
        <ul className="min-w-64 list-disc whitespace-normal pl-4">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ),
    },
    { key: 'action', header: 'Recommended action', render: ({ action }) => <p className="min-w-64 whitespace-normal">{action}</p> },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="High risk" value={count('High')} tone="danger" hint="5 or more rule points" />
        <KpiCard label="Medium risk" value={count('Medium')} tone="warning" hint="2 to 4 rule points" />
        <KpiCard label="Low risk" value={count('Low')} tone="success" hint="0 or 1 rule points" />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Open orders ranked by risk</h2>
        <DataTable columns={columns} rows={risks} />
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">How the risk level is decided</h2>
        <p className="mt-1 text-sm text-slate-500">
          Simple, visible rules add up points for each order. This is decision support, not a trained prediction model,
          and its accuracy has not been tested against real deliveries.
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {RULES.map(({ name, detail }) => (
            <li key={name}>
              <p className="font-medium text-slate-800">{name}</p>
              <p className="text-slate-500">{detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-700">Total points: 5 or more is High, 2 to 4 is Medium, below 2 is Low.</p>
      </section>
    </>
  );
}

export default function RisksPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Delay Risk Analysis"
        description="Which open orders may miss their shipment deadline, why, and what to do next."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <RisksContent data={data} />}
      </DataState>
    </>
  );
}
