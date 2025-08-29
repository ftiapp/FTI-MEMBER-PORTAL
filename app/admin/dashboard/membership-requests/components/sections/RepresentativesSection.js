import React from 'react';

const RepresentativesSection = ({ application }) => {
  if (!application?.representatives || application.representatives.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลผู้แทน
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {application.representatives.map((rep, index) => {
          const repType = rep.isPrimary ? 'ผู้แทน 1 (หลัก)' : `ผู้แทน ${rep.order || index + 1} (รอง)`;
          const resolvePrename = (th, en, other, lang = 'th') => {
            const normTh = (th || '').trim();
            const normEn = (en || '').trim();
            const normOther = (other || '').trim();
            if (lang === 'th') {
              if (!normTh && !normOther) return '';
              if (/^อื่นๆ$/i.test(normTh) || /^other$/i.test(normEn)) return normOther || '';
              return normTh || normOther || '';
            }
            if (!normEn && !normOther) return '';
            if (/^other$/i.test(normEn) || /^อื่นๆ$/i.test(normTh)) return normOther || '';
            return normEn || normOther || '';
          };
          
          return (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-blue-900">{repType}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  rep.isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {rep.isPrimary ? 'หลัก' : 'รอง'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                    <p className="text-sm text-gray-900">{[
                      resolvePrename(rep.prename_th || rep.prenameTh, rep.prename_en || rep.prenameEn, rep.prename_other || rep.prenameOther, 'th'),
                      rep.firstNameTh
                    ].filter(Boolean).join(' ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                    <p className="text-sm text-gray-900">{rep.lastNameTh || '-'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                    <p className="text-sm text-gray-900">{[
                      resolvePrename(rep.prename_th || rep.prenameTh, rep.prename_en || rep.prenameEn, rep.prename_other || rep.prenameOther, 'en'),
                      rep.firstNameEn
                    ].filter(Boolean).join(' ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                    <p className="text-sm text-gray-900">{rep.lastNameEn || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                  <p className="text-sm text-gray-900">{rep.position || '-'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                    <p className="text-sm text-gray-900">
                      {rep.phone || '-'}
                      {rep.phoneExtension && ` ต่อ ${rep.phoneExtension}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                    <p className="text-sm text-gray-900 break-all">{rep.email || '-'}</p>
                  </div>
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