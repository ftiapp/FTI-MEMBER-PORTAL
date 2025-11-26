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

export default function OCIndustryProvinceAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [mode, setMode] = useState("industry"); // "industry" | "province"
  const [limit, setLimit] = useState(10);
  const now = new Date();
  const [selectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          year: String(selectedYear),
          month: String(selectedMonth),
        });
        const res = await fetch(`/api/admin/membership-requests/oc-industry-province?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
        setData(json.data);
      } catch (e) {
        console.error("Error loading OC industry/province stats", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, selectedMonth]);

  const chartData = useMemo(() => {
    if (!data) return null;

    const source =
      mode === "industry" ? data.current?.byIndustry || [] : data.current?.byProvince || [];
    const sliced = source.slice(0, limit);

    return {
      labels: sliced.map((r) => r.name || "ไม่ระบุ"),
      datasets: [
        {
          label: mode === "industry" ? "จำนวนตามกลุ่มอุตสาหกรรม" : "จำนวนตามสภาจังหวัด",
          data: sliced.map((r) => r.count || 0),
          backgroundColor: "rgba(37, 99, 235, 0.7)",
        },
      ],
    };
  }, [data, mode, limit]);

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
            return label.length > 12 ? label.slice(0, 11) + "…" : label;
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

  const summary = useMemo(() => {
    if (!data) {
      return {
        label: "",
        currentTotal: 0,
        prevTotal: 0,
        changePercent: 0,
      };
    }

    const currentTotal =
      mode === "industry" ? data.current?.totalIndustry || 0 : data.current?.totalProvince || 0;
    const prevTotal =
      mode === "industry" ? data.previous?.totalIndustry || 0 : data.previous?.totalProvince || 0;

    const changePercent = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    return {
      label: mode === "industry" ? "ตามกลุ่มอุตสาหกรรม" : "ตามสภาจังหวัด",
      currentTotal,
      prevTotal,
      changePercent,
    };
  }, [data, mode]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">วิเคราะห์ตามกลุ่มอุตสาหกรรม / สภาจังหวัด (OC)</h3>
          {data && (
            <p className="text-sm text-gray-500">
              ข้อมูลเดือน {MONTH_LABELS[(data.month || selectedMonth) - 1]} {data.year} รวมทุกประเภทสมาชิก
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            <span className="text-sm text-gray-500">มุมมอง:</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="industry">ตามกลุ่มอุตสาหกรรม</option>
              <option value="province">ตามสภาจังหวัด</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">จำนวนรายการ:</span>
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

      {data && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs text-indigo-600 font-semibold mb-1">ยอดรวม {summary.label}</p>
            <p className="text-2xl font-bold text-indigo-700">
              {summary.currentTotal.toLocaleString("th-TH")} <span className="text-sm font-normal text-gray-500">ราย</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              เดือนก่อนหน้า: {summary.prevTotal.toLocaleString("th-TH")} ราย
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
            <p className="text-xs text-emerald-600 font-semibold mb-1">การเปลี่ยนแปลงเทียบเดือนก่อน</p>
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
      ) : !data ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-600 text-sm">
          ไม่พบข้อมูลการสมัครสมาชิกรายเดือนในช่วงที่เลือก
        </div>
      ) : (
        <div className="h-72 lg:h-80">
          <Bar data={chartData} options={chartOptions} plugins={[valueLabelPlugin]} />
        </div>
      )}
    </div>
  );
}
