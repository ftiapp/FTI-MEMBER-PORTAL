import React from "react";
import ApplicantInfoSection from "../../../components/sections/ApplicantInfoSection";
import CompanyInfoSection from "../../../components/sections/CompanyInfoSection";
import ContactPersonSection from "../../../components/sections/ContactPersonSection";
import AddressSection from "../../../components/sections/AddressSection";
import RepresentativesSection from "../../../components/sections/RepresentativesSection";
import IndustrialGroupsSection from "../../../components/sections/IndustrialGroupsSection";
import FinancialInfoSection from "../../../components/sections/FinancialInfoSection";
import BusinessInfoSection from "../../../components/sections/BusinessInfoSection";
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
  updateApplication, // Add callback to update application state
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
        const text = await response.text();
        let msg = `Failed to update data (HTTP ${response.status})`;
        try {
          const json = JSON.parse(text || "{}");
          msg = json.error || json.message || json.details || msg;
        } catch {}
        throw new Error(msg);
      }

      // Gracefully handle empty or non-JSON responses (e.g., 204 No Content)
      const text = await response.text();
      let result = { success: true };
      if (text && text.trim().length > 0) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          // If server returned non-JSON but request succeeded, consider it success
          result = { success: true };
        }
      }

      if (result && result.success) {
        // Update application state immediately without reloading
        if (updateApplication) {
          // Merge the updated data into application state
          updateApplication({ ...data });
        }
        return result;
      } else {
        throw new Error((result && (result.error || result.message)) || "Update failed");
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
      <BusinessInfoSection application={application} onUpdate={handleSectionUpdate} />
      <DocumentsSection application={application} onViewDocument={onViewDocument} type={type} />
      <ApplicantInfoSection application={application} type={type} onUpdate={handleSectionUpdate} />
      <AdminActionsSection
        application={application}
        adminNote={adminNote}
        setAdminNote={onAdminNoteChange}
        handleSaveNote={onSaveNote}
        handleApprove={onApprove}
        handleReject={onReject}
        isSubmitting={isSubmitting}
        type={type}
      />
    </div>
  );
};

export default DetailView;
