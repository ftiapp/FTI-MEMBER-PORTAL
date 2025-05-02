'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaIndustry, FaCity, FaBuilding } from 'react-icons/fa';

/**
 * MemberTypeFilter component for filtering between different groups or provinces
 * 
 * @param {Object} props Component properties
 * @param {string} props.memberType The selected member type (000, 100, 200)
 * @param {Object} props.membershipData Object containing membership data for the selected type
 * @param {Function} props.onSelectFilter Callback function when a filter is selected
 */
export default function MemberTypeFilter({ memberType, membershipData, onSelectFilter }) {
  // Get the initial filter code from URL if available
  const searchParams = new URLSearchParams(window.location.search);
  const typeCodeFromUrl = searchParams.get('typeCode');
  
  const [selectedFilter, setSelectedFilter] = useState(typeCodeFromUrl || null);
  const [initialized, setInitialized] = useState(false);
  
  // Set default filter when data changes - only once on initial load
  useEffect(() => {
    if (!initialized && membershipData && Object.keys(membershipData).length > 0) {
      // If typeCode is in URL and exists in membershipData, use it
      if (typeCodeFromUrl && membershipData[typeCodeFromUrl]) {
        setSelectedFilter(typeCodeFromUrl);
        onSelectFilter(typeCodeFromUrl);
      } else {
        // Otherwise use the first item
        const firstKey = Object.keys(membershipData)[0];
        setSelectedFilter(firstKey);
        onSelectFilter(firstKey);
      }
      setInitialized(true);
    }
  }, [membershipData, onSelectFilter, typeCodeFromUrl, initialized]);

  // Handle filter change
  const handleFilterChange = (filterCode) => {
    setSelectedFilter(filterCode);
    onSelectFilter(filterCode);
  };

  // If no data is available
  if (!membershipData || Object.keys(membershipData).length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
        <p>ไม่พบข้อมูลสำหรับประเภทสมาชิกที่เลือก</p>
      </div>
    );
  }

  // Get the appropriate icon based on member type
  const getIcon = () => {
    switch (memberType) {
      case '000':
        return <FaBuilding className="mr-2" />;
      case '100':
        return <FaIndustry className="mr-2" />;
      case '200':
        return <FaCity className="mr-2" />;
      default:
        return <FaFilter className="mr-2" />;
    }
  };

  // Get the appropriate title based on member type
  const getTitle = () => {
    switch (memberType) {
      case '000':
        return 'สภาอุตสาหกรรมแห่งประเทศไทย';
      case '100':
        return 'กลุ่มอุตสาหกรรม';
      case '200':
        return 'สภาอุตสาหกรรมจังหวัด';
      default:
        return 'เลือกประเภท';
    }
  };

  // Get the appropriate color based on member type
  const getColor = () => {
    switch (memberType) {
      case '000':
        return 'blue';
      case '100':
        return 'green';
      case '200':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const color = getColor();
  const totalItems = Object.keys(membershipData).length;

  return (
    <motion.div
      className={`mb-6 p-4 ${color === 'blue' ? 'bg-blue-50 border border-blue-200' : color === 'green' ? 'bg-green-50 border border-green-200' : 'bg-purple-50 border border-purple-200'} rounded-lg`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        {getIcon()}
        <h3 className={color === 'blue' ? 'text-blue-700 font-medium' : color === 'green' ? 'text-green-700 font-medium' : 'text-purple-700 font-medium'}>
          {getTitle()} <span className="text-sm text-gray-500">({totalItems} รายการ)</span>
        </h3>
      </div>
      
      {totalItems > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
          {Object.entries(membershipData).map(([code, data]) => (
            <motion.button
              key={code}
              className={`px-3 py-2 text-sm rounded-full transition-all border ${
                selectedFilter === code 
                  ? color === 'blue'
                    ? 'bg-blue-600 text-white font-medium border-blue-800 shadow-md transform scale-105'
                    : color === 'green'
                      ? 'bg-green-600 text-white font-medium border-green-800 shadow-md transform scale-105'
                      : 'bg-purple-600 text-white font-medium border-purple-800 shadow-md transform scale-105'
                  : color === 'blue'
                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    : color === 'green'
                      ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                      : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleFilterChange(code)}
            >
              <span className="truncate">{data.name || `รหัส ${code}`}</span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
