"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * GuestContactMessageStats Component
 *
 * Displays a bar graph of guest contact message statistics by status (unread, read, replied, closed)
 */
export default function GuestContactMessageStats({ title }) {
  const [stats, setStats] = useState({
    unread: 0,
    read: 0,
    replied: 0,
    closed: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status labels in Thai
  const statusLabels = {
    unread: "ยังไม่อ่าน",
    read: "อ่านแล้ว",
    replied: "ตอบกลับ",
    closed: "ปิดการติดต่อ",
  };

  // Status colors
  const statusColors = {
    unread: "rgba(239, 68, 68, 0.7)", // Red
    read: "rgba(59, 130, 246, 0.7)", // Blue
    replied: "rgba(16, 185, 129, 0.7)", // Green
    closed: "rgba(107, 114, 128, 0.7)", // Gray
  };

  useEffect(() => {
    const fetchGuestContactMessageStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/guest-contact-message-stats", {
          cache: "no-store",
          next: { revalidate: 0 },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch guest contact message statistics");
        }

        const data = await response.json();

        if (data.success) {
          setStats({
            ...data.data.statusCounts,
            totalCount: data.data.totalCount,
          });
        } else {
          throw new Error(data.message || "Failed to fetch guest contact message statistics");
        }
      } catch (err) {
        console.error("Error fetching guest contact message statistics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestContactMessageStats();
  }, []);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage =
              stats.totalCount > 0 ? Math.round((value / stats.totalCount) * 100) : 0;
            return `จำนวน: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // Chart data
  const chartData = {
    labels: Object.keys(stats)
      .filter((key) => key !== "totalCount")
      .map((key) => statusLabels[key]),
    datasets: [
      {
        data: Object.keys(stats)
          .filter((key) => key !== "totalCount")
          .map((key) => stats[key]),
        backgroundColor: Object.keys(stats)
          .filter((key) => key !== "totalCount")
          .map((key) => statusColors[key]),
        borderColor: Object.keys(stats)
          .filter((key) => key !== "totalCount")
          .map((key) => statusColors[key].replace("0.7", "1")),
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {title || "สถิติข้อความติดต่อจากบุคคลทั่วไป"}
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {title || "สถิติข้อความติดต่อจากบุคคลทั่วไป"}
        </h2>
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {title || "สถิติข้อความติดต่อจากบุคคลทั่วไป"}
      </h2>

      {stats.totalCount === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600 text-center">
          <p>ไม่พบข้อมูลข้อความติดต่อจากบุคคลทั่วไป</p>
        </div>
      ) : (
        <div>
          <div className="h-64 mb-4">
            <Bar options={options} data={chartData} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.keys(stats)
              .filter((key) => key !== "totalCount")
              .map((status) => (
                <div
                  key={status}
                  className="p-4 rounded-lg border flex items-center justify-between"
                  style={{ backgroundColor: statusColors[status].replace("0.7", "0.1") }}
                >
                  <div className="flex-1 mr-4">
                    <p className="text-sm text-gray-500 mb-1">{statusLabels[status]}</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: statusColors[status].replace("0.7", "1") }}
                    >
                      {stats[status]}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.totalCount > 0
                        ? `${Math.round((stats[status] / stats.totalCount) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColors[status].replace("0.7", "0.2") }}
                  >
                    {status === "unread" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={statusColors[status].replace("0.7", "1")}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {status === "read" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={statusColors[status].replace("0.7", "1")}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    {status === "replied" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={statusColors[status].replace("0.7", "1")}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                    )}
                    {status === "closed" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={statusColors[status].replace("0.7", "1")}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
