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

const MONTH_LABELS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: "all", label: "รวมทุกปี" },
  ...Array.from({ length: 6 }).map((_, idx) => {
    const y = CURRENT_YEAR - idx;
    return { value: y, label: `${y + 543}` };
  }),
];

// Color palette for different company types (will be assigned dynamically)
const TYPE_COLORS = [
  "rgba(79, 70, 229, 0.7)", // indigo
  "rgba(16, 185, 129, 0.7)", // emerald
  "rgba(249, 115, 22, 0.7)", // orange
  "rgba(236, 72, 153, 0.7)", // pink
  "rgba(59, 130, 246, 0.7)", // blue
  "rgba(168, 85, 247, 0.7)", // purple
  "rgba(234, 179, 8, 0.7)", // yellow
  "rgba(20, 184, 166, 0.7)", // teal
];

export default function OriginalMembershipAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedType, setSelectedType] = useState("all");
  const [startMonth, setStartMonth] = useState(0); // 0 = ม.ค.
  const [endMonth, setEndMonth] = useState(11); // 11 = ธ.ค.
  const [selectedStatus, setSelectedStatus] = useState("all"); // all, 0,1,2

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          year: String(selectedYear),
          startMonth: String(startMonth + 1),
          endMonth: String(endMonth + 1),
        });

        // Apply status filter if not "all"
        if (selectedStatus !== "all") {
          params.set("status", String(selectedStatus));
        }
        const res = await fetch(
          `/api/admin/analytics/original-membership-timeline?${params.toString()}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
        setData(json.data);
      } catch (e) {
        console.error("Error loading original membership timeline stats", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, startMonth, endMonth, selectedStatus]);

  const { series, summary, labels, companyTypes } = useMemo(() => {
    if (!data) {
      return {
        series: [],
        summary: {
          year: selectedYear,
          totalYear: 0,
          latestMonthCount: 0,
          changePercent: 0,
        },
        labels: MONTH_LABELS,
        companyTypes: [],
      };
    }

    const { year, months, companyTypes: types } = data;
    const availableTypes = types || [];

    // ปรับช่วงเดือนตาม state ที่เลือก
    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);

    const getTotalForMonth = (m) => {
      const counts = m.countsByType || {};
      if (selectedType === "all") {
        return Object.values(counts).reduce((sum, v) => sum + (v || 0), 0);
      }
      return counts[selectedType] || 0;
    };

    const monthTotalsAll = months.map((m) => getTotalForMonth(m));
    const monthTotals = monthTotalsAll.slice(rangeStart, rangeEnd + 1);
    const totalYear = monthTotals.reduce((sum, v) => sum + v, 0);

    // latest non-zero month or last month
    const lastIndexWithData =
      [...monthTotals]
        .map((v, i) => ({ v, i }))
        .reverse()
        .find((x) => x.v > 0)?.i ?? monthTotals.length - 1;
    const latestMonthCount = monthTotals[lastIndexWithData] || 0;
    const prevMonthCount = lastIndexWithData > 0 ? monthTotals[lastIndexWithData - 1] || 0 : 0;
    const changePercent =
      prevMonthCount > 0 ? ((latestMonthCount - prevMonthCount) / prevMonthCount) * 100 : 0;

    let chartSeries;
    if (selectedType === "all") {
      // แสดงผลรวมทุกประเภท
      chartSeries = [
        {
          label: "ทุกประเภทสมาชิก",
          backgroundColor: "rgba(79, 70, 229, 0.85)",
          borderColor: "rgba(55, 48, 163, 1)",
          borderWidth: 2,
          data: monthTotals,
        },
      ];
    } else {
      // แสดงเฉพาะประเภทที่เลือก
      const typeIndex = availableTypes.indexOf(selectedType);
      const color = TYPE_COLORS[typeIndex % TYPE_COLORS.length];
      chartSeries = [
        {
          label: selectedType,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1.5,
          data: monthTotals,
        },
      ];
    }

    return {
      series: chartSeries,
      summary: { year, totalYear, latestMonthCount, changePercent },
      labels: MONTH_LABELS.slice(rangeStart, rangeEnd + 1),
      companyTypes: availableTypes,
    };
  }, [data, selectedType, startMonth, endMonth, selectedYear]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: series,
    }),
    [labels, series],
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw || 0;
            return `${ctx.dataset.label}: ${value.toLocaleString("th-TH")} ราย`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: selectedType === "all",
        grid: { display: false },
      },
      y: {
        stacked: selectedType === "all",
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
      ctx.save();
      ctx.fillStyle = "#111827";
      ctx.font = '11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const datasets = chart.data.datasets || [];

      datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (!dataset || !meta || !meta.data) return;

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
      });

      ctx.restore();
    },
  };

  const statusCounts = useMemo(() => {
    if (!data || !data.statusCounts) {
      return { 0: 0, 1: 0, 2: 0 };
    }
    const sc = data.statusCounts;
    return {
      0: Number(sc[0]) || 0,
      1: Number(sc[1]) || 0,
      2: Number(sc[2]) || 0,
    };
  }, [data]);

  const changeColor =
    summary.changePercent > 0
      ? "text-emerald-600"
      : summary.changePercent < 0
        ? "text-red-600"
        : "text-gray-500";
  const changePrefix = summary.changePercent > 0 ? "+" : "";

  const isStatusActive = (statusValue) => {
    if (statusValue === "all") return selectedStatus === "all";
    return String(selectedStatus) === String(statusValue);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">ยืนยันตัวสมาชิกเดิม</h3>
          <p className="text-sm text-gray-500">
            ข้อมูล {summary.year === "all" ? "รวมทุกปี" : `ปี ${Number(summary.year) + 543}`} แยกตามประเภท
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ปี (พ.ศ.):</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ประเภท:</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">ทุกประเภทสมาชิก</option>
              {companyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">ช่วงเดือน:</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
            >
              {MONTH_LABELS.map((label, idx) => (
                <option key={idx} value={idx}>
                  {label}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400">ถึง</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
            >
              {MONTH_LABELS.map((label, idx) => (
                <option key={idx} value={idx} disabled={idx < startMonth}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
          ไม่พบข้อมูลการยืนยันสมาชิกเดิมในปีนี้
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs font-medium text-indigo-600 mb-1">รวมทั้งปี</p>
              <p className="text-2xl font-bold text-indigo-700">
                {summary.totalYear.toLocaleString("th-TH")} ราย
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-medium text-emerald-600 mb-1">เดือนล่าสุด</p>
              <p className="text-2xl font-bold text-emerald-700">
                {summary.latestMonthCount.toLocaleString("th-TH")} ราย
              </p>
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-600 mb-1">
                อัตราการเติบโต (ในเดือนล่าสุด)
              </p>
              <p className={`text-2xl font-bold ${changeColor}`}>
                {summary.changePercent === 0 && summary.latestMonthCount === 0
                  ? "-"
                  : `${changePrefix}${summary.changePercent.toFixed(1)}%`}
              </p>
            </div>
          </div>

          {/* Status breakdown cards (clickable filters) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h3 className="text-lg font-semibold text-gray-800">สถานะการยืนยัน</h3>
              <button
                type="button"
                onClick={() => setSelectedStatus("all")}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  isStatusActive("all")
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                แสดงทุกสถานะ
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStatus(0)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isStatusActive(0)
                    ? "bg-yellow-100/80 border-yellow-400 shadow-md"
                    : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <p className="text-xs font-medium text-yellow-700">รออนุมัติ</p>
                </div>
                <p className="text-2xl font-bold text-yellow-800">
                  {statusCounts[0].toLocaleString("th-TH")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus(1)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isStatusActive(1)
                    ? "bg-green-100/80 border-green-400 shadow-md"
                    : "bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-medium text-green-700">อนุมัติแล้ว</p>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {statusCounts[1].toLocaleString("th-TH")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus(2)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isStatusActive(2)
                    ? "bg-red-100/80 border-red-400 shadow-md"
                    : "bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-xs font-medium text-red-700">ปฏิเสธ</p>
                </div>
                <p className="text-2xl font-bold text-red-800">
                  {statusCounts[2].toLocaleString("th-TH")}
                </p>
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-72 lg:h-80 mb-6">
            <Bar data={chartData} options={chartOptions} plugins={[valueLabelPlugin]} />
          </div>
        </>
      )}
    </div>
  );
}
