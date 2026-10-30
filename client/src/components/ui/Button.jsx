const VARIANTS = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({ variant = 'primary', type = 'button', children, ...rest }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
}
