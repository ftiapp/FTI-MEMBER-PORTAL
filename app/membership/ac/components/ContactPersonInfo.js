"use client";
import ContactPersonSection from "../../components/ContactPersonSection";

/**
 * คอมโพเนนต์สำหรับกรอกข้อมูลผู้ติดต่อในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 */
export default function ContactPersonInfo({ formData, setFormData, errors }) {
  // Transform formData to contactPersons array format
  const contactPersons = formData.contactPersons || [];

  const handleContactPersonsChange = (newContactPersons) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: newContactPersons,
    }));
  };
  return (
    <div
      data-section="contact-person"
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้ให้ข้อมูล / Information Provider
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลบุคคลที่ติดต่อได้สำหรับการประสานงาน / Contact person information for coordination
        </p>
      </div>

      <div className="px-8 py-8">
        <ContactPersonSection
          contactPersons={contactPersons}
          onContactPersonsChange={handleContactPersonsChange}
          errors={errors}
          membershipType="AC"
        />
      </div>
    </div>
  );
}
