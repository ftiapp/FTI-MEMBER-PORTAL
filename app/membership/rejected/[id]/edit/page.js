"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import LoadingOverlay from "../../../components/LoadingOverlay";
import RejectedApplicationHeader from "../../../components/RejectedApplicationHeader";
import RejectedApplicationForm from "../../../components/RejectedApplicationForm";
import RejectedApplicationFormSinglePage from "../../../components/RejectedApplicationFormSinglePage";
import RejectedConversations from "../../../components/RejectedConversations";
import RejectionConversationsTable from "../../../components/RejectionConversationsTable";
import RejectedActions from "../../../components/RejectedActions";

// Centralized data mapping function
import { mapRejectionDataToForm } from "../../../utils/rejectionDataMappers";

export default function EditRejectedApplication() {
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
      oc: "สามัญ-โรงงาน (OC)",
      ac: "สมทบ-นิติบุคคล (AC)",
      am: "สามัญ-สมาคมการค้า (AM)",
      ic: "สมทบ-บุคคลธรรมดา (IC)",
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

  const handleEditInForm = () => {
    // Navigate to the appropriate membership form with the rejection data
    const membershipType = rejectedApp.membershipType;
    const editUrl = `/membership/${membershipType}/edit-rejected/${params.id}`;
    router.push(editUrl);
  };

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
                แก้ไขใบสมัครที่ถูกปฏิเสธ
              </h1>
              <motion.div
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-red-100 max-w-3xl mx-auto">
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

  if (!rejectedApp) {
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
                แก้ไขใบสมัครที่ถูกปฏิเสธ
              </h1>
              <motion.div
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-red-100 max-w-3xl mx-auto">
                ไม่พบข้อมูลใบสมัครที่ถูกปฏิเสธ
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <p className="text-gray-600 mb-4">ไม่พบข้อมูลใบสมัครที่ถูกปฏิเสธ</p>
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
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-16">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          {/* Edit icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg
                width="200"
                height="200"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              แก้ไขใบสมัครที่ถูกปฏิเสธ
            </h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <p className="text-lg md:text-xl text-center text-red-100 max-w-3xl mx-auto">
              {getMembershipTypeLabel(rejectedApp.membershipType)} - {rejectedApp.applicationName}
            </p>
          </div>
        </div>

        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Rejection Header */}
            <RejectedApplicationHeader
              rejectedApp={rejectedApp}
              membershipTypeLabel={getMembershipTypeLabel(rejectedApp.membershipType)}
            />

            {/* Conversations Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">ประวัติการสื่อสาร</h2>
                <p className="text-gray-600 mb-6">
                  ข้อมูลการติดต่อระหว่างผู้สมัครและฝ่ายทะเบียนสมาชิก
                </p>
                <RejectionConversationsTable rejectionId={rejectedApp.rejectId} />
              </div>
            </motion.div>

            {/* Form - Single Page View */}
            <RejectedApplicationFormSinglePage
              membershipType={rejectedApp.membershipType}
              formData={formData}
              setFormData={setFormData}
              rejectedApp={rejectedApp}
            />

            {/* Actions */}
            <RejectedActions
              rejectionId={rejectedApp.rejectId}
              membershipType={rejectedApp.membershipType}
              status={rejectedApp.status}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
