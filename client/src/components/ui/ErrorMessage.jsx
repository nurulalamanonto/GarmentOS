import { AlertCircle } from 'lucide-react';

// Shown when a Fetch call fails. `onRetry` re-runs the request.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rounded-lg bg-white px-3 py-1.5 font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100">
          Try again
        </button>
      )}
    </div>
  );
}
