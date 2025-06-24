import ErrorTooltip from './ErrorTooltip';

export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = 'text',
  maxLength,
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      
      <ErrorTooltip error={error} />
    </div>
  );
}