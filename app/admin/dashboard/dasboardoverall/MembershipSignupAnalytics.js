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
  OC: "สน สามัญ-โรงงาน",
  AM: "สส สามัญ-สมาคมการค้า",
  AC: "ทน สมทบ-นิติบุคคล",
  IC: "ทบ สมทบ-บุคคลธรรมดา",
};

const MONTH_LABELS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/membership-requests/timeline", { cache: "no-store" });
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
  }, []);

  const { series, summary } = useMemo(() => {
    if (!data) {
      return {
        series: [],
        summary: { year: new Date().getFullYear(), totalYear: 0, latestMonthCount: 0, changePercent: 0 },
      };
    }

    const { year, months } = data;

    const getTotalForMonth = (m) => {
      const counts = m.countsByType || {};
      if (selectedType === "all") {
        return (counts.IC || 0) + (counts.OC || 0) + (counts.AM || 0) + (counts.AC || 0);
      }
      return counts[selectedType] || 0;
    };

    const monthTotals = months.map((m) => getTotalForMonth(m));
    const totalYear = monthTotals.reduce((sum, v) => sum + v, 0);

    // latest non-zero month or last month
    const lastIndexWithData = [...monthTotals].map((v, i) => ({ v, i })).reverse().find((x) => x.v > 0)?.i ?? 11;
    const latestMonthCount = monthTotals[lastIndexWithData] || 0;
    const prevMonthCount = lastIndexWithData > 0 ? monthTotals[lastIndexWithData - 1] || 0 : 0;
    const changePercent = prevMonthCount > 0 ? ((latestMonthCount - prevMonthCount) / prevMonthCount) * 100 : 0;

    let series;
    if (selectedType === "all") {
      // แสดงเฉพาะผลรวมทุกประเภทสมาชิกต่อเดือน เป็นแท่งเดียวที่เห็นชัด
      series = [
        {
          label: MEMBER_TYPE_LABELS.all,
          backgroundColor: "rgba(79, 70, 229, 0.85)",
          borderColor: "rgba(55, 48, 163, 1)",
          borderWidth: 2,
          data: monthTotals,
        },
      ];
    } else {
      // แสดงเฉพาะประเภทที่เลือก
      series = [
        {
          label: MEMBER_TYPE_LABELS[selectedType],
          backgroundColor: TYPE_COLORS[selectedType],
          borderColor: TYPE_COLORS[selectedType],
          borderWidth: 1.5,
          data: monthTotals,
        },
      ];
    }

    return {
      series,
      summary: { year, totalYear, latestMonthCount, changePercent },
    };
  }, [data, selectedType]);

  const chartData = useMemo(
    () => ({
      labels: MONTH_LABELS,
      datasets: series,
    }),
    [series],
  );

  const perTypeSeries = useMemo(() => {
    if (!data) return {};
    const { months } = data;
    const types = ["IC", "OC", "AM", "AC"];

    const result = {};
    types.forEach((t) => {
      result[t] = {
        labels: MONTH_LABELS,
        datasets: [
          {
            label: MEMBER_TYPE_LABELS[t],
            backgroundColor: TYPE_COLORS[t],
            data: months.map((m) => m.countsByType?.[t] || 0),
          },
        ],
      };
    });
    return result;
  }, [data]);

  const perTypeStats = useMemo(() => {
    if (!data) return {};
    const { months } = data;
    const types = ["IC", "OC", "AM", "AC"];

    const stats = {};
    types.forEach((t) => {
      const monthTotals = months.map((m) => m.countsByType?.[t] || 0);
      const totalYear = monthTotals.reduce((sum, v) => sum + v, 0);

      const lastIndexWithData = [...monthTotals]
        .map((v, i) => ({ v, i }))
        .reverse()
        .find((x) => x.v > 0)?.i ?? 11;
      const latestMonthCount = monthTotals[lastIndexWithData] || 0;
      const prevMonthCount = lastIndexWithData > 0 ? monthTotals[lastIndexWithData - 1] || 0 : 0;
      const changePercent = prevMonthCount > 0 ? ((latestMonthCount - prevMonthCount) / prevMonthCount) * 100 : 0;

      stats[t] = { totalYear, latestMonthCount, changePercent };
    });

    return stats;
  }, [data]);

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
      ctx.font = "11px system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
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

  const changeColor = summary.changePercent > 0 ? "text-emerald-600" : summary.changePercent < 0 ? "text-red-600" : "text-gray-500";
  const changePrefix = summary.changePercent > 0 ? "+" : "";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">วิเคราะห์การสมัครสมาชิก</h2>
          <p className="text-sm text-gray-500">สถิติการสมัครสมาชิกปี {summary.year} แยกตามประเภทและเดือน</p>
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
              <p className="text-xs font-medium text-slate-600 mb-1">อัตราการเติบโต (ในเดือนล่าสุด)</p>
              <p className={`text-2xl font-bold ${changeColor}`}>
                {changePrefix}
                {Number.isFinite(summary.changePercent)
                  ? summary.changePercent.toFixed(1)
                  : "0"}
                %
              </p>
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
              {(["IC", "OC", "AM", "AC"]).map((t) => (
                <div
                  key={t}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">
                      {MEMBER_TYPE_LABELS[t]}
                    </p>
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
