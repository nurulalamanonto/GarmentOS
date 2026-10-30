import { STATUS_TONES } from '../../constants/statuses.js';

const TONE_CLASSES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

// Coloured pill for any status. The colour comes from STATUS_TONES,
// so "Delivered" is always green and "Cancelled" always red.
export default function StatusBadge({ status, tone }) {
  const resolvedTone = tone ?? STATUS_TONES[status] ?? 'neutral';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[resolvedTone]}`}
    >
      {status}
    </span>
  );
}
