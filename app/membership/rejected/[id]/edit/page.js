"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import LoadingOverlay from "../../../components/LoadingOverlay";
// removed incorrect use() import; useParams is a hook usable directly in client components

export default function EditRejectedApplication() {
  const params = useParams();
  const router = useRouter();
  const [rejectedApp, setRejectedApp] = useState(null);
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

  const handleResubmit = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะส่งใบสมัครนี้ใหม่? ระบบจะนำใบสมัครกลับไปสู่สถานะรอพิจารณา")) {
      return;
    }

    try {
      const response = await fetch(`/api/membership/rejected-applications/${params.id}/resubmit`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        alert("ส่งใบสมัครใหม่เรียบร้อยแล้ว");
        router.push("/dashboard?tab=membership");
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error resubmitting application:", error);
      alert("เกิดข้อผิดพลาดในการส่งใบสมัครใหม่");
    }
  };

  const handleCancel = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกใบสมัครนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    try {
      const response = await fetch(`/api/membership/rejected-applications/${params.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("ยกเลิกใบสมัครเรียบร้อยแล้ว");
        router.push("/dashboard?tab=membership");
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error cancelling application:", error);
      alert("เกิดข้อผิดพลาดในการยกเลิกใบสมัคร");
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

        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">แก้ไขใบสมัครที่ถูกปฏิเสธ</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {getMembershipTypeLabel(rejectedApp.membershipType)} -{" "}
                      {rejectedApp.applicationName}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard?tab=membership")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Comments Section */}
            <div className="bg-red-50 border border-red-200 rounded-lg mb-6">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-600"
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
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                      ความเห็นของผู้ดูแลระบบ
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      วันที่ปฏิเสธ: {formatDate(rejectedApp.createdAt)}
                    </p>

                    {rejectedApp.rejectionReason && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-700 mb-1">เหตุผลการปฏิเสธ:</p>
                        <div className="bg-white border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-800">{rejectedApp.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">เลือกการดำเนินการ</h3>
                <p className="text-sm text-gray-600 mb-6">
                  คุณสามารถแก้ไขใบสมัครตามข้อเสนอแนะของผู้ดูแลระบบ หรือยกเลิกใบสมัครนี้
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleEditInForm}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>แก้ไขใบสมัคร</span>
                    </div>
                  </button>

                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>ยกเลิกใบสมัคร</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">คำแนะนำ</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• กดปุ่ม "แก้ไขใบสมัคร" เพื่อแก้ไขข้อมูลตามข้อเสนอแนะของผู้ดูแลระบบ</li>
                    <li>• กดปุ่ม "ส่งใบสมัครใหม่" หากคุณไม่ต้องการแก้ไขข้อมูลเพิ่มเติม</li>
                    <li>• กดปุ่ม "ยกเลิกใบสมัคร" หากคุณไม่ต้องการดำเนินการต่อ</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
