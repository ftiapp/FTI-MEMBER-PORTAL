"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ICMembershipForm from "@/app/membership/ic/components/ICMembershipForm";
import ICStepIndicator from "@/app/membership/ic/components/ICStepIndicator";
import MembershipConversationHistory from "@/app/membership/components/MembershipConversationHistory";
import { INITIAL_FORM_DATA } from "@/app/membership/ic/components/ICMembershipForm/constants";
import { submitICMembershipDocumentsUpdate } from "@/app/membership/ic/components/ICFormSubmission";

export default function EditICApplicationV4() {
  const params = useParams();
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleEditSubmit = useCallback(
    async (data) => {
      try {
        const comment = data.userResubmissionComment;
        if (comment && comment.trim()) {
          const commentRes = await fetch(`/api/membership/ic/${params.id}/comment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: comment }),
          });

          const commentResult = await commentRes.json();
          if (!commentRes.ok || !commentResult.success) {
            return {
              success: false,
              message:
                commentResult.message ||
                "ไม่สามารถส่งข้อความถึงผู้ดูแลระบบได้ กรุณาลองใหม่อีกครั้ง",
            };
          }
        } else {
          return {
            success: false,
            message: "กรุณาระบุข้อความถึงผู้ดูแลระบบก่อนยืนยันการส่ง",
          };
        }

        // Normalize business info fields before sending to API
        const normalizedData = { ...data };

        // Ensure industrialGroupId has the selected IDs (copy from industrialGroupIds if needed)
        if (!normalizedData.industrialGroupId && normalizedData.industrialGroupIds) {
          normalizedData.industrialGroupId = normalizedData.industrialGroupIds;
        }

        // Ensure provincialChapterId has the selected IDs (copy from provincialChapterIds if needed)
        if (!normalizedData.provincialChapterId && normalizedData.provincialChapterIds) {
          normalizedData.provincialChapterId = normalizedData.provincialChapterIds;
        }

        const res = await fetch(`/api/membership/ic-v4/${params.id}/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData: normalizedData }),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          return {
            success: false,
            message: result.message || "ไม่สามารถบันทึกการแก้ไขใบสมัครได้",
          };
        }

        const docResult = await submitICMembershipDocumentsUpdate(data, params.id);
        if (!docResult.success) {
          return {
            success: false,
            message: docResult.message || "ไม่สามารถอัปเดตเอกสารแนบได้",
          };
        }

        return {
          success: true,
          message: docResult.message || result.message || "บันทึกการแก้ไขใบสมัครเรียบร้อยแล้ว",
        };
      } catch (e) {
        console.error("[IC-V4] Edit submit error:", e);
        return { success: false, message: e.message || "ไม่สามารถบันทึกการแก้ไขใบสมัครได้" };
      }
    },
    [params.id],
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/membership/ic/summary/${params.id}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || "ไม่สามารถโหลดข้อมูลใบสมัครได้");
      }

      if (!result.data) {
        throw new Error("ไม่พบข้อมูลใบสมัคร");
      }

      const data = result.data || {};

      // Map summary API data into the shape expected by ICMembershipForm
      const mappedFormData = {
        ...INITIAL_FORM_DATA,
        ...data,
        // Applicant basic info
        idCardNumber: data.idCardNumber || data.id_card_number || INITIAL_FORM_DATA.idCardNumber,
        // Prename fields (support both camelCase and snake_case from API)
        prename_th: data.prename_th || data.prenameTh || INITIAL_FORM_DATA.prename_th,
        prenameTh: data.prenameTh || data.prename_th || INITIAL_FORM_DATA.prename_th,
        prename_en: data.prename_en || data.prenameEn || INITIAL_FORM_DATA.prename_en,
        prenameEn: data.prenameEn || data.prename_en || INITIAL_FORM_DATA.prename_en,
        prename_other: data.prename_other || data.prenameOther || INITIAL_FORM_DATA.prename_other,
        prenameOther: data.prenameOther || data.prename_other || INITIAL_FORM_DATA.prename_other,
        prename_other_en:
          data.prename_other_en || data.prenameOtherEn || INITIAL_FORM_DATA.prename_other_en,
        prenameOtherEn:
          data.prenameOtherEn || data.prename_other_en || INITIAL_FORM_DATA.prename_other_en,
        firstNameThai: data.firstNameThai || data.firstNameTh || INITIAL_FORM_DATA.firstNameThai,
        lastNameThai: data.lastNameThai || data.lastNameTh || INITIAL_FORM_DATA.lastNameThai,
        firstNameEng: data.firstNameEng || data.firstNameEn || INITIAL_FORM_DATA.firstNameEng,
        lastNameEng: data.lastNameEng || data.lastNameEn || INITIAL_FORM_DATA.lastNameEng,
        phone: data.phone || INITIAL_FORM_DATA.phone,
        phoneExtension: data.phoneExtension || INITIAL_FORM_DATA.phoneExtension,
        email: data.email || INITIAL_FORM_DATA.email,
        website:
          data.website ||
          data.address?.website ||
          (data.addresses && data.addresses["2"]?.website) ||
          INITIAL_FORM_DATA.website,
        // Industrial group & provincial chapter (use first entry if arrays are provided)
        industrialGroupIds:
          data.industrialGroupIds ||
          data.industrialGroupId ||
          (Array.isArray(data.industryGroups)
            ? data.industryGroups.map((ig) => ig.id).filter(Boolean)
            : INITIAL_FORM_DATA.industrialGroupId || []),
        industrialGroupId:
          data.industrialGroupId ||
          data.industrialGroupIds ||
          (Array.isArray(data.industryGroups)
            ? data.industryGroups.map((ig) => ig.id).filter(Boolean)
            : INITIAL_FORM_DATA.industrialGroupId || []),
        // เก็บชื่อกลุ่มอุตสาหกรรมไว้ด้วยเพื่อให้ฝั่ง update ใช้บันทึกชื่อถูกต้อง
        industrialGroupNames: Array.isArray(data.industryGroups)
          ? data.industryGroups.map(
              (ig) => ig.industryGroupName || ig.industry_group_name || ig.name_th || "",
            )
          : INITIAL_FORM_DATA.industrialGroupNames || [],

        provincialChapterIds:
          data.provincialChapterIds ||
          data.provincialChapterId ||
          (Array.isArray(data.provinceChapters)
            ? data.provinceChapters.map((pc) => pc.id).filter(Boolean)
            : INITIAL_FORM_DATA.provincialChapterId || []),
        provincialChapterId:
          data.provincialChapterId ||
          data.provincialChapterIds ||
          (Array.isArray(data.provinceChapters)
            ? data.provinceChapters.map((pc) => pc.id).filter(Boolean)
            : INITIAL_FORM_DATA.provincialChapterId || []),
        // เก็บชื่อสภาจังหวัดไว้ด้วย
        provincialChapterNames: Array.isArray(data.provinceChapters)
          ? data.provinceChapters.map(
              (pc) => pc.provinceChapterName || pc.province_chapter_name || pc.name_th || "",
            )
          : INITIAL_FORM_DATA.provincialChapterNames || [],

        // Existing documents from summary API (for edit mode)
        idCardDocument: data.idCardDocument || INITIAL_FORM_DATA.idCardDocument || null,
        authorizedSignature:
          data.authorizedSignature || INITIAL_FORM_DATA.authorizedSignature || null,
      };

      // Addresses: prefer multi-address structure from API, fallback to legacy single address
      if (data.addresses && Object.keys(data.addresses).length > 0) {
        mappedFormData.addresses = {
          ...INITIAL_FORM_DATA.addresses,
          ...data.addresses,
        };
      } else if (data.address) {
        mappedFormData.addresses = {
          ...INITIAL_FORM_DATA.addresses,
          2: {
            addressType: "2",
            ...(data.address || {}),
          },
        };
      }

      setFormData(mappedFormData);
    } catch (e) {
      console.error("[IC-V4] Load error:", e);
      setError(e.message || "ไม่สามารถโหลดข้อมูลใบสมัครได้");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "ข้อมูลผู้สมัคร" },
    { id: 2, name: "ข้อมูลผู้แทน" },
    { id: 3, name: "ข้อมูลธุรกิจ" },
    { id: 4, name: "เอกสารแนบ" },
    { id: 5, name: "ยืนยันข้อมูล" },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูลใบสมัคร..." />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
            <h1 className="text-xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-700 mb-4">{error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              แก้ไข - ใบสมัครสมาชิกประเภท สมทบ-บุคคลธรรมดา
            </h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <p className="text-lg md:text-xl text-center text-blue-100 max-w-3xl mx-auto">
              ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ ทะเบียนสมาชิกจะพิจารณาคำขอของท่าน ภายใน 3-5
              วันทำการ
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-50 rounded-full -ml-20 -mb-20"></div>
              </>
            )}

            <div className="relative z-10">
              <ICStepIndicator steps={steps} currentStep={currentStep} />
            </div>
          </motion.div>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <MembershipConversationHistory membershipType="ic" membershipId={params.id} />
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            {!isMobile && (
              <>
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mt-16"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mb-24"></div>
              </>
            )}

            {/* ใช้ ICMembershipForm ตัวเดิมในโหมด external state */}
            <div className="relative z-10">
              <ICMembershipForm
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                formData={formData}
                setFormData={setFormData}
                totalSteps={steps.length}
                isEditMode={true}
                disableSaveDraft={true}
                onEditSubmit={handleEditSubmit}
              />
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
