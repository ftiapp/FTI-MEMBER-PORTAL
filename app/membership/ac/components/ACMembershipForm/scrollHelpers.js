// Scroll and Error Field Helpers for AC Membership Form

/**
 * Helper: Scroll to a field key with offset and focus
 */
export const scrollToErrorField = (errorKey) => {
  if (!errorKey || typeof document === "undefined") return;

  // Company basic info fields - handle these first and specifically
  const companyBasicFields = [
    "companyName",
    "companyNameEn",
    "taxId",
    "registrationNumber",
    "registrationDate",
  ];
  if (companyBasicFields.includes(errorKey)) {
    setTimeout(() => {
      // Try multiple selector strategies for company fields
      const selectors = [
        `#${errorKey}`,
        `[name="${errorKey}"]`,
        `[data-field="${errorKey}"]`,
        `input[id="${errorKey}"]`,
        `input[name="${errorKey}"]`,
      ];

      let el = null;
      for (const selector of selectors) {
        el = document.querySelector(selector);
        if (el) break;
      }

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus after scrolling completes
        setTimeout(() => {
          try {
            el.focus({ preventScroll: true });
          } catch (e) {}
        }, 100);
      } else {
        // Fallback: scroll to company info section
        const section =
          document.querySelector('[data-section="company-info"]') ||
          document.querySelector(".company-info");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return;
  }

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
      else if (["addressNumber", "building", "moo", "soi", "road", "street"].includes(field))
        targetId = field;
      // subDistrict/district/province/postalCode are SearchableDropdowns; scrolling to section is sufficient

      // Allow CompanyAddressInfo to auto-switch tab via its useEffect (based on errors), then focus
      setTimeout(() => {
        let el = null;
        if (targetId) {
          el = document.getElementById(targetId);
          if (!el) el = document.querySelector(`[name="${targetId}"]`);
        }

        // Try more specific selector for address fields
        if (!el) {
          el = document.querySelector(`[name="addresses[${tab}][${field}]"]`);
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
          setTimeout(() => el.focus({ preventScroll: true }), 300);
        } catch {}
      }, 250);
      return;
    }
  }

  // Representative fields: handle special rep-{index}-{field} format
  if (errorKey.startsWith("rep-")) {
    const match = errorKey.match(/rep-(\d+)-(.+)$/);
    if (match) {
      const repIndex = match[1];
      const field = match[2];

      setTimeout(() => {
        // Try various selectors to find the representative field
        const selectors = [
          `#rep-${repIndex}-${field}`,
          `[name="representatives[${repIndex}][${field}]"]`,
          `[data-rep="${repIndex}"][data-field="${field}"]`,
        ];

        let el = null;
        for (const selector of selectors) {
          el = document.querySelector(selector);
          if (el) break;
        }

        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => el.focus({ preventScroll: true }), 300);
        } else {
          // Fallback: scroll to representative section
          const section = document.querySelector('[data-section="representatives"]');
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }
  }

  // Authorized Signatory fields (in DocumentUploadSection) - now using signatories array
  if (errorKey.startsWith("signatories[")) {
    const match = errorKey.match(/signatories\[(\d+)\]\.(.+)$/);
    if (match) {
      const signatoryIndex = match[1];
      const field = match[2];

      setTimeout(() => {
        // Try selectors for signatory fields
        const selectors = [
          `[data-signatory="${signatoryIndex}"][data-field="${field}"]`,
          `[name="signatories[${signatoryIndex}][${field}]"]`,
          `input[name="signatories[${signatoryIndex}][${field}]"]`,
          `select[name="signatories[${signatoryIndex}][${field}]"]`,
        ];

        let el = null;
        for (const selector of selectors) {
          el = document.querySelector(selector);
          if (el) break;
        }

        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            try {
              el.focus({ preventScroll: true });
            } catch (e) {}
          }, 100);
        } else {
          // Fallback: scroll to document upload section
          const section =
            document.querySelector('[data-section="documents"]') ||
            document.querySelector('[data-section="document-upload"]');
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }
  }

  // Authorized Signature files (in DocumentUploadSection)
  if (errorKey.startsWith("authorizedSignature_")) {
    const match = errorKey.match(/authorizedSignature_(\d+)$/);
    if (match) {
      const signatoryIndex = match[1];
      setTimeout(() => {
        // Try to find the signature upload zone for this signatory
        const el = document.querySelector(`[data-signatory-signature="${signatoryIndex}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          // Fallback: scroll to document upload section
          const section =
            document.querySelector('[data-section="documents"]') ||
            document.querySelector('[data-section="document-upload"]');
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }
  }

  // Non-address fields: try matching by id or name
  setTimeout(() => {
    // Try multiple selector strategies
    const selectors = [
      `#${errorKey}`,
      `[name="${errorKey}"]`,
      `[data-field="${errorKey}"]`,
      `input[id="${errorKey}"]`,
      `input[name="${errorKey}"]`,
      `select[id="${errorKey}"]`,
      `select[name="${errorKey}"]`,
      `textarea[id="${errorKey}"]`,
      `textarea[name="${errorKey}"]`,
    ];

    let el = null;
    for (const selector of selectors) {
      el = document.querySelector(selector);
      if (el) break;
    }

    if (el) {
      try {
        // Use scrollIntoView for consistent behavior with OC form
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => el.focus({ preventScroll: true }), 100);
        return;
      } catch {}
    }

    // Handle summary key for contact persons (plural)
    if (errorKey === "contactPersons") {
      const section = document.querySelector('[data-section="contact-person"]');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Handle contact person fields: contactPerson{index}{field}
    if (errorKey.startsWith("contactPerson")) {
      const match = errorKey.match(/contactPerson(\d+)(.+)$/);
      if (match) {
        const contactIndex = match[1];
        const field = match[2];

        setTimeout(() => {
          // Try multiple selector strategies for contact person fields
          const selectors = [
            `#${errorKey}`,
            `[name="${errorKey}"]`,
            `#contactPerson${contactIndex}${field}`,
            `[name="contactPerson${contactIndex}${field}"]`,
          ];

          let contactEl = null;
          for (const selector of selectors) {
            contactEl = document.querySelector(selector);
            if (contactEl) break;
          }

          if (contactEl) {
            contactEl.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
              try {
                contactEl.focus({ preventScroll: true });
              } catch (e) {}
            }, 100);
          } else {
            // Fallback: scroll to contact person section
            const section = document.querySelector('[data-section="contact-person"]');
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
        return;
      }

      // Fallback for general contact person errors
      const section = document.querySelector('[data-section="contact-person"]');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    } else if (errorKey === "addresses") {
      // Handle generic address errors - scroll to address section
      const section = document.querySelector('[data-section="company-address"]');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Last resort: try to find a section based on the error key
      const sectionMap = {
        companyName: "company-info",
        businessTypes: "business-types",
        products: "products",
        documents: "documents",
      };

      // Check if the error key starts with any of the keys in sectionMap
      for (const [key, sectionName] of Object.entries(sectionMap)) {
        if (errorKey.startsWith(key)) {
          const section = document.querySelector(`[data-section="${sectionName}"]`);
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
        }
      }
    }
  }, 100);
};

/**
 * Helper to extract the first specific field error in a deterministic priority
 * Priority: Company basic info -> Addresses -> Contact persons -> Fallback
 */
export const getFirstFieldError = (errs) => {
  if (!errs || typeof errs !== "object") return { key: null, message: null };

  // 1) Company basic info fields in explicit order
  const companyPriority = [
    "companyName",
    "companyNameEn",
    "taxId",
    "registrationNumber",
    "registrationDate",
    // Note: companyEmail, companyPhone, companyWebsite are fallback fields only, not validated
  ];
  for (const k of companyPriority) {
    if (typeof errs[k] === "string") {
      return { key: k, message: errs[k] };
    }
  }

  // 2) Address nested errors: errors.addresses[type][field] or summary
  if (errs.addresses && typeof errs.addresses === "object") {
    const typeKeys = Object.keys(errs.addresses).filter((k) => k !== "_error");
    for (const t of typeKeys) {
      const obj = errs.addresses[t];
      if (obj && typeof obj === "object") {
        const fieldKeys = Object.keys(obj).filter((f) => f !== "base");
        if (fieldKeys.length > 0) {
          const f = fieldKeys[0];
          const msg = obj[f];
          if (typeof msg === "string") return { key: `addresses.${t}.${f}`, message: msg };
        }
      }
    }
    if (typeof errs.addresses._error === "string") {
      return { key: "addresses", message: errs.addresses._error };
    }
  }

  // 3) Contact person flat field keys e.g. contactPerson0FirstNameTh
  const contactKeys = Object.keys(errs).filter((k) => k.startsWith("contactPerson"));
  if (contactKeys.length > 0) {
    const k = contactKeys[0];
    const v = errs[k];
    if (typeof v === "string") return { key: k, message: v };
  }

  // 4) Signatories array errors: signatories[index].field
  if (errs.signatories && Array.isArray(errs.signatories)) {
    for (let i = 0; i < errs.signatories.length; i++) {
      const signatoryErrors = errs.signatories[i];
      if (signatoryErrors && typeof signatoryErrors === "object") {
        const fieldKeys = Object.keys(signatoryErrors);
        if (fieldKeys.length > 0) {
          const field = fieldKeys[0];
          const message = signatoryErrors[field];
          if (typeof message === "string") {
            return { key: `signatories[${i}].${field}`, message };
          }
        }
      }
    }
  }

  // 5) Authorized signature file errors: authorizedSignature_index
  const authorizedSignatureKeys = Object.keys(errs).filter((k) =>
    k.startsWith("authorizedSignature_"),
  );
  if (authorizedSignatureKeys.length > 0) {
    const k = authorizedSignatureKeys[0];
    const v = errs[k];
    if (typeof v === "string") return { key: k, message: v };
  }

  // Note: Representative errors are handled specially in submit handlers via representativeErrors

  // 6) Fallback: first flat string error key or first leaf string in a nested object
  for (const [k, v] of Object.entries(errs)) {
    if (typeof v === "string") return { key: k, message: v };
    if (v && typeof v === "object") {
      const nestedFirstKey = Object.keys(v).find((x) => typeof v[x] === "string");
      if (nestedFirstKey) return { key: `${k}.${nestedFirstKey}`, message: v[nestedFirstKey] };
    }
  }

  return { key: null, message: null };
};
