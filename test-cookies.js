// Simple script to test cookie management
console.log("Testing cookie management...");

// Import the CookieManager
const CookieManager = require("./app/utils/cookieManager").default;

// Test saving preferences
const testPreferences = {
  functionality: true,
  performance: true,
  analytics: false,
  marketing: false,
};

console.log("Saving test preferences:", testPreferences);
const saveResult = CookieManager.savePreferences(testPreferences, "custom");
console.log("Save result:", saveResult);

// Test getting preferences
const savedPreferences = CookieManager.getPreferences();
console.log("Retrieved preferences:", savedPreferences);

// Test checking consent
const hasConsent = CookieManager.hasConsent();
console.log("Has consent:", hasConsent);

// Test checking if specific types are allowed
console.log("Is essential allowed:", CookieManager.isAllowed("essential"));
console.log("Is functionality allowed:", CookieManager.isAllowed("functionality"));
console.log("Is performance allowed:", CookieManager.isAllowed("performance"));
console.log("Is analytics allowed:", CookieManager.isAllowed("analytics"));
console.log("Is marketing allowed:", CookieManager.isAllowed("marketing"));

console.log("Cookie management test complete!");
