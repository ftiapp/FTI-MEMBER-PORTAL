/**
 * Shared utilities for PDPA consent management
 * Used by all membership forms
 */

/**
 * Render PDPA consent checkbox section
 * @param {boolean} consentAgreed - Current consent state
 * @param {function} setConsentAgreed - Function to update consent state
 * @returns {JSX.Element} - Consent checkbox component
 */
export const ConsentCheckbox = ({ consentAgreed, setConsentAgreed }) => {
  return (
    <div
      data-consent-box
      className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Shield Icon */}
        <div className="flex-shrink-0 mt-1">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">การคุ้มครองข้อมูลส่วนบุคคล</h3>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-1.5 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium text-gray-900">
                  ข้าพเจ้าตกลงและยินยอมให้{" "}
                  <span className="text-blue-700 font-semibold">สภาอุตสาหกรรมแห่งประเทศไทย</span>
                </span>{" "}
                เก็บ รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
                เพื่อวัตถุประสงค์ในการติดต่อสื่อสาร การให้บริการ
                และการดำเนินงานที่เกี่ยวข้องกับการเป็นสมาชิก
              </p>
              <p className="text-sm text-gray-700 mt-2">
                อ่านรายละเอียดฉบับเต็มได้ที่{" "}
                <a
                  href="/Privacy-Notice-ผู้สมัครสมาชิกส.อ.ท_.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-800"
                >
                  นโยบายความเป็นส่วนตัว (Privacy Notice) สำหรับผู้สมัครสมาชิก
                </a>
              </p>
              <p className="text-xs text-gray-600 mt-2 italic">
                ทั้งนี้ ข้าพเจ้าสามารถเพิกถอนความยินยอมได้ตามช่องทางที่องค์กรกำหนด
              </p>
            </div>
          </label>

          {!consentAgreed && (
            <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium">กรุณายอมรับข้อตกลงเพื่อดำเนินการต่อ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Validate consent before submission
 * @param {boolean} consentAgreed - Consent state
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateConsent = (consentAgreed) => {
  if (!consentAgreed) {
    return {
      isValid: false,
      message: "กรุณายอมรับข้อตกลงการคุ้มครองข้อมูลส่วนบุคคลก่อนยืนยันการสมัคร",
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Scroll to consent box
 */
export const scrollToConsentBox = () => {
  setTimeout(() => {
    const consentBox = document.querySelector("[data-consent-box]");
    if (consentBox) {
      consentBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
};
