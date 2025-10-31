"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import CryptoJS from "crypto-js";

/**
 * Admin Login Component
 *
 * This component provides the login interface for admin FTI_Portal_User.
 * It authenticates FTI_Portal_User against the FTI_Portal_Admin_Users table and redirects
 * to the appropriate dashboard based on the admin's permission level.
 *
 * - Regular admins (levels 1-4) are redirected to /admin/dashboard
 * - SuperAdmins (level 5) are redirected to /admin/dashboard/manage-admins
 */

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const recaptchaRef = useRef(null);
  const recaptchaLoaded = useRef(false);
  const [formError, setFormError] = useState("");
  // เพิ่ม animation เมื่อโหลดหน้า
  const [mounted, setMounted] = useState(false);
  const rememberMeSecret = process.env.NEXT_PUBLIC_REMEMBER_ME_SECRET || "fti-remember-secret";

  useEffect(() => {
    setMounted(true);
    // Load saved credentials if exists
    loadSavedCredentials();
  }, []);

  const decodeLegacyCredential = (str) => {
    try {
      return decodeURIComponent(atob(str));
    } catch (e) {
      return str;
    }
  };

  const encryptCredential = (str) => {
    try {
      if (!str) return "";
      return CryptoJS.AES.encrypt(str, rememberMeSecret).toString();
    } catch (error) {
      console.error("Error encrypting credential:", error);
      return str;
    }
  };

  const decryptCredential = (str) => {
    if (!str) return "";
    try {
      const bytes = CryptoJS.AES.decrypt(str, rememberMeSecret);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (decrypted) {
        return decrypted;
      }
    } catch (error) {
      console.error("Error decrypting credential:", error);
    }
    return decodeLegacyCredential(str);
  };

  // Load saved credentials from localStorage
  const loadSavedCredentials = () => {
    try {
      const savedUsername = localStorage.getItem("admin_remember_username");
      const savedPassword = localStorage.getItem("admin_remember_password");
      const savedRemember = localStorage.getItem("admin_remember_me");

      if (savedRemember === "true" && savedUsername && savedPassword) {
        setFormData({
          username: decryptCredential(savedUsername),
          password: decryptCredential(savedPassword),
        });
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Error loading saved credentials:", error);
    }
  };

  // Save credentials to localStorage
  const saveCredentials = () => {
    try {
      if (rememberMe) {
        localStorage.setItem("admin_remember_username", encryptCredential(formData.username));
        localStorage.setItem("admin_remember_password", encryptCredential(formData.password));
        localStorage.setItem("admin_remember_me", "true");
      } else {
        // Clear saved credentials if unchecked
        localStorage.removeItem("admin_remember_username");
        localStorage.removeItem("admin_remember_password");
        localStorage.removeItem("admin_remember_me");
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  };

  // Load reCAPTCHA script dynamically when needed
  useEffect(() => {
    if (captchaRequired && !recaptchaLoaded.current) {
      // Load the reCAPTCHA script
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        recaptchaLoaded.current = true;
        renderReCaptcha();
      };

      document.body.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        document.body.removeChild(script);
      };
    }
  }, [captchaRequired]);

  // Function to render reCAPTCHA
  const renderReCaptcha = () => {
    if (window.grecaptcha && recaptchaRef.current) {
      window.grecaptcha.ready(() => {
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey:
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
              "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // Use test key if not provided
            callback: (token) => setCaptchaToken(token),
            "expired-callback": () => setCaptchaToken(""),
          });
        } catch (error) {
          // Handle case where reCAPTCHA was already rendered
          console.error("reCAPTCHA rendering error:", error);
        }
      });
    }
  };

  /**
   * Handles form input changes
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles the login form submission
   * Validates inputs, authenticates the user, and redirects to the appropriate dashboard
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.username || !formData.password) {
      setFormError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    // Check if CAPTCHA is required but not provided
    if (captchaRequired && !captchaToken) {
      setFormError("กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ");
      toast.error("กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken: captchaToken, // Include CAPTCHA token if available
        }),
      });

      const result = await response.json();
      console.log("Admin login response:", { status: response.status, data: result });

      if (!response.ok) {
        // Handle rate limit exceeded
        if (response.status === 429) {
          console.log("Rate limit exceeded:", result);
          setIsLoading(false);
          setRateLimitInfo({
            seconds: result.retryAfter || 300, // Use retryAfter or default to 5 minutes
            retryAfter: result.retryAfter,
            timeRemaining: result.timeRemaining,
          });

          // If CAPTCHA is required after rate limit
          if (result.captchaRequired) {
            setCaptchaRequired(true);
            // Initialize CAPTCHA if script is already loaded
            if (recaptchaLoaded.current && window.grecaptcha) {
              setTimeout(renderReCaptcha, 100); // Small delay to ensure DOM is ready
            }
          }
          return;
        }

        // Handle CAPTCHA requirement
        if (response.status === 400 && result.captchaRequired) {
          console.log("CAPTCHA required");
          setIsLoading(false);
          setCaptchaRequired(true);
          setFormError(result.message || "กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ");

          // Initialize CAPTCHA if script is already loaded
          if (recaptchaLoaded.current && window.grecaptcha) {
            setTimeout(renderReCaptcha, 100); // Small delay to ensure DOM is ready
          }
          return;
        }

        // Handle other errors without throwing an exception
        setFormError(result.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      if (result.success) {
        // Save credentials if remember me is checked
        saveCredentials();

        toast.success("เข้าสู่ระบบสำเร็จ");
        // Redirect based on admin level with smooth transition
        if (result.adminLevel === 5) {
          router.push("/admin/dashboard/manage-admins", undefined, { scroll: false });
        } else {
          router.push("/admin/dashboard", undefined, { scroll: false });
        }
      } else {
        setFormError(result.message || "เข้าสู่ระบบไม่สำเร็จ");
        toast.error(result.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Login error:", error);
      setFormError(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      toast.error(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  // Rate Limit Error Popup Component
  const RateLimitErrorPopup = ({ seconds, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
      if (!seconds) return;

      setTimeLeft(seconds);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [seconds]);

    const minutes = Math.floor(timeLeft / 60);
    const remainingSeconds = timeLeft % 60;

    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md mt-4 bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden"
      >
        <div className="bg-red-500 p-4 text-white flex justify-between items-center">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-medium">การเข้าสู่ระบบถูกจำกัด</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="mb-4">มีการพยายามเข้าสู่ระบบหลายครั้ง กรุณารอ:</p>
          <div className="text-center bg-red-50 py-3 rounded-lg mb-4">
            <span className="text-2xl font-bold text-red-600">
              {String(minutes).padStart(2, "0")}:{String(remainingSeconds).padStart(2, "0")}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            ระบบจะปลดล็อคการเข้าสู่ระบบโดยอัตโนมัติหลังจากเวลาที่กำหนด
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Rate limit error popup */}
      <AnimatePresence>
        {rateLimitInfo && (
          <RateLimitErrorPopup
            seconds={rateLimitInfo.seconds}
            onClose={() => setRateLimitInfo(null)}
          />
        )}
      </AnimatePresence>
      <div
        className={`sm:mx-auto sm:w-full sm:max-w-md transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <Image
              src="/images/FTI-MasterLogo_RGB_forLightBG.png"
              alt="FTI Logo"
              width={96}
              height={96}
              className="rounded-full shadow-md"
            />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[#1e3a8a]">เข้าสู่ระบบผู้ดูแล</h2>
        <p className="mt-2 text-center text-sm text-[#1e3a8a] text-opacity-70">
          สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className={`bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[#1e3a8a] border-opacity-20 transition-all duration-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-center text-sm">
              {formError}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#1e3a8a]">
                ชื่อผู้ใช้
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1e3a8a]">
                รหัสผ่าน
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                จดจำฉัน
              </label>
            </div>

            {/* CAPTCHA Component */}
            {captchaRequired && (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        เนื่องจากมีการพยายามเข้าสู่ระบบหลายครั้ง
                        กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div ref={recaptchaRef} className="g-recaptcha"></div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-[#1e3a8a] hover:bg-[#2a4caf] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
