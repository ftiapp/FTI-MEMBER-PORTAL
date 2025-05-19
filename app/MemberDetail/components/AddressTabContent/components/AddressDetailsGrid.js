'use client';

import { motion } from 'framer-motion';
import { FaHome, FaRoad, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Address details grid component
 * @param {Object} address - Address data object
 * @param {string} language - Selected language ('th' or 'en')
 */
export default function AddressDetailsGrid({ address, language = 'th' }) {
  // ตรวจสอบว่าเป็นภาษาไทยหรือไม่
  const isThai = language === 'th';
  // If no address data, show a message
  if (!address) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-gray-600">
        {isThai ? 'ไม่พบข้อมูลที่อยู่' : 'No address information found'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* House Number */}
      {(isThai ? address.ADDR_NO : (address.ADDR_NO_EN || address.ADDR_NO)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaHome className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">{isThai ? 'ที่อยู่' : 'Address'}</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{isThai ? address.ADDR_NO : (address.ADDR_NO_EN || address.ADDR_NO)}</p>
        </div>
      )}
      
      {/* Road */}
      {(isThai ? address.ADDR_ROAD : (address.ADDR_ROAD_EN || address.ADDR_ROAD)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaRoad className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">{isThai ? 'ถนน' : 'Road'}</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{isThai ? address.ADDR_ROAD : (address.ADDR_ROAD_EN || address.ADDR_ROAD)}</p>
        </div>
      )}
      
      {/* Sub District */}
      {(isThai ? address.ADDR_SUB_DISTRICT : (address.ADDR_SUB_DISTRICT_EN || address.ADDR_SUB_DISTRICT)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">{isThai ? 'ตำบล/แขวง' : 'Sub-district'}</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{isThai ? address.ADDR_SUB_DISTRICT : (address.ADDR_SUB_DISTRICT_EN || address.ADDR_SUB_DISTRICT)}</p>
        </div>
      )}
      
      {/* District */}
      {(isThai ? address.ADDR_DISTRICT : (address.ADDR_DISTRICT_EN || address.ADDR_DISTRICT)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">{isThai ? 'อำเภอ/เขต' : 'District'}</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{isThai ? address.ADDR_DISTRICT : (address.ADDR_DISTRICT_EN || address.ADDR_DISTRICT)}</p>
        </div>
      )}
      
      {/* Province */}
      {(isThai ? address.ADDR_PROVINCE_NAME : (address.ADDR_PROVINCE_NAME_EN || address.ADDR_PROVINCE_NAME)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">{isThai ? 'จังหวัด' : 'Province'}</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{isThai ? address.ADDR_PROVINCE_NAME : (address.ADDR_PROVINCE_NAME_EN || address.ADDR_PROVINCE_NAME)}</p>
        </div>
      )}
      
      {/* Postal Code */}
      {(isThai ? address.ADDR_POSTCODE : (address.ADDR_POSTCODE_EN || address.ADDR_POSTCODE)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
            <p className="font-semibold text-blue-700 text-base">{isThai ? 'รหัสไปรษณีย์' : 'Postal Code'}</p>
          </div>
          <p className="text-gray-800 text-lg pl-7">{isThai ? address.ADDR_POSTCODE : (address.ADDR_POSTCODE_EN || address.ADDR_POSTCODE)}</p>
        </div>
      )}
    </div>
  );
}