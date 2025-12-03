// pdf-sections.js - HTML sections builder
import {
  field,
  section,
  buildGroupsAndChaptersBlock,
  buildCompactContactPersonBlock,
  buildSignatorySignature,
} from "./pdf-core-sections.js";

import {
  buildMemberInfoIC,
  buildMemberInfoCompany,
  buildAddressSection,
  buildRepresentativesSection,
  buildBusinessSection,
  buildContactPersonSection,
  buildInvoiceAddressSection,
} from "./pdf-domain-sections.js";

// Re-export all public helpers so existing imports keep working
export {
  field,
  section,
  buildGroupsAndChaptersBlock,
  buildCompactContactPersonBlock,
  buildSignatorySignature,
  buildMemberInfoIC,
  buildMemberInfoCompany,
  buildInvoiceAddressSection,
  buildAddressSection,
  buildRepresentativesSection,
  buildBusinessSection,
  buildContactPersonSection,
};
