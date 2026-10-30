import { Info } from 'lucide-react';

// Small note under a page title: this page shows fictional sample records.
export default function DemoNotice() {
  return (
    <p className="mb-4 flex items-center gap-2 text-xs text-slate-500">
      <Info size={14} aria-hidden="true" />
      Demo data: fictional records stored in the app (not a database). They reset when the page reloads.
    </p>
  );
}
