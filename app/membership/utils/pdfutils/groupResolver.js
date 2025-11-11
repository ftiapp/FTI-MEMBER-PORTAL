// Group name resolution utilities

// Resolve Industrial Group & Provincial Chapter names
export const resolveGroupNames = (data, application, industrialGroups, provincialChapters) => {
  let industrialGroupNames = data.industrialGroupNames || [];
  let provincialChapterNames = data.provincialChapterNames || [];

  const pickName = (obj, keys) => keys.map((k) => obj?.[k]).find(Boolean);

  if (!industrialGroupNames || industrialGroupNames.length === 0) {
    // Try from arrays with names (API provides `industryGroups`)
    if (Array.isArray(application.industryGroups)) {
      industrialGroupNames = application.industryGroups
        .map((g) => pickName(g, ["industryGroupName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]))
        .filter(Boolean);
    }
    // Admin normalized data uses `industrialGroups` (not `industrialGroupIds`)
    else if (Array.isArray(data.industrialGroups)) {
      industrialGroupNames = data.industrialGroups
        .map((g) =>
          pickName(g, [
            "name",
            "industryGroupName",
            "industry_group_name",
            "MEMBER_GROUP_NAME",
            "name_th",
            "nameTh",
          ]),
        )
        .filter(Boolean);
    }
    // Legacy: Check for industrialGroupIds
    else if (Array.isArray(data.industrialGroupIds)) {
      // Case 1: Admin may provide array of objects that already include name fields
      if (data.industrialGroupIds.length > 0 && typeof data.industrialGroupIds[0] === "object") {
        industrialGroupNames = data.industrialGroupIds
          .map((g) =>
            pickName(g, [
              "industryGroupName",
              "industry_group_name",
              "MEMBER_GROUP_NAME",
              "name_th",
              "nameTh",
            ]),
          )
          .filter(Boolean);
      }
      // Case 2: Fallback to lookup arrays (ids only)
      if (!industrialGroupNames || industrialGroupNames.length === 0) {
        const groupsArr = Array.isArray(industrialGroups)
          ? industrialGroups
          : industrialGroups.data || [];
        industrialGroupNames = data.industrialGroupIds
          .map((id) => groupsArr.find((g) => g.id === id || g.MEMBER_GROUP_CODE === id))
          .map(
            (g) =>
              g && pickName(g, ["industryGroupName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]),
          )
          .filter(Boolean);
      }
    }
  }

  if (!provincialChapterNames || provincialChapterNames.length === 0) {
    if (
      Array.isArray(application.provinceChapters) ||
      Array.isArray(application.provincialChapters)
    ) {
      const src = application.provinceChapters || application.provincialChapters;
      provincialChapterNames = src
        .map((c) =>
          pickName(c, ["provinceChapterName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]),
        )
        .filter(Boolean);
    }
    // Admin normalized data uses `provincialChapters` (not `provincialChapterIds`)
    else if (Array.isArray(data.provincialChapters)) {
      provincialChapterNames = data.provincialChapters
        .map((c) =>
          pickName(c, [
            "name",
            "provinceChapterName",
            "province_chapter_name",
            "MEMBER_GROUP_NAME",
            "name_th",
            "nameTh",
          ]),
        )
        .filter(Boolean);
    }
    // Legacy: Check for provincialChapterIds
    else if (Array.isArray(data.provincialChapterIds)) {
      // Case 1: Admin may provide array of objects that already include name fields
      if (
        data.provincialChapterIds.length > 0 &&
        typeof data.provincialChapterIds[0] === "object"
      ) {
        provincialChapterNames = data.provincialChapterIds
          .map((c) =>
            pickName(c, [
              "provinceChapterName",
              "province_chapter_name",
              "MEMBER_GROUP_NAME",
              "name_th",
              "nameTh",
            ]),
          )
          .filter(Boolean);
      }
      // Case 2: Fallback to lookup arrays (ids only)
      if (!provincialChapterNames || provincialChapterNames.length === 0) {
        const chArr = Array.isArray(provincialChapters)
          ? provincialChapters
          : provincialChapters.data || [];
        provincialChapterNames = data.provincialChapterIds
          .map((id) => chArr.find((c) => c.id === id || c.MEMBER_GROUP_CODE === id))
          .map(
            (c) =>
              c && pickName(c, ["provinceChapterName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]),
          )
          .filter(Boolean);
      }
    }
  }

  return {
    industrialGroupNames,
    provincialChapterNames,
  };
};

// Limit long lists to help fit within 2 pages
export const limitDisplayLists = (industrialGroupNames, provincialChapterNames) => {
  const MAX_PRODUCTS_DISPLAY = 12;
  const MAX_GROUPS_DISPLAY = 10;
  const MAX_CHAPTERS_DISPLAY = 10;

  const displayIndustryGroups = Array.isArray(industrialGroupNames)
    ? industrialGroupNames.slice(0, MAX_GROUPS_DISPLAY)
    : [];
  const extraIndustryGroups =
    Array.isArray(industrialGroupNames) && industrialGroupNames.length > MAX_GROUPS_DISPLAY
      ? industrialGroupNames.length - MAX_GROUPS_DISPLAY
      : 0;

  const displayProvincialChapters = Array.isArray(provincialChapterNames)
    ? provincialChapterNames.slice(0, MAX_CHAPTERS_DISPLAY)
    : [];
  const extraProvincialChapters =
    Array.isArray(provincialChapterNames) && provincialChapterNames.length > MAX_CHAPTERS_DISPLAY
      ? provincialChapterNames.length - MAX_CHAPTERS_DISPLAY
      : 0;

  return {
    MAX_PRODUCTS_DISPLAY,
    MAX_GROUPS_DISPLAY,
    MAX_CHAPTERS_DISPLAY,
    displayIndustryGroups,
    extraIndustryGroups,
    displayProvincialChapters,
    extraProvincialChapters,
  };
};
