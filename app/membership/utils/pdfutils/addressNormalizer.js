// Address normalization utilities

// Extract address type 2 contact information
export const normalizeAddressType2Contact = (app) => {
  let addressType2Phone = "";
  let addressType2PhoneExt = "";
  let addressType2Email = "";
  let addressType2Website = "";

  // Check if addresses exists and find type 2 (array or object format)
  if (app.addresses) {
    if (Array.isArray(app.addresses)) {
      const addressType2 = app.addresses.find(
        (addr) => addr.address_type === "2" || addr.addressType === "2",
      );
      if (addressType2) {
        addressType2Phone = addressType2.phone || "";
        addressType2PhoneExt = addressType2.phone_extension || addressType2.phoneExtension || "";
        addressType2Email = addressType2.email || "";
        addressType2Website = addressType2.website || "";
      }
    } else if (typeof app.addresses === "object" && app.addresses["2"]) {
      const a2 = app.addresses["2"];
      addressType2Phone = a2.phone || "";
      addressType2PhoneExt = a2.phone_extension || a2.phoneExtension || "";
      addressType2Email = a2.email || "";
      addressType2Website = a2.website || "";
    }
  }

  return {
    addressType2Phone,
    addressType2PhoneExt,
    addressType2Email,
    addressType2Website,
  };
};

// Build address type 2 object (shipping address) - support array or object format
export const normalizeAddress2 = (app) => {
  let address2 = null;
  if (app.addresses) {
    if (Array.isArray(app.addresses)) {
      const raw = app.addresses.find(
        (addr) => addr.address_type === "2" || addr.addressType === "2" || addr.addressTypeId === 2,
      );
      if (raw) {
        address2 = {
          number:
            raw.address_number ||
            raw.addressNumber ||
            raw.address_no ||
            raw.addressNo ||
            raw.house_number ||
            raw.houseNumber ||
            raw.number ||
            "",
          moo: raw.moo || "",
          soi: raw.soi || "",
          street: raw.STreet || raw.street || raw.road || "",
          subDistrict: raw.sub_district || raw.subDistrict || "",
          district: raw.district || raw.amphur || "",
          province: raw.province || "",
          postalCode: raw.postal_code || raw.postalCode || "",
        };
      }
    } else if (typeof app.addresses === "object" && app.addresses["2"]) {
      const raw = app.addresses["2"];
      address2 = {
        number:
          raw.addressNumber ||
          raw.address_number ||
          raw.address_no ||
          raw.addressNo ||
          raw.house_number ||
          raw.houseNumber ||
          raw.number ||
          "",
        moo: raw.moo || "",
        soi: raw.soi || "",
        street: raw.STreet || raw.street || raw.road || "",
        subDistrict: raw.subDistrict || raw.sub_district || "",
        district: raw.district || raw.amphur || "",
        province: raw.province || "",
        postalCode: raw.postalCode || raw.postal_code || "",
      };
    }
  }
  return address2;
};

// Normalize base address fields (with robust fallbacks including addresses[0]/type1)
export const normalizeBaseAddress = (app) => {
  let baseAddress = {
    number: app.address_number || app.addressNumber || app.address?.addressNumber,
    moo: app.moo || app.address?.moo,
    soi: app.soi || app.address?.soi,
    street:
      app.STreet ||
      app.street ||
      app.road ||
      app.address?.STreet ||
      app.address?.street ||
      app.address?.road,
    subDistrict: app.sub_district || app.subDistrict || app.address?.subDistrict,
    district: app.district || app.address?.district,
    province: app.province || app.address?.province,
    postalCode: app.postal_code || app.postalCode || app.address?.postalCode,
  };

  if (!baseAddress.number && app.addresses) {
    const pick = (raw) => ({
      number:
        raw.address_number ||
        raw.addressNumber ||
        raw.address_no ||
        raw.addressNo ||
        raw.house_number ||
        raw.houseNumber ||
        raw.number ||
        "",
      moo: raw.moo || "",
      soi: raw.soi || "",
      street: raw.STreet || raw.street || raw.road || "",
      subDistrict: raw.sub_district || raw.subDistrict || "",
      district: raw.district || raw.amphur || "",
      province: raw.province || "",
      postalCode: raw.postal_code || raw.postalCode || "",
    });

    if (Array.isArray(app.addresses)) {
      const a1 =
        app.addresses.find(
          (addr) =>
            addr.address_type === "1" || addr.addressType === "1" || addr.addressTypeId === 1,
        ) || app.addresses[0];
      if (a1) baseAddress = pick(a1);
    } else if (typeof app.addresses === "object" && app.addresses["1"]) {
      const a1 = app.addresses["1"];
      if (a1) baseAddress = pick(a1);
    }
  }

  return {
    addressNumber: baseAddress.number,
    moo: baseAddress.moo,
    soi: baseAddress.soi,
    street: baseAddress.street,
    district: baseAddress.district,
    province: baseAddress.province,
    subDistrict: baseAddress.subDistrict,
    postalCode: baseAddress.postalCode,
  };
};
