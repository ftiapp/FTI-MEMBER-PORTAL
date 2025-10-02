"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEnvelope,
  FaArrowLeft,
  FaArrowRight,
  FaPaperPlane,
} from "react-icons/fa";
import ContactStepIndicator from "./ContactStepIndicator";

const ContactForm = ({ user, onSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // No auto-step updates based on form state
  // We'll control steps manually with navigation buttons

  // Create a ref to track if a request is in progress
  const isSubmitting = useRef(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear success message when user starts typing again
    if (success) {
      setSuccess(false);
    }

    // Clear error when user starts typing again
    if (error) {
      setError("");
    }
  };

  // Validate the form data
  const validateForm = () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    setError("");
    return true;
  };

  // Handle next step button
  const handleNextStep = (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      // Validate before proceeding to review
      if (!validateForm()) {
        return;
      }
      setCurrentStep(2);
    }
  };

  // Handle back button
  const handlePreviousStep = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission with debounce protection
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting.current || loading) {
      return;
    }

    // Validate form data
    if (!validateForm()) {
      return;
    }

    // Set loading state and prevent new submissions
    setLoading(true);
    isSubmitting.current = true;
    setError("");
    setSuccess(false);

    try {
      // Submit the contact form data
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          subject: formData.subject,
          message: formData.message,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการส่งข้อความ");
      }

      // Show success message and move to step 3
      setSuccess(true);
      setCurrentStep(3);

      // Notify parent component
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);

      // Allow new submissions after a short delay to prevent accidental double-clicks
      setTimeout(() => {
        isSubmitting.current = false;
      }, 300);
    }
  };

  // Reset the form and go back to step 1
  const handleStartOver = () => {
    setFormData({
      subject: "",
      message: "",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setSuccess(false);
    setError("");
    setCurrentStep(1);
  };

  // Render the form based on current step
  const renderStepContent = () => {
    // ใช้สีที่เข้มขึ้นสำหรับทุกขั้นตอน
    switch (currentStep) {
      case 1: // Form input step
        return (
          <>
            {/* User Info (Read-only) */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-2">
              <h4 className="font-bold text-black mb-3">ข้อมูลผู้ติดต่อ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-black mb-1">
                    ชื่อ
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-black mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={formData.phone}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-bold text-black mb-2">
                  เรื่องที่ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border ${error && !formData.subject ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-lg text-gray-700 shadow-sm transition-colors disabled:bg-gray-100 disabled:text-gray-500`}
                  placeholder="ระบุเรื่องที่ต้องการติดต่อ"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-black mb-2">
                  ข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border ${error && !formData.message ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-lg text-gray-700 shadow-sm transition-colors disabled:bg-gray-100 disabled:text-gray-500`}
                  placeholder="รายละเอียดข้อความที่ต้องการส่งถึงเรา"
                ></textarea>
              </div>
            </div>

            {/* Next button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 active:shadow-sm"
                style={{ minWidth: "160px" }}
              >
                <span className="flex items-center justify-center">
                  ขั้นตอนถัดไป
                  <FaArrowRight className="ml-2" />
                </span>
              </button>
            </div>
          </>
        );

      case 2: // Review step
        return (
          <>
            <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-4">ยืนยันข้อมูลการติดต่อ</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-black">ข้อมูลผู้ติดต่อ</h4>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p>
                      <span className="font-bold text-black">ชื่อ:</span>{" "}
                      <span className="text-black">{formData.name}</span>
                    </p>
                    <p>
                      <span className="font-bold text-black">อีเมล:</span>{" "}
                      <span className="text-black">{formData.email}</span>
                    </p>
                    <p>
                      <span className="font-bold text-black">เบอร์โทรศัพท์:</span>{" "}
                      <span className="text-black">{formData.phone || "-"}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-black">เรื่องที่ติดต่อ</h4>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="font-bold text-black">{formData.subject}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-black">ข้อความ</h4>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-black font-medium">
                    {formData.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
              >
                <span className="flex items-center justify-center">
                  <FaArrowLeft className="mr-2" />
                  แก้ไขข้อมูล
                </span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isSubmitting.current}
                className={`px-6 py-3 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"} text-white rounded-lg transition-all disabled:opacity-70 font-medium shadow-sm hover:shadow-md transform ${!loading && "hover:-translate-y-1"} active:translate-y-0 active:shadow-sm`}
                style={{ minWidth: "160px" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FaHourglassHalf className="animate-spin mr-2" />
                    กำลังส่ง...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaPaperPlane className="mr-2" />
                    ยืนยันและส่งข้อความ
                  </span>
                )}
              </button>
            </div>
          </>
        );

      case 3: // Success step
        return (
          <>
            <div className="p-6 bg-green-50 text-green-800 rounded-lg border border-green-200 flex flex-col items-center shadow-sm animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">ส่งข้อความเรียบร้อยแล้ว</h3>
              <p className="text-center mb-4 text-black font-medium">
                ขอบคุณสำหรับข้อความของท่าน เราจะติดต่อกลับโดยเร็วที่สุด
              </p>
              <button
                type="button"
                onClick={handleStartOver}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md mt-2"
              >
                ส่งข้อความใหม่
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <ContactStepIndicator currentStep={currentStep} />

      <form className="space-y-6">
        {/* Display error message if any */}
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-center shadow-sm animate-fade-in">
            <FaTimesCircle className="text-red-500 mr-3" size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Render content based on current step */}
        {renderStepContent()}
      </form>
    </div>
  );
};

export default ContactForm;
