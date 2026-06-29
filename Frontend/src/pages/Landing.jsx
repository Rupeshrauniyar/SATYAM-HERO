import { useState, useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "File reports",
    desc: "Describe the issue, pick a category, attach a photo. Your report lands directly with the responsible department.",
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Track status",
    desc: "Every report moves through Pending → In Progress → Resolved. You see exactly where it stands, always.",
  },
  {
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
    title: "Vote and comment",
    desc: "Upvote issues that affect you. High-vote reports surface automatically. Leave updates as things develop.",
  },
  {
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    title: "Get notified",
    desc: "Authorities push status updates directly to you. No need to refresh — your phone buzzes when something changes.",
  },
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    title: "Search reports",
    desc: "Browse by ward, category, or keyword. See what neighbours have already filed before you submit a duplicate.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Ward dashboards",
    desc: "Each ward has a public dashboard. Resolution rate, backlog size, average response time — open to every citizen.",
  },
];

const REPORTS = [
  {
    id: "RPT-1042",
    ward: "Ward 4",
    title: "Broken streetlight on Tokha Road",
    status: "resolved",
    votes: 34,
    time: "2 days ago",
    cat: "Infrastructure",
  },
  {
    id: "RPT-1078",
    ward: "Ward 9",
    title: "Sewage overflow near Biratnagar market",
    status: "in-progress",
    votes: 61,
    time: "5 hours ago",
    cat: "Sanitation",
  },
  {
    id: "RPT-1091",
    ward: "Ward 2",
    title: "Pothole at Buddhanagar crossing",
    status: "pending",
    votes: 18,
    time: "Just now",
    cat: "Roads",
  },
];

const STATUS = {
  resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  pending: {
    label: "Pending",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-400",
  },
};

function Icon({ path, className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function ReportCard({ report, delay = 0 }) {
  const s = STATUS[report.status];
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium tracking-wide">{report.id}</span>
          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{report.ward}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-3 leading-snug">{report.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">{report.cat}</span>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            </svg>
            {report.votes}
          </span>
          <span>{report.time}</span>
        </div>
      </div>
    </div>
  );
}

function HeroMockup() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 2400);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { label: "Pending", dot: "bg-indigo-400", bar: "bg-indigo-400", w: "16%", text: "text-indigo-700", bg: "bg-indigo-50" },
    { label: "In progress", dot: "bg-amber-400", bar: "bg-amber-400", w: "55%", text: "text-amber-700", bg: "bg-amber-50" },
    { label: "Resolved", dot: "bg-emerald-500", bar: "bg-emerald-500", w: "100%", text: "text-emerald-700", bg: "bg-emerald-50" },
  ];
  const s = steps[step];

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xl shadow-slate-200">
      {/* Browser bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ background: c }} className="w-2.5 h-2.5 rounded-full" />
          ))}
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 ml-2">
          civicreport.np/reports
        </div>
      </div>

      {/* App header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-white text-sm font-bold tracking-tight">CivicReport</span>
        </div>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Alert */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-start gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 font-medium leading-snug">Ward 9: Road repair crew scheduled for Monday</p>
        </div>

        {/* Report card */}
        <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">RPT-1078 · Ward 9</span>
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-500 ${s.bg} ${s.text}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${s.dot}`} />
              {s.label}
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-800 mb-3 leading-snug">
            Sewage overflow near Biratnagar market
          </p>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between mb-1.5">
              {["Pending", "In progress", "Resolved"].map((l, i) => (
                <span key={l} className={`text-[10px] font-semibold transition-colors duration-500 ${i <= step ? "text-gray-700" : "text-gray-300"}`}>
                  {l}
                </span>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-in-out ${s.bar}`}
                style={{ width: s.w }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                </svg>
                61
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                12
              </span>
            </div>
            <span className="text-[10px] text-gray-400">Share</span>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-around pt-3 mt-3 border-t border-gray-100">
          {[
            { label: "Home", active: false },
            { label: "Reports", active: true },
            { label: "Alerts", active: false },
            { label: "Insights", active: false },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <div className={`w-5 h-1 rounded-full ${item.active ? "bg-amber-400" : "bg-transparent"}`} />
              <span className={`text-[10px] font-semibold ${item.active ? "text-slate-900" : "text-gray-300"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CivicReportLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const ids = ["features", "how-it-works", "live-reports", "insights"];
      let cur = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 100) cur = id;
      }
      setActiveSection(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    if (!id) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Features", section: "features" },
    { label: "How it works", section: "how-it-works" },
    { label: "Live reports", section: "live-reports" },
    { label: "Insights", section: "insights" },
  ];

  return (
    <div className="font-sans bg-white text-slate-900 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; }
      `}</style>

      {/* NAV */}
      <nav className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${scrolled ? "border-b border-gray-200 shadow-sm" : "border-b border-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => { scrollTo(null); setMenuOpen(false); }} className="flex items-center gap-2.5 cursor-pointer border-none bg-transparent p-0">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">CivicReport</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = activeSection === l.section;
              return (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.section)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer ${
                    active ? "bg-slate-100 text-slate-900" : "text-slate-500 bg-transparent hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a href="/signin" className="px-4 py-2 text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg hover:border-slate-400 transition-colors no-underline">
              Sign in
            </a>
            <a href="/" className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors no-underline">
              File a report
            </a>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white"
          >
            {menuOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => { scrollTo(l.section); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 border-none bg-transparent cursor-pointer"
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2">
              <a href="/signin" className="w-full text-center py-3 text-sm font-semibold text-slate-700 border border-gray-200 rounded-xl no-underline">
                Sign in
              </a>
              <a href="/" className="w-full text-center py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl no-underline">
                File a report
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-amber-50/30 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 mb-7">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-800 tracking-widest uppercase">Biratnagar Metropolitan City</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.04] tracking-tight text-slate-900 mb-6">
              Your ward.<br />
              <span className="text-amber-400">Your voice.</span><br />
              Their duty.
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-md">
              CivicReport connects residents across all 20 wards directly with local authorities. File issues, track resolution, and hold your government accountable — in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/" className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-7 py-4 rounded-xl hover:bg-slate-700 transition-colors text-base no-underline">
                File a report
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <button
                onClick={() => scrollTo("features")}
                className="inline-flex items-center gap-2 bg-white text-slate-700 font-semibold px-7 py-4 rounded-xl border border-gray-200 hover:border-slate-400 transition-colors text-base cursor-pointer"
              >
                Explore features
              </button>
            </div>
          </div>
          <div className="w-full md:w-auto md:flex-shrink-0 flex justify-center">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* DARK BAND — no fake numbers, just message */}
      <section className="bg-slate-900 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-2xl font-bold text-white mb-1">Built for Biratnagar. Open to everyone.</p>
            <p className="text-slate-400 text-base">All 20 wards covered. Free for citizens. No account needed to browse.</p>
          </div>
          <a href="/" className="shrink-0 inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-amber-300 transition-colors no-underline text-sm">
            Get started
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
              <span className="text-xs font-bold text-blue-700 tracking-widest uppercase">Platform</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Everything civic accountability needs</h2>
            <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed">
              Not a generic platform. Built for Biratnagar's wards, residents, and the way local government actually works.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-slate-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 mb-4">
              <span className="text-xs font-bold text-violet-700 tracking-widest uppercase">How it works</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Three steps. One solved problem.</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-base leading-relaxed">
              From spotting an issue to watching it get fixed — all traceable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(100%/6)] right-[calc(100%/6)] h-px bg-gray-200" />
            {[
              {
                n: "01",
                title: "Spot and report",
                desc: "Open CivicReport, select your ward, pick a category, and describe the issue. Attach a photo if you have one. Takes under two minutes.",
                accent: "bg-blue-50 text-blue-700 border-blue-100",
              },
              {
                n: "02",
                title: "Community amplifies",
                desc: "Other residents upvote the issue. High-vote reports get escalated automatically to the right department — pressure from the whole ward, not just one person.",
                accent: "bg-amber-50 text-amber-700 border-amber-100",
              },
              {
                n: "03",
                title: "Authorities resolve",
                desc: "The department updates status as they work. You get notified at every stage. The record stays public so the community can see what was done.",
                accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
              },
            ].map((step) => (
              <div key={step.n} className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 text-xl font-black ${step.accent}`}>
                  {step.n}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE REPORTS */}
      <section id="live-reports" className="px-6 py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">Live reports</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">What citizens are filing today</h2>
            </div>
            <a href="/" className="shrink-0 text-sm font-semibold text-slate-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:border-slate-400 transition-colors no-underline">
              View all reports →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REPORTS.map((r, i) => (
              <ReportCard key={r.id} report={r} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section id="insights" className="px-6 py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 rounded-full px-3 py-1 mb-5">
              <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Ward insights</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-5 tracking-tight">
              Data that makes silence impossible
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
              Each ward has a public dashboard showing its open backlog, how fast reports are being resolved, and which categories keep coming back. Anyone can see how their ward is performing — no login needed.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Resolution rate by ward — updated in real time",
                "Average days from report filed to status change",
                "Most reported categories per ward per month",
                "Open backlog: how many reports are still waiting",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center mt-0.5 shrink-0">
                    <svg className="w-2.5 h-2.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <a href="/" className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-amber-300 transition-colors no-underline text-sm">
              View ward insights
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Insight card — no fake numbers, just structure */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Ward 9 · This month</p>
                  <h3 className="text-base font-bold text-slate-900">Monthly overview</h3>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <span className="text-xs font-bold text-emerald-700">Improving</span>
                </div>
              </div>

              {/* Bars — unlabeled, just visual */}
              <div className="space-y-3 mb-5">
                {[
                  { label: "Total reports", fill: "bg-blue-400", pct: "100%" },
                  { label: "Resolved", fill: "bg-emerald-400", pct: "68%" },
                  { label: "In progress", fill: "bg-amber-400", pct: "21%" },
                  { label: "Pending", fill: "bg-indigo-300", pct: "11%" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.fill}`} style={{ width: row.pct }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Resolution rate and response time are calculated from verified status changes logged by the assigned department.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-7">
            <svg className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-5">
            Your city improves<br />when citizens speak up.
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10">
            Join residents across all 20 wards who are filing reports, tracking resolutions, and making their voice heard.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-700 transition-colors no-underline text-base">
              File your first report
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <button
              onClick={() => scrollTo(null)}
              className="inline-flex items-center gap-2 text-slate-700 border border-gray-200 font-semibold px-8 py-4 rounded-xl hover:border-slate-400 transition-colors text-base bg-white cursor-pointer"
            >
              Explore the app
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-6">Free for all citizens · No account needed to browse reports</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 px-6 pt-14 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-bold text-base text-white">CivicReport</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Civic accountability for Biratnagar Metropolitan City. All 20 wards, one platform.
              </p>
            </div>
            <div className="flex flex-wrap gap-12">
              {[
                {
                  heading: "Platform",
                  links: [
                    { l: "Browse reports", href: "/" },
                    { l: "File a report", href: "/" },
                    { l: "Ward insights", href: "#insights" },
                    { l: "Search", href: "/" },
                  ],
                },
                {
                  heading: "Account",
                  links: [
                    { l: "Sign in", href: "/signin" },
                    { l: "My reports", href: "/" },
                    { l: "For authorities", href: "/" },
                  ],
                },
                {
                  heading: "Info",
                  links: [
                    { l: "How it works", href: "#how-it-works" },
                    { l: "Features", href: "#features" },
                    { l: "Privacy", href: "/privacy" },
                    { l: "About", href: "/about" },
                  ],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">{col.heading}</p>
                  <div className="flex flex-col gap-3">
                    {col.links.map((item) => (
                      <a
                        key={item.l}
                        href={item.href}
                        onClick={(e) => {
                          if (item.href.startsWith("#")) { e.preventDefault(); scrollTo(item.href.slice(1)); }
                        }}
                        className="text-sm text-slate-400 hover:text-white transition-colors no-underline"
                      >
                        {item.l}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between gap-3">
            <p className="text-xs text-slate-500">© 2025 CivicReport · Biratnagar Metropolitan City, Koshi Province, Nepal</p>
            <p className="text-xs text-slate-500">Serving the people of Biratnagar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}