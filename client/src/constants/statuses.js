// Fixed lists of values used by forms, filters and badges across the app.

export const ORDER_STATUSES = [
  'Draft',
  'Confirmed',
  'Materials Pending',
  'Ready for Production',
  'In Production',
  'Quality Inspection',
  'Ready to Ship',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const PRODUCTION_STAGES = ['Cutting', 'Sewing', 'Finishing', 'Quality Inspection', 'Packing'];

export const SHIPMENT_STATUSES = [
  'Preparing',
  'Documents Pending',
  'Ready to Ship',
  'Dispatched',
  'In Transit',
  'Delivered',
];

export const DEFECT_CATEGORIES = [
  'Stitching defect',
  'Fabric defect',
  'Measurement mismatch',
  'Color inconsistency',
  'Accessory defect',
  'Packaging defect',
];

export const MATERIAL_CATEGORIES = ['Fabric', 'Thread', 'Buttons', 'Zippers', 'Labels', 'Packaging'];

export const RISK_LEVELS = ['Low', 'Medium', 'High'];

// Internal document checklist for each shipment (tracking only, not official certification).
export const SHIPMENT_DOCUMENTS = [
  { key: 'invoice', label: 'Commercial invoice' },
  { key: 'packing', label: 'Packing list' },
  { key: 'origin', label: 'Certificate of origin' },
];

// Which colour a status badge uses: success (green), warning (amber),
// danger (red), info (blue) or neutral (grey).
export const STATUS_TONES = {
  // Orders
  Draft: 'neutral',
  Confirmed: 'info',
  'Materials Pending': 'warning',
  'Ready for Production': 'info',
  'In Production': 'info',
  'Quality Inspection': 'warning',
  'Ready to Ship': 'success',
  Shipped: 'success',
  Delivered: 'success',
  Cancelled: 'danger',
  // Shipments
  Preparing: 'neutral',
  'Documents Pending': 'warning',
  Dispatched: 'info',
  'In Transit': 'info',
  // Production stages, stock and schedule indicators
  Cutting: 'neutral',
  Sewing: 'info',
  Finishing: 'info',
  Packing: 'success',
  Received: 'success',
  Issued: 'info',
  'Low stock': 'danger',
  'In stock': 'success',
  'Behind plan': 'danger',
  'On plan': 'success',
  'Docs complete': 'success',
  // Risk levels
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
};
