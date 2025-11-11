// Image utility functions

// If URL is Cloudinary, inject a safe transformation to ensure image output and smaller size
export const transformCloudinaryUrl = (url) => {
  try {
    if (!url) return url;
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return url;
    // Insert transformation segment before version segment 'v12345'
    const parts = u.pathname.split("/");
    const uploadIdx = parts.findIndex((p) => p === "upload");
    if (uploadIdx === -1) return url;
    const nextPart = parts[uploadIdx + 1] || "";
    const isVersion = /^v\d+$/.test(nextPart);
    const isTransform = nextPart && !isVersion && !nextPart.includes(".");
    const inject = "pg_1,f_auto,q_auto:eco,w_600";
    if (isVersion) {
      // No existing transform, insert before version
      parts.splice(uploadIdx + 1, 0, inject);
    } else if (isTransform) {
      // Already has transform; if missing f_auto, prepend ours
      if (!nextPart.includes("f_auto")) {
        parts[uploadIdx + 1] = `${inject},${nextPart}`;
      }
    } else {
      // Likely directly public_id (with extension). Insert transform here.
      parts.splice(uploadIdx + 1, 0, inject);
    }
    u.pathname = parts.join("/");
    return u.toString();
  } catch {
    return url;
  }
};

// Load remote image as Data URL to avoid CORS issues in html2canvas (enhanced for production compatibility)
export const loadImageAsDataURL = async (url) => {
  if (!url) return null;
  console.debug(`[PDF] Attempting to load image as data URL: ${url}`);
  try {
    // First attempt: Try without CORS mode (works better in production for some cases)
    let res;
    try {
      console.debug(`[PDF] Trying fetch without CORS mode...`);
      res = await fetch(url);
      if (!res.ok) {
        console.warn(`[PDF] Fetch without CORS failed (${res.status} ${res.statusText}), trying with CORS mode...`);
        // Second attempt: Try with CORS mode
        res = await fetch(url, { mode: "cors" });
      }
    } catch (err) {
      console.warn(`[PDF] Fetch without CORS failed with error, trying with CORS mode...`, err);
      res = await fetch(url, { mode: "cors" });
    }
    if (!res.ok) {
      console.error(`[PDF] ❌ All fetch attempts failed. Final status: ${res.status} ${res.statusText} for URL: ${url}`);

      // If it's an auth error (401/403), try direct URL fallback for html2canvas
      if (res.status === 401 || res.status === 403) {
        console.warn(`[PDF] ⚠️ Authentication error (${res.status}). Trying direct URL fallback for html2canvas compatibility.`);
        const looksLikeImg = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);
        if (looksLikeImg) {
          console.debug(`[PDF] 🔄 Using direct URL due to auth error: ${url}`);
          return url;
        }
      }

      return null;
    }
    const blob = await res.blob();
    // Only proceed if content is actually an image
    if (!(blob && blob.type && blob.type.startsWith("image/"))) {
      return null;
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Error loading image as data URL:", err);
    return null;
  }
};

// Enhanced signature image loading with multiple fallback strategies
export const loadSignatureImageAsDataURL = async (url, retryCount = 0) => {
  if (!url) return null;

  // Detect Edge browser - it has issues with data URLs in html2canvas
  const isEdge = typeof window !== 'undefined' && /Edg/.test(navigator.userAgent);

  const maxRetries = 2;
  console.debug(`[PDF] Loading signature image (attempt ${retryCount + 1}/${maxRetries + 1}): ${url}${isEdge ? ' (Edge browser detected)' : ''}`);

  try {
    // For Edge browser, try direct URL first since data URLs often fail
    if (isEdge && retryCount === 0) {
      console.debug(`[PDF] Edge Strategy 1: Trying direct URL first for better compatibility...`);
      const looksLikeImg = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);
      if (looksLikeImg) {
        console.debug(`[PDF] ⚠️ Edge: Using direct URL as primary strategy: ${url}`);
        return url;
      }
    }

    // Strategy 1: Try loading as data URL (preferred for other browsers)
    console.debug(`[PDF] ${isEdge ? 'Edge Strategy 2' : 'Strategy 1'}: Loading as data URL...`);
    let dataUrl = await loadImageAsDataURL(url);
    if (dataUrl) {
      console.debug(`[PDF] ✅ Data URL strategy successful (${dataUrl.length} chars)`);
      return dataUrl;
    }

    // Strategy 2: If data URL fails, try direct URL if it looks like an image
    console.debug(`[PDF] ${isEdge ? 'Edge Strategy 3' : 'Strategy 2'}: Direct URL fallback...`);
    const looksLikeImg = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);
    console.debug(`[PDF] URL looks like image: ${looksLikeImg}`);
    if (looksLikeImg) {
      console.debug(`[PDF] ⚠️ Using direct URL as fallback: ${url}`);
      return url;
    }

    // Strategy 3: If still no success and we have retries left, try again
    if (retryCount < maxRetries) {
      console.debug(`[PDF] All strategies failed, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return loadSignatureImageAsDataURL(url, retryCount + 1);
    }

    console.warn(`[PDF] ❌ All loading strategies failed for: ${url}`);
    return null;
  } catch (err) {
    console.error(`[PDF] Error in signature loading attempt ${retryCount + 1}:`, err);
    if (retryCount < maxRetries) {
      console.debug(`[PDF] Retrying after error... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadSignatureImageAsDataURL(url, retryCount + 1);
    }
    return null;
  }
};
