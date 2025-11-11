// Image preloading utilities

import { transformCloudinaryUrl, loadSignatureImageAsDataURL } from './imageUtils.js';

// Preload company stamp image (if any) - using enhanced loading like signatures
export const preloadCompanyStamp = async (data) => {
  // Handle database structure: cloudinary_url is the actual field
  const stampUrlCandidate = 
    data.companyStamp?.cloudinary_url || // Direct from DB formatDocumentForResponse
    data.companyStamp?.fileUrl || 
    data.companyStamp?.file_url ||
    data.company_stamp?.cloudinary_url ||
    data.company_stamp?.fileUrl ||
    data.company_stamp?.file_url || "";
  
  let companyStampImgSrc = "";
  if (stampUrlCandidate) {
    const maybeCld = transformCloudinaryUrl(stampUrlCandidate);
    console.debug("[PDF] companyStamp URL (original):", stampUrlCandidate);
    console.debug("[PDF] companyStamp URL (transformed):", maybeCld);
    console.debug("[PDF] companyStamp mimeType:", data.companyStamp?.mime_type || data.companyStamp?.mimeType);
    console.debug("[PDF] companyStamp fileName:", data.companyStamp?.file_name || data.companyStamp?.fileName);

    // Use the same enhanced loading function as signatures
    const stampResult = await loadSignatureImageAsDataURL(maybeCld);
    if (stampResult) {
      companyStampImgSrc = stampResult;
      console.debug(`[PDF] ✅ companyStamp loaded successfully (${stampResult.length} chars)`);
    } else {
      console.warn(`[PDF] ❌ companyStamp load failed, will fallback to FTI logo`);
      // Will use FTI logo as fallback in the HTML
    }
  } else {
    console.debug("[PDF] No companyStamp cloudinary_url available");
    console.debug("[PDF] Available data keys:", Object.keys(data));
    console.debug("[PDF] companyStamp:", data.companyStamp);
    console.debug("[PDF] company_stamp:", data.company_stamp);
  }

  return companyStampImgSrc;
};

// Preload FTI logo as Data URL to avoid any CORS/path issues
export const preloadLogo = async () => {
  const logoPublicPath = "/FTI-MasterLogo_RGB_forLightBG.png";
  let logoSrc = logoPublicPath;
  try {
    const logoDataUrl = await loadSignatureImageAsDataURL(logoPublicPath);
    if (logoDataUrl) logoSrc = logoDataUrl;
  } catch (e) {
    console.warn("[PDF] failed to preload logo as data URL, fallback to public path", e);
  }
  return logoSrc;
};

// Preload signature images for single and multiple signatories
export const preloadSignatures = async (data) => {
  const preloadSignature = async (signatureDoc) => {
    console.log("[PDF] Preloading signature image...");
    if (!signatureDoc) {
      console.log("[PDF] Signature document is missing.");
      return null;
    }
    
    // Handle database structure: cloudinary_url is the actual field
    const sigUrlCandidate = 
      signatureDoc?.cloudinary_url || // Direct from DB formatDocumentForResponse
      signatureDoc?.fileUrl || 
      signatureDoc?.file_url || "";
    
    if (!sigUrlCandidate) {
      console.log("[PDF] Signature document has no cloudinary_url.");
      return null;
    }

    const maybeCld = transformCloudinaryUrl(sigUrlCandidate);
    console.debug("[PDF] signature URL (original):", sigUrlCandidate);
    console.debug("[PDF] signature URL (transformed):", maybeCld);

    // Use enhanced signature loading with retry logic
    console.debug("[PDF] Starting signature image fetch...");
    const result = await loadSignatureImageAsDataURL(maybeCld);
    if (result) {
      console.debug(`[PDF] ✅ Signature preloaded successfully (${result.length} chars)`);
      return result;
    } else {
      console.warn(`[PDF] ❌ Signature preload failed for: ${maybeCld}`);
      return null;
    }
  };

  // Preload single signature (fallback)
  console.debug("[PDF] authorizedSignature doc:", data.authorizedSignature);
  let signatureImgSrc = "";
  if (data.authorizedSignature) {
    // Handle database structure: cloudinary_url is the actual field
    const sigUrlCandidate = 
      data.authorizedSignature?.cloudinary_url || // Direct from DB formatDocumentForResponse
      data.authorizedSignature?.fileUrl || 
      data.authorizedSignature?.file_url ||
      data.authorized_signature?.cloudinary_url ||
      data.authorized_signature?.fileUrl ||
      data.authorized_signature?.file_url || "";
    
    console.debug("[PDF] authorizedSignature cloudinary_url:", sigUrlCandidate);
    console.debug("[PDF] authorizedSignature mimeType:", data.authorizedSignature?.mime_type || data.authorizedSignature?.mimeType);
    console.debug("[PDF] authorizedSignature fileName:", data.authorizedSignature?.file_name || data.authorizedSignature?.fileName);
    console.debug("[PDF] Preloading single signature for IC form...");
    
    if (sigUrlCandidate) {
      const maybeCld = transformCloudinaryUrl(sigUrlCandidate);
      signatureImgSrc = await loadSignatureImageAsDataURL(maybeCld);
      console.debug(`[PDF] Single signature preload result: ${signatureImgSrc ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.warn("[PDF] No cloudinary_url found in authorizedSignature");
    }
  } else {
    console.warn("[PDF] No authorizedSignature found in data for IC form");
    console.debug("[PDF] Available signature-related keys:", Object.keys(data).filter(k => k.toLowerCase().includes('sign')));
  }

  // Preload multiple signatures
  const preloadedSignatures = [];
  const signaturesArray = data.authorizedSignatures || data.authorized_signatures || [];
  
  if (signaturesArray && Array.isArray(signaturesArray)) {
    console.debug("[PDF] Preloading", signaturesArray.length, "signature files");
    for (let i = 0; i < signaturesArray.length; i++) {
      const signatureFile = signaturesArray[i];
      
      // Handle database structure: cloudinary_url is the actual field
      const sigUrlCandidate = 
        signatureFile?.cloudinary_url || // Direct from DB formatDocumentForResponse
        signatureFile?.fileUrl || 
        signatureFile?.file_url || "";
      
      console.debug(`[PDF] Signature ${i + 1} cloudinary_url:`, sigUrlCandidate);
      console.debug(`[PDF] Signature ${i + 1} mimeType:`, signatureFile?.mime_type || signatureFile?.mimeType);
      console.debug(`[PDF] Signature ${i + 1} fileName:`, signatureFile?.file_name || signatureFile?.fileName);
      console.debug(`[PDF] Preloading signature ${i + 1}/${signaturesArray.length}...`);
      
      if (sigUrlCandidate) {
        const maybeCld = transformCloudinaryUrl(sigUrlCandidate);
        const preloaded = await loadSignatureImageAsDataURL(maybeCld);
        if (preloaded) {
          preloadedSignatures.push(preloaded);
          console.debug(`[PDF] ✅ Signature ${i + 1} preloaded successfully`);
        } else {
          preloadedSignatures.push(null);
          console.warn(`[PDF] ❌ Signature ${i + 1} preload failed`);
        }
      } else {
        preloadedSignatures.push(null);
        console.warn(`[PDF] ❌ Signature ${i + 1} has no cloudinary_url`);
      }
    }
    console.debug(`[PDF] Signature preload complete: ${preloadedSignatures.filter(s => s !== null).length}/${preloadedSignatures.length} successful`);
  } else {
    console.debug("[PDF] No authorizedSignatures array found");
    console.debug("[PDF] Available signature-related keys:", Object.keys(data).filter(k => k.toLowerCase().includes('sign')));
  }

  return {
    signatureImgSrc,
    preloadedSignatures,
  };
};
