import React from 'react';
import { getFactoryTypeName } from '../../ีutils/dataTransformers';

const CompanyInfoSection = ({ application, type }) => {
  if (!application || type === 'ic') return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลบริษัท/องค์กร
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
          <p className="text-lg text-gray-900">{application.companyNameTh || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
          <p className="text-lg text-gray-900">{application.companyNameEn || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">เลขทะเบียนนิติบุคคล</p>
          <p className="text-lg text-gray-900 font-mono">{application.taxId || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
          <p className="text-lg text-gray-900">
            {application.numberOfEmployees ? `${application.numberOfEmployees} คน` : '-'}
          </p>
        </div>
        
        {type === 'am' && application.numberOfMembers && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนสมาชิกสมาคม</p>
            <p className="text-lg text-gray-900">{application.numberOfMembers} คน</p>
          </div>
        )}
        
        {type === 'oc' && application.factoryType && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทโรงงาน</p>
            <p className="text-lg text-gray-900">{getFactoryTypeName(application.factoryType)}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
          <p className="text-lg text-gray-900">{application.email || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
          <p className="text-lg text-gray-900">{application.phone || '-'}</p>
        </div>
        {application.website && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
            <p className="text-lg text-gray-900">{application.website}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;