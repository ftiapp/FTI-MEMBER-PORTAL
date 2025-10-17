// ScrollHelpers.js
// Scroll and error field handling utilities for OC Form

/**
 * Get first error key from errors object
 * @param {Object} errors - Errors object
 * @returns {string|null} - First error key
 */
export const getFirstErrorKey = (errors) => {
  if (!errors || typeof errors !== 'object') return null;
  
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  
  const [firstKey] = entries[0];
  return firstKey;
};

/**
 * Scroll to error field with special handling for different field types
 * @param {string} errorKey - The error key to scroll to
 */
export const scrollToErrorField = (errorKey) => {
  if (!errorKey) return;

  // Address fields: addresses.{type}.{field}
  if (errorKey.startsWith("addresses.")) {
    const match = errorKey.match(/addresses\.(\d+)\.(.+)$/);
    if (match) {
      const tab = match[1];
      const field = match[2];

      // Map validation field to actual input id in CompanyAddressInfo
      let targetId = null;
      if (field === "email") targetId = `email-${tab}`;
      else if (field === "phone") targetId = `phone-${tab}`;
      else if (["addressNumber", "building", "moo", "soi", "street"].includes(field))
        targetId = field;
      // subDistrict/district/province/postalCode are SearchableDropdowns; scrolling to section is sufficient

      // Allow CompanyAddressInfo to auto-switch tab via its useEffect (based on errors), then focus
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
            document.querySelector(".company-address") ||
            document.querySelector(".bg-white");
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

  // Non-address fields: try matching by id or name
  setTimeout(() => {
    const byId = document.getElementById(errorKey);
    const byName = document.querySelector(`[name="${errorKey}"]`);
    const el = byId || byName;
    if (el) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
        return;
      } catch {}
    }

    // Fallbacks by section
    if (errorKey.startsWith("contactPerson")) {
      const section = document.querySelector('[data-section="contact-person"]');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (errorKey === "representativeErrors" || errorKey?.startsWith("representative")) {
      const section = document.querySelector(
        '[data-section="representatives"], [data-section="representative-section"]'
      );
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
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