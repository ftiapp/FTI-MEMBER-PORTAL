import { useRef } from "react";
import { toast } from "react-hot-toast";

export function useAssociationInfoFetcher(
  formData,
  setFormData,
  setErrors,
  setIsFetchingDBD,
  setValidationStatus,
) {
  const lastFetchTime = useRef(0);
  const throttleTime = 5000; // 5 seconds

  const clearAutofilledFields = () => {
    setFormData((prev) => ({
      ...prev,
      associationName: "",
      associationNameEng: "",
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

  const fetchPostalCode = async (subDistrictName) => {
    if (!subDistrictName || subDistrictName.length < 2) {
      console.log("❌ ไม่มีชื่อตำบลหรือสั้นเกินไป");
      return;
    }

    try {
      console.log(`🔍 กำลังหา postal code สำหรับ: ${subDistrictName}`);

      const postalResponse = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(subDistrictName)}&type=subdistrict`,
      );

      if (postalResponse.ok) {
        const postalData = await postalResponse.json();
        console.log("📬 ผลการค้นหา postal code:", postalData);

        if (postalData.success && postalData.data && postalData.data.length > 0) {
          const exactMatch = postalData.data.find((item) => item.text === subDistrictName);
          const selectedItem = exactMatch || postalData.data[0];

          if (selectedItem && selectedItem.postalCode) {
            console.log(`✅ เจอ postal code: ${selectedItem.postalCode}`);

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
          } else {
            console.log("❌ ไม่มี postal code ในข้อมูล");
          }
        } else {
          console.log("❌ ไม่เจอข้อมูลตำบล");
        }
      } else {
        console.log("❌ API response ไม่ ok");
      }
    } catch (postalError) {
      console.log("❌ Error ในการดึง postal code:", postalError);
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

    lastFetchTime.current = now;
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
              "ไม่พบเลขประจำตัวผู้เสียภาษีนี้ในระบบ กรุณาตรวจสอบหมายเลขอีกครั้ง หากท่านยืนยันว่าถูกต้อง ให้กรอกข้อมูลด้วยตนเอง",
          );
          return;
        } else if (response.status === 503 || response.status === 504 || response.status === 500) {
          // ระบบไม่พร้อมใช้งาน
          clearAutofilledFields();
          toast.error(
            errorData.message ||
              "ขณะนี้ระบบดึงข้อมูลอัตโนมัติไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง หรือใช้โหมดกรอกข้อมูลด้วยตนเอง ขออภัยในความไม่สะดวก",
            { duration: 6000 },
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

        // Fetch postal code
        if (subDistrictName) {
          await fetchPostalCode(subDistrictName);
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
        { duration: 6000 },
      );
    } finally {
      setIsFetchingDBD(false);
    }
  };

  return {
    fetchAssociationInfo,
    clearAutofilledFields,
  };
}
