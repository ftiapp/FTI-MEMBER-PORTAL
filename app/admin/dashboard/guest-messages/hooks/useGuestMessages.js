// app/admin/dashboard/guest-messages/hooks/useGuestMessages.js

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const useGuestMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching guest messages...");

      const encodedSearch = encodeURIComponent(searchTerm || "");

      const response = await fetch(
        `/api/admin/guest-messages?page=${currentPage}&status=${filterStatus}&search=${encodedSearch}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
        },
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Failed to fetch guest messages: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error("Error response:", errorText);

          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson && errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (jsonError) {
            if (errorText && errorText.length > 0) {
              errorMessage = errorText;
            }
          }
        } catch (textError) {
          console.error("Error getting response text:", textError);
        }

        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        throw new Error("Invalid response format from server");
      }

      if (data.success) {
        setMessages(data.messages || []);
        setTotalPages(data.totalPages || 1);

        if ((data.messages || []).length === 0) {
          setError("ไม่พบข้อความที่ตรงกับเงื่อนไขการค้นหา");
        }
      } else {
        throw new Error(data.message || "Failed to fetch guest messages");
      }
    } catch (err) {
      console.error("Error fetching guest messages:", err);
      setError(err.message);
      setMessages([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/guest-messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark message as read");
      }

      setMessages(messages.map((m) => (m.id === messageId ? { ...m, status: "read" } : m)));

      return true;
    } catch (err) {
      console.error("Error marking message as read:", err);
      toast.error("เกิดข้อผิดพลาดในการอ่านข้อความ");
      return false;
    }
  };

  const replyToMessage = async (messageId, replyText) => {
    try {
      const response = await fetch(`/api/admin/guest-messages/${messageId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remark: replyText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to save remark");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("บันทึก Remark เรียบร้อยแล้ว");

        setMessages(messages.map((m) => (m.id === messageId ? { ...m, status: "replied" } : m)));

        return {
          status: "replied",
          reply_message: replyText,
          replied_at: new Date().toISOString(),
        };
      } else {
        throw new Error(data.message || "Failed to save remark");
      }
    } catch (err) {
      console.error("Error saving remark:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึก Remark");
      return null;
    }
  };

  const closeMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/guest-messages/${messageId}/close`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to close message");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("ปิดการติดต่อเรียบร้อยแล้ว");

        setMessages(messages.map((m) => (m.id === messageId ? { ...m, status: "closed" } : m)));

        return {
          status: "closed",
          closed_at: new Date().toISOString(),
        };
      } else {
        throw new Error(data.message || "Failed to close message");
      }
    } catch (err) {
      console.error("Error closing message:", err);
      toast.error("เกิดข้อผิดพลาดในการปิดการติดต่อ");
      return null;
    }
  };

  const assignToMe = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/guest-messages/${messageId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to assign message");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("รับผิดชอบข้อความนี้เรียบร้อยแล้ว");

        setMessages(
          messages.map((m) => (m.id === messageId ? { ...m, assigned_to: data.adminName } : m)),
        );

        return data.adminName;
      } else {
        throw new Error(data.message || "Failed to assign message");
      }
    } catch (err) {
      console.error("Error assigning message:", err);
      toast.error("เกิดข้อผิดพลาดในการรับผิดชอบข้อความ");
      return null;
    }
  };

  const addSampleData = async () => {
    try {
      const response = await fetch("/api/admin/sample-guest-messages");
      const data = await response.json();
      if (data.success) {
        toast.success(`เพิ่มข้อมูลตัวอย่างจำนวน ${data.count} รายการ`);
        fetchMessages();
      } else {
        toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง");
      }
    } catch (err) {
      console.error("Error loading sample data:", err);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, filterStatus]);

  return {
    messages,
    loading,
    error,
    currentPage,
    totalPages,
    filterStatus,
    searchTerm,
    setCurrentPage,
    setFilterStatus,
    setSearchTerm,
    fetchMessages,
    markAsRead,
    replyToMessage,
    closeMessage,
    assignToMe,
    addSampleData,
  };
};
