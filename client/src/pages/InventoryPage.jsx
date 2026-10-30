import { useState } from 'react';
import { Plus, PackagePlus, PackageMinus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DemoNotice from '../components/ui/DemoNotice.jsx';
import DataState from '../components/ui/DataState.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import FilterSelect from '../components/ui/FilterSelect.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useFactoryData } from '../hooks/useFactoryData.js';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_TODAY } from '../data/demoData.js';
import { MATERIAL_CATEGORIES } from '../constants/statuses.js';
import { OPEN_STATUSES, isLowStock, inventoryValue, orderShortages } from '../utils/metrics.js';
import { isPositiveNumber, isNonNegativeNumber, hasErrors } from '../utils/validation.js';
import { formatNumber, formatDate } from '../utils/format.js';

const EMPTY_MATERIAL = { name: '', category: '', available: '', unit: '', minStock: '', supplier: '', unitCost: '' };

function InventoryContent({ data }) {
  const { orders, requirements } = data;
  const { notify } = useApp();
  const [materials, setMaterials] = useState(data.materials);
  const [movements, setMovements] = useState(data.stockMovements);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Receive / issue dialog: { type: 'Received' | 'Issued', materialId } or null
  const [movementDialog, setMovementDialog] = useState(null);
  const [movementForm, setMovementForm] = useState({ quantity: '', reference: '' });
  const [movementErrors, setMovementErrors] = useState({});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState(EMPTY_MATERIAL);
  const [materialErrors, setMaterialErrors] = useState({});

  const lowStock = materials.filter(isLowStock);
  const selectedMaterial = materials.find(({ id }) => id === movementDialog?.materialId);

  const visibleMaterials = materials.filter(
    ({ id, name, supplier, category: materialCategory }) =>
      `${id} ${name} ${supplier}`.toLowerCase().includes(search.toLowerCase()) &&
      (!category || materialCategory === category),
  );

  // Materials that open orders still need but the store does not have enough of
  const shortageRows = orders
    .filter(({ status }) => OPEN_STATUSES.includes(status))
    .flatMap((order) =>
      orderShortages(order.id, requirements, materials).map(({ material, required, available }) => ({
        id: `${order.id}-${material.id}`,
        orderId: order.id,
        customer: order.customer,
        material: material.name,
        unit: material.unit,
        required,
        available,
        missing: required - available,
      })),
    );

  const historyRows = [...movements]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 12)
    .map((movement) => ({
      ...movement,
      materialName: materials.find(({ id }) => id === movement.materialId)?.name ?? movement.materialId,
    }));

  // ---- Table columns ----
  const stockColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Material' },
    { key: 'category', header: 'Category' },
    { key: 'available', header: 'Available', align: 'right', render: ({ available, unit }) => `${formatNumber(available)} ${unit}` },
    { key: 'minStock', header: 'Minimum', align: 'right', render: ({ minStock, unit }) => `${formatNumber(minStock)} ${unit}` },
    { key: 'supplier', header: 'Supplier' },
    { key: 'unitCost', header: 'Unit cost', align: 'right', render: ({ unitCost }) => `$${unitCost.toFixed(2)}` },
    { key: 'value', header: 'Stock value', align: 'right', render: ({ available, unitCost }) => `$${formatNumber(Math.round(available * unitCost))}` },
    { key: 'status', header: 'Status', render: (material) => <StatusBadge status={isLowStock(material) ? 'Low stock' : 'In stock'} /> },
    {
      key: 'actions',
      header: 'Stock',
      render: ({ id }) => (
        <span className="flex gap-2">
          <Button variant="secondary" onClick={() => openMovement('Received', id)}>
            <PackagePlus size={14} aria-hidden="true" /> Receive
          </Button>
          <Button variant="secondary" onClick={() => openMovement('Issued', id)}>
            <PackageMinus size={14} aria-hidden="true" /> Issue
          </Button>
        </span>
      ),
    },
  ];

  const shortageColumns = [
    { key: 'orderId', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'material', header: 'Material' },
    { key: 'required', header: 'Required', align: 'right', render: ({ required, unit }) => `${formatNumber(required)} ${unit}` },
    { key: 'available', header: 'Available', align: 'right', render: ({ available, unit }) => `${formatNumber(available)} ${unit}` },
    { key: 'missing', header: 'Short by', align: 'right', render: ({ missing, unit }) => <span className="font-medium text-red-600">{`${formatNumber(missing)} ${unit}`}</span> },
  ];

  const historyColumns = [
    { key: 'date', header: 'Date', render: ({ date }) => formatDate(date) },
    { key: 'materialName', header: 'Material' },
    { key: 'type', header: 'Movement', render: ({ type }) => <StatusBadge status={type} /> },
    { key: 'quantity', header: 'Quantity', align: 'right', render: ({ quantity }) => formatNumber(quantity) },
    { key: 'reference', header: 'Reference' },
  ];

  // ---- Receive or issue stock ----
  const openMovement = (type, materialId) => {
    setMovementForm({ quantity: '', reference: '' });
    setMovementErrors({});
    setMovementDialog({ type, materialId });
  };

  const handleMovementSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const quantity = Number(movementForm.quantity);
    if (!isPositiveNumber(movementForm.quantity)) {
      found.quantity = 'Enter a quantity above 0';
    } else if (movementDialog.type === 'Issued' && quantity > selectedMaterial.available) {
      found.quantity = `Only ${formatNumber(selectedMaterial.available)} ${selectedMaterial.unit} available`;
    }
    if (!movementForm.reference.trim()) found.reference = 'Enter an order or purchase reference';
    setMovementErrors(found);
    if (hasErrors(found)) return;

    const change = movementDialog.type === 'Received' ? quantity : -quantity;
    setMaterials((current) =>
      current.map((material) =>
        material.id === selectedMaterial.id ? { ...material, available: material.available + change } : material,
      ),
    );
    setMovements((current) => [
      ...current,
      {
        id: `S-${String(current.length + 1).padStart(3, '0')}`,
        materialId: selectedMaterial.id,
        type: movementDialog.type,
        quantity,
        date: DEMO_TODAY,
        reference: movementForm.reference.trim(),
      },
    ]);
    notify('success', `${movementDialog.type} ${formatNumber(quantity)} ${selectedMaterial.unit} of ${selectedMaterial.name}`);
    setMovementDialog(null);
  };

  // ---- Add a material ----
  const setMaterialField = (field) => (value) => setMaterialForm((current) => ({ ...current, [field]: value }));

  const handleAddMaterial = (event) => {
    event.preventDefault();
    const found = {};
    if (!materialForm.name.trim()) found.name = 'Enter a material name';
    if (!materialForm.category) found.category = 'Choose a category';
    if (!isNonNegativeNumber(materialForm.available)) found.available = 'Enter the quantity in stock (0 or more)';
    if (!materialForm.unit.trim()) found.unit = 'Enter a unit, e.g. m, pcs';
    if (!isNonNegativeNumber(materialForm.minStock)) found.minStock = 'Enter the minimum stock level';
    if (!materialForm.supplier.trim()) found.supplier = 'Enter a supplier';
    if (!isNonNegativeNumber(materialForm.unitCost)) found.unitCost = 'Enter the unit cost';
    setMaterialErrors(found);
    if (hasErrors(found)) return;

    const material = {
      id: `M-${String(materials.length + 1).padStart(3, '0')}`,
      name: materialForm.name.trim(),
      category: materialForm.category,
      available: Number(materialForm.available),
      unit: materialForm.unit.trim(),
      minStock: Number(materialForm.minStock),
      supplier: materialForm.supplier.trim(),
      unitCost: Number(materialForm.unitCost),
    };
    setMaterials((current) => [...current, material]);
    setIsAddOpen(false);
    setMaterialForm(EMPTY_MATERIAL);
    notify('success', `${material.name} added to inventory`);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Materials" value={materials.length} hint="Tracked items" />
        <KpiCard label="Low-stock items" value={lowStock.length} tone={lowStock.length > 0 ? 'danger' : 'success'} hint="Below minimum level" />
        <KpiCard label="Inventory value" value={`$${formatNumber(Math.round(inventoryValue(materials)))}`} tone="success" hint="Available x unit cost" />
        <KpiCard label="Order shortages" value={shortageRows.length} tone={shortageRows.length > 0 ? 'warning' : 'success'} hint="Material lines not covered" />
      </div>

      {lowStock.length > 0 && (
        <section role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Low-stock alert</p>
          <p className="mt-1">
            {lowStock.map(({ name, available, minStock, unit }) => `${name} (${formatNumber(available)} of ${formatNumber(minStock)} ${unit})`).join(', ')}
          </p>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Stock</h2>
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar id="material-search" value={search} onChange={setSearch} placeholder="Search material or supplier" />
            <FilterSelect id="category-filter" label="Category" value={category} onChange={setCategory} options={MATERIAL_CATEGORIES} />
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus size={16} aria-hidden="true" /> Add material
            </Button>
          </div>
        </div>
        <DataTable columns={stockColumns} rows={visibleMaterials} emptyMessage="Try a different search or category." />
      </section>

      <section className="mt-6">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Material shortages for open orders</h2>
        <p className="mb-3 text-xs text-slate-500">From the bill of materials: what each open order still needs versus what is in stock.</p>
        <DataTable columns={shortageColumns} rows={shortageRows} emptyTitle="No shortages" emptyMessage="Every open order has the materials it needs." />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Stock movement history</h2>
        <DataTable columns={historyColumns} rows={historyRows} />
      </section>

      <Modal
        isOpen={Boolean(movementDialog)}
        title={movementDialog ? `${movementDialog.type === 'Received' ? 'Receive' : 'Issue'} stock: ${selectedMaterial?.name}` : ''}
        onClose={() => setMovementDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMovementDialog(null)}>Cancel</Button>
            <Button type="submit" form="movement-form">Save</Button>
          </>
        }
      >
        {selectedMaterial && (
          <form id="movement-form" onSubmit={handleMovementSubmit} noValidate className="space-y-4">
            <p className="text-sm text-slate-500">
              In stock now: {formatNumber(selectedMaterial.available)} {selectedMaterial.unit}
            </p>
            <FormInput id="m-quantity" label={`Quantity (${selectedMaterial.unit})`} type="number" min="0" value={movementForm.quantity} onChange={(value) => setMovementForm((c) => ({ ...c, quantity: value }))} error={movementErrors.quantity} required />
            <FormInput id="m-reference" label={movementDialog.type === 'Received' ? 'Purchase order' : 'Order issued to'} value={movementForm.reference} onChange={(value) => setMovementForm((c) => ({ ...c, reference: value }))} error={movementErrors.reference} required />
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isAddOpen}
        title="Add material"
        onClose={() => setIsAddOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" form="material-form">Add material</Button>
          </>
        }
      >
        <form id="material-form" onSubmit={handleAddMaterial} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormInput id="a-name" label="Material name" value={materialForm.name} onChange={setMaterialField('name')} error={materialErrors.name} required />
          </div>
          <FormInput id="a-category" label="Category" value={materialForm.category} onChange={setMaterialField('category')} options={MATERIAL_CATEGORIES} error={materialErrors.category} required />
          <FormInput id="a-unit" label="Unit" value={materialForm.unit} onChange={setMaterialField('unit')} error={materialErrors.unit} required />
          <FormInput id="a-available" label="Quantity in stock" type="number" min="0" value={materialForm.available} onChange={setMaterialField('available')} error={materialErrors.available} required />
          <FormInput id="a-min" label="Minimum stock level" type="number" min="0" value={materialForm.minStock} onChange={setMaterialField('minStock')} error={materialErrors.minStock} required />
          <FormInput id="a-supplier" label="Supplier" value={materialForm.supplier} onChange={setMaterialField('supplier')} error={materialErrors.supplier} required />
          <FormInput id="a-cost" label="Unit cost (USD)" type="number" step="0.01" min="0" value={materialForm.unitCost} onChange={setMaterialField('unitCost')} error={materialErrors.unitCost} required />
        </form>
      </Modal>
    </>
  );
}

export default function InventoryPage() {
  const { data, isLoading, error, refetch } = useFactoryData();

  return (
    <>
      <PageHeader
        title="Inventory & Materials"
        description="Raw materials, stock levels and movements. Issuing more than the available stock is blocked."
      />
      <DemoNotice />
      <DataState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && <InventoryContent data={data} />}
      </DataState>
    </>
  );
}
