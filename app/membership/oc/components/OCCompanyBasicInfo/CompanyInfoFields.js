import InputField from "./InputField";

export default function CompanyInfoFields({
  formData,
  errors,
  isAutofill,
  handleInputChange,
}) {
  return (
    <>
      {/* Company Name Field */}
      <InputField
        id="companyName"
        name="companyName"
        label="ชื่อบริษัท"
        value={formData.companyName || ""}
        onChange={handleInputChange}
        disabled={isAutofill}
        placeholder="ชื่อบริษัท"
        error={errors.companyName}
        required
        showAutoFillNote={isAutofill}
      />

      {/* Company Name English Field */}
      <InputField
        id="companyNameEng"
        name="companyNameEng"
        label="ชื่อบริษัทภาษาอังกฤษ"
        value={formData.companyNameEng || ""}
        onChange={handleInputChange}
        disabled={isAutofill}
        placeholder="Company Name in English"
        error={errors.companyNameEng}
        required
        showAutoFillNote={isAutofill}
      />
    </>
  );
}