import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const STYLES = {
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: XCircle, classes: 'border-red-200 bg-red-50 text-red-800' },
  warning: { icon: AlertTriangle, classes: 'border-amber-200 bg-amber-50 text-amber-900' },
  info: { icon: Info, classes: 'border-sky-200 bg-sky-50 text-sky-800' },
};

// Toast messages created with notify('success', 'Order saved') from useApp().
export default function NotificationStack() {
  const { notifications, dismissNotification } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      {notifications.map(({ id, type, message }) => {
        const { icon: Icon, classes } = STYLES[type] ?? STYLES.info;
        return (
          <div key={id} role="status" className={`flex items-start gap-2 rounded-lg border p-3 text-sm shadow-md ${classes}`}>
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p className="flex-1">{message}</p>
            <button type="button" onClick={() => dismissNotification(id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
