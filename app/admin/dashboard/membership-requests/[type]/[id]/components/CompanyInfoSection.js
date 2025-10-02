import React from "react";

const CompanyInfoSection = ({ application, type }) => {
  if (!application) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        {type === "ic" ? "ข้อมูลผู้สมัคร" : "ข้อมูลบริษัท"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {type === "ic" ? (
          <>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
              <p className="text-lg text-gray-900">
                {application.first_name_th || application.firstNameTh || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
              <p className="text-lg text-gray-900">
                {application.last_name_th || application.lastNameTh || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
              <p className="text-lg text-gray-900">
                {application.first_name_en || application.firstNameEn || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
              <p className="text-lg text-gray-900">
                {application.last_name_en || application.lastNameEn || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เลขบัตรประชาชน</p>
              <p className="text-lg text-gray-900 font-mono">
                {application.id_card_number || application.idCard || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              <p className="text-lg text-gray-900">{application.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              <p className="text-lg text-gray-900">{application.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
              <p className="text-lg text-gray-900">{application.website || "-"}</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อบริษัท (ไทย)</p>
              <p className="text-lg text-gray-900">
                {application.company_name_th ||
                  application.companyNameTh ||
                  application.associationNameTh ||
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อบริษัท (อังกฤษ)</p>
              <p className="text-lg text-gray-900">
                {application.company_name_en ||
                  application.companyNameEn ||
                  application.associationNameEn ||
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เลขทะเบียนนิติบุคคล</p>
              <p className="text-lg text-gray-900 font-mono">
                {application.tax_id || application.taxId || "-"}
              </p>
            </div>
            {type === "am" && (
              <>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
                  <p className="text-lg text-gray-900">
                    {application.number_of_employees || application.numberOfEmployees || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนสมาชิกสมาคม</p>
                  <p className="text-lg text-gray-900">
                    {application.number_of_member || application.numberOfMember || "-"}
                  </p>
                </div>
              </>
            )}
            {type === "ac" && (
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
                <p className="text-lg text-gray-900">
                  {application.number_of_employees || application.numberOfEmployees || "-"}
                </p>
              </div>
            )}
            {type === "oc" && (
              <>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทโรงงาน</p>
                  <p className="text-lg text-gray-900">
                    {(() => {
                      const factoryType = application.factory_type || application.factoryType;
                      if (
                        factoryType === "TYPE1" ||
                        factoryType === "type1" ||
                        factoryType === "1"
                      ) {
                        return "มีเครื่องจักร > 50 แรงม้า";
                      } else if (
                        factoryType === "TYPE2" ||
                        factoryType === "type2" ||
                        factoryType === "2"
                      ) {
                        return "ไม่มีเครื่องจักรหรือมีเครื่องจักร < 50 แรงม้า";
                      } else {
                        return "-";
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
                  <p className="text-lg text-gray-900">
                    {application.number_of_employees || application.numberOfEmployees || "-"}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              <p className="text-lg text-gray-900">
                {application.company_email || application.companyEmail || application.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              <p className="text-lg text-gray-900">
                {application.company_phone || application.companyPhone || application.phone || "-"}
                {(application.company_phone_extension ||
                  application.companyPhoneExtension ||
                  application.associationPhoneExtension) && (
                  <span className="text-blue-600 ml-2">
                    ต่อ{" "}
                    {application.company_phone_extension ||
                      application.companyPhoneExtension ||
                      application.associationPhoneExtension}
                  </span>
                )}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
              <p className="text-lg text-gray-900">
                {application.company_website ||
                  application.companyWebsite ||
                  application.website ||
                  "-"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;
