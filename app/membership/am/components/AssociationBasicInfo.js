"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";

export default function AssociationBasicInfo({
  formData,
  setFormData,
  errors,
  setErrors,
  isAutofill,
  setIsAutofill,
  isLoading,
  isCheckingTaxId,
  setIsCheckingTaxId,
}) {
  // State for throttling and TAX_ID validation
  const [isThrottled, setIsThrottled] = useState(false);
  const [validationStatus, setValidationStatus] = useState({ status: "idle", message: "" }); // idle, checking, valid, invalid
  const [isFetchingDBD, setIsFetchingDBD] = useState(false);
  const lastFetchTime = useRef(0);
  const throttleTime = 5000; // 5 seconds
  const taxIdTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // เคลียร์ข้อมูลที่ถูกดึงอัตโนมัติ (ชื่อสมาคม + ที่อยู่)
  const clearAutofilledFields = () => {
    setFormData((prev) => ({
      ...prev,
      associationName: "",
      associationNameEng: "",
      associationNameEn: "",
      addresses: {
        ...prev.addresses,
        1: {
          ...prev.addresses?.["1"],
          addressNumber: "",
          building: "",
          road: "",
          street: "",
          subDistrict: "",
          district: "",
          province: "",
          postalCode: "",
          addressType: prev.addresses?.["1"]?.addressType || "1",
        },
      },
      postalCode: "",
    }));
  };

  const checkTaxIdUniqueness = async (taxId) => {
    if (!taxId || taxId.length !== 13) {
      setValidationStatus({ status: "idle", message: "" });
      return false;
    }

    setValidationStatus({ status: "checking", message: "กำลังตรวจสอบเลขประจำตัวผู้เสียภาษี..." });

    try {
      const response = await fetch(`/api/member/am-membership/check-tax-id?taxId=${taxId}`);

      if (!response.headers.get("Content-Type")?.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

      if (response.ok || response.status === 409) {
        if (data.exists) {
          setErrors((prev) => ({ ...prev, taxId: data.message }));
          setValidationStatus({ status: "invalid", message: data.message });
          toast.error(data.message);
          return false;
        }

        setErrors((prev) => ({ ...prev, taxId: undefined }));
        setValidationStatus({
          status: "valid",
          message: "เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้",
        });
        toast.success("เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้");
        return true;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Error checking tax ID uniqueness:", error);
      const errorMessage = "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี";
      setErrors((prev) => ({ ...prev, taxId: errorMessage }));
      setValidationStatus({ status: "invalid", message: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const handleTaxIdChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, "").slice(0, 13);

    setFormData((prev) => ({ ...prev, taxId: numericValue }));
    setValidationStatus({ status: "idle", message: "" });
    if (errors.taxId) {
      setErrors((prev) => ({ ...prev, taxId: undefined }));
    }

    if (taxIdTimeoutRef.current) clearTimeout(taxIdTimeoutRef.current);

    if (numericValue.length === 13) {
      taxIdTimeoutRef.current = setTimeout(() => {
        checkTaxIdUniqueness(numericValue).then((isValid) => {
          if (isValid && isAutofill) {
            fetchAssociationInfo(numericValue);
          }
        });
      }, 500);
    }
  };

  const fetchAssociationInfo = async (taxId) => {
    if (!taxId || taxId.length !== 13) return;

    // Check throttling
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;

    if (timeSinceLastFetch < throttleTime) {
      const remainingTime = Math.ceil((throttleTime - timeSinceLastFetch) / 1000);
      toast.error(`กรุณารอ ${remainingTime} วินาทีก่อนดึงข้อมูลอีกครั้ง`);
      return;
    }

    // Record the time of the last fetch
    lastFetchTime.current = now;
    setIsThrottled(true);

    // Set timer to allow clicking again after the specified time
    setTimeout(() => {
      setIsThrottled(false);
    }, throttleTime);

    setIsFetchingDBD(true);

    try {
      const response = await fetch(`/api/dbd/company/${taxId}`);

      if (!response.ok) {
        const errorData = await response.json();
        
        // ตรวจสอบ status code เพื่อแสดงข้อความที่เหมาะสม
        if (response.status === 404) {
          // ไม่พบข้อมูล
          clearAutofilledFields();
          toast.error(
            errorData.message ||
              "ไม่พบเลขประจำตัวผู้เสียภาษีนี้ในระบบ กรุณาตรวจสอบหมายเลขอีกครั้ง หากท่านยืนยันว่าถูกต้อง ให้กรอกข้อมูลด้วยตนเอง"
          );
          return;
        } else if (response.status === 503 || response.status === 504 || response.status === 500) {
          // ระบบไม่พร้อมใช้งาน
          clearAutofilledFields();
          toast.error(
            errorData.message ||
              "ขณะนี้ระบบดึงข้อมูลอัตโนมัติไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง หรือใช้โหมดกรอกข้อมูลด้วยตนเอง ขออภัยในความไม่สะดวก",
            { duration: 6000 }
          );
          return;
        } else {
          // Error อื่นๆ
          clearAutofilledFields();
          toast.error(errorData.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
          return;
        }
      }

      const result = await response.json();

      if (result.success && result.data) {
        const assocData = result.data;
        const subDistrictName = assocData.address?.subDistrict || "";

        setFormData((prev) => ({
          ...prev,
          associationName: assocData.companyName || "",
          associationNameEng: assocData.companyNameEn || "",
          associationNameEn: assocData.companyNameEn || "",
          addresses: {
            ...prev.addresses,
            1: {
              ...prev.addresses?.["1"],
              addressNumber: assocData.address?.addressNumber || "",
              building: assocData.address?.building || "",
              road: assocData.address?.street || "",
              subDistrict: subDistrictName,
              district: assocData.address?.district || "",
              province: assocData.address?.province || "",
              addressType: "1",
            },
          },
        }));

        setErrors((prev) => ({
          ...prev,
          associationName: "",
          associationNameEng: "",
        }));

        toast.success("ดึงข้อมูลสำเร็จ");

        // Fetch and set postal code for address type '1' (Office Address)
        if (subDistrictName && subDistrictName.length >= 2) {
          try {
            const postalResponse = await fetch(
              `/api/thailand-address/search?query=${encodeURIComponent(subDistrictName)}&type=subdistrict`,
            );
            if (postalResponse.ok) {
              const postalData = await postalResponse.json();
              const exactMatch = postalData?.data?.find((item) => item.text === subDistrictName);
              const selectedItem = exactMatch || postalData?.data?.[0];
              if (postalData.success && selectedItem?.postalCode) {
                setFormData((prev) => ({
                  ...prev,
                  addresses: {
                    ...prev.addresses,
                    1: {
                      ...prev.addresses?.["1"],
                      postalCode: selectedItem.postalCode,
                    },
                  },
                }));
                toast.success("ดึงรหัสไปรษณีย์สำเร็จ!");
              }
            }
          } catch (_) {
            // silent failure
          }
        }
      } else {
        // ไม่ควรเกิดขึ้น (success: false)
        clearAutofilledFields();
        toast.error(
          result.message ||
            "ไม่พบเลขประจำตัวผู้เสียภาษีนี้ในระบบ กรุณาตรวจสอบหมายเลขอีกครั้ง หากท่านยืนยันว่าถูกต้อง ให้กรอกข้อมูลด้วยตนเอง",
        );
      }
    } catch (error) {
      console.error("Error fetching association info:", error);
      
      // Network error (Failed to fetch)
      clearAutofilledFields();
      toast.error(
        "ขณะนี้ระบบดึงข้อมูลอัตโนมัติไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง หรือใช้โหมดกรอกข้อมูลด้วยตนเอง ขออภัยในความไม่สะดวก",
        { duration: 6000 }
      );
    } finally {
      setIsFetchingDBD(false);
    }
  };

  const fetchPostalCode = async (subDistrict) => {
    if (!subDistrict || subDistrict.length < 2) return;

    try {
      console.log(`🔍 กำลังหา postal code สำหรับ: ${subDistrict}`);

      const response = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(subDistrict)}&type=subdistrict`,
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้");
      }

      const data = await response.json();
      console.log("📬 ผลการค้นหา postal code:", data);

      if (data.success && data.data && data.data.length > 0) {
        // หาตำบลที่ตรงกันที่สุด
        const exactMatch = data.data.find((item) => item.text === subDistrict);
        const selectedItem = exactMatch || data.data[0];

        if (selectedItem && selectedItem.postalCode) {
          console.log(`✅ เจอ postal code: ${selectedItem.postalCode}`);

          setFormData((prev) => ({
            ...prev,
            postalCode: selectedItem.postalCode,
          }));

          toast.success("ดึงรหัสไปรษณีย์สำเร็จ!");
        }
      }
    } catch (error) {
      console.error("Error fetching postal code:", error);
    }
  };

  const toggleAutofill = () => {
    const newIsAutofill = !isAutofill;
    setIsAutofill(newIsAutofill);

    // If switching to manual mode, clear related fields and stop any pending validation
    if (!newIsAutofill) {
      if (taxIdTimeoutRef.current) {
        clearTimeout(taxIdTimeoutRef.current);
      }
      setValidationStatus({ status: "idle", message: "" });
      setErrors((prev) => ({ ...prev, taxId: undefined }));
      // Clear fields that were auto-filled
      clearAutofilledFields();
      toast("โหมดกรอกข้อมูลเอง: กรุณากรอกข้อมูลสมาคมด้วยตนเอง");
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (taxIdTimeoutRef.current) {
        clearTimeout(taxIdTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <LoadingOverlay 
        isVisible={isFetchingDBD} 
        message="กำลังดึงข้อมูลจากกรมพัฒนาธุรกิจการค้า..."
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">ข้อมูลสมาคม</h3>
        <p className="text-blue-100 text-sm mt-1">กรอกข้อมูลพื้นฐานของสมาคม</p>
      </div>

      {/* Content Section */}
      <div className="px-8 py-8 space-y-8">
        {/* Mode Selection Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">วิธีการกรอกข้อมูล</h4>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="autofill"
                name="fillMode"
                checked={isAutofill}
                onChange={toggleAutofill}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="autofill"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                ดึงข้อมูลอัตโนมัติ
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="manual"
                name="fillMode"
                checked={!isAutofill}
                onChange={toggleAutofill}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="manual"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                กรอกข้อมูลเอง
              </label>
            </div>
          </div>
        </div>

        {/* Association Information Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลพื้นฐาน
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tax ID Field */}
            <div className="space-y-2">
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-900">
                เลขประจำตัวผู้เสียภาษี
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId || ""}
                  onChange={handleTaxIdChange}
                  maxLength={13}
                  required
                  placeholder="0000000000000"
                  className={`
                    w-full px-4 py-3 text-sm
                    border rounded-lg
                    bg-white
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${
                      validationStatus.status === "invalid"
                        ? "border-red-300 bg-red-50"
                        : validationStatus.status === "valid"
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                    }
                    ${isAutofill || validationStatus.status === "checking" ? "pr-28" : ""}
                  `}
                  disabled={validationStatus.status === "checking"}
                />

                {/* Status Badge or Fetch Button - Only show one at a time */}
                {validationStatus.status === "checking" ? (
                  <div className="absolute right-2 top-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-md flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    ตรวจสอบ
                  </div>
                ) : validationStatus.status === "invalid" ? (
                  <div className="absolute right-2 top-2 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-medium rounded-md flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ไม่ผ่าน
                  </div>
                ) : validationStatus.status === "valid" ? (
                  <div className="absolute right-2 top-2 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-md flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ผ่าน
                  </div>
                ) : isAutofill ? (
                  <button
                    type="button"
                    onClick={() => fetchAssociationInfo(formData.taxId)}
                    disabled={
                      isLoading || !formData.taxId || formData.taxId.length !== 13 || isThrottled
                    }
                    className="
                      absolute right-2 top-2 
                      px-3 py-1.5 
                      bg-blue-600 hover:bg-blue-700 
                      text-white text-xs font-medium
                      rounded-md
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                  >
                    {isLoading ? "กำลังดึง..." : isThrottled ? "รอสักครู่..." : "ดึงข้อมูล"}
                  </button>
                ) : null}
              </div>

              {/* Status Messages */}
              {validationStatus.message && (
                <p
                  className={`mt-1 text-sm flex items-center gap-2 ${
                    validationStatus.status === "invalid"
                      ? "text-red-600"
                      : validationStatus.status === "valid"
                        ? "text-green-600"
                        : "text-blue-600"
                  }`}
                >
                  {validationStatus.status === "checking" && (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {validationStatus.status === "valid" && (
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {validationStatus.status === "invalid" && (
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {validationStatus.message}
                </p>
              )}
            </div>

            {/* Association Name Field */}
            <div className="space-y-2">
              <label htmlFor="associationName" className="block text-sm font-medium text-gray-900">
                ชื่อสมาคม
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                id="associationName"
                name="associationName"
                value={formData.associationName || ""}
                onChange={handleInputChange}
                required
                disabled={isAutofill}
                placeholder="ชื่อสมาคม"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  ${
                    isAutofill
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                      : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                  ${
                    errors.associationName
                      ? "border-red-300 bg-red-50"
                      : isAutofill
                        ? "border-gray-200"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                  }
                `}
              />

              {errors.associationName && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.associationName}
                </p>
              )}

              {isAutofill && (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ฟิลด์นี้จะถูกดึงข้อมูลอัตโนมัติ
                </p>
              )}
            </div>

            {/* Association Name English Field */}
            <div className="space-y-2">
              <label
                htmlFor="associationNameEng"
                className="block text-sm font-medium text-gray-900"
              >
                ชื่อสมาคมภาษาอังกฤษ
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                id="associationNameEng"
                name="associationNameEng"
                value={formData.associationNameEng || ""}
                onChange={handleInputChange}
                required
                disabled={isAutofill}
                placeholder="Association Name in English"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  ${
                    isAutofill
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                      : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                  ${
                    errors.associationNameEng
                      ? "border-red-300 bg-red-50"
                      : isAutofill
                        ? "border-gray-200"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                  }
                `}
              />

              {errors.associationNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.associationNameEng}
                </p>
              )}

              {isAutofill && (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ฟิลด์นี้จะถูกดึงข้อมูลอัตโนมัติ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
