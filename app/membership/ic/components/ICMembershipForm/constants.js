// ICMembershipForm_Constants.js
// Constants for IC Form

export const STEPS = [
  { id: 1, name: "ข้อมูลผู้สมัคร" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

export const INITIAL_FORM_DATA = {
  // Applicant info
  idCardNumber: "",
  // Prename fields (applicant)
  prenameTh: "",
  prenameEn: "",
  prenameOther: "",
  prenameOtherEn: "",
  firstNameThai: "",
  lastNameThai: "",
  firstNameEng: "",
  lastNameEng: "",
  phone: "",
  email: "",

  // Address
  addressNumber: "",
  moo: "",
  soi: "",
  road: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",
  website: "",

  // Industrial group and provincial chapter
  industrialGroupId: "",
  provincialChapterId: "",

  // Representative info (only one allowed)
  representative: {
    prenameTh: "",
    prenameEn: "",
    prenameOther: "",
    prenameOtherEn: "",
    firstNameThai: "",
    lastNameThai: "",
    firstNameEng: "",
    lastNameEng: "",
    email: "",
    phone: "",
    phoneExtension: "",
  },

  // Business info
  businessTypes: {},
  otherBusinessTypeDetail: "",
  products: [{ id: 1, nameTh: "", nameEn: "" }],

  // Document
  idCardDocument: null,

  // เอกสารที่จำเป็น (บังคับทุกกรณี)
  authorizedSignature: null,

  // Authorized signatory name fields
  authorizedSignatoryPrenameTh: "",
  authorizedSignatoryPrenameEn: "",
  authorizedSignatoryPrenameOther: "",
  authorizedSignatoryPrenameOtherEn: "",
  authorizedSignatoryFirstNameTh: "",
  authorizedSignatoryLastNameTh: "",
  authorizedSignatoryFirstNameEn: "",
  authorizedSignatoryLastNameEn: "",
};

export const STICKY_HEADER_OFFSET = 120;
