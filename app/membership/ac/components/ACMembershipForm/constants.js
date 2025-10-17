// Constants for AC Membership Form

export const STEPS = [
  { id: 1, name: "ข้อมูลบริษัท" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

export const INITIAL_FORM_DATA = {
  companyName: "",
  companyNameEn: "",
  taxId: "",
  companyEmail: "",
  companyPhone: "",
  companyWebsite: "",
  addressNumber: "",
  street: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",

  representatives: [
    {
      idCardNumber: "",
      firstNameThai: "",
      lastNameThai: "",
      firstNameEnglish: "",
      lastNameEnglish: "",
      position: "",
      email: "",
      phone: "",
      isPrimary: true,
    },
  ],

  businessTypes: {},
  otherBusinessTypeDetail: "",
  products: [],
  memberCount: "",
  registeredCapital: "",
  industrialGroups: [],
  provincialChapters: [],
  // Documents
  companyRegistration: null,
  vatRegistration: null,
  idCard: null,
  authorityLetter: null,
  companyStamp: null,
  authorizedSignature: null,

  // Authorized signatory name fields
  authorizedSignatoryFirstNameTh: "",
  authorizedSignatoryLastNameTh: "",
  authorizedSignatoryFirstNameEn: "",
  authorizedSignatoryLastNameEn: "",
  // Authorized signatory position fields
  authorizedSignatoryPositionTh: "",
  authorizedSignatoryPositionEn: "",
};
