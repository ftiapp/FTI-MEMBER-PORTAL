'use client';

import { motion } from 'framer-motion';
import { FaHome, FaRoad, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Address details grid component
 * @param {Object} address - Address data object
 */
/**
 * Address details grid component
 * @param {Object} address - Address data object
 */
export default function AddressDetailsGrid({ address }) {
  // If no address data, show a message
  if (!address) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600">
        ไม่พบข้อมูลที่อยู่
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* House Number */}
      {address.ADDR_NO && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaHome className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">ที่อยู่</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{address.ADDR_NO}</p>
        </div>
      )}
      
      {/* Road */}
      {address.ADDR_ROAD && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaRoad className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">ถนน</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{address.ADDR_ROAD}</p>
        </div>
      )}
      
      {/* Sub District */}
      {address.ADDR_SUB_DISTRICT && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">ตำบล/แขวง</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{address.ADDR_SUB_DISTRICT}</p>
        </div>
      )}
      
      {/* District */}
      {address.ADDR_DISTRICT && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">อำเภอ/เขต</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{address.ADDR_DISTRICT}</p>
        </div>
      )}
      
      {/* Province */}
      {address.ADDR_PROVINCE_NAME && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">จังหวัด</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{address.ADDR_PROVINCE_NAME}</p>
        </div>
      )}
      
      {/* Postal Code */}
      {address.ADDR_POSTCODE && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">รหัสไปรษณีย์</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{address.ADDR_POSTCODE}</p>
        </div>
      )}
    </div>
  );
}