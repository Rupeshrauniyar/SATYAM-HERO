import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BarChart3, Clock3, Loader2, Search as SearchIcon } from "lucide-react";

const statusOrder = ["Pending", "Progress", "Resolved"];

const Insights = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    ward: "all",
    category: "all",
    search: "",
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/report/get`, {
          params: { page: 1, limit: 100 },
        });

        if (response.data?.success) {
          setReports(response.data.Reports || []);
        }
      } catch (error) {
        console.error("Failed to load insights data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const summary = useMemo(() => {
    const statusCounts = statusOrder.reduce((acc, status) => {
      acc[status] = reports.filter((report) => report.status === status).length;
      return acc;
    }, {});

    const last24Hours = reports.filter((report) => {
      const createdAt = new Date(report.createdAt).getTime();
      return Date.now() - createdAt <= 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: reports.length,
      pending: statusCounts.Pending || 0,
      progress: statusCounts.Progress || 0,
      resolved: statusCounts.Resolved || 0,
      last24Hours,
    };
  }, [reports]);

  const categories = useMemo(() => {
    return [...new Set(reports.map((report) => report.category).filter(Boolean))].sort();
  }, [reports]);

  const wards = useMemo(() => {
    return [...new Set(reports.map((report) => String(report.ward_number)).filter(Boolean))].sort(
      (a, b) => Number(a) - Number(b),
    );
  }, [reports]);

  const filteredReports = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus = filters.status === "all" || report.status === filters.status;
      const matchesWard = filters.ward === "all" || String(report.ward_number) === filters.ward;
      const matchesCategory = filters.category === "all" || report.category === filters.category;
      const matchesSearch =
        !search ||
        [report.title, report.description, report.category, String(report.ward_number)]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesWard && matchesCategory && matchesSearch;
    });
  }, [filters, reports]);

  const filteredInsights = useMemo(() => {
    const statusCounts = statusOrder.reduce((acc, status) => {
      acc[status] = filteredReports.filter((report) => report.status === status).length;
      return acc;
    }, {});

    const last24Hours = filteredReports.filter((report) => {
      const createdAt = new Date(report.createdAt).getTime();
      return Date.now() - createdAt <= 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: filteredReports.length,
      pending: statusCounts.Pending || 0,
      progress: statusCounts.Progress || 0,
      resolved: statusCounts.Resolved || 0,
      last24Hours,
    };
  }, [filteredReports]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value !== "all" && value !== "");
  }, [filters]);

  const activeFilterSummary = useMemo(() => {
    const parts = [];
    if (filters.status !== "all") parts.push(filters.status);
    if (filters.ward !== "all") parts.push(`Ward ${filters.ward}`);
    if (filters.category !== "all") parts.push(filters.category);
    if (filters.search.trim()) parts.push(`“${filters.search.trim()}”`);
    return parts.length ? parts.join(" • ") : "All reports";
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 animate-spin text-x-accent" size={28} />
          <p className="text-sm text-x-text-secondary">Loading civic insights…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="x-page-header">
        <div>
          <p className="text-sm text-x-text-secondary">Community overview</p>
          <h1>Insights</h1>
        </div>
        <Link to="/create" className="x-btn x-btn-primary x-btn-sm">
          Report an issue
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="x-panel p-4">
          <p className="text-xs uppercase tracking-wider text-x-text-secondary">Total reports</p>
          <p className="mt-2 text-2xl font-bold">{summary.total}</p>
        </div>
        <div className="x-panel p-4">
          <p className="text-xs uppercase tracking-wider text-x-text-secondary">Filed in 24 hrs</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-violet-500">
            <Clock3 size={18} /> {summary.last24Hours}
          </p>
        </div>
        <div className="x-panel p-4">
          <p className="text-xs uppercase tracking-wider text-x-text-secondary">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-500">{summary.pending}</p>
        </div>
        <div className="x-panel p-4">
          <p className="text-xs uppercase tracking-wider text-x-text-secondary">In progress</p>
          <p className="mt-2 text-2xl font-bold text-sky-500">{summary.progress}</p>
        </div>
        <div className="x-panel p-4">
          <p className="text-xs uppercase tracking-wider text-x-text-secondary">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-500">{summary.resolved}</p>
        </div>
      </div>

      <div className="x-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-x-accent" />
          <h2 className="font-bold text-lg">Filter reports</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-x-text-secondary">
            <span className="mb-1 block">Status</span>
            <select
              value={filters.status}
              onChange={(event) => handleFilterChange("status", event.target.value)}
              className="w-full rounded-xl border border-x-border bg-x-bg-secondary px-3 py-2 text-sm outline-none"
            >
              <option value="all">All statuses</option>
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-x-text-secondary">
            <span className="mb-1 block">Ward</span>
            <select
              value={filters.ward}
              onChange={(event) => handleFilterChange("ward", event.target.value)}
              className="w-full rounded-xl border border-x-border bg-x-bg-secondary px-3 py-2 text-sm outline-none"
            >
              <option value="all">All wards</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  Ward {ward}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-x-text-secondary">
            <span className="mb-1 block">Issue type</span>
            <select
              value={filters.category}
              onChange={(event) => handleFilterChange("category", event.target.value)}
              className="w-full rounded-xl border border-x-border bg-x-bg-secondary px-3 py-2 text-sm outline-none"
            >
              <option value="all">All types</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-x-text-secondary">
            <span className="mb-1 block">Search</span>
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-x-text-secondary" />
              <input
                value={filters.search}
                onChange={(event) => handleFilterChange("search", event.target.value)}
                placeholder="Search title or keyword"
                className="w-full rounded-xl border border-x-border bg-x-bg-secondary pl-9 pr-3 py-2 text-sm outline-none"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="x-panel p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-lg">Filtered insights</h2>
            <p className="text-sm text-x-text-secondary">
              {hasActiveFilters
                ? `Showing ${filteredReports.length} report${filteredReports.length === 1 ? "" : "s"} for ${activeFilterSummary}.`
                : "Showing the full community overview. Use filters to focus the view."}
            </p>
          </div>
          <span className="text-sm text-x-text-secondary">{filteredReports.length} matching</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-x-border bg-x-bg-secondary px-4 py-8 text-center text-sm text-x-text-secondary">
            No reports match the current filters yet.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wider text-x-text-secondary">Filtered total</p>
              <p className="mt-2 text-2xl font-bold">{filteredInsights.total}</p>
            </div>
            <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wider text-x-text-secondary">Filed in 24 hrs</p>
              <p className="mt-2 text-2xl font-bold text-violet-500">{filteredInsights.last24Hours}</p>
            </div>
            <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wider text-x-text-secondary">Pending</p>
              <p className="mt-2 text-2xl font-bold text-amber-500">{filteredInsights.pending}</p>
            </div>
            <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wider text-x-text-secondary">In progress</p>
              <p className="mt-2 text-2xl font-bold text-sky-500">{filteredInsights.progress}</p>
            </div>
            <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-4 md:col-span-2 xl:col-span-4">
              <p className="text-xs uppercase tracking-wider text-x-text-secondary">Current focus</p>
              <p className="mt-2 text-lg font-bold">{hasActiveFilters ? activeFilterSummary : "All reports across the community"}</p>
              <p className="mt-1 text-sm text-x-text-secondary">
                {hasActiveFilters
                  ? "These counts reflect only the reports that match your current selection."
                  : "Select a ward, category, status, or keyword to narrow the view to what matters most."}
              </p>
            </div>
            <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-4 md:col-span-2 xl:col-span-4">
              <p className="text-xs uppercase tracking-wider text-x-text-secondary">Resolved</p>
              <p className="mt-2 text-2xl font-bold text-emerald-500">{filteredInsights.resolved}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
