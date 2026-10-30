import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

// Temporary page for modules that are built in a later stage.
// It is honest about it: no fake data, no buttons that do nothing.
export default function ModulePlaceholderPage({ title, stage }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        title="This module is not built yet"
        message={stage ? `Planned for ${stage} of the implementation plan.` : 'The page you asked for does not exist.'}
      />
    </>
  );
}
