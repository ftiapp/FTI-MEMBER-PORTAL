import React from "react";
import ApplicantInfoSection from "../../../components/sections/ApplicantInfoSection";
import CompanyInfoSection from "../../../components/sections/CompanyInfoSection";
import ContactPersonSection from "../../../components/sections/ContactPersonSection";
import AddressSection from "../../../components/sections/AddressSection";
import RepresentativesSection from "../../../components/sections/RepresentativesSection";
import IndustrialGroupsSection from "../../../components/sections/IndustrialGroupsSection";
import FinancialInfoSection from "../../../components/sections/FinancialInfoSection";
import ProductsSection from "../../../components/sections/ProductsSection";
import DocumentsSection from "../../../components/sections/DocumentsSection";
import AdminActionsSection from "../../../components/sections/AdminActionsSection";

const DetailView = ({
  application,
  type,
  industrialGroups,
  provincialChapters,
  adminNote,
  onAdminNoteChange,
  onSaveNote,
  onApprove,
  onReject,
  onOpenRejectModal,
  onViewDocument,
  isSubmitting,
  onDownload,
}) => {
  // ฟังก์ชันสำหรับอัปเดตข้อมูลแต่ละส่วน
  const handleSectionUpdate = async (section, data) => {
    try {
      const response = await fetch("/api/admin/membership-requests/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application.id,
          type: type,
          section: section,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update data");
      }

      const result = await response.json();

      if (result.success) {
        // รีเฟรชหน้าเพื่อแสดงข้อมูลใหม่
        window.location.reload();
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล: " + error.message);
      throw error;
    }
  };

  if (!application) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">ไม่พบข้อมูลใบสมัคร</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sections */}
      <CompanyInfoSection application={application} type={type} onUpdate={handleSectionUpdate} />
      <ContactPersonSection application={application} onUpdate={handleSectionUpdate} />
      <IndustrialGroupsSection
        application={application}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
        onUpdate={handleSectionUpdate}
      />
      <FinancialInfoSection application={application} type={type} onUpdate={handleSectionUpdate} />
      <RepresentativesSection application={application} onUpdate={handleSectionUpdate} />
      <AddressSection application={application} onUpdate={handleSectionUpdate} />
      <ProductsSection application={application} onUpdate={handleSectionUpdate} />
      <DocumentsSection application={application} onViewDocument={onViewDocument} />
      <ApplicantInfoSection application={application} type={type} onUpdate={handleSectionUpdate} />
      <AdminActionsSection
        application={application}
        adminNote={adminNote}
        onAdminNoteChange={onAdminNoteChange}
        onSaveNote={onSaveNote}
        onApprove={onApprove}
        onReject={onReject}
        onOpenRejectModal={onOpenRejectModal}
        isSubmitting={isSubmitting}
        type={type}
      />
    </div>
  );
};

export default DetailView;
