import { useState, useEffect } from "react";

export const useNotifications = (user) => {
  const [FTI_Portal_User_Notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/notifications?userId=${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch FTI_Portal_User_Notifications");
        }

        const data = await response.json();
        setNotifications(data.FTI_Portal_User_Notifications || []);
      } catch (error) {
        console.error("Error fetching FTI_Portal_User_Notifications:", error);
        setError("ไม่สามารถโหลดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all FTI_Portal_User_Notifications as read");
      }

      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.read_at ? notification : { ...notification, read_at: now },
        ),
      );
    } catch (error) {
      console.error("Error marking all FTI_Portal_User_Notifications as read:", error);
    }
  };

  return {
    FTI_Portal_User_Notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    setNotifications,
  };
};
