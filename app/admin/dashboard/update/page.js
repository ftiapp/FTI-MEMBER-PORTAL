'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

export default function UpdateMembers() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
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

  // Fetch members on initial load
  useEffect(() => {
    if (searchTerm.length > 0) {
      searchMembers();
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
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/search-members?term=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMembers(result.data);
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
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">อัพเดตข้อมูลสมาชิก</h2>
        
        {/* Search Bar */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            ค้นหาสมาชิก
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
              placeholder="ค้นหาด้วยชื่อบริษัท, รหัสสมาชิก, หรืออีเมล"
            />
            <button
              type="button"
              onClick={searchMembers}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ค้นหา
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Search Results */}
            {members.length > 0 && !selectedMember && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">ผลการค้นหา</h3>
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
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.MEMBER_CODE || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{member.company_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
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
                              onClick={() => handleSelectMember(member)}
                              className="text-indigo-600 hover:text-indigo-900"
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
            
            {/* Member Edit Form */}
            {selectedMember && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">แก้ไขข้อมูลสมาชิก</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    &larr; กลับไปค้นหา
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="MEMBER_CODE" className="block text-sm font-medium text-gray-700">
                        รหัสสมาชิก
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="MEMBER_CODE"
                          id="MEMBER_CODE"
                          value={memberData.MEMBER_CODE}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                        ชื่อบริษัท
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="company_name"
                          id="company_name"
                          value={memberData.company_name}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="company_type" className="block text-sm font-medium text-gray-700">
                        ประเภทธุรกิจ
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="company_type"
                          id="company_type"
                          value={memberData.company_type}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
                        เลขทะเบียนบริษัท
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="registration_number"
                          id="registration_number"
                          value={memberData.registration_number}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                        เลขประจำตัวผู้เสียภาษี
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="tax_id"
                          id="tax_id"
                          value={memberData.tax_id}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        ที่อยู่
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={memberData.address}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                        จังหวัด
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="province"
                          id="province"
                          value={memberData.province}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                        รหัสไปรษณีย์
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="postal_code"
                          id="postal_code"
                          value={memberData.postal_code}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        โทรศัพท์
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={memberData.phone}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        เว็บไซต์
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="website"
                          id="website"
                          value={memberData.website}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="admin_comment" className="block text-sm font-medium text-gray-700">
                        ความคิดเห็นจากผู้ดูแลระบบ
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="admin_comment"
                          name="admin_comment"
                          rows={3}
                          value={memberData.admin_comment}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="ความคิดเห็นเพิ่มเติม (จะแสดงให้สมาชิกเห็น)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      บันทึกข้อมูล
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {searchTerm.length > 0 && members.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                ไม่พบข้อมูลสมาชิกที่ตรงกับคำค้นหา
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
