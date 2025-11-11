// Data normalization functions

import { normalizeAddressType2Contact, normalizeAddress2, normalizeBaseAddress } from './addressNormalizer.js';
import { normalizeCompanyData, normalizeApplicantNames } from './companyNormalizer.js';
import { normalizeSignatureData, normalizeAuthorizedSignatoryName, normalizeAuthorizedSignatoryPosition } from './signatureNormalizer.js';
import { normalizeRepresentatives } from './representativeNormalizer.js';
import { normalizeApplicantAccount, normalizeApplicantFullName } from './applicantNormalizer.js';

// Process data - normalize field names
export const processData = (app) => {
  // Get normalized data from each module
  const addressType2Contact = normalizeAddressType2Contact(app);
  const address2 = normalizeAddress2(app);
  const baseAddress = normalizeBaseAddress(app);
  const companyData = normalizeCompanyData(app);
  const applicantNames = normalizeApplicantNames(app);
  const signatureData = normalizeSignatureData(app);
  const representatives = normalizeRepresentatives(app);
  const applicantAccount = normalizeApplicantAccount(app);

  // Create normalized applicant data with names
  const applicantData = {
    ...applicantNames,
    applicantFullName: normalizeApplicantFullName(applicantAccount, applicantNames),
  };

  return {
    ...app,
    // Company data
    ...companyData,
    // Applicant names (IC)
    ...applicantData,
    // Address data
    ...baseAddress,
    ...addressType2Contact,
    address2,
    // Signature data
    ...signatureData,
    // Representatives
    representatives,
    // Computed signature fields
    authorizedSignatoryName: normalizeAuthorizedSignatoryName(app),
    authorizedSignatoryPosition: normalizeAuthorizedSignatoryPosition(app),
  };
};
