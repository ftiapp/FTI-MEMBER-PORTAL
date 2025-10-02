"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function IndustrialGroupSection({
  formData,
  setFormData,
  errors,
  industrialGroups,
  provincialChapters,
  isLoading,
}) {
  const getSafeSelectedIds = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }
    // If the first item is an object with an 'id', map to IDs. Otherwise, assume it's already an array of IDs.
    if (typeof items[0] === "object" && items[0] !== null && "id" in items[0]) {
      return items.map((item) => item.id);
    }
    return items;
  };

  // ✅ FIX: แก้ไขให้ใช้ field name ที่ตรงกับ API และการ submit
  const handleIndustrialGroupChange = (selectedIds) => {
    console.log("Industrial groups selected:", selectedIds);

    setFormData((prev) => ({
      ...prev,
      // ✅ ใช้ field name ที่ตรงกับการส่งข้อมูล
      industrialGroupId: selectedIds, // เก็บเป็น array
      // เก็บชื่อสำหรับแสดงผล
      industrialGroupNames: selectedIds.map((id) => {
        // ✅ Normalize numeric/string IDs for reliable matching
        const sid = id != null ? id.toString() : "";
        const source = Array.isArray(industrialGroups)
          ? industrialGroups
          : industrialGroups?.data || [];
        const group = source.find((g) => {
          const gid = g?.id != null ? g.id.toString() : "";
          const code = g?.MEMBER_GROUP_CODE != null ? g.MEMBER_GROUP_CODE.toString() : "";
          return gid === sid || code === sid;
        });
        return group ? group.MEMBER_GROUP_NAME || group.name_th || "" : "";
      }),
    }));
  };

  const handleProvincialCouncilChange = (selectedIds) => {
    console.log("Provincial councils selected:", selectedIds);

    setFormData((prev) => ({
      ...prev,
      // ✅ ใช้ field name ที่ตรงกับการส่งข้อมูล
      provincialChapterId: selectedIds, // เก็บเป็น array
      // ✅ FIX: เก็บชื่อใน field ที่ตรงกับ ICFormSubmission
      provincialChapterNames: selectedIds.map((id) => {
        const sid = id != null ? id.toString() : "";
        const source = Array.isArray(provincialChapters)
          ? provincialChapters
          : provincialChapters?.data || [];
        const council = source.find((c) => {
          const cid = c?.id != null ? c.id.toString() : "";
          const code = c?.MEMBER_GROUP_CODE != null ? c.MEMBER_GROUP_CODE.toString() : "";
          return cid === sid || code === sid;
        });
        return council ? council.name_th || council.MEMBER_GROUP_NAME || "" : "";
      }),
      // ✅ เก็บ provincialCouncilNames ด้วยเพื่อ backward compatibility
      provincialCouncilNames: selectedIds.map((id) => {
        const sid = id != null ? id.toString() : "";
        const source = Array.isArray(provincialChapters)
          ? provincialChapters
          : provincialChapters?.data || [];
        const council = source.find((c) => {
          const cid = c?.id != null ? c.id.toString() : "";
          const code = c?.MEMBER_GROUP_CODE != null ? c.MEMBER_GROUP_CODE.toString() : "";
          return cid === sid || code === sid;
        });
        return council ? council.name_th || council.MEMBER_GROUP_NAME || "" : "";
      }),
    }));
  };

  // Debug: แสดงข้อมูลที่ได้รับ
  useEffect(() => {
    console.log("=== IndustrialGroupSection Debug ===");
    console.log("industrialGroups:", industrialGroups);
    console.log("provincialChapters:", provincialChapters);
    console.log("formData.industrialGroupId:", formData.industrialGroupId);
    console.log("formData.provincialChapterId:", formData.provincialChapterId);
  }, [industrialGroups, provincialChapters, formData]);

  // ✅ เตรียมข้อมูล options ให้ถูกต้อง
  const industrialGroupOptions = () => {
    if (industrialGroups?.data) {
      return industrialGroups.data.map((group) => ({
        id: group.MEMBER_GROUP_CODE,
        name_th: group.MEMBER_GROUP_NAME,
      }));
    }
    if (Array.isArray(industrialGroups)) {
      return industrialGroups.map((group) => ({
        id: group.id || group.MEMBER_GROUP_CODE,
        name_th: group.name_th || group.MEMBER_GROUP_NAME,
      }));
    }
    return [];
  };

  const provincialChapterOptions = () => {
    if (provincialChapters?.data) {
      return provincialChapters.data.map((chapter) => ({
        id: chapter.id || chapter.MEMBER_GROUP_CODE,
        name_th: chapter.name_th || chapter.MEMBER_GROUP_NAME,
      }));
    }
    if (Array.isArray(provincialChapters)) {
      return provincialChapters.map((chapter) => ({
        id: chapter.id,
        name_th: chapter.name_th,
      }));
    }
    return [];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
        </h3>
        <p className="text-blue-100 text-sm mt-1">เลือกกลุ่มอุตสาหกรรมและสภาจังหวัดที่เกี่ยวข้อง</p>
      </div>

      {/* Content Section */}
      <div className="px-8 py-8 overflow-visible relative">
        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">การเลือกกลุ่มอุตสาหกรรม</p>
              <p className="text-sm text-blue-700 mt-1">
                สามารถเลือกได้มากกว่า 1 รายการ
                เพื่อระบุกลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัดที่บริษัทมีส่วนเกี่ยวข้อง
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
                  options={industrialGroupOptions()}
                  selectedValues={getSafeSelectedIds(formData.industrialGroupId)}
                  onChange={handleIndustrialGroupChange}
                  isLoading={isLoading}
                  error={errors?.industrialGroupId || errors?.industrialGroupIds}
                  placeholder="เลือกกลุ่มอุตสาหกรรม"
                  label=""
                />
              </div>
              {(errors?.industrialGroupId || errors?.industrialGroupIds) && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.industrialGroupId || errors.industrialGroupIds}
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
                  options={provincialChapterOptions()}
                  selectedValues={getSafeSelectedIds(formData.provincialChapterId)}
                  onChange={handleProvincialCouncilChange}
                  isLoading={isLoading}
                  error={errors?.provincialChapterId || errors?.provincialCouncilIds}
                  placeholder="เลือกสภาอุตสาหกรรมจังหวัด"
                  label=""
                />
              </div>
              {(errors?.provincialChapterId || errors?.provincialCouncilIds) && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.provincialChapterId || errors.provincialCouncilIds}
                </p>
              )}
            </div>
          </div>

          {/* Selected Items Display */}
          {(formData.industrialGroupId?.length > 0 || formData.provincialChapterId?.length > 0) && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900">รายการที่เลือก</h5>
                  <div className="flex-1"></div>
                  <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {(formData.industrialGroupId?.length || 0) +
                      (formData.provincialChapterId?.length || 0)}{" "}
                    รายการ
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Industrial Groups Selected */}
                  {formData.industrialGroupId?.length > 0 && (
                    <div className="group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                        <p className="text-sm font-semibold text-gray-800">กลุ่มอุตสาหกรรม</p>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                          {formData.industrialGroupId.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {formData.industrialGroupId.map((id) => {
                          const sid = id != null ? id.toString() : "";
                          let group = null;
                          if (industrialGroups?.data) {
                            group = industrialGroups.data.find((g) => {
                              const code =
                                g?.MEMBER_GROUP_CODE != null ? g.MEMBER_GROUP_CODE.toString() : "";
                              const gid = g?.id != null ? g.id.toString() : "";
                              return code === sid || gid === sid;
                            });
                          } else if (Array.isArray(industrialGroups)) {
                            group = industrialGroups.find((g) => {
                              const gid = g?.id != null ? g.id.toString() : "";
                              const code =
                                g?.MEMBER_GROUP_CODE != null ? g.MEMBER_GROUP_CODE.toString() : "";
                              return gid === sid || code === sid;
                            });
                          }
                          return group ? (
                            <div
                              key={id}
                              className="group/tag relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                            >
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium">
                                {group.MEMBER_GROUP_NAME || group.name_th}
                              </span>
                              <div className="w-0.5 h-4 bg-blue-300 rounded-full opacity-0 group-hover/tag:opacity-100 transition-opacity"></div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Provincial Chapters Selected */}
                  {formData.provincialChapterId?.length > 0 && (
                    <div className="group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                        <p className="text-sm font-semibold text-gray-800">สภาอุตสาหกรรมจังหวัด</p>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          {formData.provincialChapterId.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {formData.provincialChapterId.map((id) => {
                          const chapter = Array.isArray(provincialChapters)
                            ? provincialChapters.find((c) => c.id === id)
                            : provincialChapters?.data?.find(
                                (c) => c.id === id || c.MEMBER_GROUP_CODE === id,
                              );
                          return chapter ? (
                            <div
                              key={id}
                              className="group/tag relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium">
                                {chapter.name_th || chapter.MEMBER_GROUP_NAME}
                              </span>
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
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
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
  industrialGroups: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  provincialChapters: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isLoading: PropTypes.bool,
};

IndustrialGroupSection.defaultProps = {
  errors: {},
  industrialGroups: [],
  provincialChapters: [],
  isLoading: false,
};
