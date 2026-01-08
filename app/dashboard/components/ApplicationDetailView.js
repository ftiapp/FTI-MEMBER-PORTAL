"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import dynamic from "next/dynamic";

// Import SummarySection components dynamically based on member type
const OCSummarySection = dynamic(() => import("../../membership/oc/components/SummarySection"), {
  loading: () => <div>กำลังโหลด...</div>,
});

const ACSummarySection = dynamic(() => import("../../membership/ac/components/SummarySection"), {
  loading: () => <div>กำลังโหลด...</div>,
});

const AMSummarySection = dynamic(() => import("../../membership/am/components/SummarySection"), {
  loading: () => <div>กำลังโหลด...</div>,
});

const ICSummarySection = dynamic(() => import("../../membership/ic/components/SummarySection"), {
  loading: () => <div>กำลังโหลด...</div>,
});

export default function ApplicationDetailView() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("detail");
  const type = searchParams.get("type");

  useEffect(() => {
    if (id && type) {
      fetchApplicationDetail();
    }
  }, [id, type]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await fetch(`/api/member/get-application-detail?id=${id}&type=${type}`);
      if (!response.ok) throw new Error("Failed to fetch application detail");

      const data = await response.json();
      setApplication(data);
    } catch (error) {
      console.error("Error fetching application detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status, memberCode) => {
    // If member_code exists, show as approved
    if (memberCode && memberCode.trim() !== "") {
      return "อนุมัติ";
    }
    
    const statusMap = {
      0: "รอพิจารณา",
      1: "รอการชำระเงิน",
      2: "ปฏิเสธ",
    };
    return statusMap[status] || "ไม่ระบุ";
  };

  const getDocumentStatusText = (status, memberCode) => {
    // If member_code exists, show as approved
    if (memberCode && memberCode.trim() !== "") {
      return "อนุมัติ";
    }
    
    const statusMap = {
      0: "รอพิจารณา",
      1: "รอการชำระเงิน",
      2: "ปฏิเสธ",
    };
    return statusMap[status] || "ไม่ระบุ";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: "text-yellow-600 bg-yellow-100",
      1: "text-green-600 bg-green-100",
      2: "text-red-600 bg-red-100",
    };
    return colorMap[status] || "text-gray-600 bg-gray-100";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ไม่พบข้อมูลการสมัคร</p>
        <button
          onClick={() => router.push("/dashboard?tab=member")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          กลับไปหน้ารายการ
        </button>
      </div>
    );
  }

  const {
    application: appData,
    addresses,
    contactPersons,
    representatives,
    businessTypes: apiBusinessTypes,
    products,
    documents,
  } = application;

  const memberCode = (appData?.member_code || appData?.memberCode || appData?.MEMBER_CODE || "");

  // Transform application data to match SummarySection expected format
  const transformDataForSummary = () => {
    const formData = {
      // Company information
      company_name: appData.company_name || "",
      company_name_eng: appData.company_name_eng || "",
      tax_id: appData.tax_id || "",
      company_email: appData.company_email || "",
      company_phone: appData.company_phone || "",
      company_website: appData.company_website || "",
      number_of_employees: appData.number_of_employees || "",
      factory_type: appData.factory_type || "",
      other_business_type: appData.other_business_type || "",
      status: appData.status || "",
      member_code: appData.member_code || "",
      created_at: appData.created_at || "",
      updated_at: appData.updated_at || "",
      member_type: appData.member_type || "",
      member_type_th: appData.member_type_th || "",

      // Address data
      address_number: "",
      moo: "",
      soi: "",
      street: "",
      sub_district: "",
      district: "",
      province: "",
      postal_code: "",

      // Contact person data
      first_name: "",
      last_name: "",
      first_name_eng: "",
      last_name_eng: "",
      position: "",
      email: "",
      phone: "",

      // Business types and products
      business_types: [],
      products: [],

      // Representatives
      representatives: [],

      // Documents
      documents: [],
    };

    // Transform addresses
    const addressData = addresses?.[0] || {};
    Object.assign(formData, {
      address_number: addressData.address_number || "",
      moo: addressData.moo || "",
      soi: addressData.soi || "",
      street: addressData.street || "",
      sub_district: addressData.sub_district || "",
      district: addressData.district || "",
      province: addressData.province || "",
      postal_code: addressData.postal_code || "",
    });

    // Transform contact persons
    const contactData = contactPersons?.[0] || {};
    Object.assign(formData, {
      first_name: contactData.first_name || "",
      last_name: contactData.last_name || "",
      first_name_eng: contactData.first_name_eng || "",
      last_name_eng: contactData.last_name_eng || "",
    });

    // Transform business types
    const businessTypesArray = apiBusinessTypes?.map((bt) => bt.business_type) || [];
    const businessTypesObj = {};
    businessTypesArray.forEach((type) => {
      businessTypesObj[type] = true;
    });

    // Transform industrial groups and provincial chapters
    const industrialGroupIds = appData.industrial_group_ids || [];
    const provincialChapterIds = appData.provincial_chapter_ids || [];

    return {
      formData: {
        ...formData,
        businessTypes: businessTypesObj,
        industrialGroupIds: industrialGroupIds,
        provincialChapterIds: provincialChapterIds,
      },
      businessTypes: businessTypesArray,
      industrialGroups: industrialGroupIds,
      provincialChapters: provincialChapterIds,
    };
  };

  const {
    formData,
    businessTypes: transformedBusinessTypes,
    industrialGroups,
    provincialChapters,
  } = transformDataForSummary();

  // Render appropriate SummarySection based on member type
  const renderSummarySection = () => {
    switch (type) {
      case "OC":
        return (
          <OCSummarySection
            formData={formData}
            businessTypes={transformedBusinessTypes}
            industrialGroups={industrialGroups}
            provincialChapters={provincialChapters}
          />
        );
      case "AC":
        return (
          <ACSummarySection
            formData={formData}
            businessTypes={transformedBusinessTypes}
            industrialGroups={industrialGroups}
            provincialChapters={provincialChapters}
          />
        );
      case "AM":
        return (
          <AMSummarySection
            formData={formData}
            businessTypes={transformedBusinessTypes}
            industrialGroups={industrialGroups}
            provincialChapters={provincialChapters}
          />
        );
      case "IC":
        return (
          <ICSummarySection
            formData={formData}
            businessTypes={transformedBusinessTypes}
            industrialGroups={industrialGroups}
            provincialChapters={provincialChapters}
          />
        );
      default:
        return <div>ไม่พบประเภทสมาชิก</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={() => router.push("/dashboard?tab=member")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          กลับไปหน้ารายการ
        </button>
      </div>

      {/* Status Display */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">สถานะเอกสาร</h3>
              <p className="text-sm text-gray-600">สถานะปัจจุบันของเอกสารสมัครสมาชิก</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(appData.status)}`}>
              {getDocumentStatusText(appData.status, memberCode)}
            </div>
          </div>
        </div>
      </div>

      {renderSummarySection()}
    </div>
  );
}
