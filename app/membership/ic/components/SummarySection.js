"use client";

import React from "react";
import PropTypes from "prop-types";

// Simplified info card with consistent blue theme
const InfoCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
    <p className="text-sm text-gray-900">{value || "-"}</p>
  </div>
);

// Special card for business types with tags
const BusinessTypesCard = ({ title, businessTypes }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
    {businessTypes.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {businessTypes.map((type, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          >
            {type}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
    )}
  </div>
);

// Products/Services card
const ProductsCard = ({ products }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-3">สินค้า/บริการ</h4>
    {products && products.length > 0 ? (
      <div className="space-y-2">
        {products.map((product, index) => (
          <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
            <p className="text-sm font-medium">{product.nameTh || "-"}</p>
            <p className="text-xs text-gray-500">{product.nameEn || "-"}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
    )}
  </div>
);

// Representative card
// Representative card - แก้ไขเพื่อแสดง phone extension
const RepresentativeCard = ({ representative }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="mb-2">
      <h4 className="text-sm font-medium text-gray-700">ข้อมูลผู้แทน</h4>
    </div>

    {representative ? (
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-sm">
            {representative.fullNameTh ||
              `${representative.firstNameTh || representative.firstNameThai || ""} ${representative.lastNameTh || representative.lastNameThai || ""}`.trim() ||
              "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-sm">
            {representative.fullNameEn ||
              `${representative.firstNameEn || representative.firstNameEng || ""} ${representative.lastNameEn || representative.lastNameEng || ""}`.trim() ||
              "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">อีเมล</p>
          <p className="text-sm">{representative.email || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">เบอร์โทรศัพท์</p>
          <p className="text-sm">
            {representative.phone || "-"}
            {representative.phoneExtension && representative.phoneExtension.trim() && (
              <span className="text-gray-600 ml-1">ต่อ {representative.phoneExtension}</span>
            )}
          </p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
    )}
  </div>
);
// Enhanced file display with view functionality
const FileCard = ({ fileName, description, fileUrl, fileType, documentType }) => {
  const handleViewFile = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const getFileIcon = () => {
    if (fileType?.includes("pdf")) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (fileType?.includes("image")) {
      return (
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          {getFileIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{description}</p>
          <p className="text-xs text-gray-500">
            {fileName && fileName !== "ไม่ได้อัปโหลด" && fileName !== "ไม่มีเอกสาร"
              ? fileName
              : "ไม่ได้อัปโหลด"}
          </p>
        </div>
        {fileName && fileName !== "ไม่ได้อัปโหลด" && fileName !== "ไม่มีเอกสาร" && fileUrl && (
          <button
            onClick={handleViewFile}
            className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors"
            title="ดูไฟล์"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        )}
        {fileName && fileName !== "ไม่ได้อัปโหลด" && fileName !== "ไม่มีเอกสาร" && (
          <div className="w-4 h-4 text-green-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Simplified section with consistent blue theme
const Section = ({ title, children, className }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className || ""}`}>
    <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function SummarySection({
  formData,
  industrialGroups = [],
  provincialChapters = [],
  isSubmitting = false,
  onSubmit,
  onBack,
  viewMode = false, // เพิ่ม viewMode สำหรับโหมดดูข้อมูล
}) {
  const [consentAgreed, setConsentAgreed] = React.useState(false);
  // Get selected business types from database
  const getSelectedBusinessTypes = () => {
    console.log("=== Debug Business Types ===");
    console.log("formData.businessTypes:", formData.businessTypes);

    // ถ้าเป็น object (จาก BusinessInfoSection)
    if (
      formData.businessTypes &&
      typeof formData.businessTypes === "object" &&
      !Array.isArray(formData.businessTypes)
    ) {
      const BUSINESS_TYPE_MAP = {
        manufacturer: "ผู้ผลิต",
        distributor: "ผู้จัดจำหน่าย",
        importer: "ผู้นำเข้า",
        exporter: "ผู้ส่งออก",
        service: "ผู้ให้บริการ",
        other: "อื่นๆ",
      };

      const selectedTypes = Object.keys(formData.businessTypes)
        .filter((key) => formData.businessTypes[key] === true)
        .map((key) => {
          if (key === "other" && formData.otherBusinessTypeDetail) {
            return `อื่นๆ (${formData.otherBusinessTypeDetail})`;
          }
          return BUSINESS_TYPE_MAP[key] || key;
        });

      console.log("Mapped business types:", selectedTypes);
      return selectedTypes;
    }

    // ถ้าเป็น array (รูปแบบเก่า)
    if (formData.businessTypes && Array.isArray(formData.businessTypes)) {
      return formData.businessTypes.map((bt) => bt.businessTypeName || bt.id || "-");
    }

    console.log("No business types found");
    return [];
  };

  // แก้ไขฟังก์ชัน formatProducts() ให้รองรับ key
  const formatProducts = () => {
    console.log("=== Debug Products ===");
    console.log("formData.products:", formData.products);

    if (!formData.products || !Array.isArray(formData.products)) {
      console.log("No products array found");
      return [];
    }

    const formattedProducts = formData.products
      .filter((product) => product && (product.nameTh || product.nameEn)) // กรองข้อมูลที่มีเนื้อหา
      .map((product) => ({
        nameTh: product.nameTh || "-",
        nameEn: product.nameEn || "-",
      }));

    console.log("Formatted products:", formattedProducts);
    return formattedProducts;
  };

  // Helper function to get file name - รองรับทั้งโหมดสมัครและโหมดดูข้อมูล
  const getFileName = (fileObj) => {
    if (!fileObj) return "ไม่ได้อัปโหลด";

    // สำหรับโหมดดูข้อมูล (จากฐานข้อมูล)
    if (viewMode && formData.documents && Array.isArray(formData.documents)) {
      return formData.documents.length > 0 ? formData.documents[0].fileName : "ไม่มีเอกสาร";
    }

    // สำหรับโหมดสมัคร (จากฟอร์ม)
    if (typeof fileObj === "object") {
      if (fileObj instanceof File) return fileObj.name;
      if (fileObj.name) return fileObj.name;
      if (fileObj.file && fileObj.file.name) return fileObj.file.name;
    }
    return "ไฟล์ถูกอัปโหลดแล้ว";
  };
  // Helper: ชื่อ-นามสกุล (ไทย) พร้อมคำนำหน้า เช่น "นายพลวัต ศรีชนะ"
  const getDisplayNameTh = () => {
    const prefix =
      (viewMode
        ? (formData.prename_th ??
          formData.prenameTh ??
          formData.prename_other ??
          formData.prenameOther)
        : (formData.prenameTh ?? formData.prenameOther)) || "";
    const first =
      (viewMode ? (formData.firstNameTh ?? formData.firstNameThai) : formData.firstNameThai) || "";
    const last =
      (viewMode ? (formData.lastNameTh ?? formData.lastNameThai) : formData.lastNameThai) || "";
    const namePart = `${first} ${last}`.trim();
    const full = `${prefix ? prefix : ""}${namePart ? namePart : ""}`.trim();
    return full || "-";
  };

  // Helper: ชื่อ-นามสกุล (อังกฤษ) พร้อมคำนำหน้า (เว้นวรรคหลังคำนำหน้า)
  const getDisplayNameEn = () => {
    const prefix =
      (viewMode
        ? (formData.prename_en ??
          formData.prenameEn ??
          formData.prename_other ??
          formData.prenameOther)
        : (formData.prenameEn ?? formData.prenameOther)) || "";
    const first = (viewMode ? formData.firstNameEn : formData.firstNameEng) || "";
    const last = (viewMode ? formData.lastNameEn : formData.lastNameEng) || "";
    const namePart = `${first} ${last}`.trim();
    const full = `${prefix ? prefix + " " : ""}${namePart}`.trim();
    return full || "-";
  };

  // Get industrial group names from database
  const getIndustrialGroupNames = () => {
    console.log("Debug - formData.industrialGroupId:", formData.industrialGroupId);

    // อ่านจาก industrialGroupId (ที่ IndustrialGroupSection บันทึกไว้)
    if (
      formData.industrialGroupId &&
      Array.isArray(formData.industrialGroupId) &&
      formData.industrialGroupId.length > 0
    ) {
      return formData.industrialGroupId.map((id) => {
        // หาชื่อจาก industrialGroups prop
        let group = null;

        if (industrialGroups?.data) {
          group = industrialGroups.data.find((g) => g.MEMBER_GROUP_CODE === id || g.id === id);
        } else if (Array.isArray(industrialGroups)) {
          group = industrialGroups.find((g) => g.id === id || g.MEMBER_GROUP_CODE === id);
        }

        return group ? group.MEMBER_GROUP_NAME || group.name_th || String(id) : String(id);
      });
    }
    // Fallback เพิ่มเติม: ใช้จาก formData.industryGroups หาก API ใส่มาในฟอร์มโดยตรง (แสดงเฉพาะที่เลือกไว้)
    if (Array.isArray(formData.industryGroups) && formData.industryGroups.length > 0) {
      return formData.industryGroups.map(
        (g) => g.industryGroupName || g.MEMBER_GROUP_NAME || g.name_th || String(g.id),
      );
    }
    return [];
  };

  // Get provincial chapter names from database
  const getProvincialChapterNames = () => {
    console.log("Debug - formData.provincialChapterId:", formData.provincialChapterId);

    // อ่านจาก provincialChapterId (ที่ IndustrialGroupSection บันทึกไว้)
    if (
      formData.provincialChapterId &&
      Array.isArray(formData.provincialChapterId) &&
      formData.provincialChapterId.length > 0
    ) {
      return formData.provincialChapterId.map((id) => {
        // หาชื่อจาก provincialChapters prop
        let chapter = null;

        if (provincialChapters?.data) {
          chapter = provincialChapters.data.find((c) => c.MEMBER_GROUP_CODE === id || c.id === id);
        } else if (Array.isArray(provincialChapters)) {
          chapter = provincialChapters.find((c) => c.id === id || c.MEMBER_GROUP_CODE === id);
        }

        return chapter ? chapter.MEMBER_GROUP_NAME || chapter.name_th || String(id) : String(id);
      });
    }
    // Fallback เพิ่มเติม: ใช้จาก formData.provinceChapters หาก API ใส่มาในฟอร์มโดยตรง (แสดงเฉพาะที่เลือกไว้)
    if (Array.isArray(formData.provinceChapters) && formData.provinceChapters.length > 0) {
      return formData.provinceChapters.map(
        (c) => c.provinceChapterName || c.MEMBER_GROUP_NAME || c.name_th || String(c.id),
      );
    }
    return [];
  };

  // Handle submit button click
  const handleSubmitClick = (e) => {
    console.log("=== Submit button clicked in SummarySection ===");
    console.log("onSubmit function:", onSubmit);
    console.log("isSubmitting:", isSubmitting);

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // ✅ ต้องยอมรับเงื่อนไขก่อนส่ง
    if (!consentAgreed) {
      // Use React toast if available, otherwise alert
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error("กรุณายอมรับเงื่อนไขการเก็บ ใช้ และเปิดเผยข้อมูลส่วนบุคคลก่อนส่งใบสมัคร");
      } else {
        alert("กรุณายอมรับเงื่อนไขการเก็บ ใช้ และเปิดเผยข้อมูลส่วนบุคคลก่อนส่งใบสมัคร");
      }
      return;
    }

    if (onSubmit && typeof onSubmit === "function") {
      console.log("Calling onSubmit...");
      onSubmit(e);
    } else {
      console.error("onSubmit function not provided or not a function:", onSubmit);
    }
  };

  return (
    <div className="space-y-6">
      {/* ข้อมูลผู้สมัคร */}
      {/* ข้อมูลผู้สมัคร */}
      <Section title="ข้อมูลผู้สมัคร">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="เลขบัตรประจำตัวประชาชน" value={formData.idCardNumber} />
          <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={getDisplayNameTh()} />
          <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={getDisplayNameEn()} />
          <InfoCard title="อีเมล" value={formData.email} />
          <InfoCard title="เบอร์โทรศัพท์" value={formData.phone} />
          <InfoCard title="ต่อ" value={formData.phoneExtension} />
        </div>
      </Section>

      {/* ที่อยู่ */}
      <Section title="ที่อยู่" className="mt-6">
        {(() => {
          const addressLabels = {
            2: "ที่อยู่จัดส่งเอกสาร",
            1: "ที่อยู่สำนักงาน",
            3: "ที่อยู่ใบกำกับภาษี",
          };

          // Helper to render single address block
          const renderAddressBlock = (type) => {
            const addressData =
              formData.addresses && formData.addresses[type] ? formData.addresses[type] : {};
            const get = (field, fallback = "-") => (addressData[field] ?? fallback) || fallback;
            return (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">{addressLabels[type]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoCard title="เลขที่" value={get("addressNumber")} />
                  <InfoCard title="อาคาร/หมู่บ้าน" value={get("building")} />
                  <InfoCard title="หมู่" value={get("moo")} />
                  <InfoCard title="ซอย" value={get("soi")} />
                  <InfoCard
                    title="ถนน"
                    value={
                      (addressData.street && String(addressData.street).trim()) ||
                      (addressData.road && String(addressData.road).trim()) ||
                      "-"
                    }
                  />
                  <InfoCard title="ตำบล/แขวง" value={get("subDistrict")} />
                  <InfoCard title="อำเภอ/เขต" value={get("district")} />
                  <InfoCard title="จังหวัด" value={get("province")} />
                  <InfoCard title="รหัสไปรษณีย์" value={get("postalCode")} />
                  <InfoCard title="โทรศัพท์" value={get("phone", formData.phone || "-")} />
                  <InfoCard title="ต่อ" value={get("phoneExtension")} />
                  <InfoCard title="อีเมล" value={get("email", formData.email || "-")} />
                  <InfoCard title="เว็บไซต์" value={get("website", formData.website || "-")} />
                </div>
              </div>
            );
          };

          // New multi-address format: always render 3 sections in fixed order
          if (formData.addresses && typeof formData.addresses === "object") {
            return (
              <div className="space-y-6">{["2", "1", "3"].map((t) => renderAddressBlock(t))}</div>
            );
          }

          // Fallback for old single address format
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="เลขที่" value={formData.address?.addressNumber || "-"} />
              <InfoCard title="หมู่" value={formData.address?.moo || "-"} />
              <InfoCard title="ซอย" value={formData.address?.soi || "-"} />
              <InfoCard
                title="ถนน"
                value={
                  formData.address?.street ||
                  formData.address?.road ||
                  formData.street ||
                  formData.road ||
                  "-"
                }
              />
              <InfoCard title="ตำบล/แขวง" value={formData.address?.subDistrict || "-"} />
              <InfoCard title="อำเภอ/เขต" value={formData.address?.district || "-"} />
              <InfoCard title="จังหวัด" value={formData.address?.province || "-"} />
              <InfoCard title="รหัสไปรษณีย์" value={formData.address?.postalCode || "-"} />
            </div>
          );
        })()}
      </Section>

      {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
      <Section title="กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">กลุ่มอุตสาหกรรม</h4>
            {getIndustrialGroupNames().length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getIndustrialGroupNames().map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">สภาอุตสาหกรรมจังหวัด</h4>
            {getProvincialChapterNames().length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getProvincialChapterNames().map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
            )}
          </div>
        </div>
      </Section>

      {/* ข้อมูลผู้แทน */}
      <Section title="ข้อมูลผู้แทน">
        <div className="grid grid-cols-1 gap-4">
          <RepresentativeCard representative={formData.representative} />
        </div>
      </Section>

      {/* ข้อมูลธุรกิจ */}
      <Section title="ข้อมูลธุรกิจ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BusinessTypesCard title="ประเภทธุรกิจ" businessTypes={getSelectedBusinessTypes()} />
          <ProductsCard products={formatProducts()} />
        </div>
      </Section>

      {/* เอกสารแนบ */}
      <Section title="เอกสารแนบ">
        <div className="space-y-3">
          {viewMode && formData.documents && formData.documents.length > 0 ? (
            // โหมดดูข้อมูล - แสดงเอกสารจากฐานข้อมูล
            formData.documents.map((doc, index) => (
              <FileCard
                key={index}
                fileName={doc.fileName || doc.original_name || "ไม่ทราบชื่อไฟล์"}
                description={
                  doc.documentType === "id_card"
                    ? "สำเนาบัตรประชาชน"
                    : doc.document_type || "เอกสารแนบ"
                }
                fileUrl={doc.fileUrl || doc.cloudinary_url || doc.file_path}
                fileType={doc.fileType || doc.mime_type}
                documentType={doc.documentType || doc.document_type}
              />
            ))
          ) : (
            // โหมดสมัคร - แสดงเอกสารจากฟอร์ม
            <>
              <FileCard
                fileName={getFileName(formData.idCardDocument)}
                description="สำเนาบัตรประชาชน"
                fileUrl={
                  formData.idCardDocument?.file
                    ? URL.createObjectURL(formData.idCardDocument.file)
                    : null
                }
                fileType={formData.idCardDocument?.file?.type}
                documentType="id_card"
              />
              <FileCard
                fileName={getFileName(formData.authorizedSignature)}
                description="ลายเซ็นผู้มีอำนาจลงนาม"
                fileUrl={
                  formData.authorizedSignature?.file
                    ? URL.createObjectURL(formData.authorizedSignature.file)
                    : null
                }
                fileType={formData.authorizedSignature?.file?.type}
                documentType="authorized_signature"
              />
            </>
          )}
        </div>
      </Section>

      {/* ปุ่มนำทางและส่งข้อมูล */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          {viewMode ? (
            // โหมดดูข้อมูล - แสดงสถานะใบสมัคร
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">สถานะใบสมัคร</h3>
              <div className="mb-6">
                {formData.status === 0 && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    รอพิจารณา
                  </div>
                )}
                {formData.status === 1 && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    อนุมัติแล้ว
                  </div>
                )}
                {formData.status === 2 && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    ปฏิเสธ
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-6">
                ข้อมูลใบสมัครที่ส่งเมื่อวันที่{" "}
                {formData.createdAt
                  ? new Date(formData.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>
              <button
                type="button"
                onClick={() => window.close()}
                className="px-6 py-3 rounded-xl font-semibold text-base bg-gray-500 hover:bg-gray-600 hover:shadow-lg text-white transition-all duration-200"
              >
                ปิดหน้าต่าง
              </button>
            </>
          ) : (
            // โหมดสมัคร - แสดงปุ่ม Submit
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ยืนยันการส่งข้อมูล</h3>
              <p className="text-sm text-gray-600 mb-6">
                กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนกดส่ง หลังจากส่งแล้วจะไม่สามารถแก้ไขได้
              </p>

              {/* Consent Checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                  />
                  <span>
                    ข้าพเจ้าตกลงและยินยอมให้ สภาอุตสาหกรรมแห่งประเทศไทย เก็บ รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อวัตถุประสงค์ในการ [เช่น การติดต่อสื่อสาร การให้บริการ หรือการทำการตลาด] ทั้งนี้ ข้าพเจ้าสามารถเพิกถอนความยินยอมเมื่อใดก็ได้ ตามช่องทางที่องค์กรกำหนดไว้
                  </span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Back Button */}
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                      isSubmitting
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-gray-500 hover:bg-gray-600 hover:shadow-lg text-white"
                    }`}
                  >
                    ← ย้อนกลับ
                  </button>
                )}

                {/* Submit Button */}
                {onSubmit && (
                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={isSubmitting || !consentAgreed}
                    className={`px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                      isSubmitting || !consentAgreed
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-green-600 hover:bg-green-700 hover:shadow-lg text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        กำลังส่งข้อมูล...
                      </span>
                    ) : (
                      "✓ ส่งข้อมูลสมัครสมาชิก"
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

SummarySection.propTypes = {
  formData: PropTypes.shape({
    idCardNumber: PropTypes.string,
    prenameTh: PropTypes.string,
    prenameEn: PropTypes.string,
    prenameOther: PropTypes.string,
    firstNameThai: PropTypes.string,
    lastNameThai: PropTypes.string,
    firstNameEng: PropTypes.string,
    lastNameEng: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    addressNumber: PropTypes.string,
    moo: PropTypes.string,
    soi: PropTypes.string,
    road: PropTypes.string,
    subDistrict: PropTypes.string,
    district: PropTypes.string,
    province: PropTypes.string,
    postalCode: PropTypes.string,
    industrialGroupId: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    provincialChapterId: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    representative: PropTypes.object,
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
    products: PropTypes.array,
    idCardDocument: PropTypes.object,
  }).isRequired,
  industrialGroups: PropTypes.array,
  provincialChapters: PropTypes.array,
  isSubmitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};
