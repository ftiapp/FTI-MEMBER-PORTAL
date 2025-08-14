import React from 'react';
import { formatCurrency, formatNumber, formatPercent } from '../../ีutils/formatters';

const FinancialInfoSection = ({ application, type }) => {
  if (!application || type === 'ic') return null;
  
  const hasFinancialData = application.registeredCapital || 
                          application.productionCapacityValue ||
                          application.salesDomestic ||
                          application.salesExport ||
                          application.shareholderThaiPercent ||
                          application.shareholderForeignPercent;
  
  if (!hasFinancialData) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลทางการเงิน
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {application.registeredCapital && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ทุนจดทะเบียน</p>
            <p className="text-lg text-gray-900">{formatCurrency(application.registeredCapital)}</p>
          </div>
        )}
        
        {(application.productionCapacityValue || application.productionCapacityUnit) && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">กำลังการผลิต (ต่อปี)</p>
            <p className="text-lg text-gray-900">
              {application.productionCapacityValue && application.productionCapacityUnit
                ? `${formatNumber(application.productionCapacityValue)} ${application.productionCapacityUnit}`
                : application.productionCapacityValue 
                  ? formatNumber(application.productionCapacityValue)
                  : application.productionCapacityUnit || '-'}
            </p>
          </div>
        )}
        
        {application.salesDomestic && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ยอดจำหน่ายในประเทศ (ต่อปี)</p>
            <p className="text-lg text-gray-900">{formatCurrency(application.salesDomestic)}</p>
          </div>
        )}
        
        {application.salesExport && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ยอดจำหน่ายส่งออก (ต่อปี)</p>
            <p className="text-lg text-gray-900">{formatCurrency(application.salesExport)}</p>
          </div>
        )}
        
        {application.shareholderThaiPercent && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">สัดส่วนผู้ถือหุ้นไทย</p>
            <p className="text-lg text-gray-900">{formatPercent(application.shareholderThaiPercent)}</p>
          </div>
        )}
        
        {application.shareholderForeignPercent && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">สัดส่วนผู้ถือหุ้นต่างประเทศ</p>
            <p className="text-lg text-gray-900">{formatPercent(application.shareholderForeignPercent)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialInfoSection;