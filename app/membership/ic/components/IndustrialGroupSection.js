'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MultiSelectDropdown from './MultiSelectDropdown';

export default function IndustrialGroupSection({ 
  formData, 
  setFormData, 
  errors,
  industrialGroups,
  provincialChapters,
  isLoading
}) {
  // ✅ FIX: แก้ไขให้ใช้ field name ที่ตรงกับ API และการ submit
  const handleIndustrialGroupChange = (selectedIds) => {
    console.log('Industrial groups selected:', selectedIds);
    
    setFormData(prev => ({
      ...prev,
      // ✅ ใช้ field name ที่ตรงกับการส่งข้อมูล
      industrialGroupId: selectedIds, // เก็บเป็น array
      // เก็บชื่อสำหรับแสดงผล
      industrialGroupNames: selectedIds.map(id => {
        const group = industrialGroups?.data?.find(g => g.MEMBER_GROUP_CODE === id) ||
                     industrialGroups?.find(g => g.id === id);
        return group ? (group.MEMBER_GROUP_NAME || group.name_th) : '';
      })
    }));
  };
  
  const handleProvincialCouncilChange = (selectedIds) => {
    console.log('Provincial councils selected:', selectedIds);
    
    setFormData(prev => ({
      ...prev,
      // ✅ ใช้ field name ที่ตรงกับการส่งข้อมูล
      provincialChapterId: selectedIds, // เก็บเป็น array
      // เก็บชื่อสำหรับแสดงผล
      provincialCouncilNames: selectedIds.map(id => {
        const council = Array.isArray(provincialChapters) 
          ? provincialChapters.find(c => c.id === id)
          : provincialChapters?.data?.find(c => c.id === id);
        return council ? council.name_th : '';
      })
    }));
  };

  // Debug: แสดงข้อมูลที่ได้รับ
  useEffect(() => {
    console.log('=== IndustrialGroupSection Debug ===');
    console.log('industrialGroups:', industrialGroups);
    console.log('provincialChapters:', provincialChapters);
    console.log('formData.industrialGroupId:', formData.industrialGroupId);
    console.log('formData.provincialChapterId:', formData.provincialChapterId);
  }, [industrialGroups, provincialChapters, formData]);

  // ✅ เตรียมข้อมูล options ให้ถูกต้อง
  const industrialGroupOptions = () => {
    if (industrialGroups?.data) {
      return industrialGroups.data.map(group => ({
        id: group.MEMBER_GROUP_CODE,
        name_th: group.MEMBER_GROUP_NAME
      }));
    }
    if (Array.isArray(industrialGroups)) {
      return industrialGroups.map(group => ({
        id: group.id || group.MEMBER_GROUP_CODE,
        name_th: group.name_th || group.MEMBER_GROUP_NAME
      }));
    }
    return [];
  };

  const provincialChapterOptions = () => {
    if (provincialChapters?.data) {
      return provincialChapters.data.map(chapter => ({
        id: chapter.id || chapter.MEMBER_GROUP_CODE,
        name_th: chapter.name_th || chapter.MEMBER_GROUP_NAME
      }));
    }
    if (Array.isArray(provincialChapters)) {
      return provincialChapters.map(chapter => ({
        id: chapter.id,
        name_th: chapter.name_th
      }));
    }
    return [];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 overflow-visible">
      <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
        กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Industrial Groups */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            กลุ่มอุตสาหกรรม
          </label>
          <MultiSelectDropdown
            options={industrialGroupOptions()}
            selectedValues={formData.industrialGroupId || []}
            onChange={handleIndustrialGroupChange}
            isLoading={isLoading}
            error={errors?.industrialGroupId || errors?.industrialGroupIds}
            placeholder="เลือกกลุ่มอุตสาหกรรม"
          />
          {errors?.industrialGroupId && (
            <p className="text-sm text-red-600 mt-1">{errors.industrialGroupId}</p>
          )}
        </div>

        {/* Provincial Councils */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            สภาอุตสาหกรรมจังหวัด
          </label>
          <MultiSelectDropdown
            options={provincialChapterOptions()}
            selectedValues={formData.provincialChapterId || []}
            onChange={handleProvincialCouncilChange}
            isLoading={isLoading}
            error={errors?.provincialChapterId || errors?.provincialCouncilIds}
            placeholder="เลือกสภาอุตสาหกรรมจังหวัด"
          />
          {errors?.provincialChapterId && (
            <p className="text-sm text-red-600 mt-1">{errors.provincialChapterId}</p>
          )}
        </div>
      </div>

      {/* Debug Information (เฉพาะใน development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
          <p><strong>Selected Industrial Groups:</strong> {JSON.stringify(formData.industrialGroupId)}</p>
          <p><strong>Selected Provincial Chapters:</strong> {JSON.stringify(formData.provincialChapterId)}</p>
        </div>
      )}
    </div>
  );
}

IndustrialGroupSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  industrialGroups: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  provincialChapters: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isLoading: PropTypes.bool
};

IndustrialGroupSection.defaultProps = {
  errors: {},
  industrialGroups: [],
  provincialChapters: [],
  isLoading: false
};