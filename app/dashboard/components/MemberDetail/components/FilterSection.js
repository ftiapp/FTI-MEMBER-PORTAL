'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaCalendarAlt } from 'react-icons/fa';

/**
 * FilterSection component for filtering companies by date range
 * @param {Object} props Component properties
 * @param {boolean} props.showFilters Whether to show the filter section
 * @param {Function} props.toggleFilters Callback to toggle filter visibility
 * @param {string} props.startDate Start date filter value
 * @param {Function} props.onStartDateChange Callback for start date changes
 * @param {string} props.endDate End date filter value
 * @param {Function} props.onEndDateChange Callback for end date changes
 * @param {Function} props.resetFilters Callback to reset all filters
 * @returns {JSX.Element} The filter section UI
 */
const FilterSection = ({ 
  showFilters, 
  toggleFilters, 
  startDate, 
  onStartDateChange, 
  endDate, 
  onEndDateChange, 
  resetFilters 
}) => (
  <motion.div 
    className="mb-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-between items-center mb-4">
      <div>
        <motion.h2 
          className="text-xl font-semibold text-blue-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          รายการบริษัทที่ได้รับการอนุมัติ
        </motion.h2>
        <motion.p
          className="text-xs text-gray-600 mt-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          แสดงรายการบริษัทที่ได้รับการอนุมัติจากสภาอุตสาหกรรมแห่งประเทศไทย คุณสามารถค้นหาและกรองข้อมูลได้ตามต้องการ
        </motion.p>
      </div>
      <motion.button
        onClick={toggleFilters}
        className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        whileHover={{ scale: 1.05, backgroundColor: "#dbeafe" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaFilter className="mr-1" size={14} />
        <span>{showFilters ? 'ซ่อนตัวกรอง' : 'ตัวกรอง'}</span>
      </motion.button>
    </div>

    <AnimatePresence>
      {showFilters && (
        <motion.div 
          className="mb-4 p-4 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, height: 0, overflow: "hidden" }}
          animate={{ opacity: 1, height: "auto", overflow: "visible" }}
          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Start Date Filter */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                วันที่อนุมัติ (จาก)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  type="date"
                  id="startDate"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                />
              </div>
            </motion.div>
            
            {/* End Date Filter */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                วันที่อนุมัติ (ถึง)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  type="date"
                  id="endDate"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                />
              </div>
            </motion.div>
          </motion.div>
          
          {/* Reset Filters Button */}
          <motion.div 
            className="mt-4 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
            >
              รีเซ็ตตัวกรอง
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default FilterSection;