import { useState, useEffect, useRef } from "react";

/* ─── DATA ─────────────────────────────────────────────── */
const FEATURES = [
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, title: "Submit Reports", desc: "Citizens of every ward in Biratnagar can file infrastructure issues, sanitation problems, and civic complaints directly to authorities.", color: "#3B82F6", bg: "#EFF6FF" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, title: "Live Status Tracking", desc: "Follow every report through Pending → In Progress → Resolved. Real-time visibility into what your local government is actually working on.", color: "#10B981", bg: "#ECFDF5" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, title: "Vote & Comment", desc: "Upvote urgent issues to push them up the priority queue. Leave comments, share updates, and build community pressure where it matters.", color: "#F59E0B", bg: "#FFFBEB" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>, title: "Instant Alerts", desc: "Government-pushed notifications land in the app the moment an authority updates a status, posts a response, or issues a civic alert.", color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, title: "Search Reports", desc: "Search by ward number, issue category, or keyword. Find reports near you or browse what your neighbours have already filed.", color: "#0F1F3D", bg: "#F0F4FF" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: "Civic Insights", desc: "Ward-level dashboards show resolution rates, average response time, and the most reported categories — data that holds authorities accountable.", color: "#EF4444", bg: "#FEF2F2" },
];

const STATS = [
  { value: "20", suffix: "+", label: "Wards Covered" },
  { value: "500", suffix: "+", label: "Reports Filed" },
  { value: "72", suffix: "%", label: "Resolution Rate" },
  { value: "48", suffix: "h", label: "Avg. Response Time" },
];

const REPORTS = [
  { id: "RPT-1042", ward: "Ward 4", title: "Broken streetlight on Tokha Road", status: "resolved", votes: 34, time: "2 days ago", cat: "Infrastructure", catColor: "#3B82F6" },
  { id: "RPT-1078", ward: "Ward 9", title: "Sewage overflow near Biratnagar market", status: "in-progress", votes: 61, time: "5 hours ago", cat: "Sanitation", catColor: "#10B981" },
  { id: "RPT-1091", ward: "Ward 2", title: "Pothole at Buddhanagar crossing", status: "pending", votes: 18, time: "Just now", cat: "Roads", catColor: "#F59E0B" },
];

const STATUS_CONFIG = {
  resolved: { label: "Resolved", color: "#059669", bg: "#D1FAE5", dot: "#10B981" },
  "in-progress": { label: "In Progress", color: "#D97706", bg: "#FEF3C7", dot: "#F59E0B" },
  pending: { label: "Pending", color: "#6366F1", bg: "#EEF2FF", dot: "#818CF8" },
};

/* ─── NAV CONFIG ────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",        href: "/",            section: null },
  { label: "Features",    href: "#features",    section: "features" },
  { label: "How It Works",href: "#how-it-works",section: "how-it-works" },
  { label: "Live Reports",href: "#live-reports", section: "live-reports" },
  { label: "Insights",    href: "#insights",    section: "insights" },
];

/* ─── HELPERS ───────────────────────────────────────────── */
function scrollTo(id) {
  if (!id) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  const el = document.getElementById(id);
  if (el) {
    const offset = 70;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

/* ─── ANIMATED COUNTER ──────────────────────────────────── */
function AnimatedCounter({ value, suffix, duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const target = parseInt(value);
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── REPORT CARD ───────────────────────────────────────── */
function ReportCard({ report, delay = 0 }) {
  const s = STATUS_CONFIG[report.status];
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div ref={ref} style={{ background:"var(--color-x-bg-elevated)", border:"1px solid var(--color-x-border)", borderRadius:14, padding:"18px 20px", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(18px)", transition:"opacity 0.5s ease, transform 0.5s ease", boxShadow:"0 2px 8px var(--color-x-sheet-shadow)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, color:"var(--color-x-text-secondary)", fontWeight:500, letterSpacing:"0.04em" }}>{report.id}</span>
          <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:"var(--color-x-bg-secondary)", color:"var(--color-x-text)" }}>{report.ward}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"3px 10px", borderRadius:99, background:s.bg, color:s.color, fontWeight:600 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:s.dot }} />
          {s.label}
        </div>
      </div>
      <p style={{ fontSize:14, fontWeight:600, color:"var(--color-x-text)", margin:"0 0 10px", lineHeight:1.4 }}>{report.title}</p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:`${report.catColor}18`, color:report.catColor, fontWeight:600 }}>{report.cat}</span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:12, color:"var(--color-x-text-muted)", display:"flex", alignItems:"center", gap:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            {report.votes}
          </span>
          <span style={{ fontSize:11, color:"var(--color-x-text-muted)" }}>{report.time}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── HERO MOCKUP ───────────────────────────────────────── */
function HeroMockup() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 3), 2200);
    return () => clearInterval(timer);
  }, []);
  const steps = [
    { label:"Pending",     color:"#6366F1", bg:"#EEF2FF", dot:"#818CF8" },
    { label:"In Progress", color:"#D97706", bg:"#FEF3C7", dot:"#F59E0B" },
    { label:"Resolved",    color:"#059669", bg:"#D1FAE5", dot:"#10B981" },
  ];
  const s = steps[step];
  return (
    <div style={{ background:"var(--color-x-bg-elevated)", borderRadius:20, border:"1px solid var(--color-x-border)", boxShadow:"0 20px 60px rgba(15,31,61,0.12), 0 4px 16px var(--color-x-sheet-shadow)", overflow:"hidden", width:"100%", maxWidth:420 }}>
      <div style={{ background:"var(--color-x-bg-secondary)", borderBottom:"1px solid var(--color-x-border)", padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", gap:5 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
        </div>
        <div style={{ flex:1, background:"#F3F4F6", borderRadius:6, padding:"4px 10px", fontSize:11, color:"#9CA3AF", marginLeft:8 }}>CivicReport.np/reports</div>
      </div>
      <div style={{ background:"var(--color-x-primary)", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"var(--color-x-accent)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <span style={{ color:"var(--color-x-text-on-primary)", fontWeight:700, fontSize:14 }}>CivicReport</span>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-x-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--color-x-accent)22", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:11, color:"var(--color-x-accent)", fontWeight:700 }}>NP</span>
          </div>
        </div>
      </div>
      <div style={{ padding:"20px" }}>
        <div style={{ background:"var(--color-x-bg-secondary)", border:"1px solid var(--color-x-border)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#3B82F6", flexShrink:0 }} />
          <span style={{ fontSize:12, color:"#1D4ED8", fontWeight:500 }}>Alert from Ward 9: Road repair begins Monday</span>
        </div>
        <div style={{ border:"1px solid var(--color-x-border)", borderRadius:12, padding:"14px 16px", background:"var(--color-x-bg)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, color:"#6B7280", fontWeight:500 }}>RPT-1078 · Ward 9</span>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, background:s.bg, color:s.color, transition:"all 0.4s ease" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:s.dot, transition:"background 0.4s" }} />
              {s.label}
            </div>
          </div>
          <p style={{ fontSize:13, fontWeight:600, color:"#0F1F3D", margin:"0 0 12px" }}>Sewage overflow near Biratnagar market</p>
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              {["Pending","In Progress","Resolved"].map((label, i) => (
                <span key={label} style={{ fontSize:10, fontWeight:600, color:i<=step?"#0F1F3D":"#9CA3AF", transition:"color 0.4s" }}>{label}</span>
              ))}
            </div>
            <div style={{ height:4, background:"#E5E7EB", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:step===0?"16%":step===1?"55%":"100%", background:s.dot, borderRadius:99, transition:"width 0.6s ease, background 0.4s ease" }} />
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:12 }}>
              {[{ label:"61", icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> }, { label:"12", icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }].map((btn,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6B7280" }}>{btn.icon}{btn.label}</div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#9CA3AF" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </div>
          </div>
        </div>
          <div style={{ display:"flex", justifyContent:"space-around", paddingTop:16, borderTop:"1px solid var(--color-x-border)", marginTop:16 }}>
          {[{label:"Home",active:false},{label:"Reports",active:true},{label:"Alerts",active:false},{label:"Insights",active:false}].map(item => (
            <div key={item.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <div style={{ width:20, height:4, borderRadius:99, background:item.active?"#F59E0B":"transparent" }} />
              <span style={{ fontSize:10, color:item.active?"#0F1F3D":"#9CA3AF", fontWeight:item.active?700:400 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── HAMBURGER ICON ────────────────────────────────────── */
function HamburgerIcon({ open }) {
  return (
    <div style={{ width:22, height:16, position:"relative", cursor:"pointer" }}>
      {/* Top bar */}
      <span style={{
        position:"absolute", left:0, width:"100%", height:2, background:"#0F1F3D", borderRadius:2,
        top: open ? "50%" : 0,
        transform: open ? "translateY(-50%) rotate(45deg)" : "none",
        transition:"top 0.25s 0.1s ease, transform 0.25s ease, opacity 0.2s ease",
      }} />
      {/* Middle bar */}
      <span style={{
        position:"absolute", left:0, width:"100%", height:2, background:"#0F1F3D", borderRadius:2,
        top:"50%", transform:"translateY(-50%)",
        opacity: open ? 0 : 1,
        transition:"opacity 0.15s ease",
      }} />
      {/* Bottom bar */}
      <span style={{
        position:"absolute", left:0, width:"100%", height:2, background:"#0F1F3D", borderRadius:2,
        bottom: open ? "50%" : 0,
        transform: open ? "translateY(50%) rotate(-45deg)" : "none",
        transition:"bottom 0.25s 0.1s ease, transform 0.25s ease, opacity 0.2s ease",
      }} />
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────── */
export default function CivicReportLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  /* close menu on resize to desktop */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* close menu on body scroll */
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* nav shadow on scroll + active section highlight */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const sections = ["features","how-it-works","live-reports","insights"];
      let current = null;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 120) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMenuOpen(false);
    if (link.section === null) {
      window.location.href = link.href;
    } else {
      scrollTo(link.section);
    }
  };

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:"#fff", color:"#0F1F3D", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        .btn-primary {
          background: #0F1F3D; color: #fff; border: none; border-radius: 10px;
          padding: 14px 28px; font-size: 15px; font-weight: 600; cursor: pointer;
          transition: transform 0.15s, background 0.15s, box-shadow 0.15s;
          font-family: inherit; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: #1a3360; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,31,61,0.25); }

        .btn-secondary {
          background: #fff; color: #0F1F3D; border: 1.5px solid #D1D5DB; border-radius: 10px;
          padding: 13px 28px; font-size: 15px; font-weight: 600; cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
          font-family: inherit; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-secondary:hover { border-color: #0F1F3D; transform: translateY(-1px); }

        .feature-card { transition: transform 0.2s, box-shadow 0.2s; }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(15,31,61,0.1); }

        /* desktop nav link active indicator */
        .nav-link-active { color: #0F1F3D !important; font-weight: 600 !important; }
        .nav-link-active::after {
          content: ''; display: block; height: 2px; background: #F59E0B;
          border-radius: 99px; margin-top: 2px;
        }

        /* mobile menu overlay */
        .mobile-overlay {
          position: fixed; inset: 0; z-index: 98;
          background: rgba(15,31,61,0.3);
          backdrop-filter: blur(2px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .mobile-overlay.open { opacity: 1; pointer-events: auto; }

        /* mobile menu drawer */
        .mobile-drawer {
          position: fixed; top: 64px; left: 0; right: 0; z-index: 99;
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          box-shadow: 0 8px 32px rgba(15,31,61,0.12);
          transform: translateY(-8px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease;
        }
        .mobile-drawer.open { transform: translateY(0); opacity: 1; pointer-events: auto; }

        .mobile-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 15px 20px; font-size: 15px; font-weight: 500;
          color: #374151; text-decoration: none; border-bottom: 1px solid #F3F4F6;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
        }
        .mobile-nav-item:hover { background: #F8FAFC; color: #0F1F3D; }
        .mobile-nav-item.active-mobile { color: #0F1F3D; font-weight: 700; }
        .mobile-nav-item .nav-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #E5E7EB; flex-shrink: 0;
          transition: background 0.15s;
        }
        .mobile-nav-item.active-mobile .nav-dot { background: #F59E0B; }
        .mobile-nav-item:hover .nav-dot { background: #CBD5E1; }

        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .hero-grid { flex-direction: column !important; }
          .hero-mockup-wrap { display: none !important; }
          .hero-text h1 { font-size: 40px !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .reports-grid { grid-template-columns: 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .insights-flex { flex-direction: column !important; }
          .insights-card { width: 100% !important; }
        }
        @media (max-width: 560px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .hero-text h1 { font-size: 30px !important; }
          .section-heading { font-size: 28px !important; }
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
        backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${scrolled?"#E5E7EB":"#F3F4F6"}`,
        boxShadow: scrolled ? "0 2px 12px rgba(15,31,61,0.07)" : "none",
        transition:"box-shadow 0.3s, border-color 0.3s",
        padding:"0 24px",
      }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>

          {/* Logo */}
          <a href="/" onClick={e => { e.preventDefault(); scrollTo(null); setMenuOpen(false); }} style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:34, height:34, background:"#0F1F3D", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <span style={{ fontWeight:800, fontSize:17, letterSpacing:"-0.03em", color:"#0F1F3D" }}>CivicReport</span>
          </a>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display:"flex", alignItems:"center", gap:6 }}>
            {NAV_LINKS.map(link => {
              const isActive = link.section ? activeSection === link.section : !activeSection;
              return (
                <a key={link.label} href={link.href}
                  onClick={e => handleNavClick(e, link)}
                  className={isActive ? "nav-link-active" : ""}
                  style={{ fontSize:14, fontWeight:500, color: isActive ? "#0F1F3D" : "#4B5563", textDecoration:"none", padding:"6px 12px", borderRadius:8, transition:"color 0.15s, background 0.15s", position:"relative" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="#F8FAFC"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="nav-cta-desktop" style={{ display:"flex", gap:8, alignItems:"center" }}>
            <a href="/signin" className="btn-secondary" style={{ padding:"8px 16px", fontSize:14 }}>Sign In</a>
            <a href="/signup" className="btn-secondary" style={{ padding:"8px 16px", fontSize:14, borderColor:"#0F1F3D20" }}>Sign Up</a>
            <a href="/" className="btn-primary" style={{ padding:"9px 18px", fontSize:14 }}>File a Report</a>
          </div>

          {/* Hamburger */}
          <button
            className="hamburger-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display:"none", alignItems:"center", justifyContent:"center",
              width:40, height:40, background:"none", border:"1px solid #E5E7EB",
              borderRadius:10, cursor:"pointer", padding:0, flexShrink:0,
              transition:"border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#0F1F3D"; e.currentTarget.style.background="#F8FAFC"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.background="none"; }}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY ──────────────────────────────────── */}
      <div className={`mobile-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

      {/* ── MOBILE DRAWER ───────────────────────────────────── */}
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div style={{ padding:"8px 0" }}>
          {NAV_LINKS.map(link => {
            const isActive = link.section ? activeSection === link.section : !activeSection;
            return (
              <a key={link.label} href={link.href}
                onClick={e => handleNavClick(e, link)}
                className={`mobile-nav-item ${isActive ? "active-mobile" : ""}`}
              >
                <div className="nav-dot" />
                {link.label}
                {isActive && <span style={{ marginLeft:"auto", fontSize:11, color:"#F59E0B", fontWeight:700 }}>●</span>}
              </a>
            );
          })}
        </div>

        {/* Mobile auth + CTA */}
        <div style={{ padding:"16px 20px 20px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <a href="/signin" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px 0", fontSize:14, fontWeight:600, color:"#0F1F3D", textDecoration:"none", border:"1.5px solid #D1D5DB", borderRadius:10, background:"#fff", transition:"border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#0F1F3D"}
              onMouseLeave={e => e.currentTarget.style.borderColor="#D1D5DB"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In
            </a>
            <a href="/signup" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px 0", fontSize:14, fontWeight:600, color:"#fff", textDecoration:"none", border:"none", borderRadius:10, background:"#0F1F3D" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Sign Up
            </a>
          </div>
          <a href="/" className="btn-primary" style={{ justifyContent:"center", fontSize:15, padding:"13px 0" }}>
            File a Report
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section id="home" style={{ background:"linear-gradient(160deg,#F8FAFF 0%,#FFF9EF 100%)", padding:"80px 24px 80px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div className="hero-grid" style={{ display:"flex", alignItems:"center", gap:60 }}>
            <div className="hero-text" style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:99, padding:"6px 14px", marginBottom:28 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#F59E0B" }} />
                <span style={{ fontSize:12, fontWeight:600, color:"#92400E", letterSpacing:"0.04em" }}>BIRATNAGAR METROPOLITAN CITY</span>
              </div>
              <h1 style={{ fontSize:56, fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em", margin:"0 0 24px", color:"#0F1F3D" }}>
                Your ward.<br />
                <span style={{ color:"#F59E0B" }}>Your voice.</span><br />
                Their duty.
              </h1>
              <p style={{ fontSize:18, color:"#4B5563", lineHeight:1.7, margin:"0 0 36px", maxWidth:480, fontWeight:400 }}>
                CivicReport connects citizens of all 20 wards directly with local authorities. File civic issues, track resolution in real-time, and hold your government accountable — all in one place.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:48 }}>
                <a href="/" className="btn-primary" style={{ fontSize:16, padding:"15px 32px" }}>
                  File a Report
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
                <a href="/" className="btn-secondary" onClick={e => { e.preventDefault(); scrollTo("features"); }} style={{ fontSize:16, padding:"15px 32px" }}>
                  Explore App
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </a>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <div style={{ display:"flex" }}>
                  {["#F59E0B","#3B82F6","#10B981","#8B5CF6","#EF4444"].map((c,i) => (
                    <div key={c} style={{ width:30, height:30, borderRadius:"50%", background:c, border:"2px solid #fff", marginLeft:i===0?0:-8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:"flex", gap:1, marginBottom:2 }}>
                    {[...Array(5)].map((_,i) => <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <span style={{ fontSize:12, color:"#6B7280" }}>Trusted by <strong style={{ color:"#0F1F3D" }}>500+ citizens</strong> across all wards</span>
                </div>
              </div>
            </div>
            <div className="hero-mockup-wrap" style={{ flex:"0 0 auto", display:"flex", justifyContent:"center" }}>
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section style={{ background:"#0F1F3D", padding:"48px 24px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:44, fontWeight:900, color:"#F59E0B", letterSpacing:"-0.03em", lineHeight:1 }}>
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:14, color:"#94A3B8", marginTop:6, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" style={{ padding:"96px 24px", background:"#F8FAFC" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#EFF6FF", borderRadius:99, padding:"5px 14px", marginBottom:16 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#1D4ED8", letterSpacing:"0.06em" }}>PLATFORM FEATURES</span>
            </div>
            <h2 className="section-heading" style={{ fontSize:42, fontWeight:900, letterSpacing:"-0.03em", margin:"0 0 16px" }}>Everything civic democracy<br />needs to work</h2>
            <p style={{ fontSize:17, color:"#6B7280", maxWidth:520, margin:"0 auto", lineHeight:1.7 }}>Built specifically for Biratnagar's 20 wards — not a generic platform, a tool that understands your city.</p>
          </div>
          <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card" style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:16, padding:"28px 24px" }}>
                <div style={{ width:46, height:46, borderRadius:12, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", color:f.color, marginBottom:18 }}>{f.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:700, margin:"0 0 10px", letterSpacing:"-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize:14, color:"#6B7280", lineHeight:1.65, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding:"96px 24px", background:"#fff" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F5F3FF", borderRadius:99, padding:"5px 14px", marginBottom:16 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#7C3AED", letterSpacing:"0.06em" }}>HOW IT WORKS</span>
            </div>
            <h2 className="section-heading" style={{ fontSize:42, fontWeight:900, letterSpacing:"-0.03em", margin:"0 0 16px" }}>Three steps. One solved problem.</h2>
            <p style={{ fontSize:17, color:"#6B7280", maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>From spotting an issue to watching it get fixed — all traceable.</p>
          </div>
          <div className="how-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32, position:"relative" }}>
            <div style={{ position:"absolute", top:36, left:"calc(100%/6)", right:"calc(100%/6)", height:1, background:"#E5E7EB", zIndex:0 }} />
            {[
              { step:"01", title:"Spot & Report", desc:"Open CivicReport, select your ward, pick a category, and describe the issue. Attach a photo if you have one.", color:"#3B82F6", bg:"#EFF6FF" },
              { step:"02", title:"Community Amplifies", desc:"Other residents upvote the issue. High-vote reports get escalated automatically to the right department.", color:"#F59E0B", bg:"#FFFBEB" },
              { step:"03", title:"Authorities Resolve", desc:"The department updates the status as they work on it. You get notified at every stage until it's resolved.", color:"#10B981", bg:"#ECFDF5" },
            ].map(item => (
              <div key={item.step} style={{ position:"relative", zIndex:1 }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:item.bg, border:`2px solid ${item.color}22`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
                  <span style={{ fontSize:18, fontWeight:900, color:item.color }}>{item.step}</span>
                </div>
                <h3 style={{ fontSize:20, fontWeight:800, margin:"0 0 12px", letterSpacing:"-0.02em" }}>{item.title}</h3>
                <p style={{ fontSize:15, color:"#6B7280", lineHeight:1.65, margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE REPORTS ────────────────────────────────────── */}
      <section id="live-reports" style={{ padding:"96px 24px", background:"#F8FAFC" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#ECFDF5", borderRadius:99, padding:"5px 14px", marginBottom:14 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981" }} />
                <span style={{ fontSize:12, fontWeight:700, color:"#065F46", letterSpacing:"0.06em" }}>LIVE REPORTS</span>
              </div>
              <h2 className="section-heading" style={{ fontSize:36, fontWeight:900, letterSpacing:"-0.03em", margin:0 }}>What citizens are filing today</h2>
            </div>
            <a href="/" className="btn-secondary">View all reports →</a>
          </div>
          <div className="reports-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
            {REPORTS.map((report,i) => <ReportCard key={report.id} report={report} delay={i*100} />)}
          </div>
        </div>
      </section>

      {/* ── INSIGHTS ────────────────────────────────────────── */}
      <section id="insights" style={{ padding:"96px 24px", background:"#0F1F3D" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div className="insights-flex" style={{ display:"flex", gap:64, alignItems:"center" }}>
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F59E0B22", borderRadius:99, padding:"5px 14px", marginBottom:20 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#F59E0B", letterSpacing:"0.06em" }}>WARD INSIGHTS</span>
              </div>
              <h2 className="section-heading" style={{ fontSize:40, fontWeight:900, letterSpacing:"-0.03em", color:"#fff", margin:"0 0 20px", lineHeight:1.1 }}>Data that makes silence impossible</h2>
              <p style={{ fontSize:16, color:"#94A3B8", lineHeight:1.7, margin:"0 0 36px" }}>Every ward gets its own dashboard. Resolution rates, pending backlogs, average response times — publicly visible so every citizen can see exactly how their ward performs.</p>
              <a href="/" className="btn-primary" style={{ background:"#F59E0B", color:"#0F1F3D" }}>
                View ward insights
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
            <div className="insights-card" style={{ flex:"0 0 auto", width:340 }}>
              <div style={{ background:"#fff", borderRadius:20, padding:"24px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.06em", margin:"0 0 4px" }}>WARD 9 · JUNE 2025</p>
                    <h3 style={{ fontSize:16, fontWeight:800, margin:0 }}>Monthly Overview</h3>
                  </div>
                  <div style={{ background:"#ECFDF5", padding:"6px 12px", borderRadius:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#059669" }}>↑ 14% resolved</span>
                  </div>
                </div>
                {[
                  { label:"Total Reports", value:43, pct:100, color:"#3B82F6" },
                  { label:"Resolved",      value:31, pct:72,  color:"#10B981" },
                  { label:"In Progress",   value:8,  pct:19,  color:"#F59E0B" },
                  { label:"Pending",       value:4,  pct:9,   color:"#6366F1" },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:13, color:"#4B5563", fontWeight:500 }}>{row.label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#0F1F3D" }}>{row.value}</span>
                    </div>
                    <div style={{ height:6, background:"#F3F4F6", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${row.pct}%`, background:row.color, borderRadius:99 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:16, marginTop:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    {[{val:"2.1d",label:"Avg response"},{val:"72%",label:"Resolution rate"},{val:"61",label:"Upvotes cast"}].map(item => (
                      <div key={item.label} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:900, color:"#0F1F3D" }}>{item.val}</div>
                        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding:"96px 24px", background:"#fff", textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ width:72, height:72, background:"#0F1F3D", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#F59E0B"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <h2 className="section-heading" style={{ fontSize:48, fontWeight:900, letterSpacing:"-0.03em", margin:"0 0 20px", lineHeight:1.05 }}>
            Your city improves<br />when citizens speak up.
          </h2>
          <p style={{ fontSize:18, color:"#6B7280", lineHeight:1.7, margin:"0 0 44px" }}>
            Join thousands of residents across Biratnagar's 20 wards who are already filing reports, tracking resolutions, and making their voice heard.
          </p>
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:14 }}>
            <a href="/" className="btn-primary" style={{ fontSize:17, padding:"17px 36px" }}>
              File your first report
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="/" className="btn-secondary" onClick={e => { e.preventDefault(); scrollTo(null); }} style={{ fontSize:17, padding:"17px 36px" }}>
              Explore the app
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </a>
          </div>
          <p style={{ fontSize:13, color:"#9CA3AF", marginTop:24 }}>Free for all citizens · No account required to browse reports</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background:"#0F1F3D", padding:"48px 24px 32px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:32, marginBottom:40 }}>
            <div style={{ maxWidth:280 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:34, height:34, background:"#F59E0B", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0F1F3D"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </div>
                <span style={{ fontWeight:800, fontSize:17, color:"#fff" }}>CivicReport</span>
              </div>
              <p style={{ fontSize:14, color:"#64748B", lineHeight:1.65 }}>Civic accountability for Biratnagar Metropolitan City. All 20 wards, one platform.</p>
            </div>
            <div style={{ display:"flex", gap:48, flexWrap:"wrap" }}>
              {[
                { heading:"Platform", links:[{l:"Browse Reports",h:"/"},{l:"File a Report",h:"/"},{l:"Ward Insights",h:"#insights"},{l:"Search",h:"/"}] },
                { heading:"Account",  links:[{l:"Sign In",h:"/signin"},{l:"Sign Up",h:"/signup"},{l:"My Reports",h:"/"},{l:"For Authorities",h:"/"}] },
                { heading:"Info",     links:[{l:"How it works",h:"#how-it-works"},{l:"Features",h:"#features"},{l:"Privacy",h:"/privacy"},{l:"About",h:"/about"}] },
              ].map(col => (
                <div key={col.heading}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#94A3B8", letterSpacing:"0.06em", margin:"0 0 14px" }}>{col.heading.toUpperCase()}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {col.links.map(item => (
                      <a key={item.l} href={item.h}
                        onClick={e => { if(item.h.startsWith("#")){ e.preventDefault(); scrollTo(item.h.slice(1)); } }}
                        style={{ fontSize:14, color:"#64748B", textDecoration:"none", transition:"color 0.15s" }}
                        onMouseEnter={e => e.target.style.color="#fff"}
                        onMouseLeave={e => e.target.style.color="#64748B"}
                      >{item.l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid #1E3A5F", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:13, color:"#475569", margin:0 }}>© 2025 CivicReport · Biratnagar Metropolitan City, Koshi Province, Nepal</p>
            <span style={{ fontSize:12, color:"#475569" }}>Serving the people of Biratnagar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}