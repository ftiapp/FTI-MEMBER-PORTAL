import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function SearchBar({
  value,
  onChange,
  onDateChange,
  dateRange,
  placeholder,
  onSubmit,
}) {
  const [input, setInput] = useState(value || "");

  useEffect(() => {
    setInput(value || "");
  }, [value]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    onChange && onChange(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
      <div className="relative flex-1">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 text-sm"
          placeholder={placeholder || "ค้นหาด้วยชื่อบริษัทหรือรหัสสมาชิก"}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit && onSubmit(input);
            }
          }}
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <button
        type="button"
        onClick={() => onSubmit && onSubmit(input)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
      >
        ค้นหา
      </button>
      <div>
        <input
          type="date"
          className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 text-sm mr-2"
          value={dateRange?.from || ""}
          onChange={(e) => onDateChange && onDateChange({ ...dateRange, from: e.target.value })}
        />
        <span className="mx-1 text-gray-500">-</span>
        <input
          type="date"
          className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 text-sm"
          value={dateRange?.to || ""}
          onChange={(e) => onDateChange && onDateChange({ ...dateRange, to: e.target.value })}
        />
      </div>
    </div>
  );
}
