'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { motion } from 'framer-motion';

export default function UpdateMembers() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberData, setMemberData] = useState({
    MEMBER_CODE: '',
    company_name: '',
    company_type: '',
    registration_number: '',
    tax_id: '',
    address: '',
    province: '',
    postal_code: '',
    phone: '',
    website: '',
    admin_comment: ''
  });

  // Reference to previous search term for animation control
  const prevSearchRef = useRef(searchTerm);
  
  // Fetch members when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        searchMembers();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setMembers([]);
      setIsLoading(false);
    }
  }, [searchTerm]);

  /**
   * Searches for members based on search term
   */
  const searchMembers = async () => {
    if (searchTerm.length < 2) return;
    
    // Store previous search term for animation purposes
    prevSearchRef.current = searchTerm;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/search-members?term=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMembers(result.data || []);
      } else {
        toast.error(result.message || 'ไม่สามารถค้นหาข้อมูลได้');
      }
    } catch (error) {
      console.error('Error searching members:', error);
      toast.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles selecting a member for editing
   */
  const handleSelectMember = async (member) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/member-details?id=${member.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch member details');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSelectedMember(result.data);
        setMemberData({
          MEMBER_CODE: result.data.MEMBER_CODE || '',
          company_name: result.data.company_name || '',
          company_type: result.data.company_type || '',
          registration_number: result.data.registration_number || '',
          tax_id: result.data.tax_id || '',
          address: result.data.address || '',
          province: result.data.province || '',
          postal_code: result.data.postal_code || '',
          phone: result.data.phone || '',
          website: result.data.website || '',
          admin_comment: result.data.admin_comment || ''
        });
      } else {
        toast.error(result.message || 'ไม่สามารถดึงข้อมูลสมาชิกได้');
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes for the member form
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission to update member
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/update-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedMember.id,
          ...memberData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('อัพเดตข้อมูลสมาชิกเรียบร้อยแล้ว');
        setSelectedMember(null);
        setMembers(members.map(m => 
          m.id === selectedMember.id 
            ? { ...m, company_name: memberData.company_name, MEMBER_CODE: memberData.MEMBER_CODE } 
            : m
        ));
      } else {
        toast.error(result.message || 'ไม่สามารถอัพเดตข้อมูลสมาชิกได้');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดตข้อมูลสมาชิก');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants for page transitions - Simplified for smoother experience
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Transition settings - Reduced for more responsiveness
  const pageTransition = {
    type: "tween", 
    ease: "easeOut",
    duration: 0.2
  };

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="flex justify-between items-center py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            อัพเดตข้อมูลสมาชิก
          </h1>
        </div>
        
        {/* Search Section - Improved clarity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5">
            <div className="space-y-2">
              <label htmlFor="search" className="block text-base font-medium text-gray-900">
                ค้นหาสมาชิก
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 block w-full rounded-l-md border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 text-base placeholder:text-gray-400"
                  placeholder="ชื่อบริษัท, รหัสสมาชิก, หรืออีเมล"
                />
                <button
                  type="button"
                  onClick={searchMembers}
                  disabled={searchTerm.length < 2 || isLoading}
                  className="inline-flex items-center px-5 py-3 border border-l-0 border-transparent text-base font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา 
                {searchTerm.length >= 2 && !isLoading && members.length > 0 && 
                  <span className="font-medium text-blue-600 ml-1">(พบ {members.length} รายการ)</span>
                }
              </p>
            </div>
          </div>
        </div>

        {/* Loading State - Simplified and clearer */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}

        {/* Results Container */}
        {!isLoading && (
          <>
            {/* Members List - Improved clarity with better spacing and hover states */}
            {members.length > 0 && !selectedMember && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-5">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 text-lg">รายการสมาชิก</h2>
                  <span className="text-sm text-gray-500">คลิกที่รายการเพื่อแก้ไข</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          รหัสสมาชิก
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          บริษัท
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          อีเมล
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {members.map((member) => (
                        <tr 
                          key={member.id} 
                          className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => handleSelectMember(member)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.MEMBER_CODE || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{member.company_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{member.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${member.Admin_Submit === 0 ? 'bg-yellow-100 text-yellow-800' : 
                              member.Admin_Submit === 1 ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'}`}>
                              {member.Admin_Submit === 0 ? 'รอการอนุมัติ' : 
                              member.Admin_Submit === 1 ? 'อนุมัติแล้ว' : 
                              'ปฏิเสธแล้ว'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMember(member);
                              }}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors duration-150 font-medium"
                            >
                              แก้ไข
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Member Edit Form - Improved with better spacing, sections and clear grouping */}
            {selectedMember && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-5">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">แก้ไขข้อมูลสมาชิก</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-600 hover:text-gray-800 flex items-center bg-white hover:bg-gray-100 px-4 py-2 rounded-md shadow-sm transition-colors duration-150 text-sm font-medium border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปค้นหา
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="p-6">
                    {/* Form sections for better organization */}
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">ข้อมูลทั่วไป</h4>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="MEMBER_CODE" className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสสมาชิก
                          </label>
                          <input
                            type="text"
                            name="MEMBER_CODE"
                            id="MEMBER_CODE"
                            value={memberData.MEMBER_CODE}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อบริษัท <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="company_name"
                            id="company_name"
                            value={memberData.company_name}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="company_type" className="block text-sm font-medium text-gray-700 mb-1">
                            ประเภทธุรกิจ
                          </label>
                          <input
                            type="text"
                            name="company_type"
                            id="company_type"
                            value={memberData.company_type}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                            เลขทะเบียนบริษัท
                          </label>
                          <input
                            type="text"
                            name="registration_number"
                            id="registration_number"
                            value={memberData.registration_number}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                            เลขประจำตัวผู้เสียภาษี
                          </label>
                          <input
                            type="text"
                            name="tax_id"
                            id="tax_id"
                            value={memberData.tax_id}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">ที่อยู่และการติดต่อ</h4>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            ที่อยู่
                          </label>
                          <textarea
                            id="address"
                            name="address"
                            rows={3}
                            value={memberData.address}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                            จังหวัด
                          </label>
                          <input
                            type="text"
                            name="province"
                            id="province"
                            value={memberData.province}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสไปรษณีย์
                          </label>
                          <input
                            type="text"
                            name="postal_code"
                            id="postal_code"
                            value={memberData.postal_code}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            โทรศัพท์
                          </label>
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={memberData.phone}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                            เว็บไซต์
                          </label>
                          <input
                            type="text"
                            name="website"
                            id="website"
                            value={memberData.website}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Admin Section */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">ข้อมูลสำหรับผู้ดูแลระบบ</h4>
                      <div className="sm:col-span-6">
                        <label htmlFor="admin_comment" className="block text-sm font-medium text-gray-700 mb-1">
                          ความคิดเห็นจากผู้ดูแลระบบ
                        </label>
                        <textarea
                          id="admin_comment"
                          name="admin_comment"
                          rows={3}
                          value={memberData.admin_comment}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="ความคิดเห็นเพิ่มเติม (จะแสดงให้สมาชิกเห็น)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                      disabled={isSubmitting}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          กำลังบันทึก...
                        </>
                      ) : (
                        'บันทึกข้อมูล'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Empty State - No Results - Improved with clear call to action */}
            {searchTerm.length >= 2 && members.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mt-5">
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-gray-50 p-4 rounded-full inline-flex mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg">ไม่พบข้อมูลสมาชิก</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-4">
                    ไม่พบข้อมูลสมาชิกที่ตรงกับคำค้นหา "{searchTerm}"
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 border border-blue-200 hover:bg-blue-50 font-medium rounded-md px-4 py-2 text-sm"
                    >
                      ล้างการค้นหา
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
}