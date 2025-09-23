import React from 'react';

const FinancialInfoSection = ({ application, type }) => {
  if (!application || type === 'ic') return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลทางการเงิน
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ทุนจดทะเบียน (บาท)</p>
          <p className="text-lg text-gray-900">
            {(() => {
              const capital = application.registered_capital || application.registeredCapital;
              return capital ? Number(capital).toLocaleString() : '-';
            })()}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">กำลังการผลิต (ต่อปี)</p>
          <p className="text-lg text-gray-900">
            {(() => {
              const capacityValue = application.production_capacity_value || application.productionCapacityValue;
              const capacityUnit = application.production_capacity_unit || application.productionCapacityUnit;
              if (capacityValue && capacityUnit) {
                return `${Number(capacityValue).toLocaleString()} ${capacityUnit}`;
              } else if (capacityValue) {
                return Number(capacityValue).toLocaleString();
              } else if (capacityUnit) {
                return capacityUnit;
              }
              return '-';
            })()}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ยอดจำหน่ายในประเทศ (บาท/ปี)</p>
          <p className="text-lg text-gray-900">
            {(() => {
              const domestic = application.sales_domestic || application.salesDomestic;
              return domestic ? Number(domestic).toLocaleString() : '-';
            })()}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ยอดจำหน่ายส่งออก (บาท/ปี)</p>
          <p className="text-lg text-gray-900">
            {(() => {
              const export_ = application.sales_export || application.salesExport;
              return export_ ? Number(export_).toLocaleString() : '-';
            })()}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">สัดส่วนผู้ถือหุ้นไทย (%)</p>
          <p className="text-lg text-gray-900">
            {(() => {
              const thaiPercent = application.shareholder_thai_percent || application.shareholderThaiPercent;
              return (thaiPercent || thaiPercent === 0)
                ? `${Number(thaiPercent).toFixed(2)}%`
                : '-';
            })()}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">สัดส่วนผู้ถือหุ้นต่างประเทศ (%)</p>
          <p className="text-lg text-gray-900">
            {(() => {
              const foreignPercent = application.shareholder_foreign_percent || application.shareholderForeignPercent;
              return (foreignPercent || foreignPercent === 0)
                ? `${Number(foreignPercent).toFixed(2)}%`
                : '-';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;
