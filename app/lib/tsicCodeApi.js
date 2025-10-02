"use client";

/**
 * Fetch TSIC codes for a member
 * @param {string} memberCode - The member code
 * @param {number|null} status - Filter by status (1=active, 0=inactive, null=all)
 * @returns {Promise<Object>} - Response with TSIC codes grouped by category
 */
export async function fetchMemberTsicCodes(memberCode, status = null) {
  try {
    let url = `/api/member/tsic-codes/list?member_code=${encodeURIComponent(memberCode)}`;

    if (status !== null) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch TSIC codes");
    }

    return data;
  } catch (error) {
    console.error("Error fetching TSIC codes:", error);
    throw error;
  }
}

/**
 * Add a new TSIC code for a member
 * @param {string} memberCode - The member code
 * @param {string} categoryCode - The category code
 * @param {string} tsicCode - The TSIC code
 * @param {number} status - Status (1=active, 0=inactive)
 * @returns {Promise<Object>} - Response with result
 */
export async function addTsicCode(memberCode, categoryCode, tsicCode, status = 1) {
  try {
    const response = await fetch("/api/member/tsic-codes/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        action: "add",
        memberCode,
        categoryCode,
        tsicCode,
        status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add TSIC code");
    }

    return data;
  } catch (error) {
    console.error("Error adding TSIC code:", error);
    throw error;
  }
}

/**
 * Update a TSIC code's status
 * @param {string} memberCode - The member code
 * @param {string} tsicCode - The TSIC code
 * @param {number} status - New status (1=active, 0=inactive)
 * @returns {Promise<Object>} - Response with result
 */
export async function updateTsicCodeStatus(memberCode, tsicCode, status) {
  try {
    const response = await fetch("/api/member/tsic-codes/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        action: "update",
        memberCode,
        tsicCode,
        status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update TSIC code status");
    }

    return data;
  } catch (error) {
    console.error("Error updating TSIC code status:", error);
    throw error;
  }
}

/**
 * Delete a TSIC code
 * @param {string} memberCode - The member code
 * @param {string} tsicCode - The TSIC code to delete
 * @returns {Promise<Object>} - Response with result
 */
export async function deleteTsicCode(memberCode, tsicCode) {
  try {
    const response = await fetch("/api/member/tsic-codes/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        action: "delete",
        memberCode,
        tsicCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete TSIC code");
    }

    return data;
  } catch (error) {
    console.error("Error deleting TSIC code:", error);
    throw error;
  }
}

/**
 * Add multiple TSIC codes at once
 * @param {string} memberCode - The member code
 * @param {Array<Object>} tsicCodes - Array of TSIC codes with category_code and tsic_code
 * @returns {Promise<Object>} - Response with results
 */
export async function addMultipleTsicCodes(memberCode, tsicCodes) {
  try {
    // Create an array of promises for each TSIC code
    const promises = tsicCodes.map((code) =>
      addTsicCode(memberCode, code.category_code, code.tsic_code, 1),
    );

    // Execute all promises in parallel
    const results = await Promise.allSettled(promises);

    // Count successful and failed operations
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return {
      success: failed === 0,
      message: `เพิ่มรหัส TSIC สำเร็จ ${successful} รายการ${failed > 0 ? `, ล้มเหลว ${failed} รายการ` : ""}`,
      data: {
        successful,
        failed,
        total: tsicCodes.length,
      },
    };
  } catch (error) {
    console.error("Error adding multiple TSIC codes:", error);
    throw error;
  }
}
