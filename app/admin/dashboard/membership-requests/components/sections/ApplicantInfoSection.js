import React from "react";

const ApplicantInfoSection = ({ application, type }) => {
  if (!application) return null;

  const user = application.user || {};

  const firstName =
    user.firstname ||
    application.firstNameTh ||
    application.firstname ||
    application.first_name ||
    "";
  const lastName =
    user.lastname || application.lastNameTh || application.lastname || application.last_name || "";

  // Robust fallbacks for email and phone to support AM/OC/AC payload variations
  const contactPerson =
    application.contactPerson ||
    (Array.isArray(application.contactPersons) ? application.contactPersons[0] : null) ||
    null;
  const firstAddress =
    Array.isArray(application.addresses) && application.addresses.length > 0
      ? application.addresses[0]
      : application.address || null;

  const email =
    user.email ||
    application.email ||
    application.applicant_email ||
    application.user_email ||
    application.company_email ||
    application.companyEmail ||
    application.association_email ||
    application.associationEmail ||
    application.contact_email ||
    application.contactEmail ||
    (contactPerson && contactPerson.email) ||
    (firstAddress && firstAddress.email) ||
    "-";

  const phoneRaw =
    user.phone ||
    application.phone ||
    application.applicant_phone ||
    application.user_phone ||
    application.company_phone ||
    application.companyPhone ||
    application.association_phone ||
    application.associationPhone ||
    application.contact_phone ||
    application.contactPhone ||
    (contactPerson && contactPerson.phone) ||
    (firstAddress && firstAddress.phone) ||
    "";
  const phoneExt =
    (contactPerson && (contactPerson.phoneExtension || contactPerson.phone_extension)) ||
    (firstAddress && firstAddress.phoneExtension) ||
    "";
  const phone = phoneRaw ? (phoneExt ? `${phoneRaw} ต่อ ${phoneExt}` : phoneRaw) : "-";

  const idCard = type === "ic" ? application.idCard || application.id_card_number || "-" : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลบัญชีผู้สมัคร (Account)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ</p>
          <p className="text-lg text-gray-900">{firstName || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล</p>
          <p className="text-lg text-gray-900">{lastName || "-"}</p>
        </div>
        {idCard && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เลขบัตรประชาชน</p>
            <p className="text-lg text-gray-900 font-mono">{idCard}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
          <p className="text-lg text-gray-900">{email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
          <p className="text-lg text-gray-900">{phone}</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicantInfoSection;
