"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingOverlay } from "../shared";
import { ContactForm, UserMessages, ContactInfo, ContactHeader } from "./components";
import "./components/styles.css";

export default function ContactUs(props) {
  const messageId = props?.messageId || null;
  const { user } = useAuth();
  const [userMessages, setUserMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // Timeout ref for clearing success message
  const successTimeoutRef = useRef(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      // Fetch user's contact messages
      fetchUserMessages();
    }

    // Cleanup function to clear any timeouts when component unmounts
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [user]);

  // Fetch specific message when messageId changes
  useEffect(() => {
    // If messageId is provided, fetch that specific message
    if (messageId) {
      fetchSpecificMessage(messageId);
    }
  }, [messageId]);

  // Fetch user's contact messages
  const fetchUserMessages = async () => {
    if (!user || !user.id) return;

    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/contact/user-messages?userId=${user.id}`);

      if (response.status === 401) {
        console.log("Authentication required to fetch messages");
        setUserMessages([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setUserMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching user messages:", error);
      setUserMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle successful form submission
  const handleSubmitSuccess = () => {
    // Refresh the user's messages after successful submission
    fetchUserMessages();
  };

  // Fetch a specific message by ID
  const fetchSpecificMessage = async (id) => {
    try {
      setMessagesLoading(true);

      // Check if user is logged in
      if (!user || !user.id) {
        console.error("User not authenticated, cannot fetch message");
        setMessagesLoading(false);
        return;
      }

      console.log(`Fetching message with ID: ${id} for user: ${user.id}`);

      // Include the user ID as a query parameter
      const response = await fetch(`/api/contact/message/${id}?userId=${user.id}`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        console.error(`Error response from server: ${response.status}`);
        setMessagesLoading(false);
        return;
      }

      // Get response text for debugging
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        setMessagesLoading(false);
        return;
      }

      console.log("Parsed response data:", data);

      if (data && data.success === true && data.message) {
        console.log("Setting selected message:", data.message);
        // Add a small delay for smoother transition
        setTimeout(() => {
          setSelectedMessage(data.message);
          setViewMode(true);
          setMessagesLoading(false);
        }, 500);
      } else {
        console.error("No message data in response or success is false", data);
        setMessagesLoading(false);
      }
    } catch (error) {
      console.error("Error fetching specific message:", error);
      setMessagesLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ContactHeader />
      </motion.div>

      <AnimatePresence mode="wait">
        {messagesLoading ? (
          <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูล..." inline={true} />
        ) : viewMode && selectedMessage ? (
          <motion.div
            key="message-view"
            className="bg-white rounded-xl shadow-md p-6 border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <motion.div
                className="pb-4 border-b border-blue-100 flex justify-between items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div>
                  <motion.h3
                    className="text-lg font-semibold text-blue-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    ข้อความที่คุณส่ง
                  </motion.h3>
                  <motion.p
                    className="text-sm text-gray-600 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    รายละเอียดข้อความที่คุณส่งถึงเรา
                  </motion.p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#dbeafe" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(false)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-300"
                >
                  กลับไปหน้าติดต่อ
                </motion.button>
              </motion.div>

              <motion.div
                className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div
                  className="flex justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div>
                    <motion.h4
                      className="font-medium text-gray-900"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      หัวข้อ
                    </motion.h4>
                    <motion.p
                      className="text-lg font-semibold text-blue-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      {selectedMessage.subject}
                    </motion.p>
                  </div>
                  <div className="text-right">
                    <motion.h4
                      className="font-medium text-gray-900"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      วันที่ส่ง
                    </motion.h4>
                    <motion.p
                      className="text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      {new Date(selectedMessage.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </motion.p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <motion.h4
                    className="font-medium text-gray-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  >
                    ข้อความ
                  </motion.h4>
                  <motion.div
                    className="mt-2 p-4 bg-white border border-gray-200 rounded-lg whitespace-pre-wrap"
                    initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                    animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    {selectedMessage.message}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                  >
                    <h4 className="font-medium text-gray-900">ชื่อ</h4>
                    <p className="text-gray-700">{selectedMessage.name}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.3 }}
                  >
                    <h4 className="font-medium text-gray-900">อีเมล</h4>
                    <p className="text-gray-700">{selectedMessage.email}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                  >
                    <h4 className="font-medium text-gray-900">เบอร์โทรศัพท์</h4>
                    <p className="text-gray-700">{selectedMessage.phone || "-"}</p>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex items-center mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.5 }}
                >
                  <motion.div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                      selectedMessage.status === "unread"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedMessage.status === "read"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedMessage.status === "unread" ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <span>ยังไม่ได้อ่าน</span>
                      </>
                    ) : selectedMessage.status === "read" ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                          />
                        </svg>
                        <span>อ่านแล้ว</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>ตอบกลับแล้ว</span>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {selectedMessage.admin_reply && (
                  <motion.div
                    className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    <motion.h4
                      className="font-medium text-blue-800 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.7 }}
                    >
                      การตอบกลับจากเจ้าหน้าที่
                    </motion.h4>
                    <motion.div
                      className="p-4 bg-white rounded-lg border border-blue-100 whitespace-pre-wrap"
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                      transition={{ duration: 0.5, delay: 1.8 }}
                    >
                      {selectedMessage.admin_reply}
                    </motion.div>
                  </motion.div>
                )}

                {/* Note about email replies */}
                <motion.div
                  className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.9 }}
                >
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-600 mr-2 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-yellow-800">
                      <span className="font-medium">หมายเหตุ:</span>{" "}
                      ท่านสามารถตรวจสอบข้อความตอบกลับได้ที่อีเมลล์ที่ท่านลงทะเบียนกับเรา หากไม่พบ
                      กรุณาส่งข้อความ &quot;ติดต่อเรา&quot; อีกครั้ง
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="contact-form"
            className="transition-all duration-300 ease-in-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* User's previous messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <UserMessages messages={userMessages} loading={false} />
            </motion.div>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ContactForm user={user} onSubmitSuccess={handleSubmitSuccess} />
            </motion.div>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ContactInfo />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
