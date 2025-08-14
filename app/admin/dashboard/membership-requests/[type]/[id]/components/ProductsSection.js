import React from 'react';

const ProductsSection = ({ application }) => {
  if (!application) return null;

  const hasBusinessData = (application.businessTypes && application.businessTypes.length > 0) ||
                         (application.businessTypeOther && application.businessTypeOther.length > 0) ||
                         (application.products && application.products.length > 0);

  if (!hasBusinessData) return null;

  const getBusinessTypeName = (type) => {
    const types = {
      'manufacturer': 'ผู้ผลิต',
      'distributor': 'ผู้จัดจำหน่าย',
      'importer': 'ผู้นำเข้า',
      'exporter': 'ผู้ส่งออก',
      'service': 'ผู้ให้บริการ',
      'other': 'อื่นๆ'
    };
    return types[type] || type || '-';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลธุรกิจและสินค้า
      </h3>
      
      {/* ประเภทธุรกิจ */}
      {application.businessTypes && application.businessTypes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
          <div className="flex flex-wrap gap-2">
            {application.businessTypes.map((businessType, index) => {
              // businessType can be a string or an object with business_type
              const typeKey = typeof businessType === 'string'
                ? businessType
                : (businessType.business_type || businessType.type || '');

              if (typeKey === 'other') {
                // Find matching detail by main_id if available
                let otherDetail = '';
                if (Array.isArray(application.businessTypeOther) && application.businessTypeOther.length > 0) {
                  if (typeof businessType === 'object' && businessType.main_id != null) {
                    const found = application.businessTypeOther.find(
                      (o) => (o.main_id === businessType.main_id)
                    );
                    otherDetail = (found && (found.detail || found.description || found.other_detail)) || '';
                  } else {
                    // fall back: if only one other detail provided
                    const first = application.businessTypeOther[0];
                    otherDetail = (first && (first.detail || first.description || first.other_detail)) || '';
                  }
                }
                return (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full border border-orange-200">
                    อื่นๆ: {otherDetail || 'ไม่ระบุ'}
                  </span>
                );
              }

              return (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                  {getBusinessTypeName(typeKey)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ประเภทธุรกิจอื่นๆ */}
      {application.businessTypeOther && application.businessTypeOther.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจอื่นๆ</h4>
          <div className="space-y-3">
            {application.businessTypeOther.map((other, index) => {
              const label = typeof other === 'string'
                ? other
                : (other?.detail || other?.description || other?.other_detail || '');
              return (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-lg font-medium text-gray-900">{label || '-'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* สินค้าและบริการ */}
      {application.products && application.products.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สินค้าและบริการ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.products.map((product, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-lg font-bold text-blue-900 mb-3">สินค้า/บริการ {index + 1}</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (ไทย)</p>
                    <p className="text-sm text-gray-900">{product.name_th || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                    <p className="text-sm text-gray-900">{product.name_en || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
