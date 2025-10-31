// Event Handlers for AC Membership Form
import { toast } from "react-hot-toast";
import { validateACForm } from "../ACFormValidation";
import { submitACMembershipForm } from "../ACFormSubmission";
import { checkTaxIdUniqueness } from "../../../utils/taxIdValidator";
import { deleteDraftByTaxId, saveDraftData } from "../../../utils/draftHelpers";
import { STEPS } from "./constants";
import { getFirstFieldError } from "./scrollHelpers";

/**
 * Validate Tax ID
 */
export const createValidateTaxId = (abortControllerRef, setTaxIdValidating) => async (taxId) => {
  if (!taxId || taxId.length !== 13) {
    return { isUnique: false, message: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง" };
  }

  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();

  try {
    setTaxIdValidating(true);
    const result = await checkTaxIdUniqueness(taxId, "ac", abortControllerRef.current.signal);
    setTaxIdValidating(false);
    return result;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    setTaxIdValidating(false);
    return { isUnique: false, message: "เกิดข้อผิดพลาดในการตรวจสอบ" };
  }
};

/**
 * Handle saving draft for AC membership
 */
export const createHandleSaveDraft = (formData, currentStep) => async () => {
  return await saveDraftData(formData, "ac", currentStep, "taxId");
};

/**
 * Handle form submission
 */
export const createHandleSubmit =
  ({
    formData,
    currentStep,
    totalSteps,
    isSinglePageLayout,
    setErrors,
    setIsSubmitting,
    setCurrentStep,
    validateTaxId,
    scrollToErrorField,
    consentAgreed,
    rejectionId,
    userComment,
    industrialGroups,
    provincialChapters,
    setSubmissionResult,
    setShowSuccessModal,
    router,
  }) =>
  async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      // ถ้าอยู่ในโหมดแบ่งขั้นตอน และไม่ใช่ขั้นตอนสุดท้าย ให้ไปขั้นตอนถัดไป
      if (!isSinglePageLayout && currentStep < totalSteps) {
        const formErrors = validateACForm(formData, currentStep);
        console.log("🔍 AC Form validation errors for step", currentStep, ":", formErrors);
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
          // If representative step has errors, let the child component handle scroll AND toast (avoid duplicate)
          if (currentStep === 2 && formErrors.representativeErrors) {
            // Child component (RepresentativeInfoSection) will handle both scroll and toast
            setIsSubmitting(false);
            return;
          }

          // If business info step has errors, let the child component handle scroll AND toast (avoid duplicate)
          if (
            currentStep === 3 &&
            (formErrors.businessTypes ||
              formErrors.otherBusinessTypeDetail ||
              formErrors.products ||
              formErrors.productErrors)
          ) {
            // Child component (BusinessInfoSection) will handle both scroll and toast
            setIsSubmitting(false);
            return;
          }

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
            // Note: companyEmail, companyPhone, companyWebsite are fallback fields only, not validated
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
          console.log("🔵 Checking Tax ID uniqueness for:", formData.taxId);
          const taxIdResult = await validateTaxId(formData.taxId);
          console.log("🔍 Tax ID validation result:", taxIdResult);

          if (!taxIdResult.isUnique) {
            console.log("❌ Tax ID is NOT unique, blocking progression");
            setIsSubmitting(false);
            toast.error(taxIdResult.message);
            return;
          }

          console.log("✅ Tax ID is unique, continuing to next step");
        } else if (currentStep === 1) {
          console.log("⚠️ Step 1 but tax ID is missing or not 13 digits:", formData.taxId);
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

      // สร้าง error message ที่ละเอียดสำหรับ representatives
      let errorMessage = "";
      let errorCount = 0;

      if (formErrors.representativeErrors && Array.isArray(formErrors.representativeErrors)) {
        const repErrors = formErrors.representativeErrors;
        const repErrorDetails = [];

        repErrors.forEach((repError, index) => {
          if (repError && Object.keys(repError).length > 0) {
            const fieldNames = Object.keys(repError)
              .map((key) => {
                const fieldMap = {
                  prename_th: "คำนำหน้าชื่อ (ไทย)",
                  prename_en: "คำนำหน้าชื่อ (อังกฤษ)",
                  firstNameThai: "ชื่อ (ไทย)",
                  lastNameThai: "นามสกุล (ไทย)",
                  firstNameEnglish: "ชื่อ (อังกฤษ)",
                  lastNameEnglish: "นามสกุล (อังกฤษ)",
                  email: "อีเมล",
                  phone: "เบอร์โทรศัพท์",
                  position: "ตำแหน่ง",
                };
                return fieldMap[key] || key;
              })
              .join(", ");

            repErrorDetails.push(`ผู้แทนคนที่ ${index + 1}: ${fieldNames}`);
            errorCount += Object.keys(repError).length;
          }
        });

        if (repErrorDetails.length > 0) {
          errorMessage = `ข้อมูลผู้แทนไม่ครบถ้วน:\n${repErrorDetails.join("\n")}`;
        }
      }

      // นับ errors อื่นๆ ที่ไม่ใช่ representativeErrors
      const otherErrorCount = Object.keys(formErrors).filter(
        (key) => key !== "representativeErrors",
      ).length;
      errorCount += otherErrorCount;

      if (!errorMessage) {
        const { message: firstSpecificMessage } = getFirstFieldError(formErrors);
        errorMessage =
          firstSpecificMessage ||
          `พบข้อผิดพลาด ${errorCount} รายการ: กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน`;
      } else if (otherErrorCount > 0) {
        errorMessage += `\n\nและข้อผิดพลาดอื่นๆ อีก ${otherErrorCount} รายการ`;
      }

      toast.error(errorMessage, { duration: 7000 });

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
          // Note: companyEmail, companyPhone, companyWebsite are fallback fields only, not validated
        ];

        // ถ้าเป็นฟิลด์บริษัท ให้เลื่อนไปก่อน
        if (stepFirstKey && companyBasicFields.includes(stepFirstKey)) {
          setTimeout(() => scrollToErrorField(stepFirstKey), 350);
          setIsSubmitting(false);
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
            setIsSubmitting(false);
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
              setIsSubmitting(false);
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
      setIsSubmitting(false);
      return;
    }

    // ✅ ตรวจสอบ consent หลังจาก validation ผ่านแล้ว
    if (!consentAgreed) {
      toast.error("กรุณายอมรับข้อตกลงการคุ้มครองข้อมูลส่วนบุคคลก่อนยืนยันการสมัคร", {
        duration: 4000,
      });
      // เลื่อนไปที่กล่อง consent
      setTimeout(() => {
        const consentBox = document.querySelector("[data-consent-box]");
        if (consentBox) {
          consentBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      setIsSubmitting(false);
      return;
    }

    console.log("✅ Final validation passed, proceeding with submission");
    setIsSubmitting(true);

    try {
      let result;
      if (rejectionId) {
        console.log("🔄 Resubmitting rejected application (v2 - no Reject_DATA):", rejectionId);
        const res = await fetch(
          `/api/membership/rejected-applications-v2/ac/${rejectionId}/resubmit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              formData: formData,
              userComment: userComment,
            }),
          },
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        result = await res.json();
      } else {
        console.log("🔄 New submission (step mode)");
        result = await submitACMembershipForm(formData);
      }

      if (result.success) {
        console.log("✅ Final submission successful");
        if (!rejectionId) {
          await deleteDraftByTaxId(formData.taxId, "ac");
        }
        // แสดง Success Modal แทนการ redirect ทันที
        setSubmissionResult(result);
        setShowSuccessModal(true);
        // ✅ ปิด loading overlay หลังจากสำเร็จ
        setIsSubmitting(false);
      } else {
        console.log("❌ Final submission failed:", result.message);
        setIsSubmitting(false);
        toast.error(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      console.error("💥 Final submission error:", error);
      setIsSubmitting(false);

      let errorMessage = "เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง";
      if (error.message) {
        errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

/**
 * Handle previous step
 */
export const createHandlePrevious = (handlePrevStep) => (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handlePrevStep();
};
