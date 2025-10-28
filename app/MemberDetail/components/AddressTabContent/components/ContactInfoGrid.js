"use client";

import { motion } from "framer-motion";
import { FaPhone, FaFax, FaEnvelope, FaGlobe } from "react-icons/fa";

/**
 * Contact information grid component
 * @param {Object} address - Address data object containing contact info
 * @param {string} language - Selected language ('th' or 'en')
 */
export default function ContactInfoGrid({ address, language = "th" }) {
  // ตรวจสอบว่าเป็นภาษาไทยหรือไม่
  const isThai = language === "th";
  // If no address data, don't render anything
  if (!address) return null;

  // Check if there's any contact info to display
  const hasContactInfo =
    address.ADDR_TELEPHONE ||
    address.ADDR_FAX ||
    address.ADDR_EMAIL ||
    address.ADDR_WEBSITE ||
    address.ADDR_WEBSITE_EN;

  // If no contact info, don't render the section
  if (!hasContactInfo) return null;

  return (
    <div className="border-t pt-6 mt-6">
      <h4 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
        {isThai ? "รายละเอียดการติดต่อ" : "Contact Information"}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone */}
        {address.ADDR_TELEPHONE && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center mb-2">
              <FaPhone className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-700 mb-2">
                  {isThai ? "โทรศัพท์:" : "Telephone:"}
                </p>
                <p className="text-gray-800 text-lg">{address.ADDR_TELEPHONE}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fax */}
        {address.ADDR_FAX && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center mb-2">
              <FaFax className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-700 mb-2">{isThai ? "โทรสาร:" : "Fax:"}</p>
                <p className="text-gray-800 text-lg">{address.ADDR_FAX}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email with hyperlink */}
        {address.ADDR_EMAIL && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <FaEnvelope className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-semibold text-blue-700 mb-2">{isThai ? "อีเมล:" : "Email:"}</p>
              <a
                href={`mailto:${address.ADDR_EMAIL}`}
                className="text-blue-600 hover:underline break-words block text-ellipsis overflow-hidden text-lg"
              >
                {address.ADDR_EMAIL}
              </a>
            </div>
          </div>
        )}

        {/* Website with hyperlink */}
        {(isThai ? address.ADDR_WEBSITE : address.ADDR_WEBSITE_EN || address.ADDR_WEBSITE) && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <FaGlobe className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-semibold text-blue-700 mb-2">{isThai ? "เว็บไซต์:" : "Website:"}</p>
              {/* แสดงเว็บไซต์ตามภาษาที่เลือก */}
              <a
                href={(() => {
                  // ตรวจสอบว่ามี http:// หรือ https:// นำหน้าหรือไม่
                  const website = isThai
                    ? address.ADDR_WEBSITE
                    : address.ADDR_WEBSITE_EN || address.ADDR_WEBSITE;
                  return website
                    ? website.startsWith("http")
                      ? website
                      : `http://${website}`
                    : "#";
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-words block text-ellipsis overflow-hidden text-lg"
              >
                {isThai ? address.ADDR_WEBSITE : address.ADDR_WEBSITE_EN || address.ADDR_WEBSITE}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
