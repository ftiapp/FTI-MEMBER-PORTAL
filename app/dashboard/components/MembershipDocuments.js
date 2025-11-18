"use client";

// Thin wrapper that re-exports the new MembershipDocuments implementation
// from the colocated MembershipDocuments/index.js file. This keeps any
// existing imports from "./components/MembershipDocuments" working while
// ensuring there is a single source of truth for the component.

import MembershipDocuments from "./MembershipDocuments";

export default MembershipDocuments;
