'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MemberLocation({ compPersonCode, onAddressSelect, readOnly = false }) {
  const [addresses, setAddresses] = useState([]);
  const [addressesByCode, setAddressesByCode] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddressCode, setSelectedAddressCode] = useState('001'); // Default to first address
  const [language, setLanguage] = useState('th'); // Default to Thai language
  const [editableAddress, setEditableAddress] = useState({
    ADDR_NO: '',
    ADDR_MOO: '',
    ADDR_SOI: '',
    ADDR_ROAD: '',
    ADDR_SUB_DISTRICT: '',
    ADDR_DISTRICT: '',
    ADDR_PROVINCE_NAME: '',
    ADDR_POSTCODE: '',
    ADDR_TELEPHONE: '',
    ADDR_FAX: '',
    ADDR_EMAIL: '',
    ADDR_WEBSITE: '',
    // English fields
    ADDR_NO_EN: '',
    ADDR_MOO_EN: '',
    ADDR_SOI_EN: '',
    ADDR_ROAD_EN: '',
    ADDR_SUB_DISTRICT_EN: '',
    ADDR_DISTRICT_EN: '',
    ADDR_PROVINCE_NAME_EN: '',
    ADDR_POSTCODE_EN: ''
  })

  useEffect(() => {
    if (!compPersonCode) {
      setIsLoading(false);
      setError('ไม่พบรหัสบริษัท/บุคคล');
      return;
    }

    fetchAddresses();
  }, [compPersonCode]);

  useEffect(() => {
    // When addresses change or selected address changes, update editable address
    if (addressesByCode[selectedAddressCode]) {
      const currentAddress = addressesByCode[selectedAddressCode];
      // ใช้ JSON.stringify เพื่อเปรียบเทียบว่าข้อมูลเปลี่ยนแปลงจริงๆ หรือไม่ก่อนที่จะ setState
      const newEditableAddress = {
        ADDR_NO: currentAddress.ADDR_NO || '',
        ADDR_MOO: currentAddress.ADDR_MOO || '',
        ADDR_SOI: currentAddress.ADDR_SOI || '',
        ADDR_ROAD: currentAddress.ADDR_ROAD || '',
        ADDR_SUB_DISTRICT: currentAddress.ADDR_SUB_DISTRICT || '',
        ADDR_DISTRICT: currentAddress.ADDR_DISTRICT || '',
        ADDR_PROVINCE_NAME: currentAddress.ADDR_PROVINCE_NAME || '',
        ADDR_POSTCODE: currentAddress.ADDR_POSTCODE || '',
        ADDR_TELEPHONE: currentAddress.ADDR_TELEPHONE || '',
        ADDR_FAX: currentAddress.ADDR_FAX || '',
        ADDR_EMAIL: currentAddress.ADDR_EMAIL || '',
        ADDR_WEBSITE: currentAddress.ADDR_WEBSITE || '',
        // English fields
        ADDR_NO_EN: currentAddress.ADDR_NO_EN || '',
        ADDR_MOO_EN: currentAddress.ADDR_MOO_EN || '',
        ADDR_SOI_EN: currentAddress.ADDR_SOI_EN || '',
        ADDR_ROAD_EN: currentAddress.ADDR_ROAD_EN || '',
        ADDR_SUB_DISTRICT_EN: currentAddress.ADDR_SUB_DISTRICT_EN || '',
        ADDR_DISTRICT_EN: currentAddress.ADDR_DISTRICT_EN || '',
        ADDR_PROVINCE_NAME_EN: currentAddress.ADDR_PROVINCE_NAME_EN || '',
        ADDR_POSTCODE_EN: currentAddress.ADDR_POSTCODE_EN || ''
      };
      
      // ตรวจสอบว่าข้อมูลเปลี่ยนแปลงจริงๆ หรือไม่ก่อนที่จะ setState
      if (JSON.stringify(editableAddress) !== JSON.stringify(newEditableAddress)) {
        setEditableAddress(newEditableAddress);
      }
    }
  }, [addressesByCode, selectedAddressCode, editableAddress]);
  
  // Separate useEffect for onAddressSelect to prevent unnecessary renders
  useEffect(() => {
    if (addressesByCode[selectedAddressCode] && onAddressSelect) {
      onAddressSelect(addressesByCode[selectedAddressCode]);
    }
  }, [addressesByCode, selectedAddressCode, onAddressSelect]);

  const fetchAddresses = async () => {
    try {
      // ถ้าไม่มี compPersonCode ให้ออกจากฟังก์ชันเลย
      if (!compPersonCode) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/member/address?compPersonCode=${encodeURIComponent(compPersonCode)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่');
      }

      if (result.success && Array.isArray(result.data.addresses)) {
        // Filter to only include addresses with ADDR_CODE 001, 002, or 003
        const filteredAddresses = result.data.addresses.filter(addr => 
          addr && (addr.ADDR_CODE === '001' || addr.ADDR_CODE === '002' || addr.ADDR_CODE === '003')
        );
        
        // Create a map of addresses by code
        const addrByCode = {};
        filteredAddresses.forEach(addr => {
          // Only add the first address for each code
          if (addr && addr.ADDR_CODE && !addrByCode[addr.ADDR_CODE]) {
            addrByCode[addr.ADDR_CODE] = addr;
          }
        });
        
        // สร้างอาร์เรย์ใหม่ที่มีเพียงที่อยู่เดียวสำหรับแต่ละรหัส
        const uniqueAddresses = Object.values(addrByCode);
        
        setAddresses(uniqueAddresses);
        setAddressesByCode(addrByCode);
        
        // If we have addresses, select the first one by default
        if (filteredAddresses.length > 0) {
          setSelectedAddressCode(filteredAddresses[0].ADDR_CODE);
        }
      } else {
        // ถ้าไม่มีข้อมูลที่อยู่ ให้กำหนดค่าเริ่มต้นเป็นอาร์เรย์ว่าง
        setAddresses([]);
        setAddressesByCode({});
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err.message);
      // ล้างข้อมูลเฉพาะเมื่อเกิดข้อผิดพลาด
      setAddresses([]);
      setAddressesByCode({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setSelectedAddressCode(e.target.value);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get the currently selected address
  const selectedAddress = addressesByCode[selectedAddressCode];
  
  // Get address code label
  const getAddressLabel = (code) => {
    switch(code) {
      case '001': return 'ที่อยู่ 1 (สำหรับติดต่อ)';
      case '002': return 'ที่อยู่ 2 (สำหรับจัดส่งเอกสาร)';
      case '003': return 'ที่อยู่ 3 (สำหรับออกใบกำกับภาษี)';
      default: return `ที่อยู่ ${code}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
        <h3 className="text-lg font-medium text-red-600 mb-2">ไม่สามารถโหลดข้อมูลที่อยู่ได้</h3>
        <p className="text-black">{error}</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-medium text-black mb-2">ไม่พบข้อมูลที่อยู่</h3>
        <p className="text-black">ไม่พบข้อมูลที่อยู่สำหรับสมาชิกนี้</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Address selector */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-black">
            เลือกที่อยู่
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleLanguageChange('th')}
              className={`px-2 py-1 text-xs rounded-md ${language === 'th' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-black'}`}
            >
              ภาษาไทย
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-xs rounded-md ${language === 'en' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-black'}`}
            >
              English
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {addresses.map((address) => (
            <button
              key={address.ADDR_CODE}
              type="button"
              onClick={() => setSelectedAddressCode(address.ADDR_CODE)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedAddressCode === address.ADDR_CODE ? 'bg-blue-600 text-white font-medium' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
            >
              {getAddressLabel(address.ADDR_CODE)}
            </button>
          ))}
        </div>
      </div>

      {/* Address form */}
      {selectedAddress && (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium text-black mb-4 pb-2 border-b">
            {getAddressLabel(selectedAddressCode)}
          </h3>
          
          {language === 'th' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">เลขที่</label>
                  <input
                    type="text"
                    name="ADDR_NO"
                    value={editableAddress.ADDR_NO}
                    onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">หมู่</label>
                  <input
                    type="text"
                    name="ADDR_MOO"
                    value={editableAddress.ADDR_MOO}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">ซอย</label>
                  <input
                    type="text"
                    name="ADDR_SOI"
                    value={editableAddress.ADDR_SOI}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">ถนน</label>
                  <input
                    type="text"
                    name="ADDR_ROAD"
                    value={editableAddress.ADDR_ROAD}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">แขวง/ตำบล</label>
                  <input
                    type="text"
                    name="ADDR_SUB_DISTRICT"
                    value={editableAddress.ADDR_SUB_DISTRICT}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">เขต/อำเภอ</label>
                  <input
                    type="text"
                    name="ADDR_DISTRICT"
                    value={editableAddress.ADDR_DISTRICT}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">จังหวัด</label>
                  <input
                    type="text"
                    name="ADDR_PROVINCE_NAME"
                    value={editableAddress.ADDR_PROVINCE_NAME}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    name="ADDR_POSTCODE"
                    value={editableAddress.ADDR_POSTCODE}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">โทรศัพท์</label>
                  <input
                    type="text"
                    name="ADDR_TELEPHONE"
                    value={editableAddress.ADDR_TELEPHONE}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">แฟกซ์</label>
                  <input
                    type="text"
                    name="ADDR_FAX"
                    value={editableAddress.ADDR_FAX}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">อีเมล</label>
                  <input
                    type="email"
                    name="ADDR_EMAIL"
                    value={editableAddress.ADDR_EMAIL}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">เว็บไซต์</label>
                  <input
                    type="text"
                    name="ADDR_WEBSITE"
                    value={editableAddress.ADDR_WEBSITE}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Number</label>
                  <input
                    type="text"
                    name="ADDR_NO_EN"
                    value={editableAddress.ADDR_NO_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Moo</label>
                  <input
                    type="text"
                    name="ADDR_MOO_EN"
                    value={editableAddress.ADDR_MOO_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Soi</label>
                  <input
                    type="text"
                    name="ADDR_SOI_EN"
                    value={editableAddress.ADDR_SOI_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Road</label>
                  <input
                    type="text"
                    name="ADDR_ROAD_EN"
                    value={editableAddress.ADDR_ROAD_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-district</label>
                  <input
                    type="text"
                    name="ADDR_SUB_DISTRICT_EN"
                    value={editableAddress.ADDR_SUB_DISTRICT_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    name="ADDR_DISTRICT_EN"
                    value={editableAddress.ADDR_DISTRICT_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    name="ADDR_PROVINCE_NAME_EN"
                    value={editableAddress.ADDR_PROVINCE_NAME_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="ADDR_POSTCODE_EN"
                    value={editableAddress.ADDR_POSTCODE_EN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
