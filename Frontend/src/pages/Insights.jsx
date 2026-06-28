import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "../utils/translations";

const statusOrder = ["Pending", "Progress", "Resolved"];

const STATUS_STYLE = {
  Pending:  { bar: "bg-amber-400",   text: "text-amber-500",   label: "pending"  },
  Progress: { bar: "bg-sky-400",     text: "text-sky-500",     label: "progress" },
  Resolved: { bar: "bg-emerald-400", text: "text-emerald-500", label: "resolved" },
};

const Insights = () => {
  const t = useTranslation();
  const [summary, setSummary] = useState({ total: 0, pending: 0, progress: 0, resolved: 0, last24Hours: 0 });
  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all", ward: "all", category: "all" });

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/report/insights`, {
          params: {
            status:   filters.status   !== "all" ? filters.status   : undefined,
            ward:     filters.ward     !== "all" ? filters.ward     : undefined,
            category: filters.category !== "all" ? filters.category : undefined,
          },
        });
        if (response.data?.success) {
          setSummary(response.data.summary || {});
          setCategories(response.data.filters?.categories || []);
          setWards(response.data.filters?.wards || []);
        }
      } catch (err) {
        console.error("Failed to load insights data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [filters]);

  const hasFilters = useMemo(
    () => Object.values(filters).some((v) => v !== "all"),
    [filters],
  );

  const clearFilters = () => setFilters({ status: "all", ward: "all", category: "all" });
  const handleFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const pct = summary.total
    ? {
        Pending:  (summary.pending  / summary.total) * 100,
        Progress: (summary.progress / summary.total) * 100,
        Resolved: (summary.resolved / summary.total) * 100,
      }
    : { Pending: 33, Progress: 33, Resolved: 34 };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-x-accent" size={24} />
      </div>
    );
  }

  const statKeys = [
    { key: "total",    value: summary.total,      colorClass: "text-x-text",      labelKey: "total"    },
    { key: "pending",  value: summary.pending,    colorClass: "text-amber-500",   labelKey: "pending"  },
    { key: "progress", value: summary.progress,   colorClass: "text-sky-500",     labelKey: "progress" },
    { key: "resolved", value: summary.resolved,   colorClass: "text-emerald-500", labelKey: "resolved" },
  ];

  return (
    <div className="px-4 py-5 md:px-6 space-y-4 text-x-text">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-x-text-secondary">{t("community")}</p>
          <h1 className="text-xl font-semibold leading-tight">{t("insights")}</h1>
        </div>
        <Link
          to="/create"
          className="rounded-xl bg-x-accent px-3 py-1.5 text-xs font-semibold text-x-text-on-accent transition hover:opacity-90"
        >
          + {t("reportIssue")}
        </Link>
      </div>
    <div className="rounded-2xl border border-x-border bg-x-bg-secondary px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
      

          {/* Ward */}
          <select
            value={filters.ward}
            onChange={(e) => handleFilterChange("ward", e.target.value)}
            className="rounded-xl border border-x-border bg-x-bg px-3 py-1.5 text-xs text-x-text outline-none focus:border-x-accent"
          >
            <option value="all">{t("allWards")}</option>
            {wards.map((w) => (
              <option key={w} value={w}>{t("ward")} {w}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="rounded-xl border border-x-border bg-x-bg px-3 py-1.5 text-xs text-x-text outline-none focus:border-x-accent"
          >
            <option value="all">{t("allTypes")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 rounded-xl border border-x-border bg-x-bg px-2.5 py-1.5 text-xs text-x-text-secondary hover:text-x-text transition-colors"
            >
              <X size={11} /> {t("clearFilters")}
            </button>
          )}
        </div>
      </div>
      {/* ── Stat row ── */}
      <div className="grid grid-cols-4 gap-2">
        {statKeys.map(({ key, value, colorClass, labelKey }) => (
          <div
            key={key}
            className="rounded-2xl border border-x-border bg-x-bg-secondary px-3 py-8 text-center"
          >
            <p className={`text-xl font-bold tabular-nums leading-none ${colorClass}`}>{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-x-text-secondary">{t(labelKey)}</p>
          </div>
        ))}
      </div>

      {/* ── Resolution bar ── */}
      <div className="rounded-2xl border border-x-border bg-x-bg-secondary px-4 py-6 space-y-2">
        <div className="flex gap-0.5 h-1.5 w-full overflow-hidden rounded-full">
          {statusOrder.map((s) => (
            <div
              key={s}
              className={`${STATUS_STYLE[s].bar} transition-all duration-700`}
              style={{ width: `${pct[s]}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusOrder.map((s) => (
              <span key={s} className={`flex items-center gap-1 text-[11px] font-medium ${STATUS_STYLE[s].text}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s].bar}`} />
                {t(STATUS_STYLE[s].label)}
              </span>
            ))}
          </div>
          {summary.last24Hours > 0 && (
            <span className="text-[11px] text-x-text-secondary">
              +{summary.last24Hours} {t("today")}
            </span>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
  
    </div>
  );
};

export default Insights;