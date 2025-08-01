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

  // แก้ไขให้ส่งข้อมูลเป็น object ที่มีทั้ง id และ name_th
  const handleIndustrialGroupChange = (selectedIds) => {
    console.log('Selected industrial group IDs:', selectedIds);
    
    // Convert selected IDs to array of objects with id and name_th
    const selectedGroups = selectedIds.map(id => {
      const group = industrialGroups.find(g => String(g.id) === String(id));
      return {
        id,
        name_th: group ? group.name_th : id,
        text: group ? group.name_th : id
      };
    });
    
    console.log('Selected industrial group objects:', selectedGroups);
    
    // Extract names for compatibility with other parts of the code
    const names = selectedGroups.map(group => group.name_th || group.text);
    
    // Update form data with selected groups and names
    setFormData(prev => ({
      ...prev,
      industrialGroups: selectedIds,
      industrialGroupNames: names // Store names directly in formData
    }));
  };

  const handleProvincialCouncilChange = (selectedIds) => {
    console.log('Selected provincial council IDs:', selectedIds);
    
    // Convert selected IDs to array of objects with id and name_th
    const selectedCouncils = selectedIds.map(id => {
      const council = provincialCouncils.find(c => String(c.id) === String(id));
      return {
        id,
        name_th: council ? council.name_th : id,
        text: council ? council.name_th : id
      };
    });
    
    console.log('Selected provincial council objects:', selectedCouncils);
    
    // Extract names for compatibility with other parts of the code
    const names = selectedCouncils.map(council => council.name_th || council.text);
    
    // Update form data with selected councils and names
    setFormData(prev => ({
      ...prev,
      provincialCouncils: selectedIds,
      provincialChapterNames: names // Store names directly in formData
    }));
  };

  // เพิ่ม useEffect เพื่อ debug ข้อมูลทั้งหมด
  useEffect(() => {
    console.log('📊 Current formData:', {
      industrialGroups: formData.industrialGroups,
      industrialGroupNames: formData.industrialGroupNames,
      provincialCouncils: formData.provincialCouncils,
      provincialChapterNames: formData.provincialChapterNames
    });
  }, [formData.industrialGroups, formData.provincialCouncils, formData.industrialGroupNames, formData.provincialChapterNames]);

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

          {/* Selected Items Display */}
          {(formData.industrialGroups?.length > 0 || formData.provincialCouncils?.length > 0) && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900">
                    รายการที่เลือก
                  </h5>
                  <div className="flex-1"></div>
                  <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {(formData.industrialGroups?.length || 0) + (formData.provincialCouncils?.length || 0)} รายการ
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Industrial Groups Selected */}
                  {formData.industrialGroups?.length > 0 && (
                    <div className="group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                        <p className="text-sm font-semibold text-gray-800">กลุ่มอุตสาหกรรม</p>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                          {formData.industrialGroups.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {formData.industrialGroups.map(id => {
                          const group = industrialGroups.find(g => g.id === id);
                          return group ? (
                            <div
                              key={id}
                              className="group/tag relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                            >
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium">{group.name_th}</span>
                              <div className="w-0.5 h-4 bg-blue-300 rounded-full opacity-0 group-hover/tag:opacity-100 transition-opacity"></div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Provincial Councils Selected */}
                  {formData.provincialCouncils?.length > 0 && (
                    <div className="group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                        <p className="text-sm font-semibold text-gray-800">สภาอุตสาหกรรมจังหวัด</p>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          {formData.provincialCouncils.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {formData.provincialCouncils.map(id => {
                          const council = provincialCouncils.find(c => c.id === id);
                          return council ? (
                            <div
                              key={id}
                              className="group/tag relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium">{council.name_th}</span>
                              <div className="w-0.5 h-4 bg-emerald-300 rounded-full opacity-0 group-hover/tag:opacity-100 transition-opacity"></div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
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