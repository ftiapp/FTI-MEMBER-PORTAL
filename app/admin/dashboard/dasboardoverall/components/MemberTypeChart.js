"use client";
import { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";

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
  IC: "ทบ สมทบ-บุคคลธรรมดา IC",
  OC: "สน สามัญ-โรงงาน OC",
  AM: "สส สามัญ-สมาคมการค้า AM",
  AC: "ทน สมทบ-นิติบุคคล AC",
};

const MEMBER_TYPE_COLORS = {
  IC: "rgba(99, 102, 241, 0.7)", // indigo
  OC: "rgba(16, 185, 129, 0.7)", // emerald
  AM: "rgba(251, 146, 60, 0.7)", // orange
  AC: "rgba(236, 72, 153, 0.7)", // pink
};

export default function MemberTypeChart({ memberType, year, startMonth, endMonth }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          year: String(year),
          startMonth: String(startMonth + 1),
          endMonth: String(endMonth + 1),
          memberType: memberType,
        });
        const res = await fetch(`/api/admin/analytics/location-timeline?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
        setData(json.data);
      } catch (e) {
        console.error(`Error loading ${memberType} chart:`, e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberType, year, startMonth, endMonth]);

  const summary = useMemo(() => {
    if (!data || !data.monthlyTotals) {
      return { total: 0, latestMonthCount: 0, changePercent: 0 };
    }

    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);
    const monthTotals = data.monthlyTotals.slice(rangeStart, rangeEnd + 1);

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

  const chartData = useMemo(() => {
    if (!data || !data.monthlyTotals) return null;

    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);
    const monthTotals = data.monthlyTotals.slice(rangeStart, rangeEnd + 1);
    const labels = MONTH_LABELS.slice(rangeStart, rangeEnd + 1);

    return {
      labels,
      datasets: [
        {
          label: MEMBER_TYPE_LABELS[memberType],
          data: monthTotals,
          backgroundColor: MEMBER_TYPE_COLORS[memberType],
        },
      ],
    };
  }, [data, memberType, startMonth, endMonth]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw || 0} ราย`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: (value) => value.toLocaleString("th-TH"),
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 h-64 flex items-center justify-center">
        <p className="text-sm text-red-700">เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  if (!data || !chartData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 h-64 flex items-center justify-center">
        <p className="text-sm text-gray-600">ไม่พบข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-semibold text-gray-800">{MEMBER_TYPE_LABELS[memberType]}</h5>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div>
          <p className="text-gray-600">รวม</p>
          <p className="font-bold text-gray-800">{summary.total.toLocaleString("th-TH")}</p>
        </div>
        <div>
          <p className="text-gray-600">ล่าสุด</p>
          <p className="font-bold text-emerald-700">
            {summary.latestMonthCount.toLocaleString("th-TH")}
          </p>
        </div>
        <div>
          <p className="text-gray-600">เติบโต</p>
          <p
            className={`font-bold ${
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
      <div className="h-48">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
