'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function FilterPanel({
  showFilters,
  filters,
  filterOptions,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters
}) {
  return (
    <>
      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ช่วงเวลา
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => onFilterChange('dateRange', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="today">วันนี้</option>
                    <option value="week">7 วันที่ผ่านมา</option>
                    <option value="month">30 วันที่ผ่านมา</option>
                    <option value="custom">กำหนดเอง</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                {filters.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onFilterChange('startDate', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onFilterChange('endDate', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Action Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทการดำเนินการ
                  </label>
                  <select
                    value={filters.actionType}
                    onChange={(e) => onFilterChange('actionType', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">ทั้งหมด</option>
                    {filterOptions.actionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Admin Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อแอดมิน
                  </label>
                  <select
                    value={filters.adminName}
                    onChange={(e) => onFilterChange('adminName', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">ทั้งหมด</option>
                    {filterOptions.adminNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={onApplyFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  ใช้ตัวกรอง
                </button>
                
                <button
                  onClick={onClearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-blue-800">ตัวกรองที่ใช้:</span>
              
              {filters.dateRange !== 'all' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filters.dateRange === 'today' && 'วันนี้'}
                  {filters.dateRange === 'week' && '7 วันที่ผ่านมา'}
                  {filters.dateRange === 'month' && '30 วันที่ผ่านมา'}
                  {filters.dateRange === 'custom' && `${filters.startDate} ถึง ${filters.endDate}`}
                </span>
              )}
              
              {filters.actionType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filters.actionType}
                </span>
              )}
              
              {filters.adminName && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filters.adminName}
                </span>
              )}
            </div>
            
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ล้างทั้งหมด
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}