'use client';

import { FaIdCard, FaBuilding, FaRegAddressCard, FaTable } from 'react-icons/fa';
import Link from 'next/link';

/**
 * MemberDetailView component displays detailed information about a member
 * @param {Object} props Component properties
 * @param {Object} props.memberData Member data object to display
 * @param {Function} props.onToggleView Callback to toggle between table/detail view
 * @returns {JSX.Element} The member detail view UI
 */
const MemberDetailView = ({ memberData, onToggleView }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">ข้อมูลสมาชิก</h2>
      <div className="flex items-center">
        <button
          onClick={onToggleView}
          className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          <FaTable className="mr-1" size={14} />
          <span>ดูแบบตาราง</span>
        </button>
      </div>
    </div>
    
    {/* Member Code and Status */}
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        {memberData.MEMBER_CODE && (
          <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
            <FaIdCard className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-xs text-blue-700">หมายเลขสมาชิก</p>
              <Link 
                href={`/MemberDetail?memberCode=${memberData.MEMBER_CODE}`}
                className="text-blue-600 hover:underline cursor-pointer text-sm font-medium"
              >
                {memberData.MEMBER_CODE}
              </Link>
            </div>
          </div>
        )}
      </div>
      <div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          อนุมัติ
        </span>
      </div>
    </div>
    
    {/* Company Information */}
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">ข้อมูลบริษัท</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FaBuilding className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">ชื่อบริษัท</p>
            <p className="text-sm text-gray-900">{memberData.company_name || '-'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FaBuilding className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">ประเภทบริษัท</p>
            <p className="text-sm text-gray-900">{memberData.company_type || '-'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FaRegAddressCard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</p>
            <p className="text-sm text-gray-900">{memberData.tax_id || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MemberDetailView;