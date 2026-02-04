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

const MEMBER_TYPE_LABELS = {
  all: "ทุกประเภทสมาชิก",
  IC: "ทบ สมทบ-บุคคลธรรมดา IC",
  OC: "สน สามัญ-โรงงาน OC",
  AM: "สส สามัญ-สมาคมการค้า AM",
  AC: "ทน สมทบ-นิติบุคคล AC",
};

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

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatThaiDate = (dateStr) => {
  const date = new Date(dateStr);
  const thaiYear = date.getFullYear() + 543;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${day} ${MONTH_LABELS[month - 1]} ${thaiYear}`;
};

const TYPE_COLORS = {
  IC: "rgba(79, 70, 229, 0.7)", // indigo
  OC: "rgba(16, 185, 129, 0.7)", // emerald
  AM: "rgba(249, 115, 22, 0.7)", // orange
  AC: "rgba(236, 72, 153, 0.7)", // pink
};

export default function MembershipSignupAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Initialize with current year's date range (Jan 1 - Dec 31)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(formatDateForInput(new Date(currentYear, 0, 1)));
  const [endDate, setEndDate] = useState(formatDateForInput(new Date(currentYear, 11, 31)));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          startDate: startDate,
          endDate: endDate,
        });

        if (selectedStatus !== "all") {
          params.set("status", String(selectedStatus));
        }
        const res = await fetch(`/api/admin/analytics/membership-timeline?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
        setData(json.data);
      } catch (e) {
        console.error("Error loading membership timeline stats", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate, selectedStatus]);

  const { series, summary, labels } = useMemo(() => {
    if (!data || !data.days) {
      return {
        series: [],
        summary: {
          dateRange: `${startDate} - ${endDate}`,
          totalPeriod: 0,
          latestCount: 0,
          changePercent: 0,
        },
        labels: [],
      };
    }

    const { days } = data;

    // Calculate date range span in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Aggregate by month if range > 90 days, otherwise show daily
    const aggregateByMonth = daysDiff > 90;

    let aggregatedData = [];
    let aggregatedLabels = [];

    if (aggregateByMonth) {
      // Group by year-month
      const monthlyData = {};
      days.forEach((day) => {
        const monthKey = `${day.year}-${String(day.month).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            year: day.year,
            month: day.month,
            countsByType: { IC: 0, OC: 0, AM: 0, AC: 0 },
          };
        }
        Object.keys(day.countsByType).forEach((type) => {
          monthlyData[monthKey].countsByType[type] += day.countsByType[type];
        });
      });

      // Sort by date
      const sortedMonths = Object.values(monthlyData).sort((a, b) => {
        return a.year !== b.year ? a.year - b.year : a.month - b.month;
      });

      aggregatedData = sortedMonths;
      aggregatedLabels = sortedMonths.map((m) => {
        const thaiYear = m.year + 543;
        return `${MONTH_LABELS[m.month - 1]} ${thaiYear}`;
      });
    } else {
      // Show daily data
      aggregatedData = days;
      aggregatedLabels = days.map((d) => {
        return `${d.day} ${MONTH_LABELS[d.month - 1]}`;
      });
    }

    const getTotalForPeriod = (item) => {
      const counts = item.countsByType || {};
      if (selectedType === "all") {
        return (counts.IC || 0) + (counts.OC || 0) + (counts.AM || 0) + (counts.AC || 0);
      }
      return counts[selectedType] || 0;
    };

    const periodTotals = aggregatedData.map((item) => getTotalForPeriod(item));
    const totalPeriod = periodTotals.reduce((sum, v) => sum + v, 0);

    // Latest non-zero period or last period
    const lastIndexWithData =
      [...periodTotals]
        .map((v, i) => ({ v, i }))
        .reverse()
        .find((x) => x.v > 0)?.i ?? periodTotals.length - 1;
    const latestCount = periodTotals[lastIndexWithData] || 0;
    const prevCount = lastIndexWithData > 0 ? periodTotals[lastIndexWithData - 1] || 0 : 0;
    const changePercent = prevCount > 0 ? ((latestCount - prevCount) / prevCount) * 100 : 0;

    let series;
    if (selectedType === "all") {
      series = [
        {
          label: MEMBER_TYPE_LABELS.all,
          backgroundColor: "rgba(79, 70, 229, 0.85)",
          borderColor: "rgba(55, 48, 163, 1)",
          borderWidth: 2,
          data: periodTotals,
        },
      ];
    } else {
      series = [
        {
          label: MEMBER_TYPE_LABELS[selectedType],
          backgroundColor: TYPE_COLORS[selectedType],
          borderColor: TYPE_COLORS[selectedType],
          borderWidth: 1.5,
          data: periodTotals,
        },
      ];
    }

    return {
      series,
      summary: {
        dateRange: `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`,
        totalPeriod,
        latestCount,
        changePercent,
      },
      labels: aggregatedLabels,
    };
  }, [data, selectedType, startDate, endDate]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: series,
    }),
    [labels, series],
  );

  const perTypeSeries = useMemo(() => {
    if (!data || !data.days) return {};
    const { days } = data;
    const types = ["IC", "OC", "AM", "AC"];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const aggregateByMonth = daysDiff > 90;

    let aggregatedData = [];
    let aggregatedLabels = [];

    if (aggregateByMonth) {
      const monthlyData = {};
      days.forEach((day) => {
        const monthKey = `${day.year}-${String(day.month).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            year: day.year,
            month: day.month,
            countsByType: { IC: 0, OC: 0, AM: 0, AC: 0 },
          };
        }
        Object.keys(day.countsByType).forEach((type) => {
          monthlyData[monthKey].countsByType[type] += day.countsByType[type];
        });
      });

      const sortedMonths = Object.values(monthlyData).sort((a, b) => {
        return a.year !== b.year ? a.year - b.year : a.month - b.month;
      });

      aggregatedData = sortedMonths;
      aggregatedLabels = sortedMonths.map((m) => {
        const thaiYear = m.year + 543;
        return `${MONTH_LABELS[m.month - 1]} ${thaiYear}`;
      });
    } else {
      aggregatedData = days;
      aggregatedLabels = days.map((d) => {
        return `${d.day} ${MONTH_LABELS[d.month - 1]}`;
      });
    }

    const result = {};
    types.forEach((t) => {
      result[t] = {
        labels: aggregatedLabels,
        datasets: [
          {
            label: MEMBER_TYPE_LABELS[t],
            backgroundColor: TYPE_COLORS[t],
            data: aggregatedData.map((item) => item.countsByType?.[t] || 0),
          },
        ],
      };
    });
    return result;
  }, [data, startDate, endDate]);

  const perTypeStats = useMemo(() => {
    if (!data || !data.days) return {};
    const { days } = data;
    const types = ["IC", "OC", "AM", "AC"];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const aggregateByMonth = daysDiff > 90;

    let aggregatedData = [];

    if (aggregateByMonth) {
      const monthlyData = {};
      days.forEach((day) => {
        const monthKey = `${day.year}-${String(day.month).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            year: day.year,
            month: day.month,
            countsByType: { IC: 0, OC: 0, AM: 0, AC: 0 },
          };
        }
        Object.keys(day.countsByType).forEach((type) => {
          monthlyData[monthKey].countsByType[type] += day.countsByType[type];
        });
      });

      aggregatedData = Object.values(monthlyData).sort((a, b) => {
        return a.year !== b.year ? a.year - b.year : a.month - b.month;
      });
    } else {
      aggregatedData = days;
    }

    const stats = {};
    types.forEach((t) => {
      const periodTotals = aggregatedData.map((item) => item.countsByType?.[t] || 0);
      const totalPeriod = periodTotals.reduce((sum, v) => sum + v, 0);

      const lastIndexWithData =
        [...periodTotals]
          .map((v, i) => ({ v, i }))
          .reverse()
          .find((x) => x.v > 0)?.i ?? periodTotals.length - 1;
      const latestCount = periodTotals[lastIndexWithData] || 0;
      const prevCount = lastIndexWithData > 0 ? periodTotals[lastIndexWithData - 1] || 0 : 0;
      const changePercent = prevCount > 0 ? ((latestCount - prevCount) / prevCount) * 100 : 0;

      stats[t] = { totalYear: totalPeriod, latestMonthCount: latestCount, changePercent };
    });

    return stats;
  }, [data, startDate, endDate]);

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

          // วางเลขชิดหัวแท่งมากขึ้น และไม่ดันขึ้นสูงเกินไป
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
      return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    }
    const sc = data.statusCounts;
    return {
      0: Number(sc[0]) || 0,
      1: Number(sc[1]) || 0,
      2: Number(sc[2]) || 0,
      3: Number(sc[3]) || 0,
      4: Number(sc[4]) || 0,
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
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">วิเคราะห์การสมัครสมาชิก</h2>
          <p className="text-sm text-gray-500">
            สถิติการสมัครสมาชิก {summary.dateRange} แยกตามประเภท
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">ช่วงวันที่:</span>
            <input
              type="date"
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-xs text-gray-400">ถึง</span>
            <input
              type="date"
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
          ไม่พบข้อมูลการสมัครสมาชิกในปีนี้
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs font-medium text-indigo-600 mb-1">รวมทั้งช่วง</p>
              <p className="text-2xl font-bold text-indigo-700">
                {summary.totalPeriod.toLocaleString("th-TH")} ราย
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-medium text-emerald-600 mb-1">ช่วงล่าสุด</p>
              <p className="text-2xl font-bold text-emerald-700">
                {summary.latestCount.toLocaleString("th-TH")} ราย
              </p>
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-600 mb-1">
                อัตราการเติบโต (ในช่วงล่าสุด)
              </p>
              <p className={`text-2xl font-bold ${changeColor}`}>
                {summary.changePercent === 0 && summary.latestCount === 0
                  ? "-"
                  : `${changePrefix}${summary.changePercent.toFixed(1)}%`}
              </p>
            </div>
          </div>

          {/* Status breakdown cards (clickable filters) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h3 className="text-lg font-semibold text-gray-800">สถานะการสมัครสมาชิก</h3>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStatus(0)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isStatusActive(0)
                    ? "bg-blue-100/80 border-blue-400 shadow-md"
                    : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <p className="text-xs font-medium text-blue-700">รอรับการพิจารณา</p>
                </div>
                <p className="text-2xl font-bold text-blue-800">
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

              <button
                type="button"
                onClick={() => setSelectedStatus(4)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isStatusActive(4)
                    ? "bg-purple-100/80 border-purple-400 shadow-md"
                    : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <p className="text-xs font-medium text-purple-700">แก้ไขแล้ว (รอตรวจสอบ)</p>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {statusCounts[4].toLocaleString("th-TH")}
                </p>
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-72 lg:h-80 mb-6">
            <Bar data={chartData} options={chartOptions} plugins={[valueLabelPlugin]} />
          </div>

          {/* Small charts for each member type */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">กราฟแยกตามประเภทสมาชิก</h3>
            <p className="text-xs text-gray-500 mb-4">
              ดูแนวโน้มรายเดือนของแต่ละประเภทสมาชิกแยกจากกัน
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["IC", "OC", "AM", "AC"].map((t) => (
                <div
                  key={t}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">{MEMBER_TYPE_LABELS[t]}</p>
                  </div>
                  {perTypeStats[t] && (
                    <div className="mb-2 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
                      <div>
                        <p className="font-medium text-gray-700">รวมทั้งปี</p>
                        <p className="font-semibold text-indigo-700">
                          {perTypeStats[t].totalYear.toLocaleString("th-TH")} ราย
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">เดือนล่าสุด</p>
                        <p className="font-semibold text-emerald-700">
                          {perTypeStats[t].latestMonthCount.toLocaleString("th-TH")} ราย
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">เติบโต</p>
                        <p
                          className={`font-semibold ${
                            perTypeStats[t].changePercent > 0
                              ? "text-emerald-700"
                              : perTypeStats[t].changePercent < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {Number.isFinite(perTypeStats[t].changePercent)
                            ? `${perTypeStats[t].changePercent.toFixed(1)}%`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="h-44">
                    <Bar
                      data={perTypeSeries[t] || { labels: MONTH_LABELS, datasets: [] }}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false },
                        },
                      }}
                      plugins={[valueLabelPlugin]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
