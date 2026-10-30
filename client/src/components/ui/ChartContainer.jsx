// Card that frames a Recharts chart with a title. Charts need a fixed-height parent.
export default function ChartContainer({ title, description, height = 280, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <div className="mt-4" style={{ height }}>
        {children}
      </div>
    </section>
  );
}
