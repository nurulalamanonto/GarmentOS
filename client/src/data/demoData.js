// =====================================================================
// DEMO DATA - fictional records for "Dhaka Apparel Ltd."
// This is the demo-data adapter from the project brief. It is NOT a database:
// nothing here is saved, and edits are lost on refresh. In Stage 6/7 the pages
// will read the same shapes from the REST API (Fetch) instead of this file.
// =====================================================================

// "Today" is fixed so the demo deadlines and risk results stay the same on every day.
export const DEMO_TODAY = '2026-10-27';

export const ORDERS = [
  { id: 'ORD-1001', customer: 'Northwind Retail', product: "Men's Polo Shirt", category: 'Knitwear', quantity: 12000, unitPrice: 4.8, orderDate: '2026-08-20', startDate: '2026-09-15', deadline: '2026-11-12', merchandiser: 'Nasrin Akter', status: 'In Production', notes: 'Pique cotton, 3 colours' },
  { id: 'ORD-1002', customer: 'Fjord & Co', product: 'Denim Jacket', category: 'Outerwear', quantity: 8500, unitPrice: 14.5, orderDate: '2026-09-02', startDate: '2026-10-20', deadline: '2026-11-28', merchandiser: 'Rafiq Hasan', status: 'Materials Pending', notes: 'Waiting for 12oz denim delivery' },
  { id: 'ORD-1003', customer: 'Atlas Sportswear', product: 'Track Pants', category: 'Activewear', quantity: 20000, unitPrice: 5.9, orderDate: '2026-07-25', startDate: '2026-08-25', deadline: '2026-10-30', merchandiser: 'Nasrin Akter', status: 'Ready to Ship', notes: 'Sea freight to Hamburg' },
  { id: 'ORD-1004', customer: 'Harbor Kids', product: 'Kids Hoodie', category: 'Kidswear', quantity: 6400, unitPrice: 7.2, orderDate: '2026-08-30', startDate: '2026-09-28', deadline: '2026-11-05', merchandiser: 'Imran Hossain', status: 'Quality Inspection', notes: 'Colour matching under review' },
  { id: 'ORD-1005', customer: 'Linden Basics', product: 'Basic Tee', category: 'Knitwear', quantity: 30000, unitPrice: 3.4, orderDate: '2026-10-05', startDate: '2026-11-10', deadline: '2026-12-20', merchandiser: 'Rafiq Hasan', status: 'Confirmed', notes: 'Large repeat order' },
  { id: 'ORD-1006', customer: 'Meridian Co', product: 'Chino Shorts', category: 'Bottoms', quantity: 9000, unitPrice: 6.1, orderDate: '2026-08-10', startDate: '2026-09-10', deadline: '2026-10-12', merchandiser: 'Imran Hossain', status: 'Delivered', notes: 'Delivered on time' },
  { id: 'ORD-1007', customer: 'Coastline Apparel', product: "Women's Blouse", category: 'Woven', quantity: 7500, unitPrice: 8.3, orderDate: '2026-09-12', startDate: '2026-10-05', deadline: '2026-11-08', merchandiser: 'Nasrin Akter', status: 'In Production', notes: 'Sewing line slower than planned' },
  { id: 'ORD-1008', customer: 'Sterling Uniforms', product: 'Work Shirt', category: 'Uniform', quantity: 5000, unitPrice: 6.8, orderDate: '2026-09-18', startDate: '2026-10-12', deadline: '2026-11-20', merchandiser: 'Imran Hossain', status: 'Ready for Production', notes: '' },
  { id: 'ORD-1009', customer: 'Pine & Pearl', product: 'Pyjama Set', category: 'Sleepwear', quantity: 4000, unitPrice: 9.0, orderDate: '2026-10-22', startDate: '2027-01-05', deadline: '2027-01-30', merchandiser: 'Rafiq Hasan', status: 'Draft', notes: 'Awaiting buyer sign-off' },
  { id: 'ORD-1010', customer: 'Meridian Co', product: 'Cargo Pants', category: 'Bottoms', quantity: 6000, unitPrice: 9.4, orderDate: '2026-09-05', startDate: '2026-10-10', deadline: '2026-11-25', merchandiser: 'Imran Hossain', status: 'Cancelled', notes: 'Cancelled by buyer' },
];

// One record = one shift of finished output from one line.
// Completion of an order = (actual - rejected) / order quantity.
export const PRODUCTION = [
  { id: 'P-001', orderId: 'ORD-1001', line: 'Line 1', planned: 1600, actual: 1580, rejected: 40, date: '2026-10-12', shift: 'Day', stage: 'Sewing', notes: '' },
  { id: 'P-002', orderId: 'ORD-1001', line: 'Line 1', planned: 1600, actual: 1540, rejected: 35, date: '2026-10-16', shift: 'Day', stage: 'Sewing', notes: '' },
  { id: 'P-003', orderId: 'ORD-1001', line: 'Line 2', planned: 1500, actual: 1450, rejected: 30, date: '2026-10-19', shift: 'Day', stage: 'Sewing', notes: '' },
  { id: 'P-004', orderId: 'ORD-1001', line: 'Line 2', planned: 1500, actual: 1480, rejected: 45, date: '2026-10-22', shift: 'Night', stage: 'Finishing', notes: '' },
  { id: 'P-005', orderId: 'ORD-1001', line: 'Line 1', planned: 1600, actual: 1590, rejected: 30, date: '2026-10-24', shift: 'Day', stage: 'Finishing', notes: '' },
  { id: 'P-006', orderId: 'ORD-1001', line: 'Line 2', planned: 1500, actual: 1520, rejected: 20, date: '2026-10-26', shift: 'Day', stage: 'Finishing', notes: '' },
  { id: 'P-007', orderId: 'ORD-1003', line: 'Line 3', planned: 7000, actual: 7000, rejected: 60, date: '2026-10-02', shift: 'Day', stage: 'Packing', notes: '' },
  { id: 'P-008', orderId: 'ORD-1003', line: 'Line 3', planned: 7000, actual: 6950, rejected: 70, date: '2026-10-09', shift: 'Day', stage: 'Packing', notes: '' },
  { id: 'P-009', orderId: 'ORD-1003', line: 'Line 3', planned: 6200, actual: 6300, rejected: 40, date: '2026-10-15', shift: 'Day', stage: 'Packing', notes: 'Final batch' },
  { id: 'P-010', orderId: 'ORD-1004', line: 'Line 4', planned: 2200, actual: 2200, rejected: 50, date: '2026-10-08', shift: 'Day', stage: 'Packing', notes: '' },
  { id: 'P-011', orderId: 'ORD-1004', line: 'Line 4', planned: 2200, actual: 2150, rejected: 40, date: '2026-10-14', shift: 'Day', stage: 'Quality Inspection', notes: '' },
  { id: 'P-012', orderId: 'ORD-1004', line: 'Line 4', planned: 2200, actual: 2200, rejected: 35, date: '2026-10-20', shift: 'Night', stage: 'Quality Inspection', notes: '' },
  { id: 'P-013', orderId: 'ORD-1007', line: 'Line 2', planned: 1200, actual: 900, rejected: 60, date: '2026-10-07', shift: 'Day', stage: 'Cutting', notes: 'Fabric arrived late' },
  { id: 'P-014', orderId: 'ORD-1007', line: 'Line 4', planned: 1200, actual: 800, rejected: 70, date: '2026-10-14', shift: 'Day', stage: 'Sewing', notes: 'Operators short' },
  { id: 'P-015', orderId: 'ORD-1007', line: 'Line 4', planned: 1200, actual: 700, rejected: 80, date: '2026-10-21', shift: 'Day', stage: 'Sewing', notes: 'Button supply low' },
  { id: 'P-016', orderId: 'ORD-1007', line: 'Line 4', planned: 1200, actual: 650, rejected: 50, date: '2026-10-26', shift: 'Day', stage: 'Sewing', notes: '' },
  { id: 'P-017', orderId: 'ORD-1006', line: 'Line 1', planned: 5000, actual: 5000, rejected: 50, date: '2026-09-22', shift: 'Day', stage: 'Packing', notes: '' },
  { id: 'P-018', orderId: 'ORD-1006', line: 'Line 1', planned: 4100, actual: 4100, rejected: 40, date: '2026-10-01', shift: 'Day', stage: 'Packing', notes: '' },
];

export const MATERIALS = [
  { id: 'M-001', name: 'Cotton Jersey 180gsm', category: 'Fabric', available: 14200, unit: 'm', minStock: 6000, supplier: 'Dhaka Textile Mills', unitCost: 3.1 },
  { id: 'M-002', name: 'Denim 12oz', category: 'Fabric', available: 4200, unit: 'm', minStock: 9000, supplier: 'Narayanganj Denim Co', unitCost: 4.4 },
  { id: 'M-003', name: 'Poly-cotton Twill', category: 'Fabric', available: 7800, unit: 'm', minStock: 3000, supplier: 'Dhaka Textile Mills', unitCost: 2.8 },
  { id: 'M-004', name: 'Polyester Thread 40/2', category: 'Thread', available: 340, unit: 'cones', minStock: 200, supplier: 'Chattogram Threads', unitCost: 1.2 },
  { id: 'M-005', name: 'Cotton Thread 50/3', category: 'Thread', available: 90, unit: 'cones', minStock: 150, supplier: 'Chattogram Threads', unitCost: 1.35 },
  { id: 'M-006', name: 'Shirt Buttons 18L', category: 'Buttons', available: 21000, unit: 'pcs', minStock: 30000, supplier: 'Gazipur Trims', unitCost: 0.02 },
  { id: 'M-007', name: 'Metal Zipper 5in', category: 'Zippers', available: 9400, unit: 'pcs', minStock: 5000, supplier: 'Zip Asia Ltd', unitCost: 0.14 },
  { id: 'M-008', name: 'Woven Brand Label', category: 'Labels', available: 52000, unit: 'pcs', minStock: 20000, supplier: 'Label House BD', unitCost: 0.01 },
  { id: 'M-009', name: 'Poly Bag 30x40cm', category: 'Packaging', available: 36000, unit: 'pcs', minStock: 15000, supplier: 'Pack Plus', unitCost: 0.03 },
  { id: 'M-010', name: 'Carton Box 5-ply', category: 'Packaging', available: 1250, unit: 'pcs', minStock: 800, supplier: 'Pack Plus', unitCost: 0.85 },
];

export const STOCK_MOVEMENTS = [
  { id: 'S-001', materialId: 'M-001', type: 'Received', quantity: 8000, date: '2026-10-10', reference: 'PO-2210' },
  { id: 'S-002', materialId: 'M-001', type: 'Issued', quantity: 3200, date: '2026-10-12', reference: 'ORD-1001' },
  { id: 'S-003', materialId: 'M-002', type: 'Received', quantity: 2000, date: '2026-10-15', reference: 'PO-2214' },
  { id: 'S-004', materialId: 'M-006', type: 'Issued', quantity: 6000, date: '2026-10-18', reference: 'ORD-1007' },
  { id: 'S-005', materialId: 'M-004', type: 'Issued', quantity: 120, date: '2026-10-19', reference: 'ORD-1001' },
  { id: 'S-006', materialId: 'M-007', type: 'Issued', quantity: 1800, date: '2026-10-20', reference: 'ORD-1004' },
  { id: 'S-007', materialId: 'M-005', type: 'Issued', quantity: 60, date: '2026-10-22', reference: 'ORD-1004' },
  { id: 'S-008', materialId: 'M-009', type: 'Received', quantity: 20000, date: '2026-10-23', reference: 'PO-2219' },
];

// Simplified bill of materials: material still needed to finish each open order.
export const REQUIREMENTS = [
  { orderId: 'ORD-1001', materialId: 'M-001', required: 3000 },
  { orderId: 'ORD-1001', materialId: 'M-004', required: 100 },
  { orderId: 'ORD-1002', materialId: 'M-002', required: 12000 },
  { orderId: 'ORD-1002', materialId: 'M-004', required: 90 },
  { orderId: 'ORD-1004', materialId: 'M-005', required: 40 },
  { orderId: 'ORD-1005', materialId: 'M-001', required: 28000 },
  { orderId: 'ORD-1007', materialId: 'M-003', required: 6000 },
  { orderId: 'ORD-1007', materialId: 'M-006', required: 24000 },
  { orderId: 'ORD-1008', materialId: 'M-003', required: 4200 },
  { orderId: 'ORD-1008', materialId: 'M-006', required: 5000 },
];

// passed + rejected + rework = inspected for every record.
export const INSPECTIONS = [
  { id: 'Q-001', orderId: 'ORD-1001', batch: 'B-1001-A', inspected: 800, passed: 770, rejected: 12, rework: 18, defect: 'Stitching defect', inspector: 'Farhana Islam', date: '2026-10-14', resolved: true },
  { id: 'Q-002', orderId: 'ORD-1001', batch: 'B-1001-B', inspected: 800, passed: 765, rejected: 15, rework: 20, defect: 'Fabric defect', inspector: 'Farhana Islam', date: '2026-10-20', resolved: true },
  { id: 'Q-003', orderId: 'ORD-1001', batch: 'B-1001-C', inspected: 800, passed: 780, rejected: 8, rework: 12, defect: 'Measurement mismatch', inspector: 'Tanvir Ahmed', date: '2026-10-25', resolved: true },
  { id: 'Q-004', orderId: 'ORD-1003', batch: 'B-1003-A', inspected: 1000, passed: 968, rejected: 12, rework: 20, defect: 'Stitching defect', inspector: 'Tanvir Ahmed', date: '2026-10-12', resolved: true },
  { id: 'Q-005', orderId: 'ORD-1003', batch: 'B-1003-B', inspected: 1000, passed: 972, rejected: 10, rework: 18, defect: 'Packaging defect', inspector: 'Farhana Islam', date: '2026-10-18', resolved: true },
  { id: 'Q-006', orderId: 'ORD-1004', batch: 'B-1004-A', inspected: 600, passed: 540, rejected: 22, rework: 38, defect: 'Color inconsistency', inspector: 'Tanvir Ahmed', date: '2026-10-22', resolved: false },
  { id: 'Q-007', orderId: 'ORD-1004', batch: 'B-1004-B', inspected: 600, passed: 552, rejected: 18, rework: 30, defect: 'Stitching defect', inspector: 'Farhana Islam', date: '2026-10-24', resolved: false },
  { id: 'Q-008', orderId: 'ORD-1007', batch: 'B-1007-A', inspected: 500, passed: 400, rejected: 40, rework: 60, defect: 'Stitching defect', inspector: 'Tanvir Ahmed', date: '2026-10-21', resolved: false },
  { id: 'Q-009', orderId: 'ORD-1007', batch: 'B-1007-B', inspected: 500, passed: 410, rejected: 35, rework: 55, defect: 'Accessory defect', inspector: 'Farhana Islam', date: '2026-10-26', resolved: false },
  { id: 'Q-010', orderId: 'ORD-1006', batch: 'B-1006-A', inspected: 900, passed: 880, rejected: 8, rework: 12, defect: 'Packaging defect', inspector: 'Tanvir Ahmed', date: '2026-10-02', resolved: true },
];

export const SHIPMENTS = [
  { id: 'SH-001', orderId: 'ORD-1003', destination: 'Hamburg, Germany', quantity: 20000, plannedDate: '2026-10-30', dispatchDate: null, reference: 'CTG-HAM-4471', status: 'Documents Pending', documents: { 'Commercial invoice': true, 'Packing list': true, 'Certificate of origin': false } },
  { id: 'SH-002', orderId: 'ORD-1006', destination: 'Rotterdam, Netherlands', quantity: 9000, plannedDate: '2026-10-10', dispatchDate: '2026-10-11', reference: 'CTG-RTM-4402', status: 'Delivered', documents: { 'Commercial invoice': true, 'Packing list': true, 'Certificate of origin': true } },
  { id: 'SH-003', orderId: 'ORD-1004', destination: 'Gothenburg, Sweden', quantity: 6400, plannedDate: '2026-11-05', dispatchDate: null, reference: '', status: 'Preparing', documents: { 'Commercial invoice': false, 'Packing list': false, 'Certificate of origin': false } },
  { id: 'SH-004', orderId: 'ORD-1001', destination: 'Chicago, USA', quantity: 12000, plannedDate: '2026-11-12', dispatchDate: null, reference: '', status: 'Preparing', documents: { 'Commercial invoice': true, 'Packing list': false, 'Certificate of origin': false } },
  { id: 'SH-005', orderId: 'ORD-1007', destination: 'Manchester, UK', quantity: 7500, plannedDate: '2026-11-08', dispatchDate: null, reference: '', status: 'Preparing', documents: { 'Commercial invoice': false, 'Packing list': false, 'Certificate of origin': false } },
];
