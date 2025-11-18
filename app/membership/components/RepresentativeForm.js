"use client";

import React from "react";
import RepresentativeCard from "./Rejected_Document/RepresentativeCard";

/**
 * Representative Form Component
 * Manages multiple representative cards with add/remove functionality
 */
export default function RepresentativeForm({
  mode = "multiple",
  representatives = [],
  representativeErrors = [],
  duplicateErrors = [],
  touchedPhones = {},
  maxRepresentatives = 3,
  showPosition = true,
  positionPlaceholder = "ตำแหน่ง",
  positionRequired = true,
  headerTitle = "ข้อมูลผู้แทน",
  headerSubtitle = "ข้อมูลผู้มีอำนาจลงนาม",
  infoMessage = "สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน",
  fieldNames = {
    firstNameTh: "firstNameTh",
    lastNameTh: "lastNameTh",
    firstNameEn: "firstNameEn",
    lastNameEn: "lastNameEn",
  },
  onUpdate,
  onAdd,
  onRemove,
  onPhoneBlur,
  refs = {},
}) {
  const canAddMore = mode === "multiple" && representatives.length < maxRepresentatives;
  const canRemove = mode === "multiple" && representatives.length > 1;

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      data-section="representative-info"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{headerTitle}</h2>
            <p className="text-blue-100 text-sm mt-1">{headerSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Info Alert (only for multiple mode) */}
        {mode === "multiple" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-blue-900 mb-2">การเพิ่มผู้แทน</p>
                <p className="text-sm text-blue-700 leading-relaxed">{infoMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Representative Cards */}
        <div className="space-y-8">
          {representatives.map((rep, index) => (
            <RepresentativeCard
              key={rep.id}
              representative={rep}
              index={index}
              showRemoveButton={canRemove}
              showPosition={showPosition}
              positionPlaceholder={positionPlaceholder}
              positionRequired={positionRequired}
              representativeErrors={
                mode === "single" ? representativeErrors : representativeErrors[index] || {}
              }
              duplicateErrors={duplicateErrors[index] || {}}
              phoneTouched={touchedPhones[rep.id]}
              fieldNames={fieldNames}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onPhoneBlur={() => onPhoneBlur(rep.id)}
              refs={refs}
            />
          ))}
        </div>

        {/* Add Representative Button */}
        {canAddMore && (
          <div className="mt-8">
            <button
              type="button"
              onClick={onAdd}
              className="w-full py-4 px-6 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="font-medium">เพิ่มผู้แทน</span>
              <span className="text-sm text-blue-500">
                ({representatives.length}/{maxRepresentatives})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
