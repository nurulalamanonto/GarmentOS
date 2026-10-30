const TONE_ICON = {
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-sky-50 text-sky-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
};

// One headline number with a label. `icon` is a lucide-react component.
export default function KpiCard({ label, value, hint, icon: Icon, tone = 'info' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        </div>
        {Icon && (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${TONE_ICON[tone]}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
        )}
      </div>
      {hint && <p className="mt-3 text-xs text-slate-500">{hint}</p>}
    </article>
  );
}
