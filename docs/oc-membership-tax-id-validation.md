# OC Membership TAX_ID Validation

## Overview

This document describes the implementation of TAX_ID validation for the OC membership form submission. The validation ensures that duplicate TAX_IDs cannot be submitted when they already exist in the system with status 0 (pending) or 1 (approved).

## API Endpoint

### POST `/api/member/oc-membership/check-tax-id`

Validates a TAX_ID by checking:
1. Format validation (must be 13 characters)
2. Duplicate check in `MemberRegist_OC_Main` table with status 0 or 1
3. Duplicate check in legacy `OCmember_Info` table with status 1 or 2

#### Request Body
```json
{
  "taxId": "1234567890123"
}
```

#### Response Format
```json
{
  "valid": true|false,
  "message": "Success or error message",
  "exists": true|false,
  "status": 0|1|2|null
}
```

#### Status Codes
- `200 OK`: TAX_ID is valid and available for registration
- `409 Conflict`: TAX_ID already exists with status 0 (pending) or 1 (approved)
- `400 Bad Request`: Invalid TAX_ID format

## Frontend Implementation

The TAX_ID validation has been implemented in the following components:

1. `CompanyBasicInfo.js`: Validates TAX_ID as the user types and provides real-time feedback
2. `OCFormValidation.js`: Added `validateTaxId` function for server-side validation
3. `OCFormSubmission.js`: Updated to validate TAX_ID before form submission
4. `OCMembershipForm.js`: Updated to use the new validation API

## Testing

A test page has been created at `/test-tax-id` to test the TAX_ID validation API directly.

### Test Cases

1. **Valid TAX_ID (not in system)**: Should return `valid: true`
2. **TAX_ID with pending status (0)**: Should return `valid: false` with appropriate message
3. **TAX_ID with approved status (1)**: Should return `valid: false` with appropriate message
4. **TAX_ID with rejected status (2)**: Should return `valid: true` (can reapply)
5. **Invalid format TAX_ID**: Should return `valid: false` with format error message

## Status Codes

The system uses the following status codes:
- `0`: Pending review
- `1`: Approved
- `2`: Rejected

## Database Tables

The validation checks the following tables:
1. `MemberRegist_OC_Main`: New OC membership registrations
2. `OCmember_Info`: Legacy OC membership data

## UI Feedback

The UI provides the following feedback during validation:
- Loading indicator during validation
- Red border and error message for invalid TAX_IDs
- Green border and success message for valid TAX_IDs
- Disabled submission until validation passes
