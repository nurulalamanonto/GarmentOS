import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <Inbox size={32} className="text-slate-400" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold text-slate-800">{title}</h2>
      {message && <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
