import { useState, useEffect } from "react";

/**
 * Custom hook to fetch contact message status for a user
 * @param {string} userId - The user ID to fetch contact message status for
 * @returns {Object} - The contact message status data and loading state
 */
const useContactMessageStatus = (userId) => {
  const [contactMessageStatus, setContactMessageStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Clear state when no user
      setContactMessageStatus([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("Fetching contact message status for user:", userId);

    fetch(`/api/dashboard/operation-status/contact-message-status?userId=${userId}`)
      .then((res) => {
        // Check if response is OK and is JSON
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Contact message API response:", data);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          // Map all messages to operation cards instead of just the latest one
          const contactMessages = data.messages.map((message) => ({
            id: message.id || Date.now(),
            title: "ติดต่อเจ้าหน้าที่",
            description: `หัวข้อ: ${message.subject || "ไม่มีหัวข้อ"} - สถานะการติดต่อเจ้าหน้าที่`,
            status: message.status || "unread",
            created_at: message.created_at || new Date().toISOString(),
            subject: message.subject || "",
            type: "ติดต่อเจ้าหน้าที่",
            message_content: message.message || "",
          }));
          setContactMessageStatus(contactMessages);
        } else {
          // No messages: return empty list (no placeholders)
          setContactMessageStatus([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching contact message status:", error);
        // On error: return empty list (no placeholders)
        setContactMessageStatus([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  return { contactMessageStatus, isLoading };
};

export default useContactMessageStatus;
