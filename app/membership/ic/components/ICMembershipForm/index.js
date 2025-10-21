// ICMembershipForm/index.js
// Central export point for all IC Form modules

// Export constants
export { STEPS, INITIAL_FORM_DATA, STICKY_HEADER_OFFSET } from "./constants";

// Export scroll helpers
export {
  getFirstErrorKey,
  scrollToErrorField,
  scrollToTop,
  scrollToConsentBox,
} from "./scrollHelpers";

// Export handlers
export {
  checkIdCardUniqueness,
  saveDraft,
  deleteDraft,
  loadDraftFromUrl,
  buildRepresentativeErrorMessage,
  buildErrorToastMessage,
} from "./handlers";

// Export renderers
export {
  renderStepComponent,
  renderNavigationButtons,
  renderDocumentHint,
  renderErrorMessage,
} from "./renderers";
