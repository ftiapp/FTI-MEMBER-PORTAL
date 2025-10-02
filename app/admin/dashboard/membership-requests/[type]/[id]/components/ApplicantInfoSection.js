import React from "react";

const ApplicantInfoSection = ({ application, type }) => {
  if (!application) return null;

  // แสดงข้อมูลตามประเภทของสมาชิก
  if (type === "ic") {
    // IC - บุคคลธรรมดา
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้สมัคร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
            <p className="font-medium">
              {application.first_name_th || application.firstNameTh || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
            <p className="font-medium">
              {application.last_name_th || application.lastNameTh || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
            <p className="font-medium">
              {application.first_name_en || application.firstNameEn || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
            <p className="font-medium">
              {application.last_name_en || application.lastNameEn || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เลขบัตรประชาชน</p>
            <p className="font-medium">{application.id_card_number || application.idCard || "-"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">อีเมล</p>
            <p className="font-medium">{application.email || "-"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
            <p className="font-medium">{application.phone || "-"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เว็บไซต์</p>
            <p className="font-medium">{application.website || "-"}</p>
          </div>
        </div>
      </div>
    );
  } else {
    // OC, AM, AC - นิติบุคคล
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้สมัคร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">ชื่อบริษัท (ไทย)</p>
            <p className="font-medium">
              {application.company_name_th ||
                application.companyNameTh ||
                application.associationNameTh ||
                "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">ชื่อบริษัท (อังกฤษ)</p>
            <p className="font-medium">
              {application.company_name_en ||
                application.companyNameEn ||
                application.associationNameEn ||
                "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เลขทะเบียนนิติบุคคล</p>
            <p className="font-medium">{application.tax_id || application.taxId || "-"}</p>
          </div>
          {type === "oc" && (
            <>
              <div>
                <p className="text-gray-600 text-sm">ประเภทโรงงาน</p>
                <p className="font-medium">
                  {(() => {
                    const factoryType = application.factory_type || application.factoryType;
                    console.log("Factory Type Debug:", factoryType, typeof factoryType);

                    if (factoryType === "TYPE1" || factoryType === "type1" || factoryType === "1") {
                      return "มีเครื่องจักร > 50 แรงม้า";
                    } else if (
                      factoryType === "TYPE2" ||
                      factoryType === "type2" ||
                      factoryType === "2"
                    ) {
                      return "ไม่มีเครื่องจักรหรือมีเครื่องจักร < 50 แรงม้า";
                    } else if (factoryType) {
                      return `ไม่ทราบประเภท (${factoryType})`;
                    } else {
                      return "-";
                    }
                  })()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">จำนวนพนักงาน</p>
                <p className="font-medium">
                  {application.number_of_employees || application.numberOfEmployees || "-"}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-gray-600 text-sm">อีเมล</p>
            <p className="font-medium">
              {application.company_email || application.companyEmail || application.email || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
            <p className="font-medium">
              {application.company_phone || application.companyPhone || application.phone || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เว็บไซต์</p>
            <p className="font-medium">
              {application.company_website ||
                application.companyWebsite ||
                application.website ||
                "-"}
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default ApplicantInfoSection;
