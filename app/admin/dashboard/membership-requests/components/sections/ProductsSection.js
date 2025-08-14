import React from 'react';
import { getBusinessTypeName } from '../../ีutils/dataTransformers';

const ProductsSection = ({ application }) => {
  const hasBusinessTypes = application?.businessTypes?.length > 0;
  const hasProducts = application?.products?.length > 0;
  
  if (!hasBusinessTypes && !hasProducts) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลธุรกิจและสินค้า
      </h3>
      
      {hasBusinessTypes && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
          <div className="flex flex-wrap gap-2">
            {application.businessTypes.map((businessType, index) => {
              const typeName = getBusinessTypeName(businessType);
              const isOther = businessType.type === 'other';
              
              return (
                <span 
                  key={index} 
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${
                    isOther 
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {typeName}
                </span>
              );
            })}
          </div>
        </div>
      )}
      
      {hasProducts && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สินค้าและบริการ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.products.map((product, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-lg font-bold text-blue-900 mb-3">
                  สินค้า/บริการ {index + 1}
                </h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                    <p className="text-sm text-gray-900">{product.nameEn || '-'}</p>
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