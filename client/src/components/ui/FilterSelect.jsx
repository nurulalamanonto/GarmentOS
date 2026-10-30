// Dropdown filter. `options` is a list of strings; the first option "All" clears the filter.
export default function FilterSelect({ id, label, value, onChange, options, allLabel = 'All' }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-slate-500">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
