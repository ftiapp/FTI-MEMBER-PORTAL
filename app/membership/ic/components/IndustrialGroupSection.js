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
  const handleIndustrialGroupChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      industrialGroupIds: selectedIds,
      industrialGroupNames: selectedIds.map(id => {
        const group = industrialGroups?.data?.find(g => g.MEMBER_GROUP_CODE === id);
        return group ? group.MEMBER_GROUP_NAME : '';
      })
    }));
  };
  
  const handleProvincialCouncilChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      provincialCouncilIds: selectedIds,
      provincialCouncilNames: selectedIds.map(id => {
        const council = Array.isArray(provincialChapters) 
          ? provincialChapters.find(c => c.id === id)
          : null;
        return council ? council.name_th : '';
      })
    }));
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
           
            options={industrialGroups?.data ? industrialGroups.data.map(group => ({
              id: group.MEMBER_GROUP_CODE,
              name_th: group.MEMBER_GROUP_NAME
            })) : []}
            selectedValues={formData.industrialGroupIds || []}
            onChange={handleIndustrialGroupChange}
            isLoading={isLoading}
            error={errors?.industrialGroupIds}
          />
        </div>

        {/* Provincial Councils */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            สภาอุตสาหกรรมจังหวัด
          </label>
          <MultiSelectDropdown
        
            options={Array.isArray(provincialChapters) ? provincialChapters : []}
            selectedValues={formData.provincialCouncilIds || []}
            onChange={handleProvincialCouncilChange}
            isLoading={isLoading}
            error={errors?.provincialCouncilIds}
          />
        </div>
      </div>
    </div>
  );
}

IndustrialGroupSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  industrialGroups: PropTypes.object,
  provincialChapters: PropTypes.object,
  isLoading: PropTypes.bool
};

IndustrialGroupSection.defaultProps = {
  errors: {},
  industrialGroups: { data: [] },
  provincialChapters: { data: [] },
  isLoading: false
};
