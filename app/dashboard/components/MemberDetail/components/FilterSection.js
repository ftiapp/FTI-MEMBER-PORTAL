'use client';

import { FaCalendarAlt, FaFilter } from 'react-icons/fa';

/**
 * FilterSection component for filtering data
 * @param {Object} props Component properties
 * @param {boolean} props.showFilters Whether to show filters
 * @param {Function} props.toggleFilters Function to toggle filters visibility
 * @param {string} props.companyTypeFilter Current company type filter
 * @param {Function} props.onCompanyTypeChange Callback for company type changes
 * @param {Array} props.companyTypes Array of available company types
 * @param {string} props.startDate Current start date
 * @param {Function} props.onStartDateChange Callback for start date changes
 * @param {string} props.endDate Current end date
 * @param {Function} props.onEndDateChange Callback for end date changes
 * @param {Function} props.resetFilters Callback to reset all filters
 */
export default function FilterSection({
  showFilters,
  toggleFilters,
  companyTypeFilter = '',
  onCompanyTypeChange,
  companyTypes = [],
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  resetFilters,
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">รายการบริษัทที่ได้รับการอนุมัติ</h2>
        <div className="flex items-center">
          <button
            onClick={toggleFilters}
            className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors mr-2"
          >
            <FaFilter className="mr-1" size={14} />
            <span>{showFilters ? 'ซ่อนตัวกรอง' : 'ตัวกรอง'}</span>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Company Type Filter */}
            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทบริษัท
              </label>
              <select
                id="companyType"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={companyTypeFilter}
                onChange={(e) => onCompanyTypeChange(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                {companyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Start Date Filter */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                วันที่อนุมัติ (จาก)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                />
              </div>
            </div>
            
            {/* End Date Filter */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                วันที่อนุมัติ (ถึง)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Reset Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
        </div>
      )}
    </>
  );
}