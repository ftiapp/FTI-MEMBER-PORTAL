// Applicant data normalization utilities

// Prepare applicant account info (FTI_Portal_User table fields if present)
export const normalizeApplicantAccount = (app) => {
  const u =
    app?.user ||
    app?.account ||
    app?.applicant ||
    app?.createdBy ||
    app?.created_by ||
    app?.createdUser ||
    null;
  if (u && typeof u === "object") {
    return {
      ...u,
      // normalize common name keys for downstream usage
      firstname: u.firstname || u.first_name || u.firstName || null,
      lastname: u.lastname || u.last_name || u.lastName || null,
      name: u.name || u.fullname || u.full_name || null,
    };
  }
  // Fallback to flat fields possibly present on application
  return {
    id:
      app?.userId ||
      app?.user_id ||
      app?.created_by_id ||
      app?.createdById,
    firstname:
      app?.userFirstName ||
      app?.firstname ||
      app?.first_name ||
      app?.firstName,
    lastname:
      app?.userLastName ||
      app?.lastname ||
      app?.last_name ||
      app?.lastName,
    name:
      app?.userName ||
      app?.username ||
      app?.name ||
      app?.full_name ||
      app?.fullName,
    email: app?.userEmail || app?.email,
    phone: app?.userPhone || app?.phone,
  };
};

// Normalize applicant full name
export const normalizeApplicantFullName = (applicantAccount, app) => {
  let applicantFullName = [
    applicantAccount?.firstname ||
      applicantAccount?.first_name ||
      applicantAccount?.firstName ||
      "",
    applicantAccount?.lastname || applicantAccount?.last_name || applicantAccount?.lastName || "",
  ]
    .join(" ")
    .trim();
  if (!applicantFullName) {
    applicantFullName = applicantAccount?.name || "";
  }
  if (!applicantFullName) {
    // final fallback to application data's applicant names
    const thai = [app.firstNameTh || "", app.lastNameTh || ""].join(" ").trim();
    const eng = [app.firstNameEn || "", app.lastNameEn || ""].join(" ").trim();
    applicantFullName = thai || eng || "";
  }

  return applicantFullName;
};
