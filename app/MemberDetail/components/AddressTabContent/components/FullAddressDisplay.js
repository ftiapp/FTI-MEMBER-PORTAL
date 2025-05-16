'use client';

import { motion } from 'framer-motion';
import { FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Full address display component
 * @param {Object} address - Address data object
 */
export default function FullAddressDisplay({ address }) {
  // Always render the component container
  return (
    <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100 shadow-md">
      <div className="flex items-start">
        <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0 text-xl" />
        <div className="flex-1">
          <p className="font-semibold text-blue-800 text-lg mb-2">ที่อยู่เต็ม</p>
          
          {!address ? (
            <p className="text-gray-500 italic">ไม่พบข้อมูลที่อยู่</p>
          ) : (
            <p className="text-gray-800 break-words text-lg">
              {address.ADDR_NO || 'ไม่ระบุ'}
              {address.ADDR_ROAD && `, ${address.ADDR_ROAD}`}
              {address.ADDR_SUB_DISTRICT && `, ${address.ADDR_SUB_DISTRICT}`}
              {address.ADDR_DISTRICT && `, ${address.ADDR_DISTRICT}`}
              {address.ADDR_PROVINCE_NAME && `, ${address.ADDR_PROVINCE_NAME}`}
              {address.ADDR_POSTCODE && `, ${address.ADDR_POSTCODE}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}