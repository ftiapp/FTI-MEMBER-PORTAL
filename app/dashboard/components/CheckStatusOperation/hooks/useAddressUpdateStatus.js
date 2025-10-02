import { useState, useEffect } from "react";

/**
 * Custom hook to fetch address update status for a user
 * @param {string} userId - The user ID to fetch address update status for
 * @returns {Object} - The address update status data
 */
const useAddressUpdateStatus = (userId) => {
  const [addressUpdates, setAddressUpdates] = useState([]);

  useEffect(() => {
    if (!userId) return;

    console.log("Fetching address update status for user:", userId);

    fetch(`/api/dashboard/operation-status/address-update-status?userId=${userId}`, {
      credentials: "include", // Include cookies in the request
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
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
        console.log("Address update API response:", data);
        if (data.success && Array.isArray(data.updates) && data.updates.length > 0) {
          setAddressUpdates(data.updates);
        } else {
          // Create a placeholder if no address updates found
          setAddressUpdates([
            {
              id: Date.now(),
              title: "แก้ไขข้อมูลสมาชิก",
              description: "คุณยังไม่มีคำขอแก้ไขที่อยู่",
              status: "none",
              created_at: new Date().toISOString(),
              type: "แก้ไขข้อมูลสมาชิก",
            },
          ]);
        }
      })
      .catch((error) => {
        console.error("Error fetching address update status:", error);
        setAddressUpdates([
          {
            id: Date.now(),
            title: "แก้ไขข้อมูลสมาชิก",
            description: "ไม่สามารถดึงข้อมูลสถานะการแก้ไขที่อยู่ได้",
            status: "error",
            created_at: new Date().toISOString(),
            type: "แก้ไขข้อมูลสมาชิก",
          },
        ]);
      });
  }, [userId]);

  return addressUpdates;
};

export default useAddressUpdateStatus;
