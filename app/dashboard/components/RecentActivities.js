"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  FaEnvelope,
  FaIdCard,
  FaFileAlt,
  FaUserEdit,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

export default function RecentActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingError, setLoadingError] = useState(false);
  const itemsPerPage = 3; // Changed from 5 to 3 items per page

  // Ref to prevent duplicate requests
  const isLoadingActivities = useRef(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserActivities(user.id);
    }
  }, [user]);

  const fetchUserActivities = async (userId) => {
    // Prevent duplicate requests
    if (isLoadingActivities.current) return;

    try {
      isLoadingActivities.current = true;
      setLoading(true);
      setLoadingError(false);

      const response = await fetch(`/api/dashboard/activities?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        console.error("Failed to fetch activities");
        setLoadingError(true);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setLoadingError(true);
    } finally {
      setLoading(false);
      // Add a small delay before allowing new requests
      setTimeout(() => {
        isLoadingActivities.current = false;
      }, 300);
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case "contact_message":
        return <FaEnvelope className="text-blue-600" size={20} />;
      case "member_verification":
        return <FaIdCard className="text-green-600" size={20} />;
      case "document_upload":
        return <FaFileAlt className="text-yellow-600" size={20} />;
      case "profile_update":
        return <FaUserEdit className="text-purple-600" size={20} />;
      case "profile_update_request":
        return <FaUserCog className="text-indigo-600" size={20} />;
      default:
        return <FaFileAlt className="text-gray-600" size={20} />;
    }
  };

  const getActivityStatus = (activity) => {
    if (activity.type === "contact") {
      return (
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
            activity.status === "unread"
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
              : activity.status === "read"
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          {activity.status === "unread"
            ? "ยังไม่อ่าน"
            : activity.status === "read"
              ? "อ่านแล้ว"
              : "ตอบกลับแล้ว"}
        </span>
      );
    } else if (activity.type === "member") {
      return (
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
            !activity.Admin_Submit
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
              : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          {!activity.Admin_Submit ? "รอการตรวจสอบ" : "ตรวจสอบแล้ว"}
        </span>
      );
    } else if (activity.type === "profile") {
      return (
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
            activity.status === "pending"
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
              : activity.status === "approved"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {activity.status === "pending"
            ? "รอการอนุมัติ"
            : activity.status === "approved"
              ? "อนุมัติแล้ว"
              : "ปฏิเสธแล้ว"}
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "d MMM yyyy, HH:mm น.", { locale: th });
  };

  // Calculate total pages
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  // Calculate items to display on current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activities.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top of activities container smoothly
      document
        .getElementById("activities-container")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchUserActivities(user.id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="space-y-6" id="activities-container">
        <motion.div
          className="pb-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h3
            className="text-xl font-semibold text-blue-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            กิจกรรมของคุณ
          </motion.h3>
          <motion.p
            className="text-gray-600 mt-1 text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            รายการกิจกรรมและการเปลี่ยนแปลงล่าสุดของบัญชีของคุณ
          </motion.p>
        </motion.div>

        {loading ? (
          <motion.div
            className="py-16 flex flex-col items-center justify-center text-gray-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaSpinner className="text-blue-600 mb-3" size={28} />
            </motion.div>
            <motion.p
              className="font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              กำลังโหลดข้อมูล...
            </motion.p>
          </motion.div>
        ) : loadingError ? (
          <motion.div
            className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FaExclamationCircle className="text-red-500 mb-3" size={28} />
            </motion.div>
            <motion.p
              className="font-medium mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              ลองใหม่อีกครั้ง
            </motion.button>
          </motion.div>
        ) : activities.length === 0 ? (
          <motion.div
            className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-gray-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FaExclamationCircle className="text-gray-400 mb-3" size={28} />
            </motion.div>
            <motion.p
              className="font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ยังไม่มีกิจกรรมล่าสุด
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {currentItems.map((activity, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-300 bg-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px] shadow-sm border border-gray-200"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {getActivityIcon(activity.action)}
                    </motion.div>
                    <motion.div
                      className="flex-grow"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <motion.h4
                          className="font-semibold text-gray-900"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        >
                          {activity.type === "contact"
                            ? activity.subject
                            : activity.type === "member"
                              ? `${activity.company_name} (${activity.MEMBER_CODE})`
                              : activity.type === "profile"
                                ? "คำขอแก้ไขข้อมูลส่วนตัว"
                                : activity.details}
                        </motion.h4>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        >
                          {getActivityStatus(activity)}
                        </motion.div>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mt-2">
                        {activity.type === "contact" ? (
                          `ข้อความ: ${activity.message.substring(0, 100)}${activity.message.length > 100 ? "..." : ""}`
                        ) : activity.type === "member" ? (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded-md">
                            ประเภทบริษัท: <strong>{activity.company_type}</strong>
                          </span>
                        ) : activity.type === "profile" ? (
                          activity.status === "rejected" ? (
                            <span className="block mt-1 text-red-600 p-2 bg-red-50 rounded border border-red-200">
                              <strong>เหตุผลที่ปฏิเสธ:</strong>{" "}
                              {activity.reject_reason || "ไม่ระบุเหตุผล"}
                            </span>
                          ) : (
                            "คำขอแก้ไขข้อมูลชื่อ นามสกุล อีเมล และเบอร์โทรศัพท์"
                          )
                        ) : (
                          activity.details
                        )}
                      </p>
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">วันที่:</span>{" "}
                        {formatDate(activity.created_at)}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-blue-700 hover:bg-blue-100 active:bg-blue-200"} transition-all duration-200`}
                  aria-label="Previous page"
                >
                  <FaChevronLeft size={16} />
                </motion.button>

                <motion.div
                  className="flex space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {Array.from({ length: totalPages }, (_, index) => {
                    // Display limited page numbers for better UX when there are many pages
                    const pageNumber = index + 1;

                    // Always show first, last, current, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      pageNumber === currentPage ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <motion.button
                          key={pageNumber}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => paginate(pageNumber)}
                          className={`w-8 h-8 rounded-md font-medium ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          } transition-all duration-200`}
                        >
                          {pageNumber}
                        </motion.button>
                      );
                    }

                    // Show ellipsis for gaps (only once per gap)
                    if (
                      (pageNumber === currentPage - 2 && pageNumber > 2) ||
                      (pageNumber === currentPage + 2 && pageNumber < totalPages - 1)
                    ) {
                      return (
                        <span key={pageNumber} className="w-8 text-center">
                          ...
                        </span>
                      );
                    }

                    // Hide other page numbers
                    return null;
                  })}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-blue-700 hover:bg-blue-100 active:bg-blue-200"} transition-all duration-200`}
                  aria-label="Next page"
                >
                  <FaChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add global animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-pulse {
          animation: pulse 2s infinite ease-in-out;
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }

        #activities-container {
          scroll-margin-top: 20px;
        }

        .activity-card-enter {
          opacity: 0;
          transform: translateY(20px);
        }

        .activity-card-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition:
            opacity 300ms,
            transform 300ms;
        }

        .activity-card-exit {
          opacity: 1;
        }

        .activity-card-exit-active {
          opacity: 0;
          transform: translateY(-20px);
          transition:
            opacity 300ms,
            transform 300ms;
        }
      `}</style>
    </motion.div>
  );
}
