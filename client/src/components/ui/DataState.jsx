import LoadingIndicator from './LoadingIndicator.jsx';
import ErrorMessage from './ErrorMessage.jsx';

// Shows the loading indicator or the error box instead of the page content.
export default function DataState({ isLoading, error, onRetry, children }) {
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  return children;
}
