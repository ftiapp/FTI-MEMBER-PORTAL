'use client';

import { useState, useEffect } from 'react';
import MultiSelectDropdown from '../../oc/components/MultiSelectDropdown';

export default function IndustrialGroupInfo({ 
  formData, 
  setFormData, 
  errors 
}) {
  const [industrialGroups, setIndustrialGroups] = useState([]);
  const [provincialCouncils, setProvincialCouncils] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch industrial groups
        const industrialGroupsResponse = await fetch('/api/industrial-groups');
        if (industrialGroupsResponse.ok) {
          const industrialGroupsData = await industrialGroupsResponse.json();
          const formattedData = industrialGroupsData.data.map(item => ({
            id: item.MEMBER_GROUP_CODE,
            name_th: item.MEMBER_GROUP_NAME,
            name_en: item.MEMBER_GROUP_NAME
          }));
          setIndustrialGroups(formattedData);
        }

        // Fetch provincial councils
        const provincialCouncilsResponse = await fetch('/api/province-groups');
        if (provincialCouncilsResponse.ok) {
          const provincialCouncilsData = await provincialCouncilsResponse.json();
          const formattedData = provincialCouncilsData.data.map(item => ({
            id: item.MEMBER_GROUP_CODE,
            name_th: item.MEMBER_GROUP_NAME,
            name_en: item.MEMBER_GROUP_NAME
          }));
          setProvincialCouncils(formattedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // เพิ่ม debug logs ใน IndustrialGroupInfo.js

const handleIndustrialGroupChange = (selectedIds) => {
  console.log('🏭 Industrial Groups changed:', selectedIds);
  console.log('🏭 Type:', typeof selectedIds, 'Is Array:', Array.isArray(selectedIds));
  
  setFormData(prev => {
    const newData = { ...prev, industrialGroups: selectedIds };
    console.log('🏭 Updated formData.industrialGroups:', newData.industrialGroups);
    return newData;
  });
};

const handleProvincialCouncilChange = (selectedIds) => {
  console.log('🏛️ Provincial Councils changed:', selectedIds);
  console.log('🏛️ Type:', typeof selectedIds, 'Is Array:', Array.isArray(selectedIds));
  
  setFormData(prev => {
    const newData = { ...prev, provincialCouncils: selectedIds };
    console.log('🏛️ Updated formData.provincialCouncils:', newData.provincialCouncils);
    return newData;
  });
};

// เพิ่ม useEffect เพื่อ debug ข้อมูลทั้งหมด
useEffect(() => {
  console.log('📊 Current formData:', {
    industrialGroups: formData.industrialGroups,
    provincialCouncils: formData.provincialCouncils
  });
}, [formData.industrialGroups, formData.provincialCouncils]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          เลือกกลุ่มอุตสาหกรรมและสภาจังหวัดที่เกี่ยวข้อง
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 overflow-visible relative">
        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                การเลือกกลุ่มอุตสาหกรรม
              </p>
              <p className="text-sm text-blue-700 mt-1">
                สามารถเลือกได้มากกว่า 1 รายการ เพื่อระบุกลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัดที่สมาคมมีส่วนเกี่ยวข้อง
              </p>
            </div>
          </div>
        </div>

        {/* Selection Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 overflow-visible">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            เลือกกลุ่มที่เกี่ยวข้อง
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            {/* Industrial Groups */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                กลุ่มอุตสาหกรรม
              </label>
              <div className="relative z-50">
                <MultiSelectDropdown
                  options={industrialGroups}
                  selectedValues={formData.industrialGroups || []}
                  onChange={handleIndustrialGroupChange}
                  placeholder="-- เลือกกลุ่มอุตสาหกรรม --"
                  isLoading={isLoading}
                  label=""
                />
              </div>
              {errors?.industrialGroups && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.industrialGroups}
                </p>
              )}
            </div>

            {/* Provincial Councils */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                สภาอุตสาหกรรมจังหวัด
              </label>
              <div className="relative z-40">
                <MultiSelectDropdown
                  options={provincialCouncils}
                  selectedValues={formData.provincialCouncils || []}
                  onChange={handleProvincialCouncilChange}
                  placeholder="-- เลือกสภาอุตสาหกรรมจังหวัด --"
                  isLoading={isLoading}
                  label=""
                />
              </div>
              {errors?.provincialCouncils && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.provincialCouncils}
                </p>
              )}
            </div>
          </div>

          {/* Selected Summary */}
          {(formData.industrialGroups?.length > 0 || formData.provincialCouncils?.length > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                สรุปรายการที่เลือก
              </h5>
              <div className="space-y-2">
                {formData.industrialGroups?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">กลุ่มอุตสาหกรรม:</span>{' '}
                    <span className="text-blue-600">
                      {formData.industrialGroups.length} รายการ
                    </span>
                  </div>
                )}
                {formData.provincialCouncils?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">สภาอุตสาหกรรมจังหวัด:</span>{' '}
                    <span className="text-blue-600">
                      {formData.provincialCouncils.length} รายการ
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
