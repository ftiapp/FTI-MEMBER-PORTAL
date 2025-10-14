"use client";

import React from "react";
import PropTypes from "prop-types";
import { useRepresentatives } from "../hooks/useRepresentatives";
import RepresentativeForm from "./RepresentativeForm";

/**
 * Unified Representative Info Section Component
 * Supports both single and multiple representative modes
 * 
 * @param {object} props
 * @param {string} props.mode - 'single' or 'multiple'
 * @param {object} props.formData - Form data object
 * @param {function} props.setFormData - Form data setter
 * @param {object} props.errors - Validation errors
 * @param {object} props.config - Configuration options
 */
export default function RepresentativeInfoSection({
  mode = "multiple",
  formData = {},
  setFormData = () => {},
  errors = {},
  config = {},
}) {
  // Default configuration
  const defaultConfig = {
    maxRepresentatives: 3,
    showPosition: true,
    positionPlaceholder: mode === "multiple" ? "ประธาน, รองประธาน..." : "ตำแหน่ง",
    headerTitle: mode === "single" ? "ข้อมูลผู้แทน" : "ข้อมูลผู้แทนสมาคม",
    headerSubtitle:
      mode === "single" ? "ข้อมูลผู้แทนที่สามารถติดต่อได้" : "ข้อมูลผู้มีอำนาจลงนามแทนสมาคม",
    infoMessage: "สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน ควรเป็นผู้มีอำนาจลงนามตามหนังสือรับรอง",
    toastId: "representative-errors",
    fieldNames: {
      firstNameTh: "firstNameTh",
      lastNameTh: "lastNameTh",
      firstNameEn: "firstNameEn",
      lastNameEn: "lastNameEn",
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Use custom hook for state management
  const {
    representatives,
    duplicateErrors,
    touchedPhones,
    addRepresentative,
    removeRepresentative,
    updateRepresentative,
    markPhoneTouched,
    refs,
  } = useRepresentatives({
    mode,
    formData,
    setFormData,
    errors,
    fieldNames: finalConfig.fieldNames,
    maxRepresentatives: finalConfig.maxRepresentatives,
    toastId: finalConfig.toastId,
  });

  return (
    <RepresentativeForm
      mode={mode}
      representatives={representatives}
      representativeErrors={errors?.representativeErrors || (mode === "single" ? {} : [])}
      duplicateErrors={duplicateErrors}
      touchedPhones={touchedPhones}
      maxRepresentatives={finalConfig.maxRepresentatives}
      showPosition={finalConfig.showPosition}
      positionPlaceholder={finalConfig.positionPlaceholder}
      headerTitle={finalConfig.headerTitle}
      headerSubtitle={finalConfig.headerSubtitle}
      infoMessage={finalConfig.infoMessage}
      fieldNames={finalConfig.fieldNames}
      onUpdate={updateRepresentative}
      onAdd={addRepresentative}
      onRemove={removeRepresentative}
      onPhoneBlur={markPhoneTouched}
      refs={refs}
    />
  );
}

RepresentativeInfoSection.propTypes = {
  mode: PropTypes.oneOf(["single", "multiple"]),
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  config: PropTypes.shape({
    maxRepresentatives: PropTypes.number,
    showPosition: PropTypes.bool,
    positionPlaceholder: PropTypes.string,
    headerTitle: PropTypes.string,
    headerSubtitle: PropTypes.string,
    infoMessage: PropTypes.string,
    toastId: PropTypes.string,
    fieldNames: PropTypes.shape({
      firstNameTh: PropTypes.string,
      lastNameTh: PropTypes.string,
      firstNameEn: PropTypes.string,
      lastNameEn: PropTypes.string,
    }),
  }),
};

RepresentativeInfoSection.defaultProps = {
  mode: "multiple",
  errors: {},
  config: {},
};