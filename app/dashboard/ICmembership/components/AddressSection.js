'use client';

import { useAddressAutocomplete } from './AddressSection/hooks/useAddressAutocomplete';
import { useErrorHandling } from './AddressSection/hooks/useErrorHandling';
import { isAddressComplete, hasPartialAddressData } from './AddressSection/utils/addressUtils';
import AddressField from './AddressSection/components/AddressField';
import InputField from './AddressSection/components/InputField';
import InfoTip from './AddressSection/components/InfoTip';

export default function AddressSection({
  formData,
  errors,
  handleChange,
  showErrorNotification = false
}) {
  // ใช้ custom hooks
  const {
    subdistrictResults,
    postalCodeResults,
    isSearching,
    showSubdistrictResults,
    showPostalCodeResults,
    apiReady,
    handleSubdistrictSearch,
    handlePostalCodeSearch,
    selectAddressFromSubdistrict,
    selectAddressFromPostalCode,
    handleClickOutside
  } = useAddressAutocomplete(handleChange);

  useErrorHandling(errors);

  // ตรวจสอบสถานะข้อมูลที่อยู่
  const isComplete = isAddressComplete(formData);
  const hasPartialData = hasPartialAddressData(formData);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ที่อยู่จัดส่งเอกสาร</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* เลขที่ */}
        <InputField
          id="addressNumber"
          name="addressNumber"
          label="เลขที่"
          value={formData.addressNumber}
          onChange={handleChange}
          error={errors.addressNumber}
          placeholder="เลขที่"
          required
        />
        
        {/* อาคาร */}
        <InputField
          id="addressBuilding"
          name="addressBuilding"
          label="อาคาร"
          value={formData.addressBuilding}
          onChange={handleChange}
          placeholder="อาคาร"
        />
        
        {/* หมู่ */}
        <InputField
          id="addressMoo"
          name="addressMoo"
          label="หมู่"
          value={formData.addressMoo}
          onChange={handleChange}
          placeholder="หมู่"
        />
        
        {/* ซอย */}
        <InputField
          id="addressSoi"
          name="addressSoi"
          label="ซอย"
          value={formData.addressSoi}
          onChange={handleChange}
          placeholder="ซอย"
        />
        
        {/* ถนน */}
        <InputField
          id="addressRoad"
          name="addressRoad"
          label="ถนน"
          value={formData.addressRoad}
          onChange={handleChange}
          placeholder="ถนน"
        />
        
        {/* แขวง/ตำบล */}
        <AddressField
          id="addressSubdistrict"
          name="addressSubdistrict"
          label="แขวง/ตำบล"
          value={formData.addressSubdistrict}
          onChange={handleChange}
          onSearch={handleSubdistrictSearch}
          onClickOutside={handleClickOutside}
          error={errors.addressSubdistrict}
          placeholder="พิมพ์ตำบล/แขวงเพื่อค้นหาอัตโนมัติ"
          required
          type="subdistrict"
          // Search related props
          isSearching={isSearching}
          searchResults={subdistrictResults}
          showResults={showSubdistrictResults}
          onSelectResult={selectAddressFromSubdistrict}
          apiReady={apiReady}
          isComplete={isComplete}
          hasPartialData={hasPartialData}
          showNoResults={!showSubdistrictResults && !hasPartialData}
          minSearchLength={2}
        />
        
        {/* เขต/อำเภอ */}
        <AddressField
          id="addressDistrict"
          name="addressDistrict"
          label="เขต/อำเภอ"
          value={formData.addressDistrict}
          onChange={handleChange}
          error={errors.addressDistrict}
          placeholder="เขต/อำเภอ"
          required
          readOnly
        />
        
        {/* จังหวัด */}
        <AddressField
          id="addressProvince"
          name="addressProvince"
          label="จังหวัด"
          value={formData.addressProvince}
          onChange={handleChange}
          error={errors.addressProvince}
          placeholder="จังหวัด"
          required
          readOnly
        />
        
        {/* รหัสไปรษณีย์ */}
        <AddressField
          id="addressPostalCode"
          name="addressPostalCode"
          label="รหัสไปรษณีย์"
          value={formData.addressPostalCode}
          onChange={handleChange}
          onSearch={handlePostalCodeSearch}
          onClickOutside={handleClickOutside}
          error={errors.addressPostalCode}
          placeholder="รหัสไปรษณีย์"
          required
          type="postal"
          maxLength={5}
          // Search related props
          isSearching={isSearching}
          searchResults={postalCodeResults}
          showResults={showPostalCodeResults}
          onSelectResult={selectAddressFromPostalCode}
          apiReady={apiReady}
          isComplete={isComplete}
          hasPartialData={hasPartialData}
          showNoResults={!showPostalCodeResults && !isComplete && !hasPartialData}
          minSearchLength={3}
        />
      </div>
      
      <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4">ข้อมูลติดต่อ</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* เว็บไซต์ */}
        <InputField
          id="website"
          name="website"
          label="เว็บไซต์"
          value={formData.website}
          onChange={handleChange}
          error={errors.website}
          placeholder="https://example.com"
          type="url"
        />
        
        {/* Facebook */}
        <InputField
          id="facebook"
          name="facebook"
          label="Facebook"
          value={formData.facebook}
          onChange={handleChange}
          placeholder="https://facebook.com/page"
          type="url"
        />
        
        {/* โทรศัพท์ */}
        <InputField
          id="phone"
          name="phone"
          label="โทรศัพท์"
          value={formData.phone}
          onChange={handleChange}
          placeholder="0XXXXXXXXX"
          type="tel"
        />
        
        {/* อีเมล */}
        <InputField
          id="email"
          name="email"
          label="อีเมล"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="example@email.com"
          type="email"
        />
        
        {/* โทรสาร */}
        <InputField
          id="fax"
          name="fax"
          label="โทรสาร"
          value={formData.fax}
          onChange={handleChange}
          placeholder="0XXXXXXXXX"
          type="tel"
        />
      </div>
      
      <InfoTip />
    </div>
  );
}