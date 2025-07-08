'use client';

import { useState } from 'react';
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
  console.log('OC IndustrialGroupSection - industrialGroups:', industrialGroups);
  console.log('OC IndustrialGroupSection - provincialChapters:', provincialChapters);
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
                สามารถเลือกได้มากกว่า 1 รายการ เพื่อระบุกลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัดที่บริษัทมีส่วนเกี่ยวข้อง
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
                  options={Array.isArray(industrialGroups) ? industrialGroups : []}
                  selectedValues={formData.industrialGroupIds || []}
                  onChange={(selectedIds) => {
                    setFormData(prev => ({
                      ...prev,
                      industrialGroupIds: selectedIds,
                      industrialGroupNames: selectedIds.map(id => {
                        const group = Array.isArray(industrialGroups) 
                          ? industrialGroups.find(g => g.id === id)
                          : null;
                        return group ? group.name_th : '';
                      })
                    }));
                  }}
                  placeholder="-- เลือกกลุ่มอุตสาหกรรม --"
                  isLoading={isLoading}
                  label=""
                />
              </div>
              {errors?.industrialGroupIds && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.industrialGroupIds}
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
                  options={Array.isArray(provincialChapters) ? provincialChapters : []}
                  selectedValues={formData.provincialChapterIds || []}
                  onChange={(selectedIds) => {
                    setFormData(prev => ({
                      ...prev,
                      provincialChapterIds: selectedIds,
                      provincialChapterNames: selectedIds.map(id => {
                        const chapter = Array.isArray(provincialChapters) 
                          ? provincialChapters.find(c => c.id === id)
                          : null;
                        return chapter ? chapter.name_th : '';
                      })
                    }));
                  }}
                  placeholder="-- เลือกสภาอุตสาหกรรมจังหวัด --"
                  isLoading={isLoading}
                  label=""
                />
              </div>
              {errors?.provincialChapterIds && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.provincialChapterIds}
                </p>
              )}
            </div>
          </div>

          {/* Selected Summary */}
          {(formData.industrialGroupIds?.length > 0 || formData.provincialChapterIds?.length > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                สรุปรายการที่เลือก
              </h5>
              <div className="space-y-2">
                {formData.industrialGroupIds?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">กลุ่มอุตสาหกรรม:</span>{' '}
                    <span className="text-blue-600">
                      {formData.industrialGroupIds.length} รายการ
                    </span>
                  </div>
                )}
                {formData.provincialChapterIds?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">สภาอุตสาหกรรมจังหวัด:</span>{' '}
                    <span className="text-blue-600">
                      {formData.provincialChapterIds.length} รายการ
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

IndustrialGroupSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  industrialGroups: PropTypes.array,
  provincialChapters: PropTypes.array,
  isLoading: PropTypes.bool
};

IndustrialGroupSection.defaultProps = {
  errors: {},
  industrialGroups: [],
  provincialChapters: [],
  isLoading: false
};