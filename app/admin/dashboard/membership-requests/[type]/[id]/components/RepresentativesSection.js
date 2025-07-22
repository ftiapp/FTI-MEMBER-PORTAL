import React from 'react';

const RepresentativesSection = ({ representatives }) => {
  if (!representatives || representatives.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้แทน</h3>
      <div className="space-y-4">
        {representatives.map((rep, index) => {
          // Determine representative type based on rep_order or is_primary
          let repType = '';
          if (rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true) {
            repType = 'ผู้แทน 1 (หลัก)';
          } else if (rep.rep_order === 2 || rep.is_primary === 0 || rep.is_primary === false) {
            repType = 'ผู้แทน 2 (รอง)';
          } else {
            repType = `ผู้แทน ${index + 1}`;
          }
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-blue-600">{repType}</h4>
                {(rep.is_primary === 1 || rep.is_primary === true || rep.rep_order === 1) && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    หลัก
                  </span>
                )}
                {(rep.is_primary === 0 || rep.is_primary === false || rep.rep_order === 2) && (
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    รอง
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
                  <p className="font-medium">{rep.first_name_th || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
                  <p className="font-medium">{rep.last_name_th || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
                  <p className="font-medium">{rep.first_name_en || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
                  <p className="font-medium">{rep.last_name_en || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ตำแหน่ง</p>
                  <p className="font-medium">{rep.position || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
                  <p className="font-medium">{rep.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">อีเมล</p>
                  <p className="font-medium">{rep.email || '-'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RepresentativesSection;
