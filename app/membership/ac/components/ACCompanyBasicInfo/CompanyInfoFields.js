import InputField from "./InputField";

export default function CompanyInfoFields({ formData, errors, isAutofill, handleInputChange }) {
  return (
    <>
      {/* Company Name Field */}
      <InputField
        id="companyName"
        name="companyName"
        label="ชื่อบริษัท (ไทย)"
        value={formData.companyName || ""}
        onChange={handleInputChange}
        disabled={isAutofill}
        placeholder="ชื่อบริษัทภาษาไทย"
        error={errors.companyName}
        required
        showAutoFillNote={isAutofill}
      />

      {/* Company Name English Field */}
      <InputField
        id="companyNameEn"
        name="companyNameEn"
        label="ชื่อบริษัท (อังกฤษ)"
        value={formData.companyNameEn || ""}
        onChange={handleInputChange}
        disabled={isAutofill}
        placeholder="ชื่อบริษัทภาษาอังกฤษ"
        error={errors.companyNameEn}
        required
        showAutoFillNote={isAutofill}
      />
    </>
  );
}
