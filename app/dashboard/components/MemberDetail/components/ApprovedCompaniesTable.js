'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaBuilding, 
  FaFileAlt, 
  FaCheckCircle, 
  FaSearch,
  FaPencilAlt,
  FaEdit
} from 'react-icons/fa';

import InfoBox from './InfoBox';

/**
 * ApprovedCompaniesTable component displays a table of approved companies
 * @param {Object} props Component properties
 * @param {Array} props.companies List of company objects to display
 * @param {Function} props.formatDate Function to format date strings
 * @returns {JSX.Element} The companies table UI
 */
const ApprovedCompaniesTable = ({ companies, formatDate }) => (
  <motion.div 
    className="overflow-x-auto rounded-lg shadow-lg border border-gray-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <InfoBox />
    
    <motion.div 
      className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex items-center">
        <motion.div 
          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
        >
          <FaBuilding className="text-blue-600" size={16} />
        </motion.div>
        <div>
          <motion.p 
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            พบ {companies.length} รายการบริษัทที่ได้รับการอุมัติ
          </motion.p>
        </div>
      </div>
    </motion.div>
    <table className="min-w-full divide-y divide-gray-200 border-collapse">
      <motion.thead 
        className="bg-blue-600"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            หมายเลขสมาชิก
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            ชื่อบริษัท
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            วันที่อนุมัติ
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            สถานะ
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            สถานะสมาชิก
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            เอกสารยืนยัน
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            แก้ไขข้อมูล
          </th>
        </tr>
      </motion.thead>
      <motion.tbody 
        className="bg-white divide-y divide-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {companies.length > 0 ? (
          companies.map((company, index) => (
            <motion.tr 
              key={company.id} 
              className={index % 2 === 0 ? 'bg-white hover:bg-blue-50 cursor-pointer' : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ backgroundColor: "#eff6ff", scale: 1.01 }}
              onClick={(e) => {
                // Only navigate if not clicking on a link or button
                if (!e.target.closest('a') && !e.target.closest('button') && company.MEMBER_CODE) {
                  // Set access token in session storage to authorize access to member details
                  // This token will be checked by the MemberDetail page to verify authorized access
                  sessionStorage.setItem('memberDetailAccess', `${company.MEMBER_CODE}_${Date.now()}`);
                  
                  // Navigate to member detail page with the member code
                  window.location.href = `/MemberDetail?memberCode=${encodeURIComponent(company.MEMBER_CODE)}`;
                }
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                {company.MEMBER_CODE ? (
                  <Link 
                    href={`/MemberDetail?memberCode=${company.MEMBER_CODE}`}
                    className="text-blue-600 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      e.preventDefault(); // Prevent navigation
                    }}
                  >
                    {company.MEMBER_CODE}
                  </Link>
                ) : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">
                {company.company_name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                {formatDate(company.updated_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                <motion.span 
                  className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "#dcfce7" }}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FaCheckCircle className="mr-1 mt-0.5" size={12} />
                  อนุมัติ
                </motion.span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                {company.memberStatus ? (
                  <motion.span 
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${company.memberStatus.active === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {company.memberStatus.statusName || 'ไม่พบข้อมูล'}
                  </motion.span>
                ) : (
                  <span className="text-gray-400 italic">ไม่พบข้อมูล</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.file_path ? (
                  <motion.a 
                    href={company.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                    }}
                  >
                    <FaFileAlt className="mr-1" size={14} />
                    ดูเอกสาร
                  </motion.a>
                ) : (
                  // สำหรับสมาชิกใหม่ที่ไม่มีเอกสารยืนยัน ให้ไปดูใบสมัครแทน
                  company.tax_id ? (
                    <motion.button 
                      className="text-green-600 hover:text-green-800 flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevent row click
                        
                        try {
                          // ค้นหาประเภทสมาชิกและ ID จาก tax_id
                          const response = await fetch(`/api/membership/find-by-tax-id?taxId=${company.tax_id}`);
                          const result = await response.json();
                          
                          if (result.success && result.data) {
                            const { membershipType, id } = result.data;
                            // เปิดไปหน้า summary ที่ถูกต้อง
                            const summaryUrl = `/membership/${membershipType.toLowerCase()}/summary?id=${id}`;
                            window.open(summaryUrl, '_blank');
                          } else {
                            alert('ไม่พบข้อมูลใบสมัคร');
                          }
                        } catch (error) {
                          console.error('Error finding membership:', error);
                          alert('เกิดข้อผิดพลาดในการค้นหาข้อมูล');
                        }
                      }}
                    >
                      <FaFileAlt className="mr-1" size={14} />
                      ดูใบสมัคร
                    </motion.button>
                  ) : (
                    <span className="text-gray-400 italic">ไม่มีเอกสาร</span>
                  )
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <motion.a 
                  href={`/MemberDetail?memberCode=${company.MEMBER_CODE}&memberType=000&member_group_code=000&typeCode=000`}
                  className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    e.preventDefault(); // Prevent default navigation
                    
                    // Set access token in session storage to authorize access to member details
                    // This token will be checked by the MemberDetail page to verify authorized access
                    if (company.MEMBER_CODE) {
                      sessionStorage.setItem('memberDetailAccess', `${company.MEMBER_CODE}_${Date.now()}`);
                      
                      // Navigate to member detail page with the member code and fixed parameters
                      window.location.href = `/MemberDetail?memberCode=${encodeURIComponent(company.MEMBER_CODE)}&memberType=000&member_group_code=000&typeCode=000`;
                    }
                  }}
                >
                  <FaPencilAlt className="mr-1" size={14} />
                  แก้ไข
                </motion.a>
              </td>
            </motion.tr>
          ))
        ) : (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <td colSpan="7" className="px-6 py-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaSearch className="text-gray-300 mb-3" size={24} />
                </motion.div>
                <motion.p 
                  className="text-gray-500 font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                </motion.p>
              </div>
            </td>
          </motion.tr>
        )}
      </motion.tbody>
    </table>
  </motion.div>
);

export default ApprovedCompaniesTable;