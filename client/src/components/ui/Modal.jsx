import { useEffect } from 'react';
import { X } from 'lucide-react';

// Dialog box. Shown only while `isOpen` is true; Esc and the backdrop close it.
export default function Modal({ isOpen, title, onClose, children, footer }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</footer>}
      </section>
    </div>
  );
}
