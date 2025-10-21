"use client";

import PropTypes from "prop-types";
import SearchableDropdown from "../../shared/SearchableDropdown";

/**
 * คอมโพเนนต์สำหรับแสดงฟิลด์ตำแหน่งที่ตั้ง
 * (ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์)
 */
export default function AddressLocationFields({
  currentAddress,
  handlers,
  fetchFunctions,
  errors,
  isAutofill,
  isLoading,
  activeTab,
}) {
  return (
    <>
      {/* Sub District */}
      <div className="space-y-2">
        <SearchableDropdown
          label="ตำบล/แขวง / Sub-district"
          placeholder="พิมพ์เพื่อค้นหาตำบล/แขวง / Type to search sub-district"
          value={currentAddress?.subDistrict || ""}
          onChange={handlers.handleSubDistrictChange}
          onSelect={handlers.handleSubDistrictSelect}
          fetchOptions={fetchFunctions.fetchSubDistricts}
          isRequired={true}
          isReadOnly={false}
          error={
            errors?.[`addresses.${activeTab}.subDistrict`] ||
            errors?.addresses?.[activeTab]?.subDistrict
          }
          autoFillNote={
            isAutofill && currentAddress?.subDistrict ? "* ข้อมูลถูกดึงอัตโนมัติ" : null
          }
          disabled={isLoading}
        />
      </div>

      {/* District */}
      <div className="space-y-2">
        <SearchableDropdown
          label="อำเภอ/เขต / District"
          placeholder="ระบบจะเติมอัตโนมัติ / Auto-filled from sub-district"
          value={currentAddress?.district || ""}
          onChange={handlers.handleDistrictChange}
          onSelect={handlers.handleDistrictSelect}
          fetchOptions={fetchFunctions.fetchDistricts}
          isRequired={true}
          isReadOnly={true}
          error={
            errors?.[`addresses.${activeTab}.district`] || errors?.addresses?.[activeTab]?.district
          }
          autoFillNote={isAutofill && currentAddress?.district ? "* ข้อมูลถูกดึงอัตโนมัติ" : null}
        />
      </div>

      {/* Province */}
      <div className="space-y-2">
        <SearchableDropdown
          label="จังหวัด / Province"
          placeholder="ระบบจะเติมอัตโนมัติ / Auto-filled from sub-district"
          value={currentAddress?.province || ""}
          onChange={handlers.handleProvinceChange}
          onSelect={handlers.handleProvinceSelect}
          fetchOptions={fetchFunctions.fetchProvinces}
          isRequired={true}
          isReadOnly={true}
          error={
            errors?.[`addresses.${activeTab}.province`] || errors?.addresses?.[activeTab]?.province
          }
          autoFillNote={isAutofill && currentAddress?.province ? "* ข้อมูลถูกดึงอัตโนมัติ" : null}
        />
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <SearchableDropdown
          label="รหัสไปรษณีย์ / Postal Code"
          placeholder="พิมพ์เพื่อค้นหา / Type to search postal code"
          value={currentAddress?.postalCode || ""}
          onChange={handlers.handlePostalCodeChange}
          onSelect={handlers.handlePostalCodeSelect}
          fetchOptions={fetchFunctions.fetchPostalCodes}
          isRequired={true}
          isReadOnly={false}
          error={
            errors?.[`addresses.${activeTab}.postalCode`] ||
            errors?.addresses?.[activeTab]?.postalCode
          }
          disabled={isLoading}
        />
      </div>
    </>
  );
}

AddressLocationFields.propTypes = {
  currentAddress: PropTypes.object,
  handlers: PropTypes.shape({
    handleSubDistrictChange: PropTypes.func.isRequired,
    handleSubDistrictSelect: PropTypes.func.isRequired,
    handleDistrictChange: PropTypes.func.isRequired,
    handleDistrictSelect: PropTypes.func.isRequired,
    handleProvinceChange: PropTypes.func.isRequired,
    handleProvinceSelect: PropTypes.func.isRequired,
    handlePostalCodeChange: PropTypes.func.isRequired,
    handlePostalCodeSelect: PropTypes.func.isRequired,
  }).isRequired,
  fetchFunctions: PropTypes.shape({
    fetchSubDistricts: PropTypes.func.isRequired,
    fetchDistricts: PropTypes.func.isRequired,
    fetchProvinces: PropTypes.func.isRequired,
    fetchPostalCodes: PropTypes.func.isRequired,
  }).isRequired,
  errors: PropTypes.object,
  isAutofill: PropTypes.bool,
  isLoading: PropTypes.bool,
  activeTab: PropTypes.string.isRequired,
};

AddressLocationFields.defaultProps = {
  currentAddress: {},
  errors: {},
  isAutofill: false,
  isLoading: false,
};
