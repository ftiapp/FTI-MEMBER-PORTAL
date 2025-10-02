"use client";

import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";

/**
 * Full address display component
 * @param {Object} address - Address data object
 * @param {string} language - Selected language ('th' or 'en')
 */
export default function FullAddressDisplay({ address, language = "th" }) {
  // ตรวจสอบว่าเป็นภาษาไทยหรือไม่
  const isThai = language === "th";
  // Always render the component container
  return (
    <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100 shadow-md">
      <div className="flex items-start">
        <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0 text-xl" />
        <div className="flex-1">
          <p className="font-semibold text-blue-800 text-lg mb-2">
            {isThai ? "ที่อยู่เต็ม" : "Full Address"}
          </p>

          {!address ? (
            <p className="text-gray-500 italic">
              {isThai ? "ไม่พบข้อมูลที่อยู่" : "No address information found"}
            </p>
          ) : (
            <p className="text-gray-800 break-words text-lg">
              {isThai ? (
                // แสดงที่อยู่ภาษาไทย
                <>
                  {address.ADDR_NO || "ไม่ระบุ"}
                  {address.ADDR_ROAD && `, ${address.ADDR_ROAD}`}
                  {address.ADDR_SUB_DISTRICT && `, ${address.ADDR_SUB_DISTRICT}`}
                  {address.ADDR_DISTRICT && `, ${address.ADDR_DISTRICT}`}
                  {address.ADDR_PROVINCE_NAME && `, ${address.ADDR_PROVINCE_NAME}`}
                  {address.ADDR_POSTCODE && `, ${address.ADDR_POSTCODE}`}
                </>
              ) : (
                // แสดงที่อยู่ภาษาอังกฤษ (ถ้าไม่มีข้อมูลภาษาอังกฤษให้ใช้ข้อมูลภาษาไทยแทน)
                <>
                  {address.ADDR_NO_EN || address.ADDR_NO || "Not specified"}
                  {(address.ADDR_ROAD_EN || address.ADDR_ROAD) &&
                    `, ${address.ADDR_ROAD_EN || address.ADDR_ROAD}`}
                  {(address.ADDR_SUB_DISTRICT_EN || address.ADDR_SUB_DISTRICT) &&
                    `, ${address.ADDR_SUB_DISTRICT_EN || address.ADDR_SUB_DISTRICT}`}
                  {(address.ADDR_DISTRICT_EN || address.ADDR_DISTRICT) &&
                    `, ${address.ADDR_DISTRICT_EN || address.ADDR_DISTRICT}`}
                  {(address.ADDR_PROVINCE_NAME_EN || address.ADDR_PROVINCE_NAME) &&
                    `, ${address.ADDR_PROVINCE_NAME_EN || address.ADDR_PROVINCE_NAME}`}
                  {(address.ADDR_POSTCODE_EN || address.ADDR_POSTCODE) &&
                    `, ${address.ADDR_POSTCODE_EN || address.ADDR_POSTCODE}`}
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
