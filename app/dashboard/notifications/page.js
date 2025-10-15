"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Import components
import HeroSection from "./components/HeroSection";
import NotificationsHeader from "./components/NotificationsHeader";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import NotificationList from "./components/NotificationList";

// Import custom hook
import { useNotifications } from "./hooks/useNotifications";

const NotificationsPage = () => {
  const { user } = useAuth();
  const { FTI_Portal_User_Notifications, loading, error, markAsRead, markAllAsRead } = useNotifications(user);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination calculations
  const totalPages = Math.ceil(FTI_Portal_User_Notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = FTI_Portal_User_Notifications.slice(startIndex, endIndex);

  // Reset to first page when FTI_Portal_User_Notifications change
  useEffect(() => {
    setCurrentPage(1);
  }, [FTI_Portal_User_Notifications.length]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of FTI_Portal_User_Notifications list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="bg-gray-50 min-h-screen flex-grow">
        {/* Hero Section */}
        <HeroSection />

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Dashboard Header */}
          <NotificationsHeader
            FTI_Portal_User_Notifications={FTI_Portal_User_Notifications}
            markAllAsRead={markAllAsRead}
            startIndex={startIndex}
            endIndex={endIndex}
          />

          <div className="bg-white rounded-lg shadow-sm p-6">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} />
            ) : FTI_Portal_User_Notifications.length === 0 ? (
              <EmptyState />
            ) : (
              <NotificationList
                FTI_Portal_User_Notifications={currentNotifications}
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                markAsRead={markAsRead}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
