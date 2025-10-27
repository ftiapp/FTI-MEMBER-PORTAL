"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApiData } from "../hooks/useApiData";
import OCCompanyInfoSection from "../oc/components/CompanyInfoSection";
import RepresentativeInfoSection from "./RepresentativeInfoSection";
import OCBusinessInfoSection from "../oc/components/BusinessInfoSection";
import OCDocumentUploadSection from "../oc/components/DocumentUploadSection";
// IC components
import ApplicantInfoSection from "../ic/components/ApplicantInfoSection";
import ICBusinessInfoSection from "../ic/components/BusinessInfoSection";
import ICDocumentUploadSection from "../ic/components/DocumentUploadSection";

export default function RejectedApplicationFormSinglePage({ 
  membershipType, 
  formData, 
  setFormData,
  rejectedApp 
}) {
  const [errors, setErrors] = useState({});
  
  // Fetch API data for dropdowns
  const { businessTypes, industrialGroups, provincialChapters, isLoading: apiLoading } = useApiData();

  // Render all sections based on membership type
  const renderAllSections = () => {
    switch (membershipType) {
      case 'oc':
        return (
          <div className="space-y-8">
            {/* Step 1: Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  1. ข้อมูลบริษัท
                </h3>
              </div>
              <OCCompanyInfoSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                industrialGroups={industrialGroups}
                provincialChapters={provincialChapters}
              />
            </motion.div>

            {/* Step 2: Representatives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  2. ข้อมูลผู้แทน
                </h3>
              </div>
              <RepresentativeInfoSection
                mode="multiple"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </motion.div>

            {/* Step 3: Business Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  3. ข้อมูลธุรกิจ
                </h3>
              </div>
              <OCBusinessInfoSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                businessTypes={businessTypes}
                industrialGroups={industrialGroups}
                provincialChapters={provincialChapters}
              />
            </motion.div>

            {/* Step 4: Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  4. เอกสารแนบ
                </h3>
              </div>
              <OCDocumentUploadSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </motion.div>
          </div>
        );
      
      case 'ic':
        return (
          <div className="space-y-8">
            {/* Step 1: Applicant Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-purple-900">
                  1. ข้อมูลผู้สมัคร/บริษัท
                </h3>
              </div>
              <ApplicantInfoSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
              />
            </motion.div>

            {/* Step 2: Representatives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-purple-900">
                  2. ข้อมูลผู้แทน
                </h3>
              </div>
              <RepresentativeInfoSection
                mode="single"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </motion.div>

            {/* Step 3: Business Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-purple-900">
                  3. ข้อมูลธุรกิจ
                </h3>
              </div>
              <ICBusinessInfoSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                businessTypes={businessTypes}
              />
            </motion.div>

            {/* Step 4: Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-4">
                <h3 className="text-lg font-semibold text-purple-900">
                  4. เอกสารแนบ
                </h3>
              </div>
              <ICDocumentUploadSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </motion.div>
          </div>
        );
      
      case 'ac':
      case 'am':
        return (
          <div className="text-center py-8 text-gray-500">
            <p>กำลังพัฒนาสำหรับ {membershipType.toUpperCase()}</p>
          </div>
        );
      
      default:
        return <div className="text-red-500">ไม่รองรับประเภทสมาชิกนี้</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          แก้ไขข้อมูลใบสมัคร
        </h2>
        <p className="text-gray-600">
          กรุณาตรวจสอบและแก้ไขข้อมูลตามที่ผู้ดูแลระบบแนะนำ
        </p>
      </div>

      {renderAllSections()}
    </div>
  );
}
