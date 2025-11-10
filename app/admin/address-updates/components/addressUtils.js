"use client";

import { format } from "date-fns";
import { th } from "date-fns/locale";

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return format(date, "d MMMM yyyy, HH:mm น.", { locale: th });
};

// Get language label
export const getLanguageLabel = (addrLang) => {
  return addrLang === "en" ? "ภาษาอังกฤษ" : "ภาษาไทย";
};

// Map member type code to readable text
export const getMemberTypeName = (typeCode) => {
  const memberTypeMap = {
    "000": "สภาอุตสาหกรรม",
    100: "กลุ่มอุตสาหกรรม",
    200: "สภาอุตสาหกรรมจังหวัด",
  };
  return memberTypeMap[typeCode] || typeCode;
};

// Map member subtype code to readable text
export const getMemberSubtypeName = (typeCode) => {
  const memberSubtypeMap = {
    11: "สน (สามัญ-โรงงาน)",
    12: "สส (สมาคมการค้า)",
    21: "ทน (สมทบ-นิติบุคคล)",
    22: "ทบ (สมทบ-บุคคลธรรมดา)",
  };
  return memberSubtypeMap[typeCode] || typeCode;
};

// Map address code to readable text
export const getAddressTypeName = (addrCode) => {
  const addressTypeMap = {
    "001": "ที่อยู่สำหรับติดต่อ (ทะเบียน)",
    "002": "ที่อยู่สำหรับจัดส่งเอกสาร",
    "003": "ที่อยู่สำหรับออกใบกำกับภาษี",
  };
  return addressTypeMap[addrCode] || `ที่อยู่รหัส ${addrCode}`;
};

// Document type based on address code
export const getDocumentType = (addrCode) => {
  switch (addrCode) {
    case "001":
      return "หนังสือรับรองนิติบุคคลจากกระทรวงพาณิชย์";
    case "003":
      return "ใบทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.20)";
    default:
      return "เอกสารแนบ";
  }
};

// Format full address
export const formatFullAddress = (address) => {
  if (!address) return "ไม่มีข้อมูล";

  const parts = [];

  if (address.ADDR_NO) parts.push(`เลขที่ ${address.ADDR_NO}`);
  if (address.ADDR_MOO) parts.push(`หมู่ ${address.ADDR_MOO}`);
  if (address.ADDR_SOI) parts.push(`ซอย ${address.ADDR_SOI}`);
  if (address.ADDR_ROAD) parts.push(`ถนน ${address.ADDR_ROAD}`);
  if (address.ADDR_SUB_DISTRICT) parts.push(`แขวง/ตำบล ${address.ADDR_SUB_DISTRICT}`);
  if (address.ADDR_DISTRICT) parts.push(`เขต/อำเภอ ${address.ADDR_DISTRICT}`);
  if (address.ADDR_PROVINCE_NAME) parts.push(`จังหวัด ${address.ADDR_PROVINCE_NAME}`);
  if (address.ADDR_POSTCODE) parts.push(`รหัสไปรษณีย์ ${address.ADDR_POSTCODE}`);

  const contactInfo = [];
  if (address.ADDR_TELEPHONE) contactInfo.push(`โทรศัพท์: ${address.ADDR_TELEPHONE}`);
  if (address.ADDR_FAX) contactInfo.push(`แฟกซ์: ${address.ADDR_FAX}`);
  if (address.ADDR_EMAIL) contactInfo.push(`อีเมล: ${address.ADDR_EMAIL}`);
  if (address.ADDR_WEBSITE) contactInfo.push(`เว็บไซต์: ${address.ADDR_WEBSITE}`);

  return (
    <div>
      <p className="mb-2 text-black">{parts.join(" ")}</p>
      {contactInfo.length > 0 && (
        <div className="mt-2 text-sm text-black">
          {contactInfo.map((info, index) => (
            <p key={index}>{info}</p>
          ))}
        </div>
      )}
    </div>
  );
};

// Find changes between old and new addresses
export const findChanges = (oldAddress, compareAddress) => {
  const changes = [];

  const fieldLabels = {
    ADDR_NO: "เลขที่",
    ADDR_MOO: "หมู่ที่",
    ADDR_SOI: "ซอย",
    ADDR_ROAD: "ถนน",
    ADDR_SUB_DISTRICT: "แขวง/ตำบล",
    ADDR_DISTRICT: "เขต/อำเภอ",
    ADDR_PROVINCE_NAME: "จังหวัด",
    ADDR_POSTCODE: "รหัสไปรษณีย์",
    ADDR_TELEPHONE: "โทรศัพท์",
    ADDR_FAX: "แฟกซ์",
    ADDR_EMAIL: "อีเมล",
    ADDR_WEBSITE: "เว็บไซต์",
  };

  Object.keys(fieldLabels).forEach((field) => {
    // Safely compare values, handling null/undefined cases
    const oldValue = oldAddress[field];
    const newValue = compareAddress[field];

    if (oldValue !== newValue) {
      changes.push({
        field: fieldLabels[field],
        oldValue: oldValue || "-",
        newValue: newValue || "-",
      });
    }
  });

  return changes;
};

// Preview helpers
export const isPDF = (u = "") => (u || "").toLowerCase().endsWith(".pdf");
export const isImage = (u = "") => {
  const exts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
  const l = (u || "").toLowerCase();
  return exts.some((ext) => l.endsWith(ext));
};
