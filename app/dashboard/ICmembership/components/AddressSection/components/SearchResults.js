export default function SearchResults({ 
    results, 
    onSelect, 
    type = 'subdistrict', 
    visible = false 
  }) {
    if (!visible || !results || results.length === 0) return null;
  
    return (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
        <div className="py-1 px-3 bg-gray-50 border-b text-xs text-gray-600">
          พบ {results.length} รายการ - คลิกเพื่อเลือก
        </div>
        <ul className="py-1">
          {results.map((result, index) => (
            <li 
              key={type === 'postal' 
                ? `postal-${result.postalCode}-${result.subdistrict}-${index}`
                : `${result.subdistrict}-${result.district}-${result.province}-${index}`
              }
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              onClick={() => onSelect(result)}
            >
              <div className="font-medium text-gray-900">
                {type === 'postal' ? result.postalCode : result.subdistrict}
              </div>
              <div className="text-gray-600 text-xs">
                {type === 'postal' 
                  ? `${result.subdistrict}, ${result.district}, ${result.province}`
                  : `${result.district}, ${result.province} ${result.postalCode}`
                }
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }