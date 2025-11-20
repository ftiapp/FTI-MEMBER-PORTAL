"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ACStepIndicator from "@/app/membership/ac/components/ACStepIndicator";
import ACMembershipForm from "@/app/membership/ac/components/ACMembershipForm";
import { submitACMembershipDocumentsUpdate } from "@/app/membership/ac/components/ACFormSubmission";

export default function EditACApplicationV4() {
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
          const commentRes = await fetch(`/api/membership/ac/${params.id}/comment`, {
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

        const res = await fetch(`/api/membership/ac-v4/${params.id}/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData: data }),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          return {
            success: false,
            message: result.message || "ไม่สามารถบันทึกการแก้ไขใบสมัครได้",
          };
        }

        const docResult = await submitACMembershipDocumentsUpdate(data, params.id);
        if (!docResult.success) {
          return {
            success: false,
            message: docResult.message || "ไม่สามารถอัปเดตเอกสารแนบได้",
          };
        }

        return {
          success: true,
          message:
            docResult.message || result.message || "บันทึกการแก้ไขใบสมัครเรียบร้อยแล้ว",
        };
      } catch (e) {
        console.error("[AC-V4] Edit submit error:", e);
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

      const res = await fetch(`/api/membership/ac/summary/${params.id}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || "ไม่สามารถโหลดข้อมูลใบสมัครได้");
      }

      if (!result.data) {
        throw new Error("ไม่พบข้อมูลใบสมัคร");
      }

      setFormData(result.data || {});
    } catch (e) {
      console.error("[AC-V4] Load error:", e);
      setError(e.message || "ไม่สามารถโหลดข้อมูลใบสมัครได้");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "ข้อมูลบริษัท" },
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
              แก้ไขใบสมัครวิสามัญ (AC) จากข้อมูลระบบหลัก
            </h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <p className="text-lg md:text-xl text-center text-blue-100 max-w-3xl mx-auto">
              แบบฟอร์มหลายขั้นตอน พร้อมข้อมูลพื้นฐานที่ดึงจากตาราง MemberRegist_AC_Main (ID: {params.id})
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
              <ACStepIndicator steps={steps} currentStep={currentStep} />
            </div>
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

            <div className="relative z-10">
              <ACMembershipForm
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                formData={formData}
                setFormData={setFormData}
                totalSteps={steps.length}
                isSinglePageLayout={false}
                userComment={formData.userResubmissionComment}
                rejectionId={null}
                isEditMode={true}
              />
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
