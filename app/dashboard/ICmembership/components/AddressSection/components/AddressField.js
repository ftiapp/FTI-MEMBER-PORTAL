import ErrorTooltip from './ErrorTooltip';
import SearchResults from './SearchResults';
import SearchStatus from './SearchStatus';
import { handleAddressFieldChange, handlePostalCodeFieldChange } from '../utils/addressUtils';

export default function AddressField({
  id,
  name,
  label,
  value,
  onChange,
  onSearch,
  onClickOutside,
  error,
  placeholder,
  required = false,
  readOnly = false,
  type = 'text', // 'text', 'postal'
  maxLength,
  // Search related props
  isSearching = false,
  searchResults = [],
  showResults = false,
  onSelectResult,
  apiReady = false,
  isComplete = false,
  hasPartialData = false,
  showNoResults = false,
  minSearchLength = 2,
  // Additional info
  helperText,
  apiStatus
}) {
  const handleChange = (e) => {
    if (type === 'postal') {
      handlePostalCodeFieldChange(e, onChange, onSearch);
    } else {
      handleAddressFieldChange(e, onChange, onSearch);
    }
  };

  const getPlaceholder = () => {
    if (readOnly) {
      return value ? placeholder : `จะถูกเติมอัตโนมัติเมื่อเลือกตำบล`;
    }
    if (!apiReady && (type === 'subdistrict' || type === 'postal')) {
      return "รอสักครู่... กำลังเตรียมข้อมูล";
    }
    return placeholder;
  };

  const getHelperText = () => {
    if (type === 'subdistrict') {
      return apiReady ? "พิมพ์เพื่อค้นหาอัตโนมัติ" : "กำลังเตรียมข้อมูล...";
    }
    if (type === 'postal') {
      return apiReady ? "หรือพิมพ์เพื่อค้นหา" : "รอสักครู่...";
    }
    return helperText;
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {getHelperText() && (
          <span className="ml-1 text-xs text-blue-600">
            {getHelperText()}
          </span>
        )}
        {apiReady && (type === 'subdistrict' || type === 'postal') && (
          <span className="ml-1 text-xs text-green-600">✓ พร้อมใช้งาน</span>
        )}
      </label>
      <input
        type={type === 'postal' ? 'text' : 'text'}
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onClickOutside}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          readOnly ? 'bg-gray-50' : ''
        } ${
          readOnly ? (value ? 'text-gray-900' : 'text-gray-400') : ''
        }`}
        placeholder={getPlaceholder()}
        readOnly={readOnly}
        autoComplete="off"
        maxLength={maxLength}
      />
      
      <ErrorTooltip error={error} />
      
      <SearchStatus
        isSearching={isSearching}
        fieldValue={value}
        fieldType={type}
        minLength={minSearchLength}
        apiReady={apiReady}
        isComplete={isComplete}
        hasPartialData={hasPartialData}
        showNoResults={showNoResults}
      />
      
      <SearchResults
        results={searchResults}
        onSelect={onSelectResult}
        type={type === 'postal' ? 'postal' : 'subdistrict'}
        visible={showResults}
      />
    </div>
  );
}