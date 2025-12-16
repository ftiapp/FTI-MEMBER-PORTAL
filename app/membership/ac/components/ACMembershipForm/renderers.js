// Render Functions for AC Membership Form
import CompanyInfoSection from "../CompanyInfoSection";
import RepresentativeInfoSection from "../../../components/RepresentativeInfoSection";
import BusinessInfoSection from "../BusinessInfoSection";
import DocumentsSection from "../DocumentUploadSection";
import SummarySection from "../SummarySection";

/**
 * Render form content based on layout
 */
export const createRenderFormContent =
  ({
    isSinglePageLayout,
    currentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    taxIdValidating,
    businessTypes,
    industrialGroups,
    provincialChapters,
    isLoading,
  }) =>
  () => {
    function ACRenderFormContent() {
      const commonProps = { formData, setFormData, errors, setErrors };

      if (isSinglePageLayout) {
        return (
          <div className="space-y-12">
            <CompanyInfoSection
              {...commonProps}
              setErrors={setErrors}
              taxIdValidating={taxIdValidating}
            />
            <hr />
            <RepresentativeInfoSection
              mode="multiple"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              config={{
                headerTitle: "ข้อมูลผู้แทนสมาคม",
                headerSubtitle: "ข้อมูลผู้มีอำนาจลงนามแทนสมาคม",
                positionPlaceholder: "ประธาน, รองประธาน...",
                toastId: "ac-representative-errors",
              }}
            />
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
        2: (
          <RepresentativeInfoSection
            mode="multiple"
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            config={{
              headerTitle: "ข้อมูลผู้แทนสมาคม",
              headerSubtitle: "ข้อมูลผู้มีอำนาจลงนามแทนสมาคม",
              positionPlaceholder: "ประธาน, รองประธาน...",
              toastId: "ac-representative-errors",
            }}
          />
        ),
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
    }

    ACRenderFormContent.displayName = "ACRenderFormContent";
    return <ACRenderFormContent />;
  };

/**
 * Render error message helper
 */
export const renderErrorMessage = (errorValue, key, index) => {
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
