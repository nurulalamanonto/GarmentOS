import { useState } from 'react';
import { Package, Factory, ShieldCheck, Ship } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '../components/ui/PageHeader.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import FilterSelect from '../components/ui/FilterSelect.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import Button from '../components/ui/Button.jsx';
import ChartContainer from '../components/ui/ChartContainer.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useApp } from '../context/AppContext.jsx';
import { ORDER_STATUSES } from '../constants/statuses.js';

// Fictional sample rows used ONLY on this component showcase page.
const SAMPLE_ROWS = [
  { id: 'ORD-1001', customer: 'Northwind Retail', quantity: 12000, status: 'In Production' },
  { id: 'ORD-1002', customer: 'Fjord & Co', quantity: 8500, status: 'Materials Pending' },
  { id: 'ORD-1003', customer: 'Atlas Sportswear', quantity: 20000, status: 'Ready to Ship' },
  { id: 'ORD-1004', customer: 'Harbor Kids', quantity: 6400, status: 'Cancelled' },
];

const SAMPLE_CHART = [
  { month: 'Jul', orders: 12 },
  { month: 'Aug', orders: 17 },
  { month: 'Sep', orders: 14 },
  { month: 'Oct', orders: 21 },
];

export default function DesignSystemPage() {
  const { notify } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [formError, setFormError] = useState('');

  // filter() builds the visible list from the search text and the status filter
  const visibleRows = SAMPLE_ROWS.filter(
    ({ id, customer: name, status }) =>
      (id + name).toLowerCase().includes(search.toLowerCase()) && (!statusFilter || status === statusFilter),
  );

  const columns = [
    { key: 'id', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'quantity', header: 'Quantity', align: 'right' },
    { key: 'status', header: 'Status', render: ({ status }) => <StatusBadge status={status} /> },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!customer.trim()) {
      setFormError('Customer name is required');
      return;
    }
    setFormError('');
    setIsModalOpen(false);
    notify('success', `Form validated for ${customer}`);
  };

  return (
    <>
      <PageHeader
        title="Design system"
        description="Every reusable component, shown with sample data. Used to keep all modules consistent."
        actions={<Button onClick={() => setIsModalOpen(true)}>Open modal form</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Orders in production" value="14" icon={Factory} tone="info" hint="Sample value" />
        <KpiCard label="Low-stock materials" value="3" icon={Package} tone="warning" hint="Sample value" />
        <KpiCard label="Defect rate" value="2.4%" icon={ShieldCheck} tone="success" hint="Sample value" />
        <KpiCard label="At risk of delay" value="2" icon={Ship} tone="danger" hint="Sample value" />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Table, search and filter</h2>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search order or customer" />
          <FilterSelect id="status-filter" label="Status" value={statusFilter} onChange={setStatusFilter} options={ORDER_STATUSES} />
        </div>
        <DataTable columns={columns} rows={visibleRows} emptyMessage="Try a different search or filter." />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Chart container" description="Sample monthly order volume">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SAMPLE_CHART}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Empty state and notifications</h2>
          <EmptyState title="No shipments yet" message="Create a shipment to start tracking export documents." />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => notify('success', 'Order saved')}>Success</Button>
            <Button variant="secondary" onClick={() => notify('error', 'Could not save order')}>Error</Button>
            <Button variant="secondary" onClick={() => notify('warning', 'Stock is below the minimum')}>Warning</Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="New customer"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="demo-form">Save</Button>
          </>
        }
      >
        <form id="demo-form" onSubmit={handleSubmit} className="space-y-4">
          <FormInput id="customer" label="Customer name" value={customer} onChange={setCustomer} error={formError} required />
        </form>
      </Modal>
    </>
  );
}
