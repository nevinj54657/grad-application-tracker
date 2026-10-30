function FormField({ label, name, error, type = 'text', textarea = false, options, className = '', ...rest }) {
  const inputClasses = `w-full rounded-md border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-red-400' : 'border-slate-300'
  }`;

  let field;
  if (options) {
    field = (
      <select id={name} name={name} className={inputClasses} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (textarea) {
    field = <textarea id={name} name={name} className={inputClasses} rows={3} {...rest} />;
  } else {
    field = <input id={name} name={name} type={type} className={inputClasses} {...rest} />;
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {field}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default FormField;
