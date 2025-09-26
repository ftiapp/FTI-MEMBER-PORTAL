// Server-side helper for MailerSend Email Verification API
// Docs: https://developers.mailersend.com/api/v1/email-verification.html

const MAILERSEND_API_BASE = "https://api.mailersend.com/v1";

function getApiKey() {
  const key = process.env.MAILERSEND_API_KEY;
  if (!key) {
    throw new Error("MAILERSEND_API_KEY is not configured in environment variables");
  }
  return key;
}

/**
 * Start an async email verification job
 * @param {string} email
 * @returns {Promise<{job_id: string}>}
 */
export async function startEmailVerification(email) {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required for verification");
  }

  const res = await fetch(`${MAILERSEND_API_BASE}/email-verification/verify-async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ email }),
    // MailerSend requires https; Next.js runtime handles TLS
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MailerSend verify-async failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // Expected: { job_id: string }
  return data;
}

/**
 * Get the current status/result of an email verification job
 * @param {string} jobId
 * @returns {Promise<any>} Raw MailerSend response
 */
export async function getVerificationStatus(jobId) {
  if (!jobId) throw new Error("jobId is required");

  const res = await fetch(`${MAILERSEND_API_BASE}/email-verification/${jobId}`, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MailerSend get status failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Poll verification result for a short window to simulate near real-time validation
 * @param {string} jobId
 * @param {object} options
 * @param {number} [options.timeoutMs=8000]
 * @param {number} [options.intervalMs=800]
 * @returns {Promise<{status: string, result?: any}>}
 */
export async function waitForVerification(jobId, { timeoutMs = 8000, intervalMs = 800 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const data = await getVerificationStatus(jobId);
    // MailerSend returns states like: pending, processing, completed, failed
    if (data?.status === "completed" || data?.status === "failed") {
      return { status: data.status, result: data };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: "timeout" };
}
