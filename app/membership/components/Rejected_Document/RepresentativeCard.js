"use client";

import React from "react";
import RepresentativeNameFields from "../RepresentativeNameFields";
import RepresentativeContactFields from "./RepresentativeContactFields";
import { getFieldError } from "../../utils/representativeValidation";

/**
 * Representative Card Component
 * Displays a single representative's information in a card layout
 */
export default function RepresentativeCard({
  representative,
  index,
  showRemoveButton = false,
  showPosition = true,
  positionPlaceholder = "ตำแหน่ง",
  positionRequired = true,
  representativeErrors = {},
  duplicateErrors = {},
  phoneTouched = false,
  fieldNames = {
    firstNameTh: "firstNameTh",
    lastNameTh: "lastNameTh",
    firstNameEn: "firstNameEn",
    lastNameEn: "lastNameEn",
  },
  onUpdate,
  onRemove,
  onPhoneBlur,
  refs = {},
}) {
  const handleUpdate = (field, value) => {
    onUpdate(representative.id, field, value);
  };

  const handleRemove = () => {
    onRemove(representative.id);
  };

  const errors = representativeErrors || {};
  const dupErrors = duplicateErrors || {};

  return (
    <div
      data-rep-index={index}
      className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
    >
      {/* Card Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ผู้แทนคนที่ {index + 1}</h3>
            </div>
          </div>

          {showRemoveButton && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">ลบ</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="space-y-8">
          {/* Name Fields */}
          <RepresentativeNameFields
            representative={representative}
            index={index}
            isRequired={index === 0}
            errors={errors}
            duplicateErrors={dupErrors}
            fieldNames={fieldNames}
            onUpdate={handleUpdate}
            refs={refs}
          />

          {/* Contact Fields */}
          <RepresentativeContactFields
            representative={representative}
            errors={errors}
            showPosition={showPosition}
            positionPlaceholder={positionPlaceholder}
            positionRequired={positionRequired}
            phoneTouched={phoneTouched}
            onUpdate={handleUpdate}
            onPhoneBlur={onPhoneBlur}
          />
        </div>
      </div>
    </div>
  );
}
