import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import LoadingOverlay from "./LoadingOverlay";

function RegisterForm() {
  const router = useRouter();
  const errorMessageRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(""); // เพิ่ม error state
  const [success, setSuccess] = useState(""); // เพิ่ม success state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // reCAPTCHA v2 site key from env
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  console.log("RECAPTCHA_SITE_KEY:", siteKey); // debug

  // Load reCAPTCHA v2 script once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!siteKey) return; // cannot load without key
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return; // already loaded
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
    script.async = true;
    script.defer = true;

    // Define global callback for when reCAPTCHA is loaded
    window.onRecaptchaLoad = () => {
      setRecaptchaLoaded(true);
      console.log("reCAPTCHA loaded");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      delete window.onRecaptchaLoad;
    };
  }, [siteKey]);

  // Render reCAPTCHA widget when script is loaded
  useEffect(() => {
    if (!recaptchaLoaded || !siteKey || !window.grecaptcha) return;

    try {
      // Try to render the widget if container exists
      const container = document.getElementById("recaptcha-container");
      if (container && container.innerHTML === "") {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: siteKey,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error rendering reCAPTCHA:", error);
    }
  }, [recaptchaLoaded, siteKey]);

  // เลื่อนหน้าจอไปยังข้อความแจ้งเตือนเมื่อมีข้อผิดพลาด
  useEffect(() => {
    if (error && errorMessageRef.current) {
      errorMessageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ล้าง error เมื่อมีการเปลี่ยนแปลง
    setError("");
    setSuccess("");

    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "password") {
        checkPasswordStrength(value);
      }
    }
  };

  const checkPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    setPasswordCriteria(criteria);

    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const allCriteriaPassed = Object.values(criteria).every(Boolean);

    if (passedCriteria === 0) {
      setPasswordStrength(0);
    } else if (passedCriteria <= 2) {
      setPasswordStrength(1);
    } else if (!allCriteriaPassed) {
      setPasswordStrength(2);
    } else {
      setPasswordStrength(3);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    // ตรวจสอบให้ชื่อและนามสกุลเป็นภาษาไทยเท่านั้น
    const thaiRegex = /^[\u0E00-\u0E7F\s]+$/;
    if (!thaiRegex.test(formData.firstName) || !thaiRegex.test(formData.lastName)) {
      setError("กรุณากรอกชื่อและนามสกุลเป็นภาษาไทยเท่านั้น");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return false;
    }

    if (passwordStrength < 3) {
      setError("รหัสผ่านไม่ปลอดภัยเพียงพอ ต้องผ่านทุกเกณฑ์และมีความแข็งแกร่งเต็มหลอด");
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }

    if (!formData.phone.match(/^[0-9]{10}$/)) {
      setError("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");
      return false;
    }

    if (!formData.consent) {
      setError("กรุณายอมรับเงื่อนไขการใช้บริการและนโยบายความเป็นส่วนตัว");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // ตรวจสอบ reCAPTCHA v2
    if (!window.grecaptcha) {
      setError("ระบบ reCAPTCHA ยังไม่พร้อมใช้งาน กรุณารีเฟรชหน้าและลองใหม่");
      return;
    }

    const recaptchaResponse = window.grecaptcha.getResponse();
    if (!recaptchaResponse) {
      setError('กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ โดยการติ๊ก "ฉันไม่ใช่โปรแกรมอัตโนมัติ"');
      return;
    }

    // แสดง loading overlay และป้องกันการกดซ้ำ
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // ป้องกันการเลื่อนหน้าจอขณะ loading
    document.body.style.overflow = "hidden";

    try {
      // 1) reCAPTCHA v2 verification
      console.log("Verifying reCAPTCHA token...");
      const captchaRes = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: recaptchaResponse }),
      });
      const captchaData = await captchaRes.json();
      if (!captchaRes.ok || !captchaData.ok) {
        const reason = captchaData?.reason || captchaData?.error || "การยืนยัน reCAPTCHA ไม่สำเร็จ";
        throw new Error(typeof reason === "string" ? reason : "การยืนยัน reCAPTCHA ไม่สำเร็จ");
      }

      // Proceed with registration
      const fullName = `${formData.firstName} ${formData.lastName}`;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("สมัครสมาชิกสำเร็จเว็บไซต์! กำลังนำท่านไปยังหน้าตรวจสอบอีเมล");
        // คืนค่าการเลื่อนหน้าจอเมื่อสำเร็จ
        document.body.style.overflow = "";
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        // แสดง error บนหน้าเว็บ
        const errorMsg = data.error || data.message || "เกิดข้อผิดพลาดในการลงทะเบียน";
        setError(errorMsg);
        setIsSubmitting(false);
        // คืนค่าการเลื่อนหน้าจอ
        document.body.style.overflow = "";
        // Reset reCAPTCHA
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        typeof error?.message === "string"
          ? error.message
          : "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
      );
      setIsSubmitting(false);
      // คืนค่าการเลื่อนหน้าจอ
      document.body.style.overflow = "";
      // Reset reCAPTCHA
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isSubmitting} />
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="mx-auto"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            ลงทะเบียนใช้งานระบบ
            <motion.div
              className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.h2>

          <p className="text-center text-sm md:text-base text-gray-600 mb-8 max-w-2xl mx-auto">
            กรอกข้อมูลเพื่อสร้างบัญชีเข้าใช้งานระบบสมาชิกของสภาอุตสาหกรรมแห่งประเทศไทย
          </p>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            {/* Error Message */}
            {error && (
              <div
                ref={errorMessageRef}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="ชื่อ"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
                  autoComplete="given-name"
                  pattern="^[\u0E00-\u0E7F\s]+$"
                  title="กรุณากรอกเป็นภาษาไทยเท่านั้น"
                  required
                  note="(ไม่ต้องใส่คำนำหน้า)"
                />
                <FormInput
                  label="นามสกุล"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="นามสกุล"
                  autoComplete="family-name"
                  pattern="^[\u0E00-\u0E7F\s]+$"
                  title="กรุณากรอกเป็นภาษาไทยเท่านั้น"
                  required
                />
              </div>

              <FormInput
                label="อีเมล"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                autoComplete="email"
                required
              />

              <FormInput
                label="เบอร์โทรศัพท์"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="เช่น 0812345678 (10 หลัก)"
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />

              <div>
                <PasswordInput
                  label="รหัสผ่าน"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <PasswordStrengthMeter
                  password={formData.password}
                  passwordStrength={passwordStrength}
                  passwordCriteria={passwordCriteria}
                />
              </div>

              <PasswordInput
                label="ยืนยันรหัสผ่าน"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-2 mb-2">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="text-gray-700 text-sm leading-relaxed">
                    ฉันยอมรับ
                    <Link
                      href="/privacy-policy"
                      className="text-blue-600 underline mx-1"
                      target="_blank"
                    >
                      นโยบายความเป็นส่วนตัว
                    </Link>
                    และ
                    <Link
                      href="/terms-of-service"
                      className="text-blue-600 underline mx-1"
                      target="_blank"
                    >
                      เงื่อนไขการใช้บริการ
                    </Link>
                  </label>
                </div>

                {/* reCAPTCHA v2 Checkbox */}
                <div className="my-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ
                  </label>
                  <div id="recaptcha-container" className="g-recaptcha"></div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.consent}
                  className={`w-full px-8 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 shadow-sm ${
                    isSubmitting || !formData.consent
                      ? "bg-blue-300 text-white cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-800 text-white hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? "กำลังสมัครสมาชิกเว็บไซต์..." : "เปิดบัญชีการใช้งาน"}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600">
                    มีบัญชีอยู่แล้ว?{" "}
                    <Link
                      href="/login"
                      className="text-blue-700 hover:text-blue-600 font-semibold transition-colors"
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default RegisterForm;
