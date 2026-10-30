import { useState } from 'react';
import { Plus, Pencil, XCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import FilterSelect from '../components/ui/FilterSelect.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_TODAY } from '../data/demoData.js';
import { ORDER_STATUSES } from '../constants/statuses.js';
import { OPEN_STATUSES, sumBy, daysLeft, orderValue, completionPercent } from '../utils/metrics.js';
import { isPositiveNumber, hasErrors } from '../utils/validation.js';
import { formatNumber, formatCurrency, formatDate } from '../utils/format.js';

const CATEGORIES = ['Knitwear', 'Woven', 'Outerwear', 'Activewear', 'Kidswear', 'Bottoms', 'Uniform', 'Sleepwear'];
const SORT_OPTIONS = [
  { value: 'deadline-asc', label: 'Deadline: soonest first' },
  { value: 'deadline-desc', label: 'Deadline: latest first' },
  { value: 'value-desc', label: 'Order value: highest first' },
  { value: 'value-asc', label: 'Order value: lowest first' },
];
const EMPTY_FORM = {
  customer: '',
  product: '',
  category: '',
  quantity: '',
  unitPrice: '',
  orderDate: DEMO_TODAY,
  startDate: '',
  deadline: '',
  merchandiser: '',
  status: 'Draft',
  notes: '',
};

// Progress shown for an order: finished orders are 100%, others come from production records.
const getProgress = (order, production) =>
  ['Shipped', 'Delivered'].includes(order.status) ? 100 : order.status === 'Cancelled' ? 0 : completionPercent(order, production);

function OrdersContent({ data }) {
  const { production } = data;
  const { notify } = useApp();
  const [orders, setOrders] = useState(data.orders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('deadline-asc');

  const [selectedId, setSelectedId] = useState(null); // detail dialog
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false); // create / edit dialog
  const [editingId, setEditingId] = useState(null); // null = creating a new order
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // find() gets the order that was clicked
  const selected = orders.find(({ id }) => id === selectedId);
  const merchandisers = [...new Set(data.orders.map(({ merchandiser }) => merchandiser))].sort();

  // filter() applies the search text and the status filter, sort() applies the chosen order
  const visibleOrders = orders
    .filter(
      ({ id, customer, status }) =>
        `${id} ${customer}`.toLowerCase().includes(search.toLowerCase()) && (!statusFilter || status === statusFilter),
    )
    .sort((a, b) => {
      if (sortBy === 'deadline-asc') return a.deadline.localeCompare(b.deadline);
      if (sortBy === 'deadline-desc') return b.deadline.localeCompare(a.deadline);
      return sortBy === 'value-desc' ? orderValue(b) - orderValue(a) : orderValue(a) - orderValue(b);
    });

  const activeOrders = orders.filter(({ status }) => status !== 'Cancelled');

  const columns = [
    { key: 'id', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'product', header: 'Product' },
    { key: 'quantity', header: 'Quantity', align: 'right', render: ({ quantity }) => formatNumber(quantity) },
    { key: 'value', header: 'Order value', align: 'right', render: (order) => formatCurrency(orderValue(order)) },
    {
      key: 'deadline',
      header: 'Ship deadline',
      render: ({ deadline, status }) => (
        <span>
          {formatDate(deadline)}
          {OPEN_STATUSES.includes(status) && (
            <span className={`ml-2 text-xs ${daysLeft(deadline) <= 14 ? 'text-amber-600' : 'text-slate-500'}`}>{daysLeft(deadline)}d</span>
          )}
        </span>
      ),
    },
    { key: 'merchandiser', header: 'Merchandiser' },
    { key: 'status', header: 'Status', render: ({ status }) => <StatusBadge status={status} /> },
    { key: 'progress', header: 'Progress', render: (order) => <ProgressBar value={getProgress(order, production)} /> },
  ];

  // ---- Create / edit ----
  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));
  const formTotal = Number(form.quantity) * Number(form.unitPrice) || 0; // total value updates as you type

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (order) => {
    const { id, quantity, unitPrice, ...rest } = order;
    setEditingId(id);
    setForm({ ...EMPTY_FORM, ...rest, quantity: String(quantity), unitPrice: String(unitPrice) });
    setErrors({});
    setSelectedId(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (!form.customer.trim()) found.customer = 'Enter the customer or buyer';
    if (!form.product.trim()) found.product = 'Enter the product name';
    if (!form.category) found.category = 'Choose a garment category';
    if (!isPositiveNumber(form.quantity)) found.quantity = 'Enter a quantity above 0';
    if (!isPositiveNumber(form.unitPrice)) found.unitPrice = 'Enter a unit price above 0';
    if (!form.orderDate) found.orderDate = 'Choose the order date';
    if (!form.startDate) found.startDate = 'Choose the production start date';
    else if (form.orderDate && form.startDate < form.orderDate) found.startDate = 'Production cannot start before the order date';
    if (!form.deadline) found.deadline = 'Choose the shipment deadline';
    else if (form.startDate && form.deadline < form.startDate) found.deadline = 'Deadline must be after the production start';
    if (!form.merchandiser) found.merchandiser = 'Choose the merchandiser';
    setErrors(found);
    if (hasErrors(found)) return;

    const values = {
      ...form,
      customer: form.customer.trim(),
      product: form.product.trim(),
      notes: form.notes.trim(),
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
    };

    if (editingId) {
      setOrders((current) => current.map((order) => (order.id === editingId ? { ...order, ...values } : order)));
      notify('success', `Order ${editingId} updated`);
    } else {
      const nextNumber = Math.max(...orders.map(({ id }) => Number(id.replace('ORD-', ''))), 1000) + 1;
      const id = `ORD-${nextNumber}`;
      setOrders((current) => [...current, { id, ...values }]);
      notify('success', `Order ${id} created`);
    }
    setIsFormOpen(false);
  };

  // ---- Status and cancel ----
  const handleStatusChange = (status) => {
    setOrders((current) => current.map((order) => (order.id === selected.id ? { ...order, status } : order)));
    notify('success', `${selected.id} is now ${status}`);
  };

  const handleCancelOrder = () => {
    setOrders((current) => current.map((order) => (order.id === selected.id ? { ...order, status: 'Cancelled' } : order)));
    notify('success', `Order ${selected.id} cancelled`);
    setIsConfirmingCancel(false);
  };

  const closeDetails = () => {
    setSelectedId(null);
    setIsConfirmingCancel(false);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total orders" value={orders.length} hint={`${activeOrders.length} not cancelled`} />
        <KpiCard label="Open orders" value={orders.filter(({ status }) => OPEN_STATUSES.includes(status)).length} tone="info" hint="Confirmed up to ready to ship" />
        <KpiCard label="Order value" value={formatCurrency(sumBy(activeOrders, orderValue))} tone="success" hint="Excludes cancelled orders" />
        <KpiCard label="Delivered" value={orders.filter(({ status }) => status === 'Delivered').length} tone="success" hint="Completed orders" />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar id="order-search" value={search} onChange={setSearch} placeholder="Search order ID or customer" />
            <FilterSelect id="order-status" label="Status" value={statusFilter} onChange={setStatusFilter} options={ORDER_STATUSES} />
            <div className="flex items-center gap-2">
              <label htmlFor="order-sort" className="text-sm text-slate-500">Sort</label>
              <select
                id="order-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus size={16} aria-hidden="true" /> New order
          </Button>
        </div>
        <p className="mb-3 text-xs text-slate-500">Click a row to see details, change the status, edit or cancel the order.</p>
        <DataTable columns={columns} rows={visibleOrders} onRowClick={({ id }) => setSelectedId(id)} emptyTitle="No orders found" emptyMessage="Try a different search or status." />
      </section>

      {/* Order details */}
      <Modal
        isOpen={Boolean(selected)}
        title={selected ? `Order ${selected.id}` : ''}
        onClose={closeDetails}
        footer={
          selected && (
            isConfirmingCancel ? (
              <>
                <p className="mr-auto self-center text-sm text-red-600">Cancel this order? This marks it as Cancelled.</p>
                <Button variant="secondary" onClick={() => setIsConfirmingCancel(false)}>Keep order</Button>
                <Button variant="danger" onClick={handleCancelOrder}>Yes, cancel order</Button>
              </>
            ) : (
              <>
                {selected.status !== 'Cancelled' && (
                  <Button variant="danger" onClick={() => setIsConfirmingCancel(true)}>
                    <XCircle size={16} aria-hidden="true" /> Cancel order
                  </Button>
                )}
                <Button variant="secondary" onClick={() => openEdit(selected)}>
                  <Pencil size={16} aria-hidden="true" /> Edit
                </Button>
                <Button onClick={closeDetails}>Close</Button>
              </>
            )
          )
        }
      >
        {selected && (
          <div className="space-y-5 text-sm">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div><dt className="text-slate-500">Customer</dt><dd className="font-medium text-slate-800">{selected.customer}</dd></div>
              <div><dt className="text-slate-500">Product</dt><dd className="font-medium text-slate-800">{selected.product}</dd></div>
              <div><dt className="text-slate-500">Category</dt><dd className="font-medium text-slate-800">{selected.category}</dd></div>
              <div><dt className="text-slate-500">Merchandiser</dt><dd className="font-medium text-slate-800">{selected.merchandiser}</dd></div>
              <div><dt className="text-slate-500">Quantity</dt><dd className="font-medium text-slate-800">{formatNumber(selected.quantity)} pcs</dd></div>
              <div><dt className="text-slate-500">Unit price</dt><dd className="font-medium text-slate-800">${selected.unitPrice.toFixed(2)}</dd></div>
              <div><dt className="text-slate-500">Order value</dt><dd className="font-medium text-slate-800">{formatCurrency(orderValue(selected))}</dd></div>
              <div><dt className="text-slate-500">Order date</dt><dd className="font-medium text-slate-800">{formatDate(selected.orderDate)}</dd></div>
              <div><dt className="text-slate-500">Production start</dt><dd className="font-medium text-slate-800">{formatDate(selected.startDate)}</dd></div>
              <div><dt className="text-slate-500">Shipment deadline</dt><dd className="font-medium text-slate-800">{formatDate(selected.deadline)}</dd></div>
            </dl>
            <div>
              <p className="mb-1 text-slate-500">Production progress</p>
              <ProgressBar value={getProgress(selected, production)} />
            </div>
            <div>
              <label htmlFor="order-status-update" className="mb-1 block font-medium text-slate-700">Update status</label>
              <select
                id="order-status-update"
                value={selected.status}
                onChange={(event) => handleStatusChange(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-600"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-slate-500">Notes</p>
              <p className="text-slate-800">{selected.notes || 'No notes'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / edit form */}
      <Modal
        isOpen={isFormOpen}
        title={editingId ? `Edit order ${editingId}` : 'New order'}
        onClose={() => setIsFormOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" form="order-form">{editingId ? 'Save changes' : 'Create order'}</Button>
          </>
        }
      >
        <form id="order-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormInput id="o-customer" label="Customer / buyer" value={form.customer} onChange={setField('customer')} error={errors.customer} required />
          <FormInput id="o-product" label="Product name" value={form.product} onChange={setField('product')} error={errors.product} required />
          <FormInput id="o-category" label="Garment category" value={form.category} onChange={setField('category')} options={CATEGORIES} error={errors.category} required />
          <FormInput id="o-merch" label="Merchandiser" value={form.merchandiser} onChange={setField('merchandiser')} options={merchandisers} error={errors.merchandiser} required />
          <FormInput id="o-qty" label="Order quantity" type="number" min="0" value={form.quantity} onChange={setField('quantity')} error={errors.quantity} required />
          <FormInput id="o-price" label="Unit price (USD)" type="number" step="0.01" min="0" value={form.unitPrice} onChange={setField('unitPrice')} error={errors.unitPrice} required />
          <div className="sm:col-span-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            Total order value: <span className="font-semibold">{formatCurrency(formTotal)}</span>
          </div>
          <FormInput id="o-order-date" label="Order date" type="date" value={form.orderDate} onChange={setField('orderDate')} error={errors.orderDate} required />
          <FormInput id="o-start" label="Production start" type="date" value={form.startDate} onChange={setField('startDate')} error={errors.startDate} required />
          <FormInput id="o-deadline" label="Shipment deadline" type="date" value={form.deadline} onChange={setField('deadline')} error={errors.deadline} required />
          <FormInput id="o-status" label="Status" value={form.status} onChange={setField('status')} options={ORDER_STATUSES} />
          <div className="sm:col-span-2">
            <FormInput id="o-notes" label="Notes" value={form.notes} onChange={setField('notes')} />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function OrdersPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Orders & Merchandising"
        description="Customer orders, deadlines and status. Order value is quantity x unit price."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <OrdersContent data={data} />}
      </DataState>
    </>
  );
}