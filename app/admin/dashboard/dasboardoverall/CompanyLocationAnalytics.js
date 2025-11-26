"use client";

import { useEffect, useMemo, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTH_LABELS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const MEMBER_TYPE_LABELS = {
  all: "ทุกประเภทสมาชิก",
  IC: "IC ทบ",
  OC: "OC สน",
  AM: "AM สส",
  AC: "AC ทน",
};

export default function CompanyLocationAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [limit, setLimit] = useState(10);
  const now = new Date();
  const [selectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const paramsCurrent = new URLSearchParams({
          year: String(selectedYear),
          month: String(selectedMonth),
          memberType: selectedType,
        });

        const resCurrent = await fetch(`/api/admin/membership-requests/location?${paramsCurrent.toString()}`, {
          cache: "no-store",
        });
        if (!resCurrent.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${resCurrent.status})`);
        const jsonCurrent = await resCurrent.json();
        if (!jsonCurrent.success) throw new Error(jsonCurrent.message || "โหลดข้อมูลไม่สำเร็จ");

        const prevDate = new Date(selectedYear, selectedMonth - 2, 1);
        const prevYear = prevDate.getFullYear();
        const prevMonth = prevDate.getMonth() + 1;

        const paramsPrev = new URLSearchParams({
          year: String(prevYear),
          month: String(prevMonth),
          memberType: selectedType,
        });

        const resPrev = await fetch(`/api/admin/membership-requests/location?${paramsPrev.toString()}`, {
          cache: "no-store",
        });
        if (!resPrev.ok) throw new Error(`โหลดข้อมูลเดือนก่อนหน้าไม่สำเร็จ (${resPrev.status})`);
        const jsonPrev = await resPrev.json();
        if (!jsonPrev.success) throw new Error(jsonPrev.message || "โหลดข้อมูลเดือนก่อนหน้าไม่สำเร็จ");

        setCurrentData(jsonCurrent.data);
        setPrevData(jsonPrev.data);
      } catch (e) {
        console.error("Error loading membership location stats", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, selectedMonth, selectedType]);

  const chartData = useMemo(() => {
    if (!currentData) return null;
    const source = currentData.byProvince || [];
    const sliced = source.slice(0, limit);

    return {
      labels: sliced.map((r) => r.name || "ไม่ระบุ"),
      datasets: [
        {
          label: "จำนวนใบสมัครตามจังหวัดที่ตั้งบริษัท",
          data: sliced.map((r) => r.count || 0),
          backgroundColor: "rgba(56, 189, 248, 0.7)", // sky
        },
      ],
    };
  }, [currentData, limit]);

  const summary = useMemo(() => {
    if (!currentData) {
      return {
        currentTotal: 0,
        prevTotal: 0,
        changePercent: 0,
      };
    }

    const currentTotal = currentData.total || 0;
    const prevTotal = prevData?.total || 0;
    const changePercent = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    return {
      currentTotal,
      prevTotal,
      changePercent,
    };
  }, [currentData, prevData]);

  const provinceRows = useMemo(() => {
    const map = new Map();
    if (currentData?.byProvince) {
      for (const row of currentData.byProvince) {
        map.set(row.name || "ไม่ระบุ", {
          name: row.name || "ไม่ระบุ",
          current: row.count || 0,
          prev: 0,
        });
      }
    }
    if (prevData?.byProvince) {
      for (const row of prevData.byProvince) {
        const key = row.name || "ไม่ระบุ";
        const existing = map.get(key) || { name: key, current: 0, prev: 0 };
        existing.prev = row.count || 0;
        map.set(key, existing);
      }
    }

    const rows = Array.from(map.values());
    return rows
      .map((r) => {
        const changePercent = r.prev > 0 ? ((r.current - r.prev) / r.prev) * 100 : 0;
        return { ...r, changePercent };
      })
      .sort((a, b) => b.current - a.current);
  }, [currentData, prevData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw || 0;
            return `${value.toLocaleString("th-TH")} ราย`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          callback: (val, idx) => {
            const label = chartData?.labels?.[idx] || "";
            return label.length > 10 ? label.slice(0, 9) + "…" : label;
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: (value) => value.toLocaleString("th-TH"),
        },
      },
    },
  };

  const valueLabelPlugin = {
    id: "valueLabel",
    afterDatasetsDraw(chart) {
      const {
        ctx,
        chartArea: { top },
      } = chart;
      const meta = chart.getDatasetMeta(0);
      const dataset = chart.data.datasets[0];
      if (!dataset || !meta || !meta.data) return;

      ctx.save();
      ctx.fillStyle = "#111827";
      ctx.font = "11px system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      meta.data.forEach((bar, index) => {
        const rawValue = dataset.data[index];
        const value = typeof rawValue === "number" ? rawValue : Number(rawValue) || 0;
        if (!Number.isFinite(value) || value === 0) return;

        const x = bar.x;
        const y = bar.y;
        const label = value.toLocaleString("th-TH");

        const minY = top + 4;
        const labelY = Math.max(y - 2, minY);
        ctx.fillText(label, x, labelY);
      });

      ctx.restore();
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">วิเคราะห์การสมัครสมาชิกตามจังหวัดที่ตั้งบริษัท</h3>
          {currentData && (
            <p className="text-sm text-gray-500">
              ข้อมูลเดือน {MONTH_LABELS[(currentData.month || selectedMonth) - 1]} {currentData.year} 
              ({MEMBER_TYPE_LABELS[selectedType]})
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ประเภทสมาชิก:</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">ทุกประเภทสมาชิก</option>
              <option value="IC">IC ทบ</option>
              <option value="OC">OC สน</option>
              <option value="AM">AM สส</option>
              <option value="AC">AC ทน</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">เดือน:</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value) || 1)}
            >
              {MONTH_LABELS.map((label, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">จำนวนจังหวัดที่แสดง (กราฟ):</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 10)}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {currentData && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
            <p className="text-xs text-sky-600 font-semibold mb-1">ยอดรวมทุกจังหวัด</p>
            <p className="text-2xl font-bold text-sky-700">
              {summary.currentTotal.toLocaleString("th-TH")} <span className="text-sm font-normal text-gray-500">ราย</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              เดือนก่อนหน้า: {summary.prevTotal.toLocaleString("th-TH")} ราย
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
            <p className="text-xs text-emerald-600 font-semibold mb-1">การเปลี่ยนแปลงเทียบเดือนก่อน (รวมทุกจังหวัด)</p>
            <p
              className={`text-2xl font-bold ${
                summary.changePercent > 0
                  ? "text-emerald-700"
                  : summary.changePercent < 0
                  ? "text-red-600"
                  : "text-gray-700"
              }`}
            >
              {summary.changePercent === 0 && summary.prevTotal === 0
                ? "-"
                : `${summary.changePercent.toFixed(1)}%`}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
        </div>
      ) : !currentData ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-600 text-sm">
          ไม่พบข้อมูลการสมัครสมาชิกตามจังหวัดในช่วงที่เลือก
        </div>
      ) : (
        <div className="space-y-6">
          <div className="h-72 lg:h-80">
            <Bar data={chartData} options={chartOptions} plugins={[valueLabelPlugin]} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="px-3 py-2 text-left font-medium">จังหวัด</th>
                  <th className="px-3 py-2 text-right font-medium">เดือนนี้</th>
                  <th className="px-3 py-2 text-right font-medium">เดือนก่อน</th>
                  <th className="px-3 py-2 text-right font-medium">% เปลี่ยนแปลง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {provinceRows.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{row.name}</td>
                    <td className="px-3 py-2 text-right">{row.current.toLocaleString("th-TH")}</td>
                    <td className="px-3 py-2 text-right">{row.prev.toLocaleString("th-TH")}</td>
                    <td
                      className={`px-3 py-2 text-right ${
                        row.changePercent > 0
                          ? "text-emerald-700"
                          : row.changePercent < 0
                          ? "text-red-600"
                          : "text-gray-700"
                      }`}
                    >
                      {row.changePercent === 0 && row.prev === 0
                        ? "-"
                        : `${row.changePercent.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
