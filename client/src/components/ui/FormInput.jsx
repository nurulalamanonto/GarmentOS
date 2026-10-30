// Label + input (or select) + error message, wired together for accessibility.
//   <FormInput id="qty" label="Quantity" type="number" value={qty} onChange={setQty} error={errors.qty} />
// Pass `options` (array of strings) to render a <select> instead of an <input>.
export default function FormInput({ id, label, value, onChange, error, type = 'text', options, required, ...rest }) {
  const fieldClasses = `w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-teal-600 ${
    error ? 'border-red-500' : 'border-slate-300'
  }`;
  const commonProps = {
    id,
    value,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    onChange: (event) => onChange(event.target.value),
    className: fieldClasses,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {options ? (
        <select {...commonProps} {...rest}>
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} {...commonProps} {...rest} />
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
