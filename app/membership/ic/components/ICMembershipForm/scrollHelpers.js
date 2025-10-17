// ICMembershipForm/scrollHelpers.js - แก้ไขฟังก์ชัน scrollToErrorField

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

export const scrollToErrorField = (errorKey) => {
  if (!errorKey) return;
  
  console.log("🔍 [scrollToErrorField] Attempting to scroll to:", errorKey);

  // Map error keys to actual field IDs in the form
  const fieldIdMap = {
    // Applicant fields
    'idCardNumber': 'idCardNumber',
    'prename_th': 'prenameTh',
    'prename_en': 'prenameEn', 
    'prename_other': 'prenameOther',
    'prename_other_en': 'prenameOtherEn',
    'firstNameThai': 'firstNameThai',
    'lastNameThai': 'lastNameThai',
    'firstNameEng': 'firstNameEng',
    'lastNameEng': 'lastNameEng',
    'phone': 'phone',
    'email': 'email',
    
    // Address phone fields (for different tabs)
    'address_1_phone': 'phone-1',
    'address_2_phone': 'phone-2',
    'phone-1': 'phone-1',
    'phone-2': 'phone-2',
    
    // Basic address fields (fallback for old format)
    'addressNumber': 'addressNumber',
    'subDistrict': 'subDistrict',
    'district': 'district',
    'province': 'province',
    'postalCode': 'postalCode',
    'website': 'website',
  };

  // Representative errors
  if (errorKey === "representativeErrors" || errorKey?.startsWith("representative")) {
    setTimeout(() => {
      const section = document.querySelector(
        '[data-section="representative"], [data-section="representative-section"], .representative-section'
      );
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
    return;
  }

  // Multi-address fields: address_1_addressNumber, address_2_phone, etc.
  if (errorKey.startsWith("address_") || errorKey.startsWith("addresses.")) {
    console.log("📍 [Address Field] Detected address error:", errorKey);
    
    // Extract type and field from patterns like:
    // address_1_addressNumber or addresses.1.addressNumber
    let addressType, fieldName;
    
    if (errorKey.startsWith("address_")) {
      const match = errorKey.match(/address_(\d+)_?(.*)$/);
      if (match) {
        addressType = match[1];
        fieldName = match[2] || '';
      }
    } else if (errorKey.startsWith("addresses.")) {
      const match = errorKey.match(/addresses\.(\d+)\.?(.*)$/);
      if (match) {
        addressType = match[1];
        fieldName = match[2] || '';
      }
    }
    
    console.log("📍 Parsed - Type:", addressType, "Field:", fieldName);
    
    // AddressSection component has useEffect that auto-switches tab based on errors
    // So we don't need to manually click the tab button here
    // Just wait a bit for the tab to switch, then scroll to field
    setTimeout(() => {
      // Try to find the specific field - address fields use simple IDs without prefixes
      let el = null;
      
      if (fieldName) {
        console.log("🔍 Searching for field:", fieldName);
        
        // For phone/email fields, prioritize the address-specific ID with tab suffix
        if (fieldName === 'phone' || fieldName === 'email' || fieldName === 'website') {
          // Try address-specific ID first (e.g., phone-1, email-2)
          el = document.getElementById(`${fieldName}-${addressType}`) ||
               document.querySelector(`[name="${fieldName}-${addressType}"]`) ||
               document.querySelector(`[data-error-key="address_${addressType}_${fieldName}"]`);
          
          console.log(`🔍 Looking for address-specific field: ${fieldName}-${addressType}`, el ? "✅ Found" : "❌ Not found");
        }
        
        // If not found, try other selectors
        if (!el) {
          // Address fields use simple IDs like "addressNumber", "subDistrict", etc.
          el = document.getElementById(fieldName) ||
               document.getElementById(`address_${addressType}_${fieldName}`) ||
               document.getElementById(`${fieldName}-${addressType}`) ||
               document.querySelector(`[name="${fieldName}"]`) ||
               document.querySelector(`[name="addresses[${addressType}][${fieldName}]"]`) ||
               document.querySelector(`[name="address_${addressType}_${fieldName}"]`);
        }
        
        if (el) {
          console.log("✅ Found field element:", el.id || el.name);
          
          // Verify that the element is inside the address section
          const addressSection = document.querySelector('[data-section="company-address"]');
          if (addressSection && !addressSection.contains(el)) {
            console.log("⚠️ Element is NOT inside address section, ignoring it");
            el = null; // Reset to trigger fallback to section scroll
          }
        } else {
          console.log("❌ Field element not found for:", fieldName);
        }
      }
      
      // If no specific field found, scroll to address section
      if (!el) {
        console.log("📜 Scrolling to address section instead");
        const section = document.querySelector('[data-section="company-address"]') ||
                       document.querySelector('[data-section="addresses"]') ||
                       document.querySelector('.address-tabs-container') ||
                       document.querySelector('[role="tabpanel"][data-state="active"]');
        if (section) {
          console.log("✅ Found address section, scrolling...");
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          console.log("❌ Address section not found");
        }
      } else {
        console.log("✅ Scrolling to field:", fieldName);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    }, 300);
    return;
  }

  // Products/Business types
  if (errorKey === "products" || errorKey === "productErrors") {
    setTimeout(() => {
      const section = document.querySelector('[data-section="products"]') ||
                     document.querySelector('.products-section') ||
                     document.querySelector('[id*="product"]');
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return;
  }

  if (errorKey === "businessTypes" || errorKey === "otherBusinessTypeDetail") {
    setTimeout(() => {
      const section = document.querySelector('[data-section="business-types"]') ||
                     document.querySelector('.business-types-section') ||
                     document.querySelector('[id*="business"]');
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return;
  }

  // Regular fields - try mapped ID first, then original key
  setTimeout(() => {
    const mappedId = fieldIdMap[errorKey];
    console.log("🔍 [Regular Field] Error key:", errorKey, "Mapped to:", mappedId);
    let el = null;
    
    // Try to find element with various selectors
    if (mappedId) {
      el = document.getElementById(mappedId) ||
           document.querySelector(`[name="${mappedId}"]`) ||
           document.querySelector(`input[id="${mappedId}"]`) ||
           document.querySelector(`select[id="${mappedId}"]`);
      
      if (el) {
        console.log("✅ Found element using mapped ID:", mappedId);
      }
    }
    
    // If not found with mapped ID, try original key
    if (!el) {
      el = document.getElementById(errorKey) ||
           document.querySelector(`[name="${errorKey}"]`) ||
           document.querySelector(`input[id="${errorKey}"]`) ||
           document.querySelector(`select[id="${errorKey}"]`);
      
      if (el) {
        console.log("✅ Found element using original key:", errorKey);
      }
    }
    
    // Special handling for dropdown/select fields
    if (!el) {
      // For SearchableDropdown components
      el = document.querySelector(`[data-field="${errorKey}"]`) ||
           document.querySelector(`[data-field="${mappedId}"]`) ||
           document.querySelector(`div[class*="dropdown"][id*="${errorKey}"]`);
      
      if (el) {
        console.log("✅ Found dropdown element");
      }
    }
    
    if (el) {
      console.log("✅ Scrolling to element:", el.id || el.name || el.className);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Try to focus if it's an input
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
        el.focus({ preventScroll: true });
      }
    } else {
      console.log("❌ Could not find element for error key:", errorKey);
      console.log("⬆️ Scrolling to top as fallback");
      // Fallback - scroll to top of form
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 120);
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