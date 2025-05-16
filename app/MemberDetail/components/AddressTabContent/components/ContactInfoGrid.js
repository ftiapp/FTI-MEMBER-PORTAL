'use client';

import { motion } from 'framer-motion';
import { FaPhone, FaFax, FaEnvelope, FaGlobe } from 'react-icons/fa';

/**
 * Contact information grid component
 * @param {Object} address - Address data object
 */
/**
 * Contact information grid component
 * @param {Object} address - Address data object containing contact info
 */
export default function ContactInfoGrid({ address }) {
  // If no address data, don't render anything
  if (!address) return null;

  // Check if there's any contact info to display
  const hasContactInfo = 
    address.ADDR_TELEPHONE || 
    address.ADDR_FAX || 
    address.ADDR_EMAIL || 
    address.ADDR_WEBSITE;

  // If no contact info, don't render the section
  if (!hasContactInfo) return null;

  return (
    <div className="border-t pt-6 mt-6">
      <h4 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
        รายละเอียดการติดต่อ
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone */}
        {(address.ADDR_TELEPHONE) && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <FaPhone className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 mb-2">โทรศัพท์</p>
              <p className="text-gray-800 text-lg">{address.ADDR_TELEPHONE}</p>
            </div>
          </div>
        )}
        
        {/* Fax */}
        {address.ADDR_FAX && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <FaFax className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 mb-2">โทรสาร</p>
              <p className="text-gray-800 text-lg">{address.ADDR_FAX}</p>
            </div>
          </div>
        )}
        
        {/* Email with hyperlink */}
        {(address.ADDR_EMAIL) && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <FaEnvelope className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-semibold text-blue-700 mb-2">อีเมล</p>
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
        {address.ADDR_WEBSITE && (
          <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
            <FaGlobe className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-semibold text-blue-700 mb-2">เว็บไซต์</p>
              <a 
                href={address.ADDR_WEBSITE.startsWith('http') 
                  ? address.ADDR_WEBSITE 
                  : `http://${address.ADDR_WEBSITE}`
                } 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-words block text-ellipsis overflow-hidden text-lg"
              >
                {address.ADDR_WEBSITE}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}