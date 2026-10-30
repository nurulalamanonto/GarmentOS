import { Search } from 'lucide-react';

// Controlled search box: the parent owns the text (useState) and filters its list.
export default function SearchBar({ value, onChange, placeholder = 'Search...', id = 'search' }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-600"
      />
    </div>
  );
}
