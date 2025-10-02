import { forwardRef } from "react";

const FormInput = forwardRef(function FormInput(
  {
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    inputMode,
    pattern,
    required = false,
    note,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {note && <span className="text-xs text-red-500 ml-1">{note}</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        pattern={pattern}
        {...props}
      />
    </div>
  );
});

export default FormInput;
