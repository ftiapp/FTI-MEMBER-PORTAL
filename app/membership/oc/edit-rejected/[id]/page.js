"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import OCMembershipForm from "../../components/OCMembershipForm";
import OCStepIndicator from "../../components/OCStepIndicator";

export default function EditRejectedOCApplication() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [rejectedApp, setRejectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState("");

  const fetchComments = async (membershipType, membershipId) => {
    try {
      console.log("🔄 Fetching comments for:", membershipType, membershipId);
      const res = await fetch(`/api/membership/user-comments/${membershipType}/${membershipId}`);
      const result = await res.json();
      console.log("📥 Comments API Response:", result);
      if (result.success) {
        setComments(result.comments);
        console.log("✅ Comments set:", result.comments);
      } else {
        console.error("Failed to fetch comments:", result.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

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

  // Transform rejection_data snapshot into the flat formData shape for OCMembershipForm
  const mapRejectionDataToOCForm = (data) => {
    console.log("🔍 Mapping OC rejection data:", data);
    if (!data) return {};

    // Check if data is already in flat format (like draft data)
    if (data.companyName || data.taxId) {
      console.log("📋 OC Data is already in flat format, using as-is");
      return data;
    }

    // Handle nested database structure
    const main = data.main || {};
    const address =
      Array.isArray(data.addresses) && data.addresses.length > 0 ? data.addresses[0] : {};
    const reps = Array.isArray(data.representatives) ? data.representatives : [];
    const btypes = Array.isArray(data.businessTypes) ? data.businessTypes : [];
    const btypeOther =
      Array.isArray(data.businessTypeOther) && data.businessTypeOther.length > 0
        ? data.businessTypeOther[0]
        : {};
    const products = Array.isArray(data.products) ? data.products : [];

    console.log("📊 Extracted OC nested data:", {
      main,
      address,
      reps,
      btypes,
      btypeOther,
      products,
    });

    const documents = data.documents || {};
    const getFileObject = (docUrl) =>
      docUrl ? { name: `Existing File - ${docUrl.split("/").pop()}`, url: docUrl } : null;
    const getFileObjects = (docUrls) =>
      (docUrls || []).map((doc) => ({
        name: `Existing Image - ${doc.url.split("/").pop()}`,
        url: doc.url,
      }));

    const mappedData = {
      // Company info
      companyName: main.company_name_th || "",
      companyNameEng: main.company_name_en || "",
      taxId: main.tax_id || "",
      companyEmail: main.company_email || "",
      companyPhone: main.company_phone || "",
      companyPhoneExtension: main.phone_extension || "",
      addressNumber: address.address_number || "",
      street: address.street || "",
      subDistrict: address.sub_district || "",
      district: address.district || "",
      province: address.province || "",
      postalCode: address.postal_code || "",
      moo: address.moo || "",

      // Financial Info
      registeredCapital: main.registered_capital ? String(main.registered_capital) : "",
      totalAssets: main.total_assets ? String(main.total_assets) : "",
      totalRevenue: main.total_revenue ? String(main.total_revenue) : "",
      netProfit: main.net_profit ? String(main.net_profit) : "",
      productionCapacity: main.production_capacity || "",
      exportSalesRatio: main.export_sales_ratio ? String(main.export_sales_ratio) : "",
      debtToEquityRatio: main.debt_to_equity_ratio ? String(main.debt_to_equity_ratio) : "",

      // Representatives
      representatives:
        reps.length > 0
          ? reps.map((r, idx) => ({
              id: r.id || null,
              firstNameThai: r.first_name_th || "",
              lastNameThai: r.last_name_th || "",
              firstNameEnglish: r.first_name_en || "",
              lastNameEnglish: r.last_name_en || "",
              position: r.position || "",
              email: r.email || "",
              phone: r.phone || "",
              phoneExtension: r.phone_extension || "",
              isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0,
            }))
          : [],

      // Business
      businessTypes: btypes
        .map((bt) => (typeof bt === "string" ? bt : bt.business_type || ""))
        .filter(Boolean),
      otherBusinessType: btypeOther.detail || "",
      products: products.map((p, index) => ({
        id: p.id || null,
        key: p.id || `new-${index}-${Date.now()}`,
        nameTh: p.name_th || p.product_name || "",
        nameEn: p.name_en || "",
      })),
      numberOfEmployees: main.number_of_employees ? String(main.number_of_employees) : "",

      // Documents: Preserve existing files
      companyRegistration: getFileObject(documents.company_registration_doc),
      factoryLicense: getFileObject(documents.factory_license_doc),
      industrialEstateLicense: getFileObject(documents.industrial_estate_license_doc),
      productionImages: getFileObjects(documents.production_process_images),
    };

    console.log("✅ Final OC mapped data:", mappedData);
    return mappedData;
  };

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/membership/rejected-applications/${params.id}`);
      const result = await response.json();
      console.log("🌐 OC API Response:", result);

      if (result.success) {
        setRejectedApp(result.data);
        console.log("🔍 Checking membership data:", {
          membershipType: result.data.membershipType,
          membershipId: result.data.membershipId,
          hasData: !!result.data,
        });
        if (result.data.membershipType && result.data.membershipId) {
          console.log(
            "📞 Calling fetchComments with:",
            result.data.membershipType,
            result.data.membershipId,
          );
          fetchComments(result.data.membershipType, result.data.membershipId);
        } else {
          console.log("❌ Missing membershipType or membershipId in response");
        }
        console.log("✅ OC Rejected App Data set:", result.data);

        if (result.data.rejectionData) {
          console.log("🔄 Found OC rejectionData, mapping...");
          const mapped = mapRejectionDataToOCForm(result.data.rejectionData);
          console.log("🎯 Setting OC formData to:", mapped);
          setFormData(mapped);

          const adminNote = result.data.adminNote?.toLowerCase() || "";
          if (adminNote.includes("ข้อมูลบริษัท") || adminNote.includes("company")) {
            setCurrentStep(1);
          } else if (adminNote.includes("ผู้แทน") || adminNote.includes("representative")) {
            setCurrentStep(2);
          } else if (adminNote.includes("ธุรกิจ") || adminNote.includes("business")) {
            setCurrentStep(3);
          } else if (adminNote.includes("เอกสาร") || adminNote.includes("document")) {
            setCurrentStep(4);
          }
        } else {
          console.log("❌ No OC rejectionData found in response");
        }
      } else {
        setError(result.message || "Failed to fetch rejected application");
      }
    } catch (error) {
      console.error("💥 OC Fetch error:", error);
      setError("Failed to fetch rejected application");
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
        <main className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex justify-center items-center">
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
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  แก้ไขใบสมัครสมาชิกสามัญ (โรงงาน)
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
                  แก้ไขข้อมูลตามคำแนะนำของผู้ดูแลระบบและส่งใบสมัครใหม่
                </p>
              </div>

              {!isMobile && (
                <div className="flex-shrink-0">
                  <div className="bg-white p-3 rounded-full shadow-lg">
                    <svg
                      className="w-16 h-16 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments History Section */}
        <div className="container mx-auto px-4 pt-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">ประวัติการสื่อสาร</h3>
              {process.env.NODE_ENV === "development" && (
                <p className="text-xs text-gray-500 mb-4">
                  Debug: Comments array length: {comments.length}
                </p>
              )}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg ${comment.comment_type.startsWith("admin") ? "bg-red-50 border-l-4 border-red-400" : "bg-blue-50 border-l-4 border-blue-400"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p
                          className={`text-sm font-semibold ${comment.comment_type.startsWith("admin") ? "text-red-800" : "text-blue-800"}`}
                        >
                          {comment.comment_type.startsWith("admin") ? "ผู้ดูแลระบบ" : "ผู้สมัคร"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">ยังไม่มีประวัติการสื่อสาร</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="container mx-auto px-4 py-8">
          {/* User Comment Box */}
          <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                แสดงความคิดเห็นเพิ่มเติมถึงผู้ดูแลระบบ (ถ้ามี)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                หากคุณต้องการชี้แจงรายละเอียดเพิ่มเติมเกี่ยวกับการแก้ไขข้อมูล
                สามารถพิมพ์ข้อความที่นี่ได้
              </p>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="พิมพ์ข้อความของคุณที่นี่..."
              />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Step Indicator */}
            <div className="border-b border-gray-200 p-4">
              <OCStepIndicator steps={steps} currentStep={currentStep} />
            </div>

            {/* Form */}
            <div className="p-6">
              <OCMembershipForm
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                formData={formData}
                setFormData={setFormData}
                totalSteps={steps.length}
                isEditingRejected={true}
                rejectedAppId={params.id}
                userComment={userComment}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
