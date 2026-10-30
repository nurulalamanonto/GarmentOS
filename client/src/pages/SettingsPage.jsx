import PageHeader from '../components/ui/PageHeader.jsx';
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchHealth } from '../api/healthApi.js';
import { API_BASE_URL } from '../api/client.js';

export default function SettingsPage() {
  const { data, isLoading, error, refetch } = useFetch(fetchHealth);

  return (
    <>
      <PageHeader title="Settings" description="Connection details for the GarmentOS backend." />

      <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">API connection</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">API base URL</dt>
            <dd className="break-all font-mono text-slate-800">{API_BASE_URL}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Status</dt>
            <dd>
              {isLoading && 'Checking...'}
              {error && <StatusBadge status="Unreachable" tone="danger" />}
              {data && <StatusBadge status="Connected" tone="success" />}
            </dd>
          </div>
          {data && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Storage</dt>
              <dd className="text-slate-800">{data.storage}</dd>
            </div>
          )}
        </dl>
        {isLoading && <LoadingIndicator />}
        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        )}
        <div className="mt-4">
          <Button variant="secondary" onClick={refetch}>
            Check again
          </Button>
        </div>
      </section>
    </>
  );
}
