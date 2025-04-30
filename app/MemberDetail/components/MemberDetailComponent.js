'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFileAlt, FaUser, FaUsers, FaIndustry, FaCity } from 'react-icons/fa';

/**
 * MemberDetailComponent displays detailed information about a member based on their member code
 * It handles different types of members based on MEMBER_MAIN_GROUP_CODE (000, 100, 200)
 * and displays multiple addresses if available (ADDR_CODE 001, 002, 003)
 * 
 * @param {Object} props Component properties
 * @param {string} props.memberCode The member code to fetch details for
 */
export default function MemberDetailComponent({ memberCode }) {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedAddress, setSelectedAddress] = useState('001'); // Default to first address
  const [addressIndex, setAddressIndex] = useState(0); // Index for address navigation

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberCode) {
        setLoading(false);
        setError('ไม่ได้ระบุรหัสสมาชิก');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching data for memberCode:', memberCode);
        
        const response = await fetch(`/api/member-detail?memberCode=${encodeURIComponent(memberCode)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลสมาชิกได้ (${response.status})`);
        }

        const data = await response.json();
        console.log('Member data received:', data);
        
        if (data.success && data.data) {
          setMemberData(data.data);
        } else {
          setError(data.error || 'ไม่พบข้อมูลสมาชิก');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลได้');
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberCode]);

  // Helper function to get the organization type based on MEMBER_MAIN_GROUP_CODE
  const getOrganizationType = (code) => {
    switch (code) {
      case '000':
        return 'สภาอุตสาหกรรมแห่งประเทศไทย';
      case '100':
        return 'กลุ่มอุตสาหกรรม';
      case '200':
        return 'สภาอุตสาหกรรมจังหวัด';
      default:
        return 'ไม่ระบุประเภท';
    }
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    if (address.ADDR_NO) parts.push(`${address.ADDR_NO}`);
    if (address.ADDR_MOO) parts.push(`หมู่ ${address.ADDR_MOO}`);
    if (address.ADDR_SOI) parts.push(`ซอย ${address.ADDR_SOI}`);
    if (address.ADDR_ROAD) parts.push(`ถนน ${address.ADDR_ROAD}`);
    if (address.ADDR_SUB_DISTRICT) parts.push(`ตำบล/แขวง ${address.ADDR_SUB_DISTRICT}`);
    if (address.ADDR_DISTRICT) parts.push(`อำเภอ/เขต ${address.ADDR_DISTRICT}`);
    if (address.ADDR_PROVINCE_NAME) parts.push(`จังหวัด ${address.ADDR_PROVINCE_NAME}`);
    if (address.ADDR_POSTCODE) parts.push(`${address.ADDR_POSTCODE}`);
    
    return parts.join(' ');
  };

  // Helper function to get address label
  const getAddressLabel = (code) => {
    switch (code) {
      case '001':
        return 'ที่ตั้งสำนักงาน';
      case '002':
        return 'ที่ตั้งโรงงาน';
      case '003':
        return 'ที่อยู่จัดส่งเอกสาร';
      default:
        return `ที่อยู่ ${code}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-gray-600">
          <div className="animate-spin mb-3">
            <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-red-600">
          <div className="mb-3">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="font-medium text-lg mb-2">เกิดข้อผิดพลาด</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!memberData || Object.keys(memberData).length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-gray-600">
          <div className="mb-3">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="font-medium text-lg mb-2">ไม่พบข้อมูลสมาชิก</p>
          <p>ไม่พบข้อมูลสมาชิกสำหรับรหัสสมาชิกที่ระบุ</p>
        </div>
      </div>
    );
  }

  // Get the first company data for display
  const firstRegistCode = Object.keys(memberData)[0];
  const firstCompany = memberData[firstRegistCode];
  const companyInfo = firstCompany.companyInfo;
  const addresses = firstCompany.addresses;
  const representatives = firstCompany.representatives;

  // Check if multiple companies with the same REGIST_CODE exist
  const multipleCompanies = Object.keys(memberData).length > 1;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with company name and type */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">{companyInfo.COMPANY_NAME}</h2>
        <div className="flex items-center mt-1 text-sm">
          <FaBuilding className="mr-2" />
          <span>{getOrganizationType(companyInfo.MEMBER_MAIN_GROUP_CODE)}</span>
          {companyInfo.MEMBER_CODE && (
            <span className="ml-4 flex items-center">
              <FaIdCard className="mr-1" />
              รหัสสมาชิก: {companyInfo.MEMBER_CODE}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'info'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ข้อมูลทั่วไป
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'address'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ที่อยู่
          </button>
          <button
            onClick={() => setActiveTab('representatives')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'representatives'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ผู้แทน
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            สินค้า/บริการ
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="p-6">
        {/* General Information Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">ข้อมูลบริษัท</h3>
                
                <div className="flex items-start">
                  <FaBuilding className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">ชื่อบริษัท</p>
                    <p className="text-gray-700">{companyInfo.COMPANY_NAME || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaIdCard className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">เลขประจำตัวผู้เสียภาษี</p>
                    <p className="text-gray-700">{companyInfo.TAX_ID || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaUsers className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">ประเภทสมาชิก</p>
                    <p className="text-gray-700">{getOrganizationType(companyInfo.MEMBER_MAIN_GROUP_CODE)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">ข้อมูลสมาชิก</h3>
                
                <div className="flex items-start">
                  <FaIdCard className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">รหัสสมาชิก</p>
                    <p className="text-gray-700">{companyInfo.MEMBER_CODE || '-'}</p>
                  </div>
                </div>
                
                {companyInfo.MEMBER_MAIN_GROUP_CODE === '100' && (
                  <div className="flex items-start">
                    <FaIndustry className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">กลุ่มอุตสาหกรรม</p>
                      <p className="text-gray-700">{companyInfo.Industry_GROUP_NAME || '-'}</p>
                    </div>
                  </div>
                )}
                
                {companyInfo.MEMBER_MAIN_GROUP_CODE === '200' && (
                  <div className="flex items-start">
                    <FaCity className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">สภาอุตสาหกรรมจังหวัด</p>
                      <p className="text-gray-700">{companyInfo.Province_GROUP_NAME || '-'}</p>
                    </div>
                  </div>
                )}
                
                {companyInfo.MEMBER_MAIN_GROUP_CODE === '000' && (
                  <div className="flex items-start">
                    <FaBuilding className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">สภาอุตสาหกรรมแห่งประเทศไทย</p>
                      <p className="text-gray-700">{companyInfo.Right_GROUP_NAME || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {multipleCompanies && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">
                  <strong>หมายเหตุ:</strong> บริษัทนี้มีข้อมูลหลายรายการที่มีรหัสทะเบียน (REGIST_CODE) เดียวกัน
                </p>
              </div>
            )}
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div>
            {/* Address navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {Object.keys(addresses).length > 0 ? getAddressLabel(Object.keys(addresses)[addressIndex]) : 'ไม่พบข้อมูลที่อยู่'}
                </h3>
                
                {Object.keys(addresses).length > 1 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const newIndex = (addressIndex - 1 + Object.keys(addresses).length) % Object.keys(addresses).length;
                        setAddressIndex(newIndex);
                        setSelectedAddress(Object.keys(addresses)[newIndex]);
                      }}
                      disabled={Object.keys(addresses).length <= 1}
                      className={`p-2 rounded-full ${Object.keys(addresses).length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                      aria-label="ที่อยู่ก่อนหน้า"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="flex items-center text-sm text-gray-600">
                      {addressIndex + 1} / {Object.keys(addresses).length}
                    </span>
                    <button
                      onClick={() => {
                        const newIndex = (addressIndex + 1) % Object.keys(addresses).length;
                        setAddressIndex(newIndex);
                        setSelectedAddress(Object.keys(addresses)[newIndex]);
                      }}
                      disabled={Object.keys(addresses).length <= 1}
                      className={`p-2 rounded-full ${Object.keys(addresses).length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                      aria-label="ที่อยู่ถัดไป"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Address type badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.keys(addresses).map((addrCode, index) => (
                  <button
                    key={addrCode}
                    onClick={() => {
                      setSelectedAddress(addrCode);
                      setAddressIndex(index);
                    }}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedAddress === addrCode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {getAddressLabel(addrCode)}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected address details */}
            {addresses[selectedAddress] ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  {getAddressLabel(selectedAddress)}
                </h3>
                
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">ที่อยู่</p>
                    <p className="text-gray-700">{formatAddress(addresses[selectedAddress])}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaPhone className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">โทรศัพท์</p>
                    <p className="text-gray-700">{addresses[selectedAddress].ADDR_TELEPHONE || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaEnvelope className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">อีเมล</p>
                    <p className="text-gray-700">{addresses[selectedAddress].ADDR_EMAIL || '-'}</p>
                  </div>
                </div>
                
                {addresses[selectedAddress].ADDR_FAX && (
                  <div className="flex items-start">
                    <FaPhone className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">โทรสาร</p>
                      <p className="text-gray-700">{addresses[selectedAddress].ADDR_FAX}</p>
                    </div>
                  </div>
                )}
                
                {addresses[selectedAddress].ADDR_WEBSITE && (
                  <div className="flex items-start">
                    <FaGlobe className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">เว็บไซต์</p>
                      <p className="text-gray-700">
                        <a 
                          href={addresses[selectedAddress].ADDR_WEBSITE.startsWith('http') 
                            ? addresses[selectedAddress].ADDR_WEBSITE 
                            : `http://${addresses[selectedAddress].ADDR_WEBSITE}`
                          } 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {addresses[selectedAddress].ADDR_WEBSITE}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                ไม่พบข้อมูลที่อยู่สำหรับรหัสที่เลือก
              </div>
            )}
          </div>
        )}

        {/* Representatives Tab */}
        {activeTab === 'representatives' && (
          <div className="space-y-6">
            {companyInfo.MEMBER_MAIN_GROUP_CODE === '000' && representatives.right.some(rep => rep.th || rep.en) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  ผู้แทนสภาอุตสาหกรรมแห่งประเทศไทย
                </h3>
                {representatives.right.map((rep, index) => (
                  (rep.th || rep.en) && (
                    <div key={`right-${index}`} className="flex items-start mb-4">
                      <FaUser className="mt-1 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">ผู้แทนคนที่ {index + 1}</p>
                        <p className="text-gray-700">{rep.th || rep.en || '-'}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            
            {companyInfo.MEMBER_MAIN_GROUP_CODE === '100' && representatives.industry.some(rep => rep.th || rep.en) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  ผู้แทนกลุ่มอุตสาหกรรม
                </h3>
                {representatives.industry.map((rep, index) => (
                  (rep.th || rep.en) && (
                    <div key={`industry-${index}`} className="flex items-start mb-4">
                      <FaUser className="mt-1 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">ผู้แทนคนที่ {index + 1}</p>
                        <p className="text-gray-700">{rep.th || rep.en || '-'}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            
            {companyInfo.MEMBER_MAIN_GROUP_CODE === '200' && representatives.province.some(rep => rep.th || rep.en) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  ผู้แทนสภาอุตสาหกรรมจังหวัด
                </h3>
                {representatives.province.map((rep, index) => (
                  (rep.th || rep.en) && (
                    <div key={`province-${index}`} className="flex items-start mb-4">
                      <FaUser className="mt-1 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">ผู้แทนคนที่ {index + 1}</p>
                        <p className="text-gray-700">{rep.th || rep.en || '-'}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            
            {((companyInfo.MEMBER_MAIN_GROUP_CODE === '000' && !representatives.right.some(rep => rep.th || rep.en)) ||
              (companyInfo.MEMBER_MAIN_GROUP_CODE === '100' && !representatives.industry.some(rep => rep.th || rep.en)) ||
              (companyInfo.MEMBER_MAIN_GROUP_CODE === '200' && !representatives.province.some(rep => rep.th || rep.en))) && (
              <div className="py-8 text-center text-gray-500">
                ไม่พบข้อมูลผู้แทน
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              สินค้าและบริการ
            </h3>
            
            {companyInfo.PRODUCT_DESC_TH ? (
              <div className="flex items-start">
                <FaFileAlt className="mt-1 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">รายละเอียดสินค้า/บริการ</p>
                  <p className="text-gray-700 whitespace-pre-line">{companyInfo.PRODUCT_DESC_TH}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                ไม่พบข้อมูลสินค้าและบริการ
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
