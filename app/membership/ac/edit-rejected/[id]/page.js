"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import ACMembershipForm from "../../components/ACMembershipForm";

export default function EditRejectedACApplication() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [rejectedApp, setRejectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [comments, setComments] = useState([]);

  // เพิ่ม state สำหรับ debug
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchRejectedApplication();
    }
  }, [params.id]);

  useEffect(() => {
    if (rejectedApp) {
      console.log("✅ Found AC rejected app (v2 - from Main table)", rejectedApp);

      if (rejectedApp.membershipId) {
        console.log(
          "🔀 Redirecting to AC edit-v4 page for membershipId:",
          rejectedApp.membershipId,
        );
        // ใช้หน้า edit-v4 เป็นหลักแทน edit-rejected เดิม
        router.replace(`/membership/ac/edit-v4/${rejectedApp.membershipId}`);
        setDebugInfo(`Redirecting to membershipId: ${rejectedApp.membershipId}`);
        return;
      }

      // ถ้าไม่มี membershipId ให้ fallback เป็น behavior เดิม (map ข้อมูลเข้า formData)
      console.warn("⚠️ AC rejected app missing membershipId, falling back to local form");
      const mapped = mapRejectionDataToACForm(rejectedApp);
      console.log("✅ Setting AC formData to:", mapped);
      setFormData(mapped);

      // เพิ่ม debug info
      setDebugInfo(`Mapped data: ${Object.keys(mapped).length} fields`);
    }
  }, [rejectedApp, router]);

  // Transform rejection_data snapshot into the flat formData shape for ACMembershipForm
  const mapRejectionDataToACForm = (data) => {
    console.log("🔄 Mapping AC rejection data:", data);
    if (!data) return {};

    // Check if data is already in flat format (like draft data)
    if (data.companyName || data.taxId) {
      console.log("✅ AC Data is already in flat format, using as-is");

      // แต่ต้องตรวจสอบและเติมข้อมูลที่ขาดหายให้ครบถ้วน
      const flatData = { ...data };

      // ตรวจสอบ contactPersons ให้ครบถ้วน
      if (!flatData.contactPersons || flatData.contactPersons.length === 0) {
        flatData.contactPersons = [
          {
            id: Date.now(),
            firstNameTh: flatData.representatives?.[0]?.firstNameThai || "",
            lastNameTh: flatData.representatives?.[0]?.lastNameThai || "",
            firstNameEn: flatData.representatives?.[0]?.firstNameEnglish || "",
            lastNameEn: flatData.representatives?.[0]?.lastNameEnglish || "",
            position: flatData.representatives?.[0]?.position || "",
            email: flatData.representatives?.[0]?.email || flatData.companyEmail || "",
            phone: flatData.representatives?.[0]?.phone || flatData.companyPhone || "",
            phoneExtension: "",
            typeContactId: "1",
            typeContactName: "ผู้จัดการ",
            typeContactOtherDetail: "",
            isMain: true,
          },
        ];
      }

      // ตรวจสอบ addresses structure
      if (!flatData.addresses) {
        flatData.addresses = {
          1: {
            addressType: "1",
            addressNumber: flatData.addressNumber || "",
            building: flatData.building || "",
            moo: flatData.moo || "",
            soi: flatData.soi || "",
            street: flatData.street || "",
            subDistrict: flatData.subDistrict || "",
            district: flatData.district || "",
            province: flatData.province || "",
            postalCode: flatData.postalCode || "",
            phone: flatData.companyPhone || "",
            email: flatData.companyEmail || "",
            website: flatData.companyWebsite || "",
          },
          2: {
            addressType: "2",
            addressNumber: flatData.addressNumber || "",
            building: flatData.building || "",
            moo: flatData.moo || "",
            soi: flatData.soi || "",
            street: flatData.street || "",
            subDistrict: flatData.subDistrict || "",
            district: flatData.district || "",
            province: flatData.province || "",
            postalCode: flatData.postalCode || "",
            phone: flatData.companyPhone || "",
            email: flatData.companyEmail || "",
            website: flatData.companyWebsite || "",
          },
          3: {
            addressType: "3",
            addressNumber: flatData.addressNumber || "",
            building: flatData.building || "",
            moo: flatData.moo || "",
            soi: flatData.soi || "",
            street: flatData.street || "",
            subDistrict: flatData.subDistrict || "",
            district: flatData.district || "",
            province: flatData.province || "",
            postalCode: flatData.postalCode || "",
            phone: flatData.companyPhone || "",
            email: flatData.companyEmail || "",
            website: flatData.companyWebsite || "",
          },
        };
      }

      // ตรวจสอบ products format
      if (flatData.products && flatData.products.length > 0) {
        flatData.products = flatData.products.map((product) => ({
          ...product,
          nameTh: product.nameTh || product.name || "",
          name: product.name || product.nameTh || "",
          nameEn: product.nameEn || product.name_en || "",
          description: product.description || "",
        }));
      }

      // ตรวจสอบ numberOfEmployees
      if (!flatData.numberOfEmployees && flatData.numberOfEmployees !== 0) {
        flatData.numberOfEmployees = flatData.memberCount || 0;
      }

      // ตรวจสอบ otherBusinessTypeDetail
      if (flatData.businessTypes?.other && !flatData.otherBusinessTypeDetail) {
        flatData.otherBusinessTypeDetail = flatData.businessTypeOther || "";
      }

      // ตรวจสอบ representatives
      if (!flatData.representatives || flatData.representatives.length === 0) {
        flatData.representatives = [
          {
            idCardNumber: "",
            firstNameThai: "",
            lastNameThai: "",
            firstNameEnglish: "",
            lastNameEnglish: "",
            position: "",
            phone: "",
            email: "",
            isPrimary: true,
          },
        ];
      }

      return flatData;
    }

    // Check if data is a string that needs to be parsed
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
        console.log("✅ AC Parsed string data:", data);
      } catch (e) {
        console.error("❌ Error parsing rejection data:", e);
        return {};
      }
    }

    const main = data.main || {};
    const addresses = data.addresses || [];
    const address = Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : {};
    const contactPersons = data.contactPersons || [];
    const representatives = Array.isArray(data.representatives) ? data.representatives : [];
    const businessTypes = data.businessTypes || [];
    const businessTypeOther = data.businessTypeOther || [];
    const products = Array.isArray(data.products) ? data.products : [];
    const industrialGroups = Array.isArray(data.industryGroups) ? data.industryGroups : [];
    const provincialChapters = Array.isArray(data.provinceChapters) ? data.provinceChapters : [];

    console.log("✅ Extracted AC nested data:", {
      main,
      address,
      contactPersons,
      representatives,
      businessTypes,
      products,
      industrialGroups,
      provincialChapters,
    });

    // Map address to nested structure for CompanyAddressInfo
    const mappedAddresses = {
      1: {
        addressType: "1",
        addressNumber: address.address_number || address.addressnumber || "",
        building: address.building || "",
        moo: address.moo || "",
        soi: address.soi || "",
        street: address.street || "",
        subDistrict: address.sub_district || address.subdistrict || "",
        district: address.district || "",
        province: address.province || "",
        postalCode: address.postal_code || address.postalcode || "",
        phone: address.phone || main.company_phone || "",
        email: address.email || main.company_email || "",
        website: address.website || "",
      },
      2: {
        addressType: "2",
        addressNumber: address.address_number || address.addressnumber || "",
        building: address.building || "",
        moo: address.moo || "",
        soi: address.soi || "",
        street: address.street || "",
        subDistrict: address.sub_district || address.subdistrict || "",
        district: address.district || "",
        province: address.province || "",
        postalCode: address.postal_code || address.postalcode || "",
        phone: address.phone || main.company_phone || "",
        email: address.email || main.company_email || "",
        website: address.website || "",
      },
      3: {
        addressType: "3",
        addressNumber: address.address_number || address.addressnumber || "",
        building: address.building || "",
        moo: address.moo || "",
        soi: address.soi || "",
        street: address.street || "",
        subDistrict: address.sub_district || address.subdistrict || "",
        district: address.district || "",
        province: address.province || "",
        postalCode: address.postal_code || address.postalcode || "",
        phone: address.phone || main.company_phone || "",
        email: address.email || main.company_email || "",
        website: address.website || "",
      },
    };

    // แก้ไข: ต้องให้แน่ใจว่า contactPersons มีข้อมูลครบถ้วนตาม validation
    const mappedContactPersons =
      contactPersons.length > 0
        ? contactPersons.map((p, index) => ({
            id: p.id || Date.now() + index,
            firstNameTh: p.first_name_th || p.firstNameTh || "",
            lastNameTh: p.last_name_th || p.lastNameTh || "",
            firstNameEn: p.first_name_en || p.firstNameEn || "",
            lastNameEn: p.last_name_en || p.lastNameEn || "",
            position: p.position || "",
            email: p.email || "",
            phone: p.phone || "",
            phoneExtension: p.phone_extension || p.phoneExtension || "",
            typeContactId: p.type_contact_id || p.typeContactId || "1",
            typeContactName: p.type_contact_name || p.typeContactName || "ผู้จัดการ",
            typeContactOtherDetail: p.type_contact_other_detail || p.typeContactOtherDetail || "",
            isMain: index === 0,
          }))
        : [
            {
              // ถ้าไม่มี contactPersons ให้สร้างจากข้อมูล representatives หรือค่าเริ่มต้น
              id: Date.now(),
              firstNameTh: representatives[0]?.first_name_th || "",
              lastNameTh: representatives[0]?.last_name_th || "",
              firstNameEn: representatives[0]?.first_name_en || "",
              lastNameEn: representatives[0]?.last_name_en || "",
              position: representatives[0]?.position || "",
              email: representatives[0]?.email || main.company_email || "",
              phone: representatives[0]?.phone || main.company_phone || "",
              phoneExtension: "",
              typeContactId: "1",
              typeContactName: "ผู้จัดการ",
              typeContactOtherDetail: "",
              isMain: true,
            },
          ];

    const documents = data.documents || [];
    const mappedDocuments = documents.reduce((acc, doc) => {
      acc[doc.document_type] = {
        name: doc.file_name,
        url: doc.cloudinary_url || doc.file_path,
        file: null, // Start with no new file
      };
      return acc;
    }, {});

    const mappedData = {
      // Company info
      companyName: main.company_name_th || "",
      companyNameEn: main.company_name_en || "",
      taxId: main.tax_id || "",
      companyEmail: main.company_email || "",
      companyPhone: main.company_phone || "",
      companyPhoneExtension: main.company_phone_extension || "",
      companyWebsite: main.company_website || "",

      // Address data (for backward compatibility)
      addressNumber: address.address_number || address.addressnumber || "",
      building: address.building || "",
      moo: address.moo || "",
      soi: address.soi || "",
      street: address.street || "",
      subDistrict: address.sub_district || address.subdistrict || "",
      district: address.district || "",
      province: address.province || "",
      postalCode: address.postal_code || address.postalcode || "",

      // Nested addresses structure for CompanyAddressInfo
      addresses: mappedAddresses,

      // Contact Persons - แก้ไขให้ครบถ้วนตาม validation
      contactPersons: mappedContactPersons,

      // Representatives - ensure at least one representative
      representatives:
        representatives.length > 0
          ? representatives.map((r, idx) => ({
              idCardNumber: r.id_card_number || "",
              firstNameThai: r.first_name_th || "",
              lastNameThai: r.last_name_th || "",
              firstNameEnglish: r.first_name_en || "",
              lastNameEnglish: r.last_name_en || "",
              position: r.position || "",
              phone: r.phone || "",
              phoneExtension: r.phone_extension || "",
              email: r.email || "",
              isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0,
            }))
          : [
              {
                idCardNumber: "",
                firstNameThai: "",
                lastNameThai: "",
                firstNameEnglish: "",
                lastNameEnglish: "",
                position: "",
                phone: "",
                phoneExtension: "",
                email: "",
                isPrimary: true,
              },
            ],

      // Industrial Groups & Provincial Chapters - map to array of selected IDs
      // ใช้ทั้ง 2 format เพื่อ backward compatibility
      // กรอง "000" (ไม่ระบุ) ออก
      industrialGroupIds: industrialGroups
        .map((ig) => ig.industry_group_id || ig.id)
        .filter((id) => id && id !== "000" && id !== 0),
      industrialGroups: industrialGroups
        .map((ig) => ig.industry_group_id || ig.id)
        .filter((id) => id && id !== "000" && id !== 0),
      provincialChapterIds: provincialChapters
        .map((pc) => pc.province_chapter_id || pc.id)
        .filter((id) => id && id !== "000" && id !== 0),
      provincialChapters: provincialChapters
        .map((pc) => pc.province_chapter_id || pc.id)
        .filter((id) => id && id !== "000" && id !== 0),

      // Business Types - convert to object format expected by AC form
      businessTypes: businessTypes.reduce((acc, bt) => {
        const type = bt.business_type || bt;
        acc[type] = true;
        return acc;
      }, {}),
      businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0].detail || "" : "",
      otherBusinessTypeDetail:
        businessTypeOther.length > 0 ? businessTypeOther[0].detail || "" : "", // เพิ่ม field นี้

      // Products - Add a unique key for React rendering and deletion
      products: products.map((p, index) => ({
        id: p.id, // Preserve original DB id if available
        key: p.id || Date.now() + index, // Unique key for component
        nameTh: p.name_th || p.name || p.nameTh || "",
        name: p.name_th || p.name || "",
        nameEn: p.name_en || "",
        description: p.description || "",
      })),

      // Financial fields
      numberOfEmployees: main.number_of_employees || 0,
      registeredCapital: main.registered_capital || "",
      productionCapacityValue: main.production_capacity_value || "",
      productionCapacityUnit: main.production_capacity_unit || "",
      salesDomestic: main.sales_domestic || "",
      salesExport: main.sales_export || "",
      shareholderThaiPercent: main.shareholder_thai_percent || "",
      shareholderForeignPercent: main.shareholder_foreign_percent || "",

      // Documents - Preserve existing files and allow re-upload
      ...mappedDocuments,

      // For validation compatibility, ensure these fields exist even if empty
      companyRegistration: mappedDocuments.companyRegistration || null,
      companyStamp: mappedDocuments.companyStamp || null,
      authorizedSignature: mappedDocuments.authorizedSignature || null,
    };

    console.log("✅ Mapped AC form data:", mappedData);
    return mappedData;
  };

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

  const fetchRejectedApplication = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Fetching rejected application:", params.id);

      const res = await fetch(`/api/membership/rejected-applications-v2/ac/${params.id}`);
      const result = await res.json();
      console.log("📥 AC API Response:", result);

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
        console.log("✅ AC Rejected App Data set:", result.data);
        setDebugInfo(`API Success: ${result.data ? "Data found" : "No data"}`);
      } else {
        setError(result.message || "Failed to fetch rejected application");
        setDebugInfo(`API Error: ${result.message}`);
      }
    } catch (e) {
      console.error("❌ AC Fetch error:", e);
      setError("Failed to fetch rejected application");
      setDebugInfo(`Fetch Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <span className="ml-3 text-gray-600 block mt-2">กำลังโหลดข้อมูล...</span>
            {debugInfo && <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>}
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
              {debugInfo && <p className="text-xs text-gray-500 mt-2">Debug: {debugInfo}</p>}
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
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">แก้ไขใบสมัครสมาชิกวิสามัญ</h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
                  แก้ไขข้อมูลตามคำแนะนำของผู้ดูแลระบบและส่งใบสมัครใหม่
                </p>
                {process.env.NODE_ENV === "development" && debugInfo && (
                  <p className="text-xs text-blue-200 mt-2">Debug: {debugInfo}</p>
                )}
              </div>
            </div>
          </div>
        </div>

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
            <div className="p-6">
              {formData ? (
                <ACMembershipForm
                  formData={formData}
                  setFormData={setFormData}
                  currentStep={5} // บังคับให้เป็นขั้นตอนสุดท้าย
                  setCurrentStep={() => {}} // ไม่ให้เปลี่ยน step
                  totalSteps={5}
                  rejectionId={params.id}
                  isSinglePageLayout={true}
                  userComment={userComment}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">ไม่พบข้อมูลฟอร์ม</p>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs text-gray-500 mt-2">Debug: formData is null</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
