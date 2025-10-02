"use client";

import { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * ChangePersonal Component
 *
 * This component displays statistics about profile update requests
 * in a bar chart format.
 */
export default function ChangePersonal({ title, endpoint, chartType = "bar" }) {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          console.log("Profile update stats:", data.stats); // Debug log
          setStats(data.stats);
        } else {
          throw new Error(data.message || "Failed to fetch statistics");
        }
      } catch (error) {
        console.error("Error fetching profile update stats:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (endpoint) {
      fetchStats();
    }
  }, [endpoint]);

  // Status labels in Thai
  const statusLabels = {
    pending: "รออนุมัติ",
    approved: "อนุมัติ",
    rejected: "ปฏิเสธ",
  };

  // Status colors
  const statusColors = {
    pending: "rgba(255, 206, 86, 0.7)", // Yellow for pending
    approved: "rgba(16, 185, 129, 0.7)", // Green for approved
    rejected: "rgba(239, 68, 68, 0.7)", // Red for rejected
  };

  // Prepare chart data
  const chartData = {
    labels: Object.values(statusLabels),
    datasets: [
      {
        data: [
          parseInt(stats.pending) || 0,
          parseInt(stats.approved) || 0,
          parseInt(stats.rejected) || 0,
        ],
        backgroundColor: Object.values(statusColors),
        borderColor: Object.values(statusColors).map((color) => color.replace("0.7", "1")),
        borderWidth: 1,
      },
    ],
  };

  // Chart options with improved styling
  const chartOptions = {
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
            const percentage = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
            return `จำนวน: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        border: {
          dash: [4, 4],
        },
        ticks: {
          font: {
            family: "Prompt, sans-serif",
            size: 12,
          },
          precision: 0, // Only show whole numbers
          callback: function (value) {
            return value.toLocaleString("th-TH");
          },
        },
        title: {
          display: true,
          text: "จำนวน (รายการ)",
          font: {
            family: "Prompt, sans-serif",
            size: 14,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Prompt, sans-serif",
            size: 12,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 10,
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
      },
    },
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {title || "สถิติคำขอเปลี่ยนข้อมูลส่วนตัว"}
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      ) : stats.total === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600 text-center">
          <p>ไม่พบข้อมูลคำขอ</p>
        </div>
      ) : (
        <div>
          <div className="h-64 mb-4">
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {["pending", "approved", "rejected"].map((status) => (
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
                    {stats[status] || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0
                      ? `${Math.round(((stats[status] || 0) / stats.total) * 100)}%`
                      : "0%"}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColors[status].replace("0.7", "0.2") }}
                >
                  {status === "pending" && (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {status === "approved" && (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {status === "rejected" && (
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
