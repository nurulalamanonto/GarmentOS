// Thin bar showing 0-100%. `tone` colours it (teal normally, amber/red for trouble).
const TONES = { primary: 'bg-teal-600', warning: 'bg-amber-500', danger: 'bg-red-500' };

export default function ProgressBar({ value, tone = 'primary' }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-24 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full ${TONES[tone]}`} style={{ width: `${width}%` }} />
      </div>
      <span className="w-10 text-xs tabular-nums text-slate-600">{width}%</span>
    </div>
  );
}
