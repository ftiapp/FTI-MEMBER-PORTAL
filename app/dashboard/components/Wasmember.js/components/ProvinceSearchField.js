import { useRef, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { FaSearch, FaSpinner } from 'react-icons/fa';

export default function ProvinceSearchField({ 
  value,
  onChange,
  hasError
}) {
  const [provinceResults, setProvinceResults] = useState([]);
  const [isSearchingProvince, setIsSearchingProvince] = useState(false);
  const provinceDropdownRef = useRef(null);

  // Handle outside click to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target)) {
        setProvinceResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search using real API
  const debouncedProvinceSearch = useRef(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 1) {
        setProvinceResults([]);
        return;
      }

      try {
        setIsSearchingProvince(true);
        const response = await fetch(`/api/provinces/search?term=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('Province search results from API:', data.data);
          setProvinceResults(data.data);
        } else {
          console.log('No province results found or invalid response format');
          setProvinceResults([]);
        }
      } catch (error) {
        console.error('Error searching provinces:', error);
        setProvinceResults([]);
      } finally {
        setIsSearchingProvince(false);
      }
    }, 300)
  ).current;

  const handleChange = (e) => {
    const { value } = e.target;
    onChange('province', value);
    if (value.length >= 1) {
      debouncedProvinceSearch(value);
    } else {
      setProvinceResults([]);
    }
  };

  const handleSelectProvince = (province) => {
    onChange('province', province.name_th);
    setProvinceResults([]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        จังหวัด
      </label>
      <div className="relative" ref={provinceDropdownRef}>
        <input
          type="text"
          name="province"
          value={value}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasError ? 'border-red-500' : ''} text-gray-900`}
          placeholder="จังหวัด"
          autoComplete="off"
        />
        {isSearchingProvince && (
          <div className="absolute right-3 top-3">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {provinceResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
            {provinceResults.map((province) => (
              <div
                key={province.id}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleSelectProvince(province)}
              >
                <div className="font-medium text-gray-900">{province.name_th}</div>
                <div className="text-xs text-gray-500">{province.name_en}</div>
              </div>
            ))}
          </div>
        )}
        {hasError && (
          <p className="text-red-500 text-xs mt-1">กรุณาระบุจังหวัด</p>
        )}
      </div>
    </div>
  );
}