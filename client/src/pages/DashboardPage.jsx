import { ClipboardList, Factory, Package, Clock, CheckCircle2, Layers, Boxes, ShieldCheck, Ship, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import {
  OPEN_STATUSES,
  sumBy,
  daysLeft,
  isLowStock,
  rejectionRate,
  formatPercent,
  computeRisks,
} from '../utils/metrics.js';
import { formatNumber, formatDate } from '../utils/format.js';

// Every figure below is calculated from the records, not typed in by hand.
function DashboardContent({ data }) {
  const { orders, production, materials, inspections, shipments } = data;

  const openOrders = orders.filter(({ status }) => OPEN_STATUSES.includes(status));
  const risks = computeRisks(data);
  const atRisk = risks.filter(({ level }) => level !== 'Low');

  const cards = [
    { label: 'Total orders', value: orders.length, icon: ClipboardList, tone: 'info', hint: `${openOrders.length} open` },
    { label: 'In production', value: orders.filter(({ status }) => status === 'In Production').length, icon: Factory, tone: 'info', hint: 'Orders on the lines' },
    { label: 'Awaiting materials', value: orders.filter(({ status }) => status === 'Materials Pending').length, icon: Package, tone: 'warning', hint: 'Waiting for supplies' },
    { label: 'Deadlines within 14 days', value: openOrders.filter(({ deadline }) => daysLeft(deadline) <= 14).length, icon: Clock, tone: 'warning', hint: 'Open orders' },
    { label: 'Completed orders', value: orders.filter(({ status }) => ['Shipped', 'Delivered'].includes(status)).length, icon: CheckCircle2, tone: 'success', hint: 'Shipped or delivered' },
    { label: 'Total output', value: formatNumber(sumBy(production, ({ actual, rejected }) => actual - rejected)), icon: Layers, tone: 'success', hint: 'Good pieces produced' },
    { label: 'Low-stock materials', value: materials.filter(isLowStock).length, icon: Boxes, tone: 'danger', hint: 'Below minimum level' },
    { label: 'Defect rate', value: formatPercent(rejectionRate(inspections)), icon: ShieldCheck, tone: 'warning', hint: 'Rejected / inspected' },
    { label: 'Upcoming shipments', value: shipments.filter(({ status, plannedDate }) => status !== 'Delivered' && daysLeft(plannedDate) <= 14).length, icon: Ship, tone: 'info', hint: 'Due within 14 days' },
    { label: 'At risk of delay', value: atRisk.length, icon: AlertTriangle, tone: 'danger', hint: 'Medium or high risk' },
  ];

  const attentionColumns = [
    { key: 'orderId', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'level', header: 'Risk', render: ({ level }) => <StatusBadge status={level} /> },
    { key: 'deadline', header: 'Deadline', render: ({ deadline, daysLeft: remaining }) => `${formatDate(deadline)} (${remaining} days)` },
    { key: 'reasons', header: 'Main reason', render: ({ reasons }) => reasons[0] },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Orders needing attention</h2>
        <DataTable
          columns={attentionColumns}
          rows={atRisk}
          emptyTitle="Nothing needs attention"
          emptyMessage="No open order is at medium or high risk."
        />
        <p className="mt-2 text-xs text-slate-500">See Delay Risk Analysis for every reason and the recommended actions.</p>
      </section>
    </>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader title="Dashboard" description="Factory overview for Dhaka Apparel Ltd. Charts and order management are added in Stage 2." />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <DashboardContent data={data} />}
      </DataState>
    </>
  );
}
