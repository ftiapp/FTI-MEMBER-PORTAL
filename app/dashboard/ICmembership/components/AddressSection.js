'use client';

export default function AddressSection({
  formData,
  errors,
  handleChange
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ที่อยู่จัดส่งเอกสาร</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* เลขที่ */}
        <div>
          <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-700 mb-1">
            เลขที่ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressNumber"
            name="addressNumber"
            value={formData.addressNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.addressNumber ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="เลขที่"
          />
          {errors.addressNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.addressNumber}</p>
          )}
        </div>
        
        {/* อาคาร */}
        <div>
          <label htmlFor="addressBuilding" className="block text-sm font-medium text-gray-700 mb-1">
            อาคาร
          </label>
          <input
            type="text"
            id="addressBuilding"
            name="addressBuilding"
            value={formData.addressBuilding}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="อาคาร"
          />
        </div>
        
        {/* หมู่ */}
        <div>
          <label htmlFor="addressMoo" className="block text-sm font-medium text-gray-700 mb-1">
            หมู่
          </label>
          <input
            type="text"
            id="addressMoo"
            name="addressMoo"
            value={formData.addressMoo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="หมู่"
          />
        </div>
        
        {/* ซอย */}
        <div>
          <label htmlFor="addressSoi" className="block text-sm font-medium text-gray-700 mb-1">
            ซอย
          </label>
          <input
            type="text"
            id="addressSoi"
            name="addressSoi"
            value={formData.addressSoi}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="ซอย"
          />
        </div>
        
        {/* ถนน */}
        <div>
          <label htmlFor="addressRoad" className="block text-sm font-medium text-gray-700 mb-1">
            ถนน
          </label>
          <input
            type="text"
            id="addressRoad"
            name="addressRoad"
            value={formData.addressRoad}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="ถนน"
          />
        </div>
        
        {/* แขวง/ตำบล */}
        <div>
          <label htmlFor="addressSubdistrict" className="block text-sm font-medium text-gray-700 mb-1">
            แขวง/ตำบล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressSubdistrict"
            name="addressSubdistrict"
            value={formData.addressSubdistrict}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.addressSubdistrict ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="แขวง/ตำบล"
          />
          {errors.addressSubdistrict && (
            <p className="mt-1 text-sm text-red-500">{errors.addressSubdistrict}</p>
          )}
        </div>
        
        {/* เขต/อำเภอ */}
        <div>
          <label htmlFor="addressDistrict" className="block text-sm font-medium text-gray-700 mb-1">
            เขต/อำเภอ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressDistrict"
            name="addressDistrict"
            value={formData.addressDistrict}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.addressDistrict ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="เขต/อำเภอ"
          />
          {errors.addressDistrict && (
            <p className="mt-1 text-sm text-red-500">{errors.addressDistrict}</p>
          )}
        </div>
        
        {/* จังหวัด */}
        <div>
          <label htmlFor="addressProvince" className="block text-sm font-medium text-gray-700 mb-1">
            จังหวัด <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressProvince"
            name="addressProvince"
            value={formData.addressProvince}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.addressProvince ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="จังหวัด"
          />
          {errors.addressProvince && (
            <p className="mt-1 text-sm text-red-500">{errors.addressProvince}</p>
          )}
        </div>
        
        {/* รหัสไปรษณีย์ */}
        <div>
          <label htmlFor="addressPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
            รหัสไปรษณีย์ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressPostalCode"
            name="addressPostalCode"
            value={formData.addressPostalCode}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.addressPostalCode ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="รหัสไปรษณีย์"
            maxLength={5}
          />
          {errors.addressPostalCode && (
            <p className="mt-1 text-sm text-red-500">{errors.addressPostalCode}</p>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4">ข้อมูลติดต่อ</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* เว็บไซต์ */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            เว็บไซต์
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-500">{errors.website}</p>
          )}
        </div>
        
        {/* Facebook */}
        <div>
          <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
            Facebook
          </label>
          <input
            type="text"
            id="facebook"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://facebook.com/page"
          />
        </div>
        
        {/* โทรศัพท์ */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            โทรศัพท์
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0XXXXXXXXX"
          />
        </div>
        
        {/* อีเมล */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            อีเมล
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        
        {/* โทรสาร */}
        <div>
          <label htmlFor="fax" className="block text-sm font-medium text-gray-700 mb-1">
            โทรสาร
          </label>
          <input
            type="text"
            id="fax"
            name="fax"
            value={formData.fax}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0XXXXXXXXX"
          />
        </div>
      </div>
    </div>
  );
}
