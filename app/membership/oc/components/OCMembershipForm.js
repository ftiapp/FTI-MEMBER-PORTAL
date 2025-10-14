"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import MembershipSuccessModal from "@/app/components/MembershipSuccessModal";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";

// Import components
import CompanyInfoSection from "./CompanyInfoSection";
import RepresentativeInfoSection from "../../components/RepresentativeInfoSection";
import BusinessInfoSection from "./BusinessInfoSection";
import DocumentsSection from "./DocumentUploadSection";
import SummarySection from "./SummarySection";
import DraftSavePopup from "./DraftSavePopup";

// Import utilities
import { validateOCForm } from "./OCFormValidation";
import { submitOCMembershipForm } from "./OCFormSubmission";
import { useOCFormNavigation } from "./OCFormNavigation";
import OCStepIndicator from "./OCStepIndicator";
import { saveDraft } from "./OCDraftService";

// Constants
const STEPS = [
  { id: 1, name: "ข้อมูลบริษัท" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

const INITIAL_FORM_DATA = {
  // Company Info
  companyName: "",
  companyNameEng: "",
  taxId: "",
  companyEmail: "",
  companyPhone: "",
  addressNumber: "",
  street: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",
  industrialGroup: "",
  provincialChapter: "",

  // Contact Person
  contactPersonFirstName: "",
  contactPersonLastName: "",
  contactPersonPosition: "",
  contactPersonEmail: "",
  contactPersonPhone: "",

  // Representatives
  representatives: [
    {
      idCardNumber: "",
      firstNameThai: "",
      lastNameThai: "",
      firstNameEnglish: "",
      lastNameEnglish: "",
      position: "",
      email: "",
      phone: "",
      isPrimary: true,
    },
  ],

  // Business Info
  businessTypes: [],
  otherBusinessType: "",
  products: "",

  // Documents
  companyRegistration: null,
  companyProfile: null,
  shareholderList: null,
  vatRegistration: null,
  idCard: null,
  authorityLetter: null,
  companyStamp: null,
  authorizedSignature: null,

  // Authorized signatory name fields
  authorizedSignatoryFirstNameTh: "",
  authorizedSignatoryLastNameTh: "",
  authorizedSignatoryFirstNameEn: "",
  authorizedSignatoryLastNameEn: "",
};

// Custom hook for API data with better error handling
const useApiData = () => {
  const [data, setData] = useState({
    businessTypes: [],
    industrialGroups: [],
    provincialChapters: [],
    isLoading: true,
    error: null,
  });

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));

        const [businessTypesRes, industrialGroupsRes, provincialChaptersRes] = await Promise.all([
          fetch("/api/business-types", { signal: abortControllerRef.current.signal }),
          // Bump limit to load all records (avoid default 50 record pagination)
          fetch("/api/industrial-groups?limit=1000&page=1", {
            signal: abortControllerRef.current.signal,
          }),
          fetch("/api/provincial-chapters?limit=1000&page=1", {
            signal: abortControllerRef.current.signal,
          }),
        ]);

        const businessTypes = businessTypesRes.ok ? await businessTypesRes.json() : [];

        const industrialGroups = industrialGroupsRes.ok
          ? (await industrialGroupsRes.json()).data?.map((item) => ({
              id: item.MEMBER_GROUP_CODE,
              name_th: item.MEMBER_GROUP_NAME,
              name_en: item.MEMBER_GROUP_NAME,
            })) || []
          : [];

        const provincialChapters = provincialChaptersRes.ok
          ? (await provincialChaptersRes.json()).data?.map((item) => ({
              id: item.MEMBER_GROUP_CODE,
              name_th: item.MEMBER_GROUP_NAME,
              name_en: item.MEMBER_GROUP_NAME,
            })) || []
          : [];

        setData({
          businessTypes,
          industrialGroups,
          provincialChapters,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        console.error("Error fetching data:", error);
        const errorMessage = "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
        toast.error(errorMessage);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return data;
};

export default function OCMembershipForm({
  currentStep,
  setCurrentStep,
  formData: externalFormData,
  setFormData: setExternalFormData,
  totalSteps,
}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);

  // Use external form data if provided, otherwise use internal state
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [taxIdValidating, setTaxIdValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Determine which form data and setters to use
  const isExternal = externalFormData !== undefined;
  const formData = isExternal ? externalFormData : internalFormData;
  const setFormData = isExternal ? setExternalFormData : setInternalFormData;

  // Sync externalFormData with internal state when it changes
  useEffect(() => {
    if (isExternal && externalFormData && Object.keys(externalFormData).length > 0) {
      console.log(
        "OC FORM: External form data received, updating internal state.",
        externalFormData,
      );
      setInternalFormData((prevData) => ({ ...prevData, ...externalFormData }));
    }
  }, [externalFormData, isExternal]);

  const {
    businessTypes,
    industrialGroups,
    provincialChapters,
    isLoading,
    error: apiError,
  } = useApiData();

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log("OC Current Step:", currentStep);
  console.log("OC Total Steps:", totalSteps);

  // Use navigation hook
  const { handleNextStep, handlePrevStep } = useOCFormNavigation(
    (formData, step) => validateOCForm(formData, step),
    currentStep,
    setCurrentStep,
    totalSteps || STEPS.length,
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load draft data on mount
  useEffect(() => {
    const loadDraftData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get("draftId");

      if (draftId) {
        setIsLoadingDraft(true);
        try {
          const response = await fetch(`/api/membership/get-drafts?type=oc`);
          const data = await response.json();

          if (data.success && data.drafts && data.drafts.length > 0) {
            const draft = data.drafts.find((d) => d.id === parseInt(draftId));
            if (draft && draft.draftData) {
              // Merge draft data with initial form data
              setFormData((prev) => ({ ...prev, ...draft.draftData }));
              setCurrentStep(draft.currentStep || 1);
              toast.success("โหลดข้อมูลร่างสำเร็จ");
            }
          }
        } catch (error) {
          console.error("Error loading draft:", error);
          toast.error("ไม่สามารถโหลดข้อมูลร่างได้");
        } finally {
          setIsLoadingDraft(false);
        }
      }
    };

    loadDraftData();
  }, [setCurrentStep, setFormData]);

  // Check tax ID uniqueness with better error handling
  const checkTaxIdUniqueness = useCallback(async (taxId) => {
    if (!taxId || taxId.length !== 13) {
      return { valid: false, message: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง" };
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setTaxIdValidating(true);

      const response = await fetch("/api/member/oc-membership/check-tax-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taxId }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();
      console.log("Tax ID validation response:", data);

      return {
        valid: data.valid === true,
        message: data.message || "ไม่สามารถตรวจสอบเลขประจำตัวผู้เสียภาษีได้",
      };
    } catch (error) {
      if (error.name === "AbortError") {
        return { valid: false, message: "การตรวจสอบถูกยกเลิก" };
      }

      console.error("Error checking tax ID uniqueness:", error);
      return {
        valid: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี",
      };
    } finally {
      setTaxIdValidating(false);
    }
  }, []);

  // Handle form submission - เฉพาะสำหรับขั้นตอนสุดท้าย (step 5)
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      // ✅ เพิ่มเงื่อนไข: ต้องอยู่ใน step 5 เท่านั้น
      if (currentStep !== 5) {
        console.log("OC Form submit prevented - not on final step");
        return;
      }

      // Clean up empty contact persons before submission (except the main contact person)
      let updatedFormData = { ...formData };
      if (formData.contactPersons && formData.contactPersons.length > 1) {
        const cleanedContactPersons = [formData.contactPersons[0]]; // Keep main contact person

        // Only keep additional contact persons that have at least some data filled in
        for (let i = 1; i < formData.contactPersons.length; i++) {
          const contact = formData.contactPersons[i];
          const hasData =
            contact.firstNameTh ||
            contact.lastNameTh ||
            contact.firstNameEn ||
            contact.lastNameEn ||
            contact.position ||
            contact.email ||
            contact.phone;

          if (hasData) {
            cleanedContactPersons.push(contact);
          }
        }

        // Update form data if we removed any contact persons
        if (cleanedContactPersons.length !== formData.contactPersons.length) {
          updatedFormData = {
            ...formData,
            contactPersons: cleanedContactPersons,
          };
          setFormData(updatedFormData);
        }
      }

      // Re-validate all fields before final submission
      const formErrors = validateOCForm(updatedFormData, STEPS.length);
      setErrors(formErrors);

      if (Object.keys(formErrors).length > 0) {
        // Set showErrors to true to trigger error UI in child components
        setShowErrors(true);

        console.log("❌ Validation errors:", formErrors);
        
        // สร้าง error message ที่ละเอียดสำหรับ representatives
        let errorMessage = '';
        let errorCount = 0;
        
        if (formErrors.representativeErrors && Array.isArray(formErrors.representativeErrors)) {
          const repErrors = formErrors.representativeErrors;
          const repErrorDetails = [];
          
          repErrors.forEach((repError, index) => {
            if (repError && Object.keys(repError).length > 0) {
              const fieldNames = Object.keys(repError).map(key => {
                const fieldMap = {
                  'prename_th': 'คำนำหน้าชื่อ (ไทย)',
                  'prename_en': 'คำนำหน้าชื่อ (อังกฤษ)',
                  'firstNameThai': 'ชื่อ (ไทย)',
                  'lastNameThai': 'นามสกุล (ไทย)',
                  'firstNameEnglish': 'ชื่อ (อังกฤษ)',
                  'lastNameEnglish': 'นามสกุล (อังกฤษ)',
                  'email': 'อีเมล',
                  'phone': 'เบอร์โทรศัพท์',
                  'position': 'ตำแหน่ง'
                };
                return fieldMap[key] || key;
              }).join(', ');
              
              repErrorDetails.push(`ผู้แทนคนที่ ${index + 1}: ${fieldNames}`);
              errorCount += Object.keys(repError).length;
            }
          });
          
          if (repErrorDetails.length > 0) {
            errorMessage = `ข้อมูลผู้แทนไม่ครบถ้วน:\n${repErrorDetails.join('\n')}`;
          }
        }
        
        // นับ errors อื่นๆ ที่ไม่ใช่ representativeErrors
        const otherErrorCount = Object.keys(formErrors).filter(key => key !== 'representativeErrors').length;
        errorCount += otherErrorCount;
        
        if (!errorMessage) {
          errorMessage = `พบข้อผิดพลาด ${errorCount} รายการ: กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน`;
        } else if (otherErrorCount > 0) {
          errorMessage += `\n\nและข้อผิดพลาดอื่นๆ อีก ${otherErrorCount} รายการ`;
        }
        
        toast.error(errorMessage, { duration: 7000 });
        
        // Optionally, navigate to the first step with an error
        const firstErrorStep = STEPS.find(
          (step) => Object.keys(validateOCForm(updatedFormData, step)).length > 0,
        );
        if (firstErrorStep) {
          setCurrentStep(firstErrorStep.id);
        }
        return;
      }

      // ✅ ตรวจสอบ consent หลังจาก validation ผ่านแล้ว
      console.log("🔍 Checking consent:", { consentAgreed, type: typeof consentAgreed });
      if (!consentAgreed) {
        console.log("❌ Consent not agreed!");
        toast.error("กรุณายอมรับข้อตกลงการคุ้มครองข้อมูลส่วนบุคคลก่อนยืนยันการสมัคร", {
          duration: 4000,
        });
        // เลื่อนไปที่กล่อง consent
        setTimeout(() => {
          const consentBox = document.querySelector('[data-consent-box]');
          if (consentBox) {
            consentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        setIsSubmitting(false);
        return;
      }
      console.log("✅ Consent agreed, proceeding with submission");

      // Set submitting state (LoadingOverlay will show automatically)
      setIsSubmitting(true);

      try {
        const result = await submitOCMembershipForm(formData);

        if (result.success) {
          // ลบ draft หลังจากสมัครสำเร็จ
          await deleteDraft();
          // แสดง Success Modal แทนการ redirect ทันที
          setSubmissionResult(result);
          setShowSuccessModal(true);
        } else {
          toast.error(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Submission error:", error);
        toast.dismiss("submitting");
        toast.error("เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง");
        setIsSubmitting(false);
      }
    },
    [formData, router, setCurrentStep, currentStep, consentAgreed],
  );

  // Handle next step - ป้องกันการ submit โดยไม่ตั้งใจ
  const handleNext = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Clean up empty contact persons before validation (except the main contact person)
      if (formData.contactPersons && formData.contactPersons.length > 1) {
        const cleanedContactPersons = [formData.contactPersons[0]]; // Keep main contact person

        // Only keep additional contact persons that have at least some data filled in
        for (let i = 1; i < formData.contactPersons.length; i++) {
          const contact = formData.contactPersons[i];
          const hasData =
            contact.firstNameTh ||
            contact.lastNameTh ||
            contact.firstNameEn ||
            contact.lastNameEn ||
            contact.position ||
            contact.email ||
            contact.phone;

          if (hasData) {
            cleanedContactPersons.push(contact);
          }
        }

        // Update form data if we removed any contact persons
        if (cleanedContactPersons.length !== formData.contactPersons.length) {
          setFormData((prev) => ({
            ...prev,
            contactPersons: cleanedContactPersons,
          }));

          // Continue with validation after state update in next render cycle
          return;
        }
      }

      const formErrors = validateOCForm(formData, currentStep);
      setErrors(formErrors);

      if (Object.keys(formErrors).length > 0) {
        // Set showErrors to true to trigger error UI in child components
        setShowErrors(true);

        // If representative step has errors, let the child component handle scroll AND toast (avoid duplicate)
        if (currentStep === 2 && formErrors.representativeErrors) {
          // Child component (RepresentativeInfoSection) will handle both scroll and toast
          return;
        }

        // If business info step has errors, let the child component handle scroll AND toast (avoid duplicate)
        if (currentStep === 3 && (formErrors.businessTypes || formErrors.otherBusinessTypeDetail || formErrors.products)) {
          // Child component (BusinessInfoSection) will handle both scroll and toast
          return;
        }

        // Show a specific message for the first error and scroll to the field
        const [firstKey, firstValue] = Object.entries(formErrors)[0] || [];

        // Prepare toast message
        const firstMessage =
          typeof firstValue === "string" ? firstValue : "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง";

        toast.error(firstMessage);

        // Helper: map error key to DOM element id/name
        const scrollToErrorField = (errorKey) => {
          if (!errorKey) return;

          // Address fields: addresses.{type}.{field}
          if (errorKey.startsWith("addresses.")) {
            const match = errorKey.match(/addresses\.(\d+)\.(.+)$/);
            if (match) {
              const tab = match[1];
              const field = match[2];

              // Map validation field to actual input id in CompanyAddressInfo
              let targetId = null;
              if (field === "email") targetId = `email-${tab}`;
              else if (field === "phone") targetId = `phone-${tab}`;
              else if (["addressNumber", "building", "moo", "soi", "street"].includes(field))
                targetId = field;
              // subDistrict/district/province/postalCode are SearchableDropdowns; scrolling to section is sufficient

              // Allow CompanyAddressInfo to auto-switch tab via its useEffect (based on errors), then focus
              setTimeout(() => {
                let el = null;
                if (targetId) {
                  el = document.getElementById(targetId);
                  if (!el) el = document.querySelector(`[name="${targetId}"]`);
                }

                // Fallback: scroll to the address section container
                if (!el) {
                  const section =
                    document.querySelector('[data-section="company-address"]') ||
                    document.querySelector(".company-address") ||
                    document.querySelector(".bg-white");
                  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                  return;
                }

                try {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  // Focus without jumping again
                  el.focus({ preventScroll: true });
                } catch {}
              }, 250);
              return;
            }
          }

          // Non-address fields: try matching by id or name
          setTimeout(() => {
            const byId = document.getElementById(errorKey);
            const byName = document.querySelector(`[name="${errorKey}"]`);
            const el = byId || byName;
            if (el) {
              try {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus({ preventScroll: true });
                return;
              } catch {}
            }

            // Fallbacks by section
            if (errorKey.startsWith("contactPerson")) {
              const section = document.querySelector('[data-section="contact-person"]');
              if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
        };

        scrollToErrorField(firstKey);
        return;
      }

      // Special check for Tax ID on step 1
      if (currentStep === 1 && formData.taxId?.length === 13) {
        const taxIdResult = await checkTaxIdUniqueness(formData.taxId);
        if (!taxIdResult.valid) {
          setErrors((prev) => ({ ...prev, taxId: taxIdResult.message }));
          toast.error(taxIdResult.message);
          return;
        }
      }

      setCurrentStep((prev) => prev + 1);
      // Scroll to top for better UX when advancing steps
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [formData, currentStep, checkTaxIdUniqueness, setCurrentStep],
  );

  const handlePrevious = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      setCurrentStep((prev) => prev - 1);
    },
    [setCurrentStep],
  );

  // ฟังก์ชันสำหรับบันทึก draft
  const handleSaveDraft = useCallback(async () => {
    // ตรวจสอบว่ามี Tax ID หรือไม่
    if (!formData.taxId || formData.taxId.trim() === "") {
      toast.error("กรุณากรอกเลขประจำตัวผู้เสียภาษีก่อนบันทึกร่าง");
      return;
    }

    // ตรวจสอบความถูกต้องของ Tax ID (13 หลัก)
    if (formData.taxId.length !== 13 || !/^\d{13}$/.test(formData.taxId)) {
      toast.error("เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก");
      return;
    }

    try {
      const response = await fetch("/api/membership/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberType: "oc",
          draftData: formData,
          currentStep: currentStep,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // แสดง popup แทน toast
        setShowDraftSavePopup(true);
      } else {
        toast.error(`ไม่สามารถบันทึกร่างได้: ${result.message || "กรุณาลองใหม่"}`);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกร่าง");
    }
  }, [formData, currentStep]);

  // ฟังก์ชันสำหรับลบ draft หลังจากสมัครสำเร็จ
  const deleteDraft = useCallback(async () => {
    try {
      // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ tax ID
      const response = await fetch("/api/membership/get-drafts?type=oc");

      if (!response.ok) {
        console.error("Failed to fetch drafts for deletion");
        return;
      }

      const data = await response.json();
      const drafts = Array.isArray(data) ? data : data?.drafts || [];

      // หา draft ที่ตรงกับ tax ID ของผู้สมัคร
      const draftToDelete = drafts.find((draft) => {
        const draftTaxId = draft?.draftData?.taxId || draft?.tax_id || draft?.taxId;
        return String(draftTaxId || "") === String(formData.taxId || "");
      });

      if (draftToDelete) {
        const deleteResponse = await fetch("/api/membership/delete-draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberType: "oc",
            draftId: draftToDelete.id,
          }),
        });

        const deleteResult = await deleteResponse.json();

        if (deleteResult.success) {
          console.log("Draft deleted successfully");
        } else {
          console.error("Failed to delete draft:", deleteResult.message);
        }
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  }, [formData.taxId]);

  // Render current step component
  const currentStepComponent = useMemo(() => {
    const commonProps = { formData, setFormData, errors };

    const stepComponents = {
      1: (
        <CompanyInfoSection
          {...commonProps}
          setErrors={setErrors}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          taxIdValidating={taxIdValidating}
        />
      ),
      2: <RepresentativeInfoSection 
        mode="multiple"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        config={{
          headerTitle: "ข้อมูลผู้แทนนิติบุคคล",
          headerSubtitle: "ข้อมูลผู้มีอำนาจลงนามแทนนิติบุคคล",
          positionPlaceholder: "ตำแหน่งในบริษัท",
          infoMessage: "สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน ควรเป็นผู้มีอำนาจลงนามแทนนิติบุคคลตามหนังสือรับรอง",
          toastId: "oc-representative-errors",
          fieldNames: {
            firstNameTh: "firstNameThai",
            lastNameTh: "lastNameThai",
            firstNameEn: "firstNameEnglish",
            lastNameEn: "lastNameEnglish",
          },
        }}
      />,
      3: (
        <BusinessInfoSection
          {...commonProps}
          businessTypes={businessTypes}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
        />
      ),
      4: <DocumentsSection {...commonProps} showErrors={showErrors} />,
      5: (
        <SummarySection
          formData={formData}
          businessTypes={businessTypes}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
        />
      ),
    };

    return stepComponents[currentStep] || null;
  }, [
    currentStep,
    formData,
    errors,
    businessTypes,
    industrialGroups,
    provincialChapters,
    taxIdValidating,
    showErrors,
  ]);

  // Render error message helper
  const renderErrorMessage = (errorValue, key, index) => {
    if (typeof errorValue === "object" && errorValue !== null) {
      // Handle nested error objects
      const firstErrorKey = Object.keys(errorValue)[0];
      const message =
        firstErrorKey === "_error" ? errorValue._error : `${key}: ${errorValue[firstErrorKey]}`;
      return (
        <li key={`${key}-${index}`} className="text-base">
          {message}
        </li>
      );
    }
    return (
      <li key={`${key}-${index}`} className="text-base">
        {errorValue}
      </li>
    );
  };

  // Show loading state
  if (isLoading || isLoadingDraft) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  // Show API error
  if (apiError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{apiError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-8">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="mt-4 text-white text-xl font-semibold">กำลังดำเนินการส่งข้อมูล...</p>
          <p className="mt-2 text-white text-md">กรุณาอย่าปิดหน้านี้</p>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Error Messages */}
        {Object.keys(errors).filter(
          (key) =>
            errors[key] &&
            errors[key] !== "" &&
            key !== "representativeErrors" &&
            key !== "contactPerson",
        ).length > 0 && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl"
            role="alert"
          >
            <strong className="font-bold text-lg">กรุณาแก้ไขข้อมูลให้ถูกต้อง:</strong>
            <ul className="mt-4 list-disc list-inside space-y-2">
              {Object.keys(errors)
                .filter(
                  (key) =>
                    errors[key] &&
                    errors[key] !== "" &&
                    key !== "representativeErrors" &&
                    key !== "contactPerson",
                )
                .map((key, index) => renderErrorMessage(errors[key], key, index))}
            </ul>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white p-8 rounded-2xl shadow-lg min-h-[500px]">
          {currentStepComponent}
        </div>

        {/* Consent Checkbox - Show only on the last step */}
        {currentStep === (totalSteps || STEPS.length) && (
          <div data-consent-box className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              {/* Shield Icon */}
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  การคุ้มครองข้อมูลส่วนบุคคล
                </h3>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1.5 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-medium text-gray-900">
                        ข้าพเจ้าตกลงและยินยอมให้{" "}
                        <span className="text-blue-700 font-semibold">
                          สภาอุตสาหกรรมแห่งประเทศไทย
                        </span>
                      </span>{" "}
                      เก็บ รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
                      เพื่อวัตถุประสงค์ในการติดต่อสื่อสาร การให้บริการ
                      และการดำเนินงานที่เกี่ยวข้องกับการเป็นสมาชิก
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      อ่านรายละเอียดฉบับเต็มได้ที่
                      {" "}
                      <a
                        href="/Privacy-Notice-ผู้สมัครสมาชิกส.อ.ท_.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline hover:text-blue-800"
                      >
                        นโยบายความเป็นส่วนตัว (Privacy Notice) สำหรับผู้สมัครสมาชิก
                      </a>
                    </p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      ทั้งนี้ ข้าพเจ้าสามารถเพิกถอนความยินยอมได้ตามช่องทางที่องค์กรกำหนด
                    </p>
                  </div>
                </label>

                {!consentAgreed && (
                  <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-medium">
                      กรุณายอมรับข้อตกลงเพื่อดำเนินการต่อ
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons - Fixed positioning */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                currentStep === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md"
              }`}
            >
              ← ย้อนกลับ
            </button>

            {/* Step Counter */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-lg text-blue-700 font-semibold">
                  ขั้นตอนที่ {currentStep} จาก {totalSteps || STEPS.length}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Save Draft Button - Show on steps 1, 2, 3 */}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
                >
                  บันทึกร่าง
                </button>
              )}

              {/* Next Button - Show on steps 1, 2, 3, 4 */}
              {currentStep < (totalSteps || STEPS.length) && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 hover:shadow-md disabled:bg-gray-400"
                >
                  ถัดไป →
                </button>
              )}

              {/* Submit Button - Show only on the last step */}
              {currentStep === (totalSteps || STEPS.length) && (
                <button
                  type="submit"
                  disabled={isSubmitting || !consentAgreed}
                  className="px-10 py-4 bg-green-600 text-white rounded-xl font-semibold text-base hover:bg-green-700 transition-all duration-200 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "กำลังส่ง..." : "ยืนยันการสมัคร"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Document preparation hint */}
        {currentStep === 1 && (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-base">
              <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> หนังสือรับรองบริษัท
              และทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)
            </p>
          </div>
        )}
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        taxId={formData.taxId}
        companyName={formData.companyName}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isSubmitting}
        message="กำลังส่งข้อมูล... กรุณาอย่าปิดหน้าต่างนี้"
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="oc"
        memberData={{
          taxId: formData.taxId,
          companyNameTh: formData.companyName,
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/dashboard?tab=documents");
        }}
      />
    </div>
  );
}
