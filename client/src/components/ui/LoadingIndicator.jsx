import { Loader2 } from 'lucide-react';

export default function LoadingIndicator({ label = 'Loading...' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}
