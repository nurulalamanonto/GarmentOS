// Data-access layer for the factory modules.
// For now it returns the demo data in src/data/demoData.js. In Stage 6/7 only this
// file changes (each function calls apiRequest('/orders') etc.), so the pages stay the same.
import {
  ORDERS,
  PRODUCTION,
  MATERIALS,
  STOCK_MOVEMENTS,
  REQUIREMENTS,
  INSPECTIONS,
  SHIPMENTS,
} from '../data/demoData.js';

// A copy is returned so a page can change its own records without touching the originals.
export const fetchFactoryData = async () =>
  structuredClone({
    orders: ORDERS,
    production: PRODUCTION,
    materials: MATERIALS,
    stockMovements: STOCK_MOVEMENTS,
    requirements: REQUIREMENTS,
    inspections: INSPECTIONS,
    shipments: SHIPMENTS,
  });
