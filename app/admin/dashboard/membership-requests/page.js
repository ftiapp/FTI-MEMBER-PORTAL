'use client';

import { useState, useEffect } from 'react';

import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import ApplicationStats from './components/ApplicationStats';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationsTable from './components/ApplicationsTable';
import Pagination from './components/common/Pagination';
import LoadingSpinner from './components/common/LoadingSpinner';
import EmptyState from './components/common/EmptyState';
import { normalizeApplicationData } from './ีutils/dataTransformers';

export default function MembershipRequestsManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [stats, setStats] = useState(null);

  // Restore state from URL query or sessionStorage on first mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams;
      const hasAnyQuery = ['page', 'status', 'type', 'search', 'sortOrder'].some(k => q.has(k));

      // Always read session snapshot as fallback for any missing fields
      let snapshot = null;
      try {
        const raw = sessionStorage.getItem('mr:listState');
        snapshot = raw ? JSON.parse(raw) : null;
      } catch {}

      if (hasAnyQuery) {
        // URL query has priority per-field; missing fields fall back to snapshot
        const statusQ = q.get('status');
        const typeQ = q.get('type');
        const searchQ = q.get('search');
        const sortQ = q.get('sortOrder');
        const pageQ = q.get('page');

        setStatusFilter(statusQ || snapshot?.statusFilter || 'pending');
        setTypeFilter(typeQ || snapshot?.typeFilter || 'all');
        if (typeof searchQ === 'string') setSearchTerm(searchQ);
        else if (typeof snapshot?.searchTerm === 'string') setSearchTerm(snapshot.searchTerm);
        setSortOrder(sortQ || snapshot?.sortOrder || 'desc');
        const p = parseInt(pageQ || String(snapshot?.currentPage || '1'), 10);
        if (!Number.isNaN(p) && p > 0) setCurrentPage(p);
      } else {
        // Otherwise, restore entirely from snapshot
        if (snapshot) {
          if (snapshot.statusFilter) setStatusFilter(snapshot.statusFilter);
          if (snapshot.typeFilter) setTypeFilter(snapshot.typeFilter);
          if (typeof snapshot.searchTerm === 'string') setSearchTerm(snapshot.searchTerm);
          if (snapshot.sortOrder) setSortOrder(snapshot.sortOrder);
          if (typeof snapshot.currentPage === 'number' && snapshot.currentPage > 0) setCurrentPage(snapshot.currentPage);
        }
      }
    } catch (e) {
      // noop on SSR or parse errors
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [currentPage, statusFilter, typeFilter, sortOrder]);

  // Persist state to sessionStorage (so Back can restore)
  useEffect(() => {
    try {
      const state = {
        statusFilter,
        typeFilter,
        searchTerm,
        currentPage,
        sortOrder,
      };
      sessionStorage.setItem('mr:listState', JSON.stringify(state));
    } catch {}
  }, [statusFilter, typeFilter, searchTerm, currentPage, sortOrder]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        type: typeFilter,
        search: searchTerm,
        sortOrder
      });
      
      const response = await fetch(`/api/admin/membership-requests?${params}`,
        {
          method: 'GET',
          credentials: 'include', // ensure admin cookies are sent
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );
      
      if (!response.ok) {
        let message = 'Failed to fetch applications';
        try {
          const errData = await response.json();
          if (errData?.message) message = errData.message;
        } catch {}
        throw new Error(`${message} (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      if (data.success) {
        const normalized = (data.data || []).map(app => 
          normalizeApplicationData(app, app.type)
        );
        setApplications(normalized);
        setFilteredApplications(normalized);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / itemsPerPage) || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(error?.message || 'ไม่สามารถดึงข้อมูลการสมัครสมาชิกได้');
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/membership-requests/stats', {
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch stats');
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Keep showing per-page fallback in ApplicationStats if stats not available
      setStats(null);
    }
  };

  const handleToggleDateSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (newFilter) => {
    setTypeFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchApplications();
  };

  // Optional: reflect state into URL (without full reload), so deep-linking preserves filters
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams;
      q.set('status', statusFilter);
      q.set('type', typeFilter);
      q.set('sortOrder', sortOrder);
      q.set('page', String(currentPage));
      if (searchTerm) {
        q.set('search', searchTerm);
      } else {
        q.delete('search');
      }
      const newUrl = `${url.pathname}?${q.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch {}
  }, [statusFilter, typeFilter, searchTerm, currentPage, sortOrder]);

  const handleClickStatusCard = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-blue-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">จัดการคำขอสมาชิกใหม่</h1>
          <p className="text-blue-700">ตรวจสอบและอนุมัติคำขอสมัครสมาชิกทุกประเภท</p>
        </div>

        {/* Stats (uses backend totals when available) */}
        <ApplicationStats
          applications={applications}
          stats={stats}
          currentStatus={statusFilter}
          onClickStatus={handleClickStatusCard}
        />

        {/* Filters */}
        <ApplicationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilterChange}
        />

        {/* Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredApplications.length === 0 ? (
          <EmptyState message="ไม่พบข้อมูลการสมัครสมาชิก" />
        ) : (
          <>
            <ApplicationsTable
              applications={filteredApplications}
              sortOrder={sortOrder}
              onToggleDateSort={handleToggleDateSort}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}