"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import MemberTypeChart from "./components/MemberTypeChart";
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

const MEMBER_TYPE_LABELS = {
  all: "ทุกประเภทสมาชิก",
  IC: "ทบ สมทบ-บุคคลธรรมดา IC",
  OC: "สน สามัญ-โรงงาน OC",
  AM: "สส สามัญ-สมาคมการค้า AM",
  AC: "ทน สมทบ-นิติบุคคล AC",
};

export default function CompanyLocationAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const now = new Date();
  const [selectedYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(0); // 0 = ม.ค.
  const [endMonth, setEndMonth] = useState(11); // 11 = ธ.ค.
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          year: String(selectedYear),
          startMonth: String(startMonth + 1),
          endMonth: String(endMonth + 1),
          memberType: selectedType,
        });

        const res = await fetch(`/api/admin/analytics/location-timeline?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");

        setData(json.data);
      } catch (e) {
        console.error("Error loading membership location stats", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, startMonth, endMonth, selectedType]);

  const chartData = useMemo(() => {
    if (!data) return null;
    const source = data.byProvince || [];
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
  }, [data, limit]);

  const summary = useMemo(() => {
    if (!data || !data.monthlyTotals) {
      return {
        total: 0,
        latestMonthCount: 0,
        changePercent: 0,
      };
    }

    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);
    const monthTotals = data.monthlyTotals.slice(rangeStart, rangeEnd + 1);

    // Find latest non-zero month in range
    const lastIndexWithData =
      [...monthTotals]
        .map((v, i) => ({ v, i }))
        .reverse()
        .find((x) => x.v > 0)?.i ?? monthTotals.length - 1;

    const latestMonthCount = monthTotals[lastIndexWithData] || 0;
    const prevMonthCount = lastIndexWithData > 0 ? monthTotals[lastIndexWithData - 1] || 0 : 0;
    const changePercent =
      prevMonthCount > 0 ? ((latestMonthCount - prevMonthCount) / prevMonthCount) * 100 : 0;

    return {
      total: data.total || 0,
      latestMonthCount,
      changePercent,
    };
  }, [data, startMonth, endMonth]);

  const provinceRows = useMemo(() => {
    if (!data?.byProvince) return [];
    return data.byProvince
      .map((r) => ({
        name: r.name || "ไม่ระบุ",
        count: r.count || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const pagedRows = useMemo(() => {
    return provinceRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [provinceRows, page, rowsPerPage]);

  const totalPages = Math.ceil(provinceRows.length / rowsPerPage);

  const handleChangePage = (newPage) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

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
      ctx.font = '11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
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
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            วิเคราะห์การสมัครสมาชิกตามจังหวัดที่ตั้งบริษัท
          </h3>
          {data && (
            <p className="text-sm text-gray-500">
              ข้อมูลปี {data.year} ({MEMBER_TYPE_LABELS[selectedType]})
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ประเภทสมาชิก:</span>
            <select
              className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">ทุกประเภทสมาชิก</option>
              <option value="IC">ทบ สมทบ-บุคคลธรรมดา IC</option>
              <option value="OC">สน สามัญ-โรงงาน OC</option>
              <option value="AM">สส สามัญ-สมาคมการค้า AM</option>
              <option value="AC">ทน สมทบ-นิติบุคคล AC</option>
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
          <div className="flex items-center gap-2">
            <select
              aria-label="จำนวนจังหวัดที่แสดง (กราฟ)"
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
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
            <p className="text-xs text-sky-600 font-semibold mb-1">
              ยอดรวมทุกจังหวัด (ในช่วงเดือนที่เลือก)
            </p>
            <p className="text-2xl font-bold text-sky-700">
              {summary.total.toLocaleString("th-TH")}{" "}
              <span className="text-sm font-normal text-gray-500">ราย</span>
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-xs text-emerald-600 font-semibold mb-1">เดือนล่าสุดในช่วง</p>
            <p className="text-2xl font-bold text-emerald-700">
              {summary.latestMonthCount.toLocaleString("th-TH")}{" "}
              <span className="text-sm font-normal text-gray-500">ราย</span>
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-xs text-slate-600 font-semibold mb-1">
              อัตราการเติบโต (ในเดือนล่าสุด)
            </p>
            <p
              className={`text-2xl font-bold ${
                summary.changePercent > 0
                  ? "text-emerald-600"
                  : summary.changePercent < 0
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {summary.changePercent === 0 && summary.latestMonthCount === 0
                ? "-"
                : `${summary.changePercent > 0 ? "+" : ""}${summary.changePercent.toFixed(1)}%`}
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
                  <th className="px-3 py-2 text-right font-medium">จำนวน (ราย)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedRows.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{row.name}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {row.count.toLocaleString("th-TH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">แสดงแถวต่อหน้า:</span>
              <select
                className="text-sm rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-500">(ทั้งหมด {provinceRows.length} จังหวัด)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « ก่อนหน้า
              </button>
              <span className="text-sm text-gray-600">
                หน้า {page + 1} / {totalPages || 1}
              </span>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป »
              </button>
            </div>
          </div>

          {/* Member Type Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-700 mb-3">ประเภทสมาชิก</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-sm text-gray-700">ทบ สมทบ-บุคคลธรรมดา IC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-700">สน สามัญ-โรงงาน OC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-700">สส สามัญ-สมาคมการค้า AM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-sm text-gray-700">ทน สมทบ-นิติบุคคล AC</span>
              </div>
            </div>
          </div>

          {/* 4 Mini Charts by Member Type */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">กราฟแยกตามประเภทสมาชิก</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["IC", "OC", "AM", "AC"].map((type) => (
                <MemberTypeChart
                  key={type}
                  memberType={type}
                  year={selectedYear}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
