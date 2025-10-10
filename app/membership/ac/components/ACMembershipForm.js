"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import { useRouter } from "next/navigation";
import MembershipSuccessModal from "@/app/components/MembershipSuccessModal";

// Import components
import CompanyInfoSection from "./CompanyInfoSection";
import RepresentativeSection from "./RepresentativeInfoSection";
import BusinessInfoSection from "./BusinessInfoSection";
import DocumentsSection from "./DocumentUploadSection";
import SummarySection from "./SummarySection";
import DraftSavePopup from "./DraftSavePopup";

// Import utilities
import { validateACForm } from "./ACFormValidation";
import { submitACMembershipForm } from "./ACFormSubmission";
import { useACFormNavigation } from "./ACFormNavigation";
import { saveDraft } from "./ACDraftService";

// Constants
const STEPS = [
  { id: 1, name: "ข้อมูลบริษัท" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

const INITIAL_FORM_DATA = {
  companyName: "",
  companyNameEn: "",
  taxId: "",
  companyEmail: "",
  companyPhone: "",
  companyWebsite: "",
  addressNumber: "",
  street: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",

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

  businessTypes: {},
  otherBusinessTypeDetail: "",
  products: [],
  memberCount: "",
  registeredCapital: "",
  industrialGroups: [],
  provincialChapters: [],
  // Documents
  companyRegistration: null,
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
  // Authorized signatory position fields
  authorizedSignatoryPositionTh: "",
  authorizedSignatoryPositionEn: "",
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

export default function ACMembershipForm({
  formData: externalFormData,
  setFormData: externalSetFormData,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  totalSteps: externalTotalSteps,
  rejectionId, // เพิ่ม rejectionId สำหรับโหมดแก้ไข
  userComment, // เพิ่ม comment จากผู้ใช้
  isSinglePageLayout = false, // เพิ่ม prop สำหรับ layout หน้าเดียว
}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);
  const stickyOffsetRef = useRef(120); // Approx header/toolbar height to offset when scrolling

  // Use external form data if provided, otherwise use internal state
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});

  // Helper: Scroll to a field key with offset and focus
  const scrollToErrorField = useCallback(
    (errorKey) => {
      if (!errorKey || typeof document === "undefined") return;

      // Company basic info fields - handle these first and specifically
      const companyBasicFields = [
        "companyName",
        "companyNameEn",
        "taxId",
        "registrationNumber",
        "registrationDate",
      ];
      if (companyBasicFields.includes(errorKey)) {
        setTimeout(() => {
          // Try multiple selector strategies for company fields
          const selectors = [
            `#${errorKey}`,
            `[name="${errorKey}"]`,
            `[data-field="${errorKey}"]`,
            `input[id="${errorKey}"]`,
            `input[name="${errorKey}"]`,
          ];

          let el = null;
          for (const selector of selectors) {
            el = document.querySelector(selector);
            if (el) break;
          }

          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Focus after scrolling completes
            setTimeout(() => {
              try {
                el.focus({ preventScroll: true });
              } catch (e) {}
            }, 100);
          } else {
            // Fallback: scroll to company info section
            const section =
              document.querySelector('[data-section="company-info"]') ||
              document.querySelector(".company-info");
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
        return;
      }

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
          else if (["addressNumber", "building", "moo", "soi", "road", "street"].includes(field))
            targetId = field;
          // subDistrict/district/province/postalCode are SearchableDropdowns; scrolling to section is sufficient

          // Allow CompanyAddressInfo to auto-switch tab via its useEffect (based on errors), then focus
          setTimeout(() => {
            let el = null;
            if (targetId) {
              el = document.getElementById(targetId);
              if (!el) el = document.querySelector(`[name="${targetId}"]`);
            }

            // Try more specific selector for address fields
            if (!el) {
              el = document.querySelector(`[name="addresses[${tab}][${field}]"]`);
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
              setTimeout(() => el.focus({ preventScroll: true }), 300);
            } catch {}
          }, 250);
          return;
        }
      }

      // Representative fields: handle special rep-{index}-{field} format
      if (errorKey.startsWith("rep-")) {
        const match = errorKey.match(/rep-(\d+)-(.+)$/);
        if (match) {
          const repIndex = match[1];
          const field = match[2];

          setTimeout(() => {
            // Try various selectors to find the representative field
            const selectors = [
              `#rep-${repIndex}-${field}`,
              `[name="representatives[${repIndex}][${field}]"]`,
              `[data-rep="${repIndex}"][data-field="${field}"]`,
            ];

            let el = null;
            for (const selector of selectors) {
              el = document.querySelector(selector);
              if (el) break;
            }

            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => el.focus({ preventScroll: true }), 300);
            } else {
              // Fallback: scroll to representative section
              const section = document.querySelector('[data-section="representatives"]');
              if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
          return;
        }
      }

      // Non-address fields: try matching by id or name
      setTimeout(() => {
        // Try multiple selector strategies
        const selectors = [
          `#${errorKey}`,
          `[name="${errorKey}"]`,
          `[data-field="${errorKey}"]`,
          `input[id="${errorKey}"]`,
          `input[name="${errorKey}"]`,
          `select[id="${errorKey}"]`,
          `select[name="${errorKey}"]`,
          `textarea[id="${errorKey}"]`,
          `textarea[name="${errorKey}"]`,
        ];

        let el = null;
        for (const selector of selectors) {
          el = document.querySelector(selector);
          if (el) break;
        }

        if (el) {
          try {
            // Use scrollIntoView for consistent behavior with OC form
            el.scrollIntoView({ behavior: "smooth", block: "center" });

            setTimeout(() => el.focus({ preventScroll: true }), 100);
            return;
          } catch {}
        }

        // Handle summary key for contact persons (plural)
        if (errorKey === "contactPersons") {
          const section = document.querySelector('[data-section="contact-person"]');
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        // Handle contact person fields: contactPerson{index}{field}
        if (errorKey.startsWith("contactPerson")) {
          const match = errorKey.match(/contactPerson(\d+)(.+)$/);
          if (match) {
            const contactIndex = match[1];
            const field = match[2];

            setTimeout(() => {
              // Try multiple selector strategies for contact person fields
              const selectors = [
                `#${errorKey}`,
                `[name="${errorKey}"]`,
                `#contactPerson${contactIndex}${field}`,
                `[name="contactPerson${contactIndex}${field}"]`,
              ];

              let contactEl = null;
              for (const selector of selectors) {
                contactEl = document.querySelector(selector);
                if (contactEl) break;
              }

              if (contactEl) {
                contactEl.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                  try {
                    contactEl.focus({ preventScroll: true });
                  } catch (e) {}
                }, 100);
              } else {
                // Fallback: scroll to contact person section
                const section = document.querySelector('[data-section="contact-person"]');
                if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
            return;
          }

          // Fallback for general contact person errors
          const section = document.querySelector('[data-section="contact-person"]');
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        } else if (errorKey === "addresses" && errors.addresses) {
          // Handle generic address errors
          const addressTypes = ["1", "2", "3"];
          for (const type of addressTypes) {
            if (errors.addresses[type] && Object.keys(errors.addresses[type]).length > 0) {
              const section = document.querySelector('[data-section="company-address"]');
              if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
              break;
            }
          }
        } else {
          // Last resort: try to find a section based on the error key
          const sectionMap = {
            companyName: "company-info",
            businessTypes: "business-types",
            products: "products",
            documents: "documents",
          };

          // Check if the error key starts with any of the keys in sectionMap
          for (const [key, sectionName] of Object.entries(sectionMap)) {
            if (errorKey.startsWith(key)) {
              const section = document.querySelector(`[data-section="${sectionName}"]`);
              if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
              }
            }
          }
        }
      }, 100);
    },
    [errors],
  );
  const [taxIdValidating, setTaxIdValidating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Determine which form data and setters to use
  const isExternal = externalFormData !== undefined;
  const formData = isExternal ? externalFormData : internalFormData;
  const setFormData = isExternal ? externalSetFormData : setInternalFormData;

  // When external data is provided, ensure the form uses it directly.
  // This is crucial for the 'edit-rejected' feature.
  useEffect(() => {
    if (isExternal && externalFormData && Object.keys(externalFormData).length > 0) {
      console.log("AC FORM: External form data received, using it directly.", externalFormData);
      // Directly use the external data. The `formData` variable is already aliased to `externalFormData`.
      // We might clear errors from previous states if necessary.
      setErrors({});
    } else if (!isExternal) {
      // Logic for non-external data, e.g., loading draft
    }
  }, [externalFormData, isExternal]);

  const {
    businessTypes,
    industrialGroups,
    provincialChapters,
    isLoading,
    error: apiError,
  } = useApiData();

  // Use external navigation if provided, otherwise use internal hook
  const internalNavigation = useACFormNavigation(
    (formData, step) => validateACForm(formData, step),
    externalCurrentStep,
    externalSetCurrentStep,
    externalTotalSteps,
  );

  const currentStep = externalCurrentStep || internalNavigation.currentStep;
  const setCurrentStep = externalSetCurrentStep || internalNavigation.setCurrentStep;
  const totalSteps = externalTotalSteps || internalNavigation.totalSteps;
  const isSubmitting = internalNavigation.isSubmitting;
  const setIsSubmitting = internalNavigation.setIsSubmitting;
  const handleNextStep = internalNavigation.handleNextStep;
  const handlePrevStep = internalNavigation.handlePrevStep;

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log("AC Current Step:", currentStep);
  console.log("AC Total Steps:", totalSteps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load draft data on mount - only if not using external form data
  useEffect(() => {
    // Skip draft loading if external form data is provided (e.g., from edit-rejected page)
    if (externalFormData) {
      console.log("🔄 AC Form: Using external form data, skipping draft load");
      return;
    }

    const loadDraftData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get("draftId");

      if (draftId) {
        setIsLoadingDraft(true);
        try {
          const response = await fetch(`/api/membership/get-drafts?type=ac`);
          const data = await response.json();

          if (data.success && data.drafts && data.drafts.length > 0) {
            const draft = data.drafts.find((d) => d.id === parseInt(draftId));
            if (draft && draft.draftData) {
              // Merge draft data with initial form data
              setFormData((prev) => ({ ...prev, ...draft.draftData }));
              // ถ้า navigation hook รองรับการตั้งค่า currentStep
              if (setCurrentStep && draft.currentStep) {
                setCurrentStep(draft.currentStep);
              }
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
  }, [externalFormData]); // Add externalFormData as dependency

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
          memberType: "ac",
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
  const deleteDraft = useCallback(async (taxId) => {
    if (!taxId) return;
    try {
      // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ tax ID
      const response = await fetch("/api/membership/get-drafts?type=ac");

      if (!response.ok) {
        console.error("Failed to fetch drafts for deletion");
        return;
      }

      const draftsData = await response.json();
      const drafts = draftsData?.success ? draftsData.drafts || [] : [];

      // หา draft ที่ตรงกับ tax ID ของผู้สมัคร
      const normalize = (v) => String(v ?? "").replace(/\D/g, "");
      const targetTax = normalize(taxId);
      const draftToDelete = drafts.find((draft) => normalize(draft.draftData?.taxId) === targetTax);

      if (draftToDelete) {
        const deleteResponse = await fetch("/api/membership/delete-draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberType: "ac",
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
  }, []);

  // Check tax ID uniqueness with better error handling
  const checkTaxIdUniqueness = useCallback(async (taxId) => {
    if (!taxId || taxId.length !== 13) {
      return { isUnique: false, message: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง" };
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setTaxIdValidating(true);

      // ตรวจสอบกับ API ที่ถูกต้องของ AC
      const response = await fetch("/api/member/ac-membership/check-tax-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxId }),
        signal: abortControllerRef.current.signal,
      });
      const result = await response.json();

      // Map ให้เข้ากับรูปแบบที่ฟอร์มนี้ใช้งาน { isUnique, message }
      if (!response.ok) {
        if (response.status === 409) {
          return {
            isUnique: false,
            message: result.error || result.message || "เลขประจำตัวผู้เสียภาษีซ้ำ",
          };
        }
        return {
          isUnique: false,
          message: result.error || result.message || "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
        };
      }

      return {
        isUnique: result.valid === true,
        message:
          result.message ||
          (result.valid ? "เลขประจำตัวผู้เสียภาษีสามารถใช้ได้" : "ไม่สามารถตรวจสอบได้"),
      };
    } catch (error) {
      console.error("Error checking tax ID uniqueness:", error);
      return {
        isUnique: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี",
      };
    } finally {
      setTaxIdValidating(false);
    }
  }, []);

  // Helper to extract the first specific field error in a deterministic priority
  // Priority: Company basic info -> Addresses -> Contact persons -> Fallback
  const getFirstFieldError = useCallback((errs) => {
    if (!errs || typeof errs !== "object") return { key: null, message: null };

    // 1) Company basic info fields in explicit order
    const companyPriority = [
      "companyName",
      "companyNameEn",
      "taxId",
      "registrationNumber",
      "registrationDate",
      "companyEmail",
      "companyPhone",
      "companyWebsite",
    ];
    for (const k of companyPriority) {
      if (typeof errs[k] === "string") {
        return { key: k, message: errs[k] };
      }
    }

    // 2) Address nested errors: errors.addresses[type][field] or summary
    if (errs.addresses && typeof errs.addresses === "object") {
      const typeKeys = Object.keys(errs.addresses).filter((k) => k !== "_error");
      for (const t of typeKeys) {
        const obj = errs.addresses[t];
        if (obj && typeof obj === "object") {
          const fieldKeys = Object.keys(obj).filter((f) => f !== "base");
          if (fieldKeys.length > 0) {
            const f = fieldKeys[0];
            const msg = obj[f];
            if (typeof msg === "string") return { key: `addresses.${t}.${f}`, message: msg };
          }
        }
      }
      if (typeof errs.addresses._error === "string") {
        return { key: "addresses", message: errs.addresses._error };
      }
    }

    // 3) Contact person flat field keys e.g. contactPerson0FirstNameTh
    const contactKeys = Object.keys(errs).filter((k) => k.startsWith("contactPerson"));
    if (contactKeys.length > 0) {
      const k = contactKeys[0];
      const v = errs[k];
      if (typeof v === "string") return { key: k, message: v };
    }

    // Note: Representative errors are handled specially in submit handlers via representativeErrors

    // 4) Fallback: first flat string error key or first leaf string in a nested object
    for (const [k, v] of Object.entries(errs)) {
      if (typeof v === "string") return { key: k, message: v };
      if (v && typeof v === "object") {
        const nestedFirstKey = Object.keys(v).find((x) => typeof v[x] === "string");
        if (nestedFirstKey) return { key: `${k}.${nestedFirstKey}`, message: v[nestedFirstKey] };
      }
    }

    return { key: null, message: null };
  }, []);

  // Handle form submission and step navigation
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setIsSubmitting(true);

      try {
        // ถ้าอยู่ในโหมดแบ่งขั้นตอน และไม่ใช่ขั้นตอนสุดท้าย ให้ไปขั้นตอนถัดไป
        if (!isSinglePageLayout && currentStep < totalSteps) {
          const formErrors = validateACForm(formData, currentStep);
          setErrors(formErrors);

          if (Object.keys(formErrors).length > 0) {
            const { key: firstSpecificKey, message: firstSpecificMessage } =
              getFirstFieldError(formErrors);
            const firstMessage = firstSpecificMessage || "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง";
            toast.error(firstMessage);

            // ถ้า error แรกเป็นฟิลด์ข้อมูลบริษัท ให้เลื่อนไปที่ฟิลด์นั้นก่อนเลย (มีความสำคัญสูงสุด)
            const companyBasicFields = [
              "companyName",
              "companyNameEn",
              "taxId",
              "registrationNumber",
              "registrationDate",
              "companyEmail",
              "companyPhone",
              "companyWebsite",
            ];
            if (firstSpecificKey && companyBasicFields.includes(firstSpecificKey)) {
              scrollToErrorField(firstSpecificKey);
              setIsSubmitting(false);
              return;
            }

            // จัดการกรณีพิเศษสำหรับ representativeErrors
            if (formErrors.representativeErrors && Array.isArray(formErrors.representativeErrors)) {
              const repIndex = formErrors.representativeErrors.findIndex(
                (e) => e && Object.keys(e).length > 0,
              );
              if (repIndex !== -1) {
                const field = Object.keys(formErrors.representativeErrors[repIndex])[0];
                scrollToErrorField(`rep-${repIndex}-${field}`);
                setIsSubmitting(false);
                return;
              }
            }

            // จัดการกรณีพิเศษสำหรับ addresses (errors.addresses[type].field)
            if (formErrors.addresses && typeof formErrors.addresses === "object") {
              const typeKeys = Object.keys(formErrors.addresses).filter((k) => k !== "_error");
              const firstType = typeKeys.find(
                (t) => formErrors.addresses[t] && Object.keys(formErrors.addresses[t]).length > 0,
              );
              if (firstType) {
                const fieldKeys = Object.keys(formErrors.addresses[firstType]).filter(
                  (k) => k !== "base",
                );
                const firstField = fieldKeys[0];
                if (firstField) {
                  scrollToErrorField(`addresses.${firstType}.${firstField}`);
                  setIsSubmitting(false);
                  return;
                }
              }
            }

            // เลื่อนไปยัง field แรกที่มี error (ใช้ specific key ถ้ามี)
            if (firstSpecificKey) {
              scrollToErrorField(firstSpecificKey);
            }
            setIsSubmitting(false);
            return;
          }

          // ตรวจสอบ Tax ID ในขั้นตอนที่ 1
          if (currentStep === 1 && formData.taxId && formData.taxId.length === 13) {
            const taxIdResult = await checkTaxIdUniqueness(formData.taxId);
            if (!taxIdResult.isUnique) {
              setIsSubmitting(false);
              toast.error(taxIdResult.message);
              return;
            }
          }

          console.log("✅ Step validation passed, moving to next step");
          // Increment step directly to avoid re-validating with possibly different internal step in navigation hook
          if (setCurrentStep) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
          }
          setIsSubmitting(false);
          return;
        }

        // Continue with the rest of the function for final submission
      } catch (error) {
        console.error("Error during form validation or navigation:", error);
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
        setIsSubmitting(false);
        return;
      }

      // --- Final Submission Logic (currentStep === 5) สำหรับโหมดปกติ ---
      console.log("🔄 Final submission for step-by-step mode");

      const formErrors = validateACForm(formData, STEPS.length);
      setErrors(formErrors);

      if (Object.keys(formErrors).length > 0) {
        console.log("❌ Final validation errors:", formErrors);

        // แสดง error message ที่ละเอียดขึ้น
        const errorCount = Object.keys(formErrors).length;
        const { key: firstSpecificKey, message: firstSpecificMessage } =
          getFirstFieldError(formErrors);
        const firstMessage =
          firstSpecificMessage || `พบข้อผิดพลาด ${errorCount} รายการ: กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน`;
        toast.error(firstMessage, { duration: 5000 });

        const firstErrorStep = STEPS.find(
          (step) => Object.keys(validateACForm(formData, step.id)).length > 0,
        );
        if (firstErrorStep && setCurrentStep) {
          setCurrentStep(firstErrorStep.id);
          // หลังเปลี่ยนสเต็ป ให้เลื่อนและโฟกัสไปยังฟิลด์แรกของสเต็ปนั้น
          const stepErrors = validateACForm(formData, firstErrorStep.id);
          // ใช้คีย์ฟิลด์แรกตามลำดับความสำคัญที่กำหนด (บริษัท -> ที่อยู่ -> ผู้ติดต่อ)
          const { key: stepFirstKey } = getFirstFieldError(stepErrors);
          const companyBasicFields = [
            "companyName",
            "companyNameEn",
            "taxId",
            "registrationNumber",
            "registrationDate",
            "companyEmail",
            "companyPhone",
            "companyWebsite",
          ];

          // ถ้าเป็นฟิลด์บริษัท ให้เลื่อนไปก่อน
          if (stepFirstKey && companyBasicFields.includes(stepFirstKey)) {
            setTimeout(() => scrollToErrorField(stepFirstKey), 350);
            return;
          }

          // ถ้าเป็น representative ให้ใช้รูปแบบพิเศษ
          if (stepErrors.representativeErrors && Array.isArray(stepErrors.representativeErrors)) {
            const repIndex = stepErrors.representativeErrors.findIndex(
              (e) => e && Object.keys(e).length > 0,
            );
            if (repIndex !== -1) {
              const field = Object.keys(stepErrors.representativeErrors[repIndex])[0];
              setTimeout(() => scrollToErrorField(`rep-${repIndex}-${field}`), 350);
              return;
            }
          }

          // ถ้าเป็นที่อยู่ ให้เลื่อนไปยังฟิลด์แรกของที่อยู่
          if (stepErrors.addresses && typeof stepErrors.addresses === "object") {
            const typeKeys = Object.keys(stepErrors.addresses).filter((k) => k !== "_error");
            const firstType = typeKeys.find(
              (t) => stepErrors.addresses[t] && Object.keys(stepErrors.addresses[t]).length > 0,
            );
            if (firstType) {
              const fieldKeys = Object.keys(stepErrors.addresses[firstType]).filter(
                (k) => k !== "base",
              );
              const firstField = fieldKeys[0];
              if (firstField) {
                setTimeout(() => scrollToErrorField(`addresses.${firstType}.${firstField}`), 350);
                return;
              }
            }
          }

          // อย่างอื่นให้ใช้คีย์ฟิลด์เฉพาะที่หาได้
          const targetKey = stepFirstKey || Object.keys(stepErrors)[0];
          if (targetKey) {
            setTimeout(() => {
              scrollToErrorField(targetKey);
            }, 350);
          }
        }
        return;
      }

      // ✅ ต้องยอมรับเงื่อนไขก่อนส่ง
      if (!consentAgreed) {
        toast.error("กรุณายอมรับข้อตกลงการคุ้มครองข้อมูลส่วนบุคคลก่อนยืนยันการสมัคร", {
          duration: 4000,
          position: "top-center",
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

      console.log("✅ Final validation passed, proceeding with submission");
      toast.loading("กำลังส่งข้อมูล...", { id: "submitting" });
      setIsSubmitting(true);

      try {
        let result;
        if (rejectionId) {
          console.log("🔄 Resubmitting rejected application (step mode):", rejectionId);
          const res = await fetch(`/api/membership/rejected-applications/${rejectionId}/resubmit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              formData: formData,
              memberType: "ac",
              userComment: userComment, // ส่ง comment ไปด้วย
              apiData: {
                industrialGroups,
                provincialChapters,
              },
            }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          result = await res.json();
        } else {
          console.log("🔄 New submission (step mode)");
          result = await submitACMembershipForm(formData);
        }

        toast.dismiss("submitting");

        if (result.success) {
          console.log("✅ Final submission successful");
          if (!rejectionId) {
            await deleteDraft(formData.taxId);
          }
          // แสดง Success Modal แทนการ redirect ทันที
          setSubmissionResult(result);
          setShowSuccessModal(true);
        } else {
          console.log("❌ Final submission failed:", result.message);
          toast.error(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        }
      } catch (error) {
        console.error("💥 Final submission error:", error);
        toast.dismiss("submitting");

        let errorMessage = "เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง";
        if (error.message) {
          errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
        }

        toast.error(errorMessage, { duration: 5000 });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      currentStep,
      router,
      setCurrentStep,
      rejectionId,
      checkTaxIdUniqueness,
      handleNextStep,
      deleteDraft,
      isSinglePageLayout,
    ],
  );

  const handlePrevious = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      handlePrevStep();
    },
    [handlePrevStep],
  );

  // Render form content based on layout
  const renderFormContent = () => {
    const commonProps = { formData, setFormData, errors };

    if (isSinglePageLayout) {
      return (
        <div className="space-y-12">
          <CompanyInfoSection
            {...commonProps}
            setErrors={setErrors}
            taxIdValidating={taxIdValidating}
          />
          <hr />
          <RepresentativeSection {...commonProps} />
          <hr />
          <BusinessInfoSection
            {...commonProps}
            businessTypes={businessTypes}
            industrialGroups={industrialGroups}
            provincialChapters={provincialChapters}
            isLoading={isLoading}
          />
          <hr />
          <DocumentsSection {...commonProps} />
        </div>
      );
    }

    // Original step-by-step logic
    const stepComponents = {
      1: (
        <CompanyInfoSection
          {...commonProps}
          setErrors={setErrors}
          taxIdValidating={taxIdValidating}
        />
      ),
      2: <RepresentativeSection {...commonProps} />,
      3: (
        <BusinessInfoSection
          {...commonProps}
          businessTypes={businessTypes}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          isLoading={isLoading}
        />
      ),
      4: <DocumentsSection {...commonProps} />,
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
  };

  // Render error message helper
  const renderErrorMessage = (errorValue, key, index) => {
    // Helper to extract the first string message from nested objects
    const getFirstStringMessage = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      // Prefer summary key if present
      if (typeof obj._error === "string") return obj._error;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") return `${key === "addresses" ? "" : `${k}: `}${v}`.trim();
        if (v && typeof v === "object") {
          const nested = getFirstStringMessage(v);
          if (nested) return nested;
        }
      }
      return null;
    };

    if (typeof errorValue === "object" && errorValue !== null) {
      // Special handling for addresses to avoid [object Object]
      const message = getFirstStringMessage(errorValue);
      const display = message || (key ? `${key}` : "เกิดข้อผิดพลาด");
      return (
        <li key={`${key}-${index}`} className="text-base">
          {display}
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
      <LoadingOverlay isLoading={isSubmitting} message="กำลังส่งข้อมูล..." subMessage="กรุณาอย่าปิดหน้าต่างนี้" />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Messages */}
        {Object.keys(errors).filter(
          (key) => errors[key] && errors[key] !== "" && key !== "representativeErrors",
        ).length > 0 && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl"
            role="alert"
          >
            <strong className="font-bold text-lg">กรุณาแก้ไขข้อมูลให้ถูกต้อง:</strong>
            <ul className="mt-4 list-disc list-inside space-y-2">
              {Object.keys(errors)
                .filter(
                  (key) => errors[key] && errors[key] !== "" && key !== "representativeErrors",
                )
                .map((key, index) => renderErrorMessage(errors[key], key, index))}
            </ul>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
          {renderFormContent()}
        </div>

        {/* Consent Checkbox - Show only on the last step */}
        {(currentStep === 5 || isSinglePageLayout) && (
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
                      อ่านรายละเอียดฉบับเต็มได้ที่{" "}
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
          <div
            className={`max-w-7xl mx-auto flex ${isSinglePageLayout ? "justify-end" : "justify-between"} items-center`}
          >
            {!isSinglePageLayout && (
              <>
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
                      ขั้นตอนที่ {currentStep} จาก {totalSteps}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Save Draft Button - Show on steps 1, 2, 3 and not single page */}
              {!isSinglePageLayout && currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
                >
                  บันทึกร่าง
                </button>
              )}

              {/* Submit Button - Show on final step */}
              {(currentStep === 5 || isSinglePageLayout) && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !consentAgreed}
                  className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
                >
                  {isSubmitting
                    ? "กำลังส่ง..."
                    : rejectionId
                      ? "ยืนยันการส่งใบสมัครใหม่"
                      : "ยืนยันการสมัคร"}
                </button>
              )}

              {/* Next Button - Show on steps 1-4 in step mode */}
              {!isSinglePageLayout && currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 bg-blue-600 text-white hover:bg-blue-700"
                >
                  ถัดไป →
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        taxId={formData.taxId}
        companyName={formData.companyName}
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="ac"
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
