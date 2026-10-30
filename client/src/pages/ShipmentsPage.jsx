import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Copy } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_TODAY } from '../data/demoData.js';
import { SHIPMENT_STATUSES, SHIPMENT_DOCUMENTS } from '../constants/statuses.js';
import { OPEN_STATUSES, sumBy, daysLeft, missingDocuments } from '../utils/metrics.js';
import { isPositiveNumber, hasErrors } from '../utils/validation.js';
import { formatNumber, formatDate } from '../utils/format.js';

const EMPTY_FORM = { orderId: '', destination: '', quantity: '', plannedDate: '' };

// Plain-text summary a merchandiser can paste into an email.
const buildSummary = (shipment, order) =>
  [
    `Shipment ${shipment.id} for ${shipment.orderId} (${order?.customer ?? 'unknown customer'})`,
    `Product: ${order?.product ?? '-'}`,
    `Destination: ${shipment.destination}`,
    `Quantity: ${formatNumber(shipment.quantity)} pcs`,
    `Planned shipment: ${formatDate(shipment.plannedDate)}`,
    `Dispatched: ${formatDate(shipment.dispatchDate)}`,
    `Shipping reference: ${shipment.reference || 'not assigned yet'}`,
    `Status: ${shipment.status}`,
    `Missing documents: ${missingDocuments(shipment).join(', ') || 'none'}`,
  ].join('\n');

function ShipmentsContent({ data }) {
  const { orders } = data;
  const { notify } = useApp();
  const [shipments, setShipments] = useState(data.shipments);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const selected = shipments.find(({ id }) => id === selectedId);
  const selectedOrder = orders.find(({ id }) => id === selected?.orderId);

  // ---- KPIs ----
  const upcoming = shipments.filter(({ status, plannedDate }) => status !== 'Delivered' && daysLeft(plannedDate) <= 14);
  const withMissingDocs = shipments.filter((shipment) => shipment.status !== 'Delivered' && missingDocuments(shipment).length > 0);
  const delivered = shipments.filter(({ status }) => status === 'Delivered');

  const updateShipment = (id, changes) =>
    setShipments((current) => current.map((shipment) => (shipment.id === id ? { ...shipment, ...changes } : shipment)));

  const handleStatusChange = (status) => {
    const changes = { status };
    if (status === 'Dispatched' && !selected.dispatchDate) changes.dispatchDate = DEMO_TODAY;
    updateShipment(selected.id, changes);
    notify('success', `${selected.id} is now ${status}`);
  };

  const handleDocumentToggle = (name) =>
    updateShipment(selected.id, { documents: { ...selected.documents, [name]: !selected.documents[name] } });

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary(selected, selectedOrder));
      notify('success', 'Shipment summary copied');
    } catch {
      notify('warning', 'Could not copy automatically. Select the text and copy it.');
    }
  };

  // ---- Table ----
  const columns = [
    { key: 'id', header: 'Shipment' },
    { key: 'orderId', header: 'Order' },
    { key: 'destination', header: 'Destination' },
    { key: 'quantity', header: 'Quantity', align: 'right', render: ({ quantity }) => formatNumber(quantity) },
    { key: 'plannedDate', header: 'Planned date', render: ({ plannedDate }) => formatDate(plannedDate) },
    { key: 'dispatchDate', header: 'Dispatched', render: ({ dispatchDate }) => formatDate(dispatchDate) },
    { key: 'reference', header: 'Reference', render: ({ reference }) => reference || '-' },
    { key: 'status', header: 'Status', render: ({ status }) => <StatusBadge status={status} /> },
    {
      key: 'documents',
      header: 'Documents',
      render: (shipment) => {
        const missing = missingDocuments(shipment).length;
        return missing === 0 ? (
          <StatusBadge status="Docs complete" />
        ) : (
          <StatusBadge status={`${missing} missing`} tone="warning" />
        );
      },
    },
    {
      key: 'daysLeft',
      header: 'Days to ship',
      align: 'right',
      render: ({ status, plannedDate }) => (status === 'Delivered' ? '-' : daysLeft(plannedDate)),
    },
  ];

  // ---- Create a shipment ----
  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setIsCreateOpen(true);
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const found = {};
    const order = orders.find(({ id }) => id === form.orderId);
    if (!form.orderId) found.orderId = 'Choose the related order';
    if (!form.destination.trim()) found.destination = 'Enter the destination';
    if (!isPositiveNumber(form.quantity)) found.quantity = 'Enter a quantity above 0';
    else if (order && Number(form.quantity) > order.quantity) found.quantity = `The order only has ${formatNumber(order.quantity)} pieces`;
    if (!form.plannedDate) found.plannedDate = 'Choose the planned shipment date';
    setErrors(found);
    if (hasErrors(found)) return;

    const shipment = {
      id: `SH-${String(shipments.length + 1).padStart(3, '0')}`,
      orderId: form.orderId,
      destination: form.destination.trim(),
      quantity: Number(form.quantity),
      plannedDate: form.plannedDate,
      dispatchDate: null,
      reference: '',
      status: 'Preparing',
      documents: Object.fromEntries(SHIPMENT_DOCUMENTS.map(({ label }) => [label, false])),
    };
    setShipments((current) => [...current, shipment]);
    setIsCreateOpen(false);
    notify('success', `Shipment ${shipment.id} created for ${shipment.orderId}`);
  };

  const orderOptions = orders.filter(({ status }) => OPEN_STATUSES.includes(status)).map(({ id }) => id);
  const currentStep = selected ? SHIPMENT_STATUSES.indexOf(selected.status) : -1;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Shipments" value={shipments.length} hint={`${formatNumber(sumBy(shipments, ({ quantity }) => quantity))} pieces in total`} />
        <KpiCard label="Due in 14 days" value={upcoming.length} tone="info" hint="Not yet delivered" />
        <KpiCard label="Missing documents" value={withMissingDocs.length} tone={withMissingDocs.length > 0 ? 'warning' : 'success'} hint="Shipments with open checklist items" />
        <KpiCard label="Delivered" value={delivered.length} tone="success" hint="Completed shipments" />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Shipments</h2>
          <Button onClick={openCreate}>
            <Plus size={16} aria-hidden="true" /> Create shipment
          </Button>
        </div>
        <p className="mb-3 text-xs text-slate-500">Click a row to see milestones, the document checklist and a summary.</p>
        <DataTable columns={columns} rows={shipments} onRowClick={({ id }) => setSelectedId(id)} />
      </section>

      <Modal
        isOpen={Boolean(selected)}
        title={selected ? `Shipment ${selected.id}` : ''}
        onClose={() => setSelectedId(null)}
        footer={<Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button>}
      >
        {selected && (
          <div className="space-y-5 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-slate-500">Order</dt><dd className="font-medium text-slate-800">{selected.orderId} ({selectedOrder?.customer})</dd></div>
              <div><dt className="text-slate-500">Product</dt><dd className="font-medium text-slate-800">{selectedOrder?.product}</dd></div>
              <div><dt className="text-slate-500">Destination</dt><dd className="font-medium text-slate-800">{selected.destination}</dd></div>
              <div><dt className="text-slate-500">Quantity</dt><dd className="font-medium text-slate-800">{formatNumber(selected.quantity)} pcs</dd></div>
            </dl>

            <div>
              <label htmlFor="shipment-status" className="mb-1 block font-medium text-slate-700">Update status</label>
              <select
                id="shipment-status"
                value={selected.status}
                onChange={(event) => handleStatusChange(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-600"
              >
                {SHIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <section>
              <h3 className="mb-2 font-medium text-slate-800">Milestones</h3>
              <ol className="space-y-1.5">
                {SHIPMENT_STATUSES.map((status, index) => (
                  <li key={status} className={`flex items-center gap-2 ${index <= currentStep ? 'text-slate-800' : 'text-slate-400'}`}>
                    {index <= currentStep ? <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                    {status}
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="mb-1 font-medium text-slate-800">Export document checklist</h3>
              <p className="mb-2 text-xs text-slate-500">Internal tracking only. This does not certify documents or clear customs.</p>
              <ul className="space-y-1.5">
                {Object.entries(selected.documents).map(([name, isReady]) => (
                  <li key={name}>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={isReady} onChange={() => handleDocumentToggle(name)} className="h-4 w-4 accent-teal-600" />
                      <span className={isReady ? 'text-slate-800' : 'text-amber-700'}>{name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-slate-800">Shipment summary</h3>
                <Button variant="secondary" onClick={handleCopySummary}>
                  <Copy size={14} aria-hidden="true" /> Copy
                </Button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-slate-700">{buildSummary(selected, selectedOrder)}</pre>
            </section>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCreateOpen}
        title="Create shipment"
        onClose={() => setIsCreateOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" form="shipment-form">Create shipment</Button>
          </>
        }
      >
        <form id="shipment-form" onSubmit={handleCreate} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormInput id="s-order" label="Related order" value={form.orderId} onChange={setField('orderId')} options={orderOptions} error={errors.orderId} required />
          <FormInput id="s-destination" label="Destination" value={form.destination} onChange={setField('destination')} error={errors.destination} required />
          <FormInput id="s-quantity" label="Shipment quantity" type="number" min="0" value={form.quantity} onChange={setField('quantity')} error={errors.quantity} required />
          <FormInput id="s-date" label="Planned shipment date" type="date" value={form.plannedDate} onChange={setField('plannedDate')} error={errors.plannedDate} required />
        </form>
      </Modal>
    </>
  );
}

export default function ShipmentsPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Shipment & Export"
        description="Shipments linked to customer orders, milestones and the internal export-document checklist."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <ShipmentsContent data={data} />}
      </DataState>
    </>
  );
}
