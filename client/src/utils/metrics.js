// Calculations shared by the dashboard, module pages, reports and risk analysis.
// Every number shown in the app comes from these functions, applied to the records.
import { DEMO_TODAY } from '../data/demoData.js';

// Orders that still need work (not draft, finished or cancelled).
export const OPEN_STATUSES = [
  'Confirmed',
  'Materials Pending',
  'Ready for Production',
  'In Production',
  'Quality Inspection',
  'Ready to Ship',
];

export const sumBy = (rows, getValue) => rows.reduce((total, row) => total + getValue(row), 0);

export const percent = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

export const formatPercent = (value, digits = 1) => `${value.toFixed(digits)}%`;

export const daysBetween = (from, to) => Math.round((new Date(to) - new Date(from)) / 86_400_000);

export const daysLeft = (deadline) => daysBetween(DEMO_TODAY, deadline);

export const orderValue = ({ quantity, unitPrice }) => quantity * unitPrice;

// ---- Production ------------------------------------------------------

// Good pieces finished for an order = actual - rejected, summed over its records.
export const completionPercent = (order, production) => {
  const good = sumBy(
    production.filter(({ orderId }) => orderId === order.id),
    ({ actual, rejected }) => actual - rejected,
  );
  return Math.min(100, Math.round(percent(good, order.quantity)));
};

// Compare planned and actual output up to "today". Negative variance = behind plan.
export const scheduleVariance = (orderId, production) => {
  const records = production.filter(({ orderId: id, date }) => id === orderId && date <= DEMO_TODAY);
  const planned = sumBy(records, ({ planned: value }) => value);
  const actual = sumBy(records, ({ actual: value }) => value);
  return { planned, actual, variancePercent: planned > 0 ? percent(actual - planned, planned) : 0 };
};

export const isBehindSchedule = (orderId, production) => {
  const { planned, variancePercent } = scheduleVariance(orderId, production);
  return planned > 0 && variancePercent <= -10;
};

// ---- Inventory -------------------------------------------------------

export const isLowStock = ({ available, minStock }) => available < minStock;

export const inventoryValue = (materials) => sumBy(materials, ({ available, unitCost }) => available * unitCost);

// Materials an order still needs that are not available in stock.
export const orderShortages = (orderId, requirements, materials) =>
  requirements
    .filter((requirement) => requirement.orderId === orderId)
    .map(({ materialId, required }) => {
      const material = materials.find(({ id }) => id === materialId);
      return { material, required, available: material.available };
    })
    .filter(({ required, available }) => available < required);

// ---- Quality ---------------------------------------------------------

export const rejectionRate = (inspections) =>
  percent(sumBy(inspections, ({ rejected }) => rejected), sumBy(inspections, ({ inspected }) => inspected));

// First-pass yield = pieces that passed first time / pieces inspected.
export const firstPassYield = (inspections) =>
  percent(sumBy(inspections, ({ passed }) => passed), sumBy(inspections, ({ inspected }) => inspected));

export const unresolvedInspections = (orderId, inspections) =>
  inspections.filter((inspection) => inspection.orderId === orderId && !inspection.resolved && inspection.rework > 0);

// ---- Shipments -------------------------------------------------------

export const missingDocuments = ({ documents }) =>
  Object.entries(documents)
    .filter(([, isReady]) => !isReady)
    .map(([name]) => name);

// ---- Delay risk (transparent rules, no AI model) ------------------------

const ACTIONS = {
  deadline: 'Contact the buyer about the date and check faster shipping options.',
  schedule: 'Add shifts or move capacity to this order and review line allocation.',
  materials: 'Review material procurement and expedite the missing items.',
  quality: 'Finish rework and re-inspect the affected batches before shipping.',
  shipment: 'Complete the shipment record and missing export documents.',
};

export const RISK_LEVEL_FROM_POINTS = (points) => (points >= 5 ? 'High' : points >= 2 ? 'Medium' : 'Low');

export const computeRisks = ({ orders, production, materials, requirements, inspections, shipments }) =>
  orders
    .filter(({ status }) => OPEN_STATUSES.includes(status))
    .map((order) => {
      const reasons = [];
      const actionKeys = [];
      let points = 0;
      const addReason = (pts, key, text) => {
        points += pts;
        reasons.push(text);
        if (!actionKeys.includes(key)) actionKeys.push(key);
      };

      const remaining = daysLeft(order.deadline);
      const completion = completionPercent(order, production);

      // Rule 1: time left versus completion
      if (remaining < 0) {
        addReason(4, 'deadline', `Deadline passed ${Math.abs(remaining)} days ago`);
      } else if (remaining <= 7 && completion < 90) {
        addReason(3, 'deadline', `Only ${remaining} days left and production is ${completion}% complete`);
      } else if (remaining <= 14 && completion < 60) {
        addReason(2, 'deadline', `${remaining} days left and production is only ${completion}% complete`);
      }

      // Rule 2: production behind plan
      const { variancePercent, planned } = scheduleVariance(order.id, production);
      if (planned > 0 && variancePercent <= -25) {
        addReason(3, 'schedule', `Production is ${Math.abs(Math.round(variancePercent))}% behind plan`);
      } else if (planned > 0 && variancePercent <= -10) {
        addReason(2, 'schedule', `Production is ${Math.abs(Math.round(variancePercent))}% behind plan`);
      }

      // Rule 3: material shortages
      const shortages = orderShortages(order.id, requirements, materials);
      if (shortages.length > 0) {
        const names = shortages.map(({ material }) => material.name).join(', ');
        addReason(3, 'materials', `Insufficient materials: ${names}`);
      }

      // Rule 4: unresolved quality issues
      const openIssues = unresolvedInspections(order.id, inspections);
      if (openIssues.length > 0) {
        addReason(2, 'quality', `${openIssues.length} inspection(s) with unresolved rework`);
      }

      // Rule 5: shipment readiness when the deadline is close
      if (remaining <= 7 && remaining >= 0) {
        const shipment = shipments.find(({ orderId }) => orderId === order.id);
        if (!shipment) {
          addReason(2, 'shipment', 'No shipment has been created');
        } else if (missingDocuments(shipment).length > 0) {
          addReason(2, 'shipment', `Missing documents: ${missingDocuments(shipment).join(', ')}`);
        }
      }

      const level = RISK_LEVEL_FROM_POINTS(points);
      return {
        id: order.id,
        orderId: order.id,
        customer: order.customer,
        deadline: order.deadline,
        daysLeft: remaining,
        completion,
        points,
        level,
        reasons: reasons.length > 0 ? reasons : ['No risk rule triggered'],
        action: actionKeys.length > 0 ? actionKeys.map((key) => ACTIONS[key]).join(' ') : 'Continue normal monitoring.',
      };
    })
    .sort((a, b) => b.points - a.points);
