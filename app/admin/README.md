# Admin Area Documentation

This document explains the key components and behaviors in the admin area under `app/admin/` focusing on document preview/download, applicant account info fallbacks, and filter persistence for membership requests.

## Contents

- Document preview and download
- Applicant account info (fallback strategy)
- Membership Requests: filter/search persistence
- IC detail view unification
- Extending document support
- Other admin modules overview
- Admin shell (layout, navigation, hooks)
- Activities and recent activities
- Contact/Guest messages and stats
- Manage admins and permissions
- Settings, profile updates, email change, verify
- Connect database (member code)
- Address updates workflow
- Known limitations
- Developer tips

---

## Document preview and download

There are two main places with document preview behavior:

- `app/admin/address-updates/components/RequestDetail.js`
  - In-page modal preview for PDF and images.
  - "ดูเอกสาร" opens a modal (no new tab).
  - "ดาวน์โหลด" uses the `download` attribute to download directly.
  - Helpers inside component:
    - `isPDF(url)`, `isImage(url)` detect file type by extension.
    - `openPreview(url)`, `closePreview()` manage modal state.
  - Rendering:
    - PDF: `<iframe src={url} />`
    - Image: `<img src={url} />`

- `app/admin/dashboard/membership-requests/components/sections/DocumentsSection.js`
  - Shared section used across all membership types (including IC).
  - Grid list of documents with two actions:
    - "ดู" button: opens a full-screen modal preview in-page (no tab change).
    - "ดาวน์โหลด" link: `<a href={doc.filePath} download>` to download in the same tab.
  - Image preview supports zoom and pan.
  - PDF preview uses `<iframe>`.

### Why no new tabs?

- We removed `target="_blank"` and `rel="noopener noreferrer"` from download links and replaced with `download` to keep users in the same tab and provide a consistent UX.

---

## Applicant account info (fallback strategy)

Component: `app/admin/dashboard/membership-requests/components/sections/ApplicantInfoSection.js`

This section aggregates user/account contact info from multiple possible fields to avoid showing "-" when values exist under different payload keys across member types (AM/OC/AC/IC).

- Name fallbacks:
  - `application.user.firstname/lastname`
  - `application.firstNameTh/lastNameTh`
  - `application.firstname/lastname`
  - `application.first_name/last_name`

- Email fallbacks:
  - `application.user.email`
  - `application.email`, `application.applicant_email`, `application.user_email`
  - `application.company_email/companyEmail`
  - `application.association_email/associationEmail`
  - `application.contact_email/contactEmail`
  - `contactPerson.email` (from `application.contactPerson` or first of `application.contactPersons`)
  - `addresses[0].email` or `address.email`

- Phone fallbacks:
  - `application.user.phone`
  - `application.phone`, `application.applicant_phone`, `application.user_phone`
  - `application.company_phone/companyPhone`
  - `application.association_phone/associationPhone`
  - `application.contact_phone/contactPhone`
  - `contactPerson.phone`
  - `addresses[0].phone` or `address.phone`
  - If there is an extension, it appends `ต่อ <ext>` from `phoneExtension/phone_extension`.

- IC only: ID card shows from `application.idCard || application.id_card_number`.

Notes:

- Some normalization also exists in `app/admin/dashboard/membership-requests/ีutils/dataTransformers.js` (`normalizeApplicationData`), but UI adds extra fallbacks to be robust to varying payloads per type.

---

## Membership Requests: filter/search persistence

File: `app/admin/dashboard/membership-requests/page.js`

Behavior:

- On first mount, state is restored from the URL query and `sessionStorage` snapshot `mr:listState`.
- If the URL has only some query params (e.g., only `search`), missing fields (status/type/sort/page) will be filled from the session snapshot to keep filters consistent.
- State updates continue to sync to the URL and the snapshot.

Fields persisted:

- `searchTerm`, `statusFilter`, `typeFilter`, `sortOrder`, `currentPage`.

Tip:

- If you want persistence across browser restarts, switch from `sessionStorage` to `localStorage` in this file.

---

## IC detail view unification

File: `app/admin/dashboard/membership-requests/[type]/[id]/components/ICDetailView.js`

- IC view uses the shared `DocumentsSection` to ensure the same in-page preview and download experience as other types.
- We define `renderDocuments()` to return `<DocumentsSection application={application} />` and removed the previous `window.open`-style logic.

---

## Extending document support

Where:

- `DocumentsSection.js` and `RequestDetail.js` (for address updates).

How to support more file types:

- Extend detection functions to include the new extension.
  - In `RequestDetail.js`: update `isImage(url)` to include the new file extension.
  - In `DocumentsSection.js`: update `isImage(p)`, `isPDF(p)`, and `canPreview(p)` accordingly.
- For formats that are not easily embeddable, keep preview as "unknown" and encourage download.

Adding custom document labels:

- For IC, the helper `getDocumentName()` in `ICDetailView.js` maps `document_type` to Thai labels for well-known types.
- For the generic path, `dataTransformers.getDocumentDisplayName()` provides a fallback name.

---

## Known limitations

- Some storage providers generate signed URLs without file extensions; type detection by extension may fail.
  - Workaround: if your API can provide a `mimeType`, pass it through and update detection logic to use MIME when available.
- Browser PDF handling depends on user settings. Some users might download instead of rendering inline.
- If a document fails to preview, the modal shows a fallback message and users can click "ดาวน์โหลด".

---

## Developer tips

- Code style:
  - Keep imports at the top of files (avoid adding imports mid-file).
  - Use components in `components/sections/` for shared UI across member types.

- Where to change things:
  - Preview UI or behavior: `DocumentsSection.js` and `RequestDetail.js`.
  - Account info fallbacks: `ApplicantInfoSection.js`.
  - Normalization for API payloads: `…/membership-requests/ีutils/dataTransformers.js`.
  - Filters and persistence: `…/membership-requests/page.js`.
  - IC-specific layout: `…/membership-requests/[type]/[id]/components/ICDetailView.js`.

- Testing checklist:
  - Preview: Click "ดู" on both image and PDF; ensure modal opens in-page.
  - Download: Click "ดาวน์โหลด"; file should save without opening a new tab.
  - Filters: Set status/type/search/page, navigate away and back; values should be restored.
  - AM/OC/AC/IC payloads: Verify Account section shows email/phone with correct fallbacks.

---

## Other admin modules overview

The admin area includes several feature pages under `app/admin/dashboard/` in addition to membership requests:

- `activities/` and `recent-activities/`: show audit/activity feeds for admin operations.
- `contact-messages/` and `guest-messages/`: manage site contact forms; includes stats components.
- `manage-admins/` and `admin-permissions/`: manage admin accounts and their permissions.
- `settings/`: global admin settings (feature flags, thresholds, etc.).
- `profile-updates/`, `email-change/`, `verify/`, `update/`: user/account maintenance flows.
- `connect-database/`: tools to connect or sync membership data with the core database (e.g., member code linkage).

These pages commonly reuse the shell components described below.

---

## Admin shell (layout, navigation, hooks)

- `components/AdminLayout.js`: wraps all admin pages, renders header/sidebar/content areas.
- `components/AdminHeader.js`: top bar with page title, actions.
- `components/AdminSidebar.js`: menu navigation; driven by `components/MenuConfig.js`, `MenuItem.js`, `MenuIcons.js`.
- `components/ActionCounts.js`, `Analytics.js`: small dashboard widgets for counts and KPIs.
- Hooks:
  - `components/hooks/useNavigation.js`: handle active route and sidebar behavior.
  - `components/hooks/useAdminData.js`: centralize fetching admin-level data where applicable.

How to add a new admin page

1. Create a folder under `app/admin/dashboard/<your-page>/page.js`.
2. Wrap content with `AdminLayout` if needed (or rely on parent layout).
3. Add a menu entry in `components/MenuConfig.js`.

---

## Activities and recent activities

- `dashboard/activities/` with `hooks/useAdminActivities.js`: fetch and display admin activity logs.
- `dashboard/recent-activities/`: quick view of most recent actions.

Common patterns

- Paginated lists with search/filter.
- Detail drawers or modals for context on each activity.

---

## Contact/Guest messages and stats

Components

- `components/ContactMessageStats.js` and `components/GuestContactMessageStats.js`: summary cards for messages volume.

Pages

- `dashboard/contact-messages/`: list and manage authenticated user messages.
- `dashboard/guest-messages/`: list and manage guest (unauthenticated) messages.

Suggested UX

- Inline preview of message body.
- Quick actions: mark as handled, assign, add admin note.

---

## Manage admins and permissions

Pages

- `dashboard/manage-admins/`: CRUD for admin users.
- `dashboard/admin-permissions/`: assign roles/permissions.

Tips

- Centralize role definitions and permission checks in a single module to avoid drift.
- Display effective permissions per admin for transparency.

---

## Settings, profile updates, email change, verify

Pages

- `dashboard/settings/`: system or feature settings.
- `dashboard/profile-updates/`: pending profile change approvals.
- `dashboard/email-change/`: email change requests management.
- `dashboard/verify/`: verification tasks (documents, identities) if applicable.

Implementation notes

- Reuse shared components: tables, filter bars, status badges.
- For sensitive actions, use confirm modals (see `components/LogoutConfirmationDialog.js` or `components/modals/` in other sections as reference).

---

## Connect database (member code)

- `dashboard/connect-database/`: utilities to connect member applications to core membership records.
- In IC/other detail pages, the "เชื่อมต่อฐานข้อมูลสมาชิก" action triggers linkage using application identifiers (e.g., tax ID / ID card).

Best practices

- Always validate identifiers server-side before linking.
- Log linkage attempts to the activities feed for auditing.

---

## Address updates workflow

Path: `app/admin/address-updates/`

Key components

- `components/RequestList.js`: list of address update requests with filters.
- `components/RequestDetail.js`: request detail and side-by-side comparison with preview modal (PDF/Image) and download.
- `components/EditAddressForm.js`: inline edit with save handler injected via props.
- `components/RejectReasonModal.js`: capture rejection reasons.
- Hook: `hooks/useAddressUpdateRequests.js`: data fetching and state for list/detail.

Flow

1. Select a request from the list.
2. Review old vs new address and document evidence.
3. Edit new address if needed and approve, or reject with a reason.
4. Processed info displayed with timestamps and admin notes.
