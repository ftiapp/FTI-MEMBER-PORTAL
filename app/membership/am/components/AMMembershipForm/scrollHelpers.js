// AMMembershipForm_ScrollHelpers.js
// Scroll and error field handling utilities

/**
 * Determine first error field key deterministically with priority
 * Priority: Company info (association/tax/contact) -> Addresses -> Contact persons -> Fallback
 * @param {Object} errors - Error object
 * @returns {string|null} - First error field key
 */
export const getFirstFieldError = (errors = {}) => {
  if (!errors || typeof errors !== "object") return null;

  // 1) Company/association info priority
  const companyPriority = [
    "associationName",
    "associationNameEng",
    "taxId",
    "associationEmail",
    "associationPhone",
  ];
  for (const key of companyPriority) {
    if (errors[key]) return key;
  }

  // 2) Address fields: enforce order by type 1->2->3 and field priority
  const addressFieldPriority = [
    "addressNumber",
    "subDistrict",
    "district",
    "province",
    "postalCode",
    "email",
    "phone",
  ];
  const addressTypes = ["1", "2", "3"];
  for (const type of addressTypes) {
    // complete address missing
    const missingKey = `address_${type}`;
    if (errors[missingKey]) return missingKey;
    for (const f of addressFieldPriority) {
      const k = `address_${type}_${f}`;
      if (errors[k]) return k;
    }
  }

  // 3) Contact persons: prefer main contact (index 0) field order
  const contactPersonPriority = [
    "contactPersons",
    "contactPerson0PrenameTh",
    "contactPerson0PrenameEn",
    "contactPerson0PrenameOther",
    "contactPerson0FirstNameTh",
    "contactPerson0LastNameTh",
    "contactPerson0FirstNameEn",
    "contactPerson0LastNameEn",
    "contactPerson0Position",
    "contactPerson0Email",
    "contactPerson0Phone",
    "contactPerson0TypeContactId",
    "contactPerson0TypeContactOtherDetail",
  ];
  for (const key of contactPersonPriority) {
    if (errors[key]) return key;
  }

  // 4) Skip representativeErrors here (handled separately for section-level scroll)
  // 5) Fallback: return a stable key (alphabetical) if any exists
  const keys = Object.keys(errors).filter((k) => k !== "representativeErrors");
  if (keys.length > 0) {
    return keys.sort()[0];
  }
  return null;
};

/**
 * Create scroll to error field function with offset and focus
 * @param {number} stickyOffset - Offset for sticky header
 * @returns {Function} - Scroll function
 */
export const createScrollToErrorField = (stickyOffset = 120) => {
  return (fieldKey) => {
    if (!fieldKey || typeof document === "undefined") return;

    const performScroll = () => {
      const selectors = [
        `[name="${fieldKey}"]`,
        `#${CSS.escape(fieldKey)}`,
        `.${CSS.escape(fieldKey)}`,
        `[data-error-key="${fieldKey}"]`,
      ];

      let target = null;
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          target = el;
          break;
        }
      }

      if (target) {
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        const offset = Math.max(0, stickyOffset);
        window.scrollTo({ top: absoluteTop - offset, behavior: "smooth" });

        if (typeof target.focus === "function") {
          setTimeout(() => target.focus({ preventScroll: true }), 250);
        }
        return true;
      }
      return false;
    };

    // Special handling: address_{type}_{field} -> let AddressSection auto-switch tab
    if (fieldKey.startsWith("address_")) {
      const match = fieldKey.match(/^address_(\d+)_(.+)$/);
      if (match) {
        const tab = match[1];
        const field = match[2];
        
        // Map validation field to actual input id in AddressSection
        let targetId = null;
        if (field === "email") targetId = `email-${tab}`;
        else if (field === "phone") targetId = `phone-${tab}`;
        else if (field === "website") targetId = `website-${tab}`;
        else if (["addressNumber", "building", "moo", "soi", "street"].includes(field))
          targetId = field;
        // subDistrict/district/province/postalCode are SearchableDropdowns; scrolling to section is sufficient

        // Allow AddressSection to auto-switch tab via its useEffect (based on errors), then focus
        setTimeout(() => {
          let el = null;
          if (targetId) {
            el = document.getElementById(targetId);
            if (!el) el = document.querySelector(`[name="${targetId}"]`);
          }

          // Fallback: scroll to the address section container
          if (!el) {
            const section =
              document.querySelector('[data-section="company-address"]') ||
              document.querySelector('[data-section="addresses"]') ||
              document.querySelector('.address-tabs-container') ||
              document.querySelector('.bg-white');
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }

          try {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Focus without jumping again
            el.focus({ preventScroll: true });
          } catch {}
        }, 250);
        return;
      }
    }

    // Default attempt to scroll directly
    if (performScroll()) return;

    // Fallbacks by section
    if (fieldKey.startsWith("contactPerson")) {
      const section = document.querySelector('[data-section="contact-person"]');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (fieldKey.startsWith("address_")) {
      const section = document.querySelector(
        '[data-section="addresses"], [data-section="address-section"]',
      );
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (fieldKey === "representativeErrors" || fieldKey?.startsWith("representative")) {
      const section = document.querySelector(
        '[data-section="representatives"], [data-section="representative-section"]',
      );
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  };
};

/**
 * Scroll to top of page
 */
export const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

/**
 * Scroll to consent box
 */
export const scrollToConsentBox = () => {
  setTimeout(() => {
    const consentBox = document.querySelector('[data-consent-box]');
    if (consentBox) {
      consentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};