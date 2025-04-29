'use client';

import { FaCheckCircle } from 'react-icons/fa';

/**
 * ApprovedCompaniesTable component for displaying the list of approved companies
 * @param {Object} props Component properties
 * @param {Array} props.companies Array of companies to display
 * @param {Function} props.formatDate Function to format dates
 * @param {number} props.totalItems Total number of items across all pages
 */
export default function ApprovedCompaniesTable({ companies = [], formatDate, totalItems = 0 }) {
  return (
    <div>
      {/* Results count */}
      <div className="mb-2 text-sm text-gray-500">
        พบ {totalItems} รายการ
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto rounded-md shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                รหัสสมาชิก
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                ชื่อบริษัท
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                ประเภทบริษัท
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                เลขประจำตัวผู้เสียภาษี
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                วันที่อนุมัติ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.length > 0 ? (
              companies.map((company, index) => (
                <tr 
                  key={company.id} 
                  className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-blue-100'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.MEMBER_CODE || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {company.company_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.company_type || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.tax_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(company.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      อนุมัติ
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}