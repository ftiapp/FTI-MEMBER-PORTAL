'use client';
import ContactPersonSection from '../../components/ContactPersonSection';

export default function ContactPersonInfo({ 
  formData, 
  setFormData, 
  errors 
}) {
  // Transform formData to contactPersons array format
  const contactPersons = formData.contactPersons || [];

  const handleContactPersonsChange = (newContactPersons) => {
    setFormData(prev => ({ 
      ...prev, 
      contactPersons: newContactPersons
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้ให้ข้อมูล
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลบุคคลที่ติดต่อได้สำหรับการประสานงาน
        </p>
      </div>
      
      <div className="px-8 py-8">
        <ContactPersonSection
          contactPersons={contactPersons}
          onContactPersonsChange={handleContactPersonsChange}
          errors={errors}
          membershipType="AM"
        />
      </div>
    </div>
  );
}