import InputField from "./InputField";

export default function AssociationInfoFields({ formData, errors, handleInputChange }) {
  return (
    <>
      {/* Association Name Field */}
      <InputField
        id="associationName"
        name="associationName"
        label="ชื่อสมาคม / Association Name (Thai)"
        value={formData.associationName || ""}
        onChange={handleInputChange}
        placeholder="ชื่อสมาคม"
        error={errors.associationName}
        required
      />

      {/* Association Name English Field */}
      <InputField
        id="associationNameEng"
        name="associationNameEng"
        label="ชื่อสมาคมภาษาอังกฤษ / Association Name (English)"
        value={formData.associationNameEng || ""}
        onChange={handleInputChange}
        placeholder="Association Name in English"
        error={errors.associationNameEng}
        required
      />
    </>
  );
}
