"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import LoadingOverlay from "../../../components/LoadingOverlay";
import RejectedApplicationHeader from "../../../components/Rejected_Document/RejectedApplicationHeader";
import RejectedApplicationFormSinglePage from "../../../components/Rejected_Document/RejectedApplicationFormSinglePage";
import RejectionConversationsTable from "../../../components/Rejected_Document/RejectionConversationsTable";
import RejectedActions from "../../../components/Rejected_Document/RejectedActions";

// Centralized data mapping function
import { mapRejectionDataToForm } from "../../../utils/rejectionDataMappers";

export default function EditRejectedOC() {
  const params = useParams();
  const router = useRouter();
  const [rejectedApp, setRejectedApp] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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
      fetchRejectedApplication();
    }
  }, [params.id]);

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/membership/rejected-applications/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setRejectedApp(result.data);

        // Map rejection data to form data based on membership type
        if (result.data.rejectionData) {
          console.log("📦 Raw rejectionData from API:", result.data.rejectionData);
          const mapped = mapRejectionDataToForm(
            result.data.membershipType,
            result.data.rejectionData,
          );
          console.log("🎯 Mapped formData:", mapped);
          console.log("📍 Address fields:", {
            addressNumber: mapped.addressNumber,
            street: mapped.street,
            province: mapped.province,
          });
          console.log("👥 ContactPersons:", mapped.contactPersons);
          setFormData(mapped);
        }
      } else {
        setError(result.message || "Failed to fetch rejected application");
      }
    } catch (error) {
      console.error("Error fetching rejected application:", error);
      setError("Failed to fetch rejected application");
    } finally {
      setLoading(false);
    }
  };

  const getMembershipTypeLabel = (type) => {
    const labels = {
      oc: "สามัญ-โรงงาน",
      ac: "สมทบ-นิติบุคคล",
      am: "สามัญ-สมาคมการค้า",
      ic: "สมทบ-บุคคลธรรมดา",
    };
    return labels[type] || type.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
              </>
            )}

            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                แก้ไขใบสมัครสมาชิกที่ถูกปฏิเสธ
              </h1>
              <motion.div
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-blue-100 max-w-3xl mx-auto">
                กำลังโหลดข้อมูลใบสมัครที่ถูกปฏิเสธ
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
              </>
            )}

            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                แก้ไขใบสมัครสมาชิกที่ถูกปฏิเสธ
              </h1>
              <motion.div
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-blue-100 max-w-3xl mx-auto">
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => router.push("/dashboard?tab=membership")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                กลับไปหน้าหลัก
              </button>
            </div>
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
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              แก้ไขใบสมัครสามัญ OC ที่ถูกปฏิเสธ
            </h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <p className="text-lg md:text-xl text-center text-blue-100 max-w-3xl mx-auto">
              สามัญ-โรงงาน (OC)
            </p>
          </div>
        </div>

        <div className="py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <RejectedApplicationHeader
              rejectedApp={rejectedApp}
              membershipTypeLabel={getMembershipTypeLabel(rejectedApp?.membershipType)}
              formatDate={formatDate}
            />

            {/* Conversations Table */}
            <RejectionConversationsTable rejectionId={rejectedApp?.rejectId} />

            {/* Form - Single Page View */}
            <RejectedApplicationFormSinglePage
              membershipType={rejectedApp?.membershipType}
              formData={formData}
              setFormData={setFormData}
              rejectedApp={rejectedApp}
            />

            {/* Actions */}
            <RejectedActions
              rejectionId={rejectedApp?.rejectId}
              membershipType={rejectedApp?.membershipType}
              status={rejectedApp?.status}
              formData={formData}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
