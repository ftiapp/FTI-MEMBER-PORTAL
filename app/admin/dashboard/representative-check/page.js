"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";

export default function RepresentativeCheckPage() {
  const [reasonText, setReasonText] = useState("");
  const [reasonId, setReasonId] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(true);
  const [isReasonSaving, setIsReasonSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const pageSize = 10;

  const [logs, setLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const logsPageSize = 5;
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    pageSize: logsPageSize,
    total: 0,
    totalPages: 1,
  });

  const [logFilterUser, setLogFilterUser] = useState("");
  const [logFilterTerm, setLogFilterTerm] = useState("");
  const [logFilterDateFrom, setLogFilterDateFrom] = useState("");
  const [logFilterDateTo, setLogFilterDateTo] = useState("");

  const searchCacheRef = useRef({});
  const logsCacheRef = useRef({});
  const SEARCH_CACHE_TTL = 30 * 60 * 1000;
  const LOGS_CACHE_TTL = 2 * 24 * 60 * 60 * 1000;

  const canUsePage = useMemo(() => !!reasonId, [reasonId]);

  const memberTypeMeta = useMemo(
    () => [
      { code: "11", short: "สน", label: "สามัญ-โรงงาน" },
      { code: "12", short: "สส", label: "สามัญ-สมาคมการค้า" },
      { code: "21", short: "ทน", label: "สมทบ-นิติบุคคล" },
      { code: "22", short: "ทบ", label: "สมทบ-บุคคลธรรมดา" },
    ],
    [],
  );

  const memberTypeLabelByCode = useMemo(() => {
    const map = {};
    for (const mt of memberTypeMeta) {
      map[String(mt.code)] = `${mt.short} - ${mt.label}`;
    }
    return map;
  }, [memberTypeMeta]);

  useEffect(() => {
    let cancelled = false;
    const q = searchQuery.trim();

    if (!canUsePage || q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setIsSuggestLoading(true);
        const res = await fetch(
          `/api/admin/representative-check/suggest?q=${encodeURIComponent(q)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "ไม่สามารถดึง suggestion ได้");
        }
        if (!cancelled) {
          setSuggestions(Array.isArray(data.data) ? data.data : []);
          setShowSuggestions(true);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!cancelled) setIsSuggestLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery, canUsePage]);

  const fetchLogs = async (forceRefresh = false, filters = {}, page = 1) => {
    const { user = "", term = "", from = "", to = "" } = filters;
    const cacheKey = `${user}__${term}__${from}__${to}__${page}`;
    const now = Date.now();

    const cached = logsCacheRef.current[cacheKey];
    if (!forceRefresh && cached && now - cached.timestamp < LOGS_CACHE_TTL) {
      setLogs(cached.data);
      setLogsPagination(cached.pagination);
      setLogsPage(cached.pagination?.page || page);
      setIsLogsLoading(false);
      return;
    }

    try {
      setIsLogsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(logsPageSize),
      });
      if (user) params.set("user", user);
      if (term) params.set("term", term);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/admin/representative-check/log?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "ไม่สามารถดึงข้อมูลประวัติการค้นหาได้");
      }

      const logsData = Array.isArray(data.data) ? data.data : [];
      const pagination = data.pagination || {
        page,
        pageSize: logsPageSize,
        total: logsData.length,
        totalPages: 1,
      };

      logsCacheRef.current[cacheKey] = { data: logsData, pagination, timestamp: now };
      setLogs(logsData);
      setLogsPagination(pagination);
      setLogsPage(pagination.page || page);
    } catch (error) {
      console.error("fetchLogs error:", error);
      toast.error("ไม่สามารถดึงข้อมูลประวัติการค้นหาได้");
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(false, { user: logFilterUser, term: logFilterTerm, from: logFilterDateFrom, to: logFilterDateTo }, 1);
  }, []);

  const handleLogFilter = () => {
    fetchLogs(true, { user: logFilterUser, term: logFilterTerm, from: logFilterDateFrom, to: logFilterDateTo }, 1);
  };

  const clearLogFilters = () => {
    setLogFilterUser("");
    setLogFilterTerm("");
    setLogFilterDateFrom("");
    setLogFilterDateTo("");
    fetchLogs(true, {}, 1);
  };

  const fetchSearchPage = async ({ query, page, shouldToast }) => {
    const cacheKey = `${query}__${page}`;
    const now = Date.now();
    const cached = searchCacheRef.current[cacheKey];
    if (cached && now - cached.timestamp < SEARCH_CACHE_TTL) {
      setSearchResult(cached.data);
      setSearchPage(cached.data?.page || page);
      setShowSuggestions(false);
      if (shouldToast) toast.success("ค้นหาเรียบร้อยแล้ว");
      return;
    }

    const res = await fetch(
      `/api/admin/representative-check/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "ค้นหาไม่สำเร็จ");
    }

    searchCacheRef.current[cacheKey] = { data: data.data, timestamp: now };
    setSearchResult(data.data || null);
    setSearchPage(data.data?.page || page);
    setShowSuggestions(false);
    if (shouldToast) toast.success("ค้นหาเรียบร้อยแล้ว");
  };

  const saveReason = async () => {
    const text = reasonText.trim();
    if (!text) {
      toast.error("กรุณาระบุเหตุผล");
      return;
    }

    try {
      setIsReasonSaving(true);
      const res = await fetch("/api/admin/representative-check/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonText: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "บันทึกเหตุผลไม่สำเร็จ");
      }
      setReasonId(data.data?.id || true);
      setShowReasonModal(false);
      toast.success("บันทึกเหตุผลเรียบร้อยแล้ว");
    } catch (error) {
      console.error("saveReason error:", error);
      toast.error(error.message || "บันทึกเหตุผลไม่สำเร็จ");
    } finally {
      setIsReasonSaving(false);
    }
  };

  const submitSearch = async (e) => {
    e?.preventDefault?.();

    if (!canUsePage) {
      toast.error("กรุณาระบุเหตุผลก่อนใช้งาน");
      setShowReasonModal(true);
      return;
    }

    const q = searchQuery.trim();
    if (!q) {
      toast.error("กรุณากรอกคำค้นหา");
      return;
    }

    try {
      setIsSearching(true);
      setSearchPage(1);

      // Save log (MySQL)
      const res = await fetch("/api/admin/representative-check/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery: q, reasonId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "บันทึก log ไม่สำเร็จ");
      }

      // Query result (MSSQL)
      await fetchSearchPage({ query: q, page: 1, shouldToast: true });
      await fetchLogs(true, { user: logFilterUser, term: logFilterTerm, from: logFilterDateFrom, to: logFilterDateTo }, 1);
    } catch (error) {
      console.error("submitSearch error:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก log");
    } finally {
      setIsSearching(false);
    }
  };

  const goToPage = async (nextPage) => {
    const q = searchQuery.trim();
    if (!q || !searchResult) return;
    try {
      setIsSearching(true);
      await fetchSearchPage({ query: q, page: nextPage, shouldToast: false });
    } catch (error) {
      console.error("goToPage error:", error);
      toast.error(error.message || "ไม่สามารถเปลี่ยนหน้าได้");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (value) => {
    setSearchQuery(value);
    setShowSuggestions(false);
  };

  const logsTotalPages = Number(logsPagination?.totalPages || 1);
  const logsCurrentPage = Number(logsPagination?.page || logsPage || 1);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-7 h-7 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            ตรวจสอบผู้แทน
          </h2>
          <p className="text-sm text-gray-500 mt-1">ค้นหาข้อมูลผู้แทนจากฐานข้อมูลสมาชิก</p>
        </div>

        <form onSubmit={submitSearch} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหาชื่อผู้แทน</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                disabled={!canUsePage || isSearching}
                placeholder="พิมพ์ชื่อผู้แทน..."
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
              />

              {showSuggestions && (isSuggestLoading || suggestions.length > 0) && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {isSuggestLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">กำลังค้นหา...</div>
                  ) : (
                    <ul className="max-h-56 overflow-y-auto">
                      {suggestions.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            onClick={() => selectSuggestion(s)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!canUsePage || isSearching}
              title="ค้นหา"
              className="p-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-sm hover:shadow-md transition-all"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-white" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </div>
          {!canUsePage && (
            <div className="mt-2 text-xs text-red-600">
              กรุณาระบุเหตุผลก่อนเข้าใช้งานระบบตรวจสอบผู้แทน
            </div>
          )}
        </form>

        {searchResult && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
              <div className="text-sm text-blue-900 mb-4">
                <div className="font-semibold text-lg">สรุปผลการค้นหา</div>
                <div className="mt-1">คำค้นหา: <span className="font-medium">{searchResult.query}</span></div>
                <div>จำนวนบริษัทที่พบ: <span className="font-bold text-blue-700">{searchResult.totalCompanies}</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {memberTypeMeta.map((mt) => {
                  const count = Number(searchResult?.counts?.byMemberType?.[mt.code] || 0);
                  return (
                    <div key={mt.code} className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-blue-600">{mt.short}</div>
                      <div className="text-sm text-gray-600 mt-1">{mt.label}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto shadow-md rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      เลขสมาชิก
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      ชื่อบริษัท
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      ชื่อผู้แทน
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      ผู้แทนลำดับที่
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      ประเภทสมาชิก
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(searchResult.items || []).length === 0 ? (
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  ) : (
                    (searchResult.items || []).map((row, idx) => (
                      <tr key={`${row.memberCode}-${idx}`} className={`transition-all duration-200 hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`https://membersearch.fti.or.th/member/${row.memberCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {row.memberCode}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.companyName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.representativeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {row.representativeOrder ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {row.memberTypeCode != null
                            ? memberTypeLabelByCode[String(row.memberTypeCode)] || String(row.memberTypeCode)
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                หน้า <span className="font-semibold">{searchResult.page || searchPage}</span> / {searchResult.totalPages || 1}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, (searchResult.page || searchPage) - 1))}
                  disabled={isSearching || (searchResult.page || searchPage) <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                >
                  ก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(searchResult.totalPages || 1, (searchResult.page || searchPage) + 1))}
                  disabled={
                    isSearching ||
                    (searchResult.totalPages || 1) <= 1 ||
                    (searchResult.page || searchPage) >= (searchResult.totalPages || 1)
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ประวัติการค้นหา
            </h3>
            <button
              type="button"
              onClick={() => fetchLogs(true, { user: logFilterUser, term: logFilterTerm, from: logFilterDateFrom, to: logFilterDateTo }, logsCurrentPage)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              รีเฟรช
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ผู้ใช้งาน</label>
                <input
                  type="text"
                  value={logFilterUser}
                  onChange={(e) => setLogFilterUser(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogFilter()}
                  placeholder="ค้นหาชื่อผู้ใช้งาน..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">คำค้นหา</label>
                <input
                  type="text"
                  value={logFilterTerm}
                  onChange={(e) => setLogFilterTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogFilter()}
                  placeholder="ค้นหาคำค้นหา..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  value={logFilterDateFrom}
                  onChange={(e) => setLogFilterDateFrom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogFilter()}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  value={logFilterDateTo}
                  onChange={(e) => setLogFilterDateTo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogFilter()}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLogFilter}
                  title="ค้นหา"
                  className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={clearLogFilters}
                  title="ล้างตัวกรอง"
                  className="p-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto shadow-md rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    ผู้ใช้งาน
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    คำค้นหา
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider min-w-[200px]">
                    เหตุผล
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    เวลา
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLogsLoading ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                        กำลังโหลด...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                      ยังไม่มีประวัติการค้นหา
                    </td>
                  </tr>
                ) : (
                  logs.map((row, idx) => (
                    <tr key={row.id} className={`transition-all duration-200 hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.admin_username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row.search_query}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="whitespace-pre-wrap break-words">
                          {row.reason_text || <span className="text-gray-400 italic">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.created_at ? new Date(row.created_at).toLocaleString("th-TH") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logsTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                หน้า <span className="font-semibold">{logsCurrentPage}</span> / {logsTotalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchLogs(
                      false,
                      { user: logFilterUser, term: logFilterTerm, from: logFilterDateFrom, to: logFilterDateTo },
                      Math.max(1, logsCurrentPage - 1),
                    )
                  }
                  disabled={isLogsLoading || logsCurrentPage <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                >
                  ก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fetchLogs(
                      false,
                      { user: logFilterUser, term: logFilterTerm, from: logFilterDateFrom, to: logFilterDateTo },
                      Math.min(logsTotalPages, logsCurrentPage + 1),
                    )
                  }
                  disabled={isLogsLoading || logsCurrentPage >= logsTotalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {showReasonModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ระบุเหตุผล</h3>
              <div className="mt-1 text-sm text-gray-600">
                ท่านจะต้องระบุเหตุผลในการเข้าใช้งาน ระบบตรวจสอบผู้แทนก่อนเข้าใช้งาน ตามนโยบาย
                สภาอุตสาหกรรมแห่งประเทศไทย
              </div>
            </div>

            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700">เหตุผลในการใช้งาน</label>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="กรุณาระบุเหตุผล..."
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={saveReason}
                disabled={isReasonSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isReasonSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
