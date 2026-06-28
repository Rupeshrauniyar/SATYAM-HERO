import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Link2,
  Copy,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";

function buildShareUrl(reportId) {
  const envBase = import.meta.env.VITE_MAIN_URL || "";
  const origin = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
  const base = (envBase || origin).replace(/\/$/, "");
  return `${base}/?report=${reportId}`;
}

function buildShareText(report) {
  return `${report?.title}${report?.description ? ` — ${report.description.slice(0, 80)}` : ""}`;
}

const SHARE_OPTIONS = [
  {
    id: "copy",
    label: "Copy link",
    sub: "Copy to clipboard",
    bg: "bg-x-bg-secondary",
    icon: Copy,
    iconColor: "text-x-text",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "Share via chat",
    bg: "bg-[#25D366]/10",
    icon: null,
    iconColor: "text-[#25D366]",
    letter: "W",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    sub: "Post to timeline",
    bg: "bg-x-primary/10",
    icon: null,
    iconColor: "text-x-primary",
    letter: "𝕏",
  },
  {
    id: "telegram",
    label: "Telegram",
    sub: "Send to contacts",
    bg: "bg-[#0088cc]/10",
    icon: null,
    iconColor: "text-[#0088cc]",
    letter: "T",
  },
  {
    id: "facebook",
    label: "Facebook",
    sub: "Share on feed",
    bg: "bg-[#1877F2]/10",
    icon: null,
    iconColor: "text-[#1877F2]",
    letter: "f",
  },
  {
    id: "native",
    label: "More apps",
    sub: "System share menu",
    bg: "bg-x-accent/10",
    icon: Share2,
    iconColor: "text-x-accent",
  },
];

export default function ShareSheet({ report, open, onClose, onShared }) {
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setCopied(false);
      setToast("");
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
        setCopied(false);
        setToast("");
      }, 320);
      document.body.style.overflow = "auto";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!visible && !open) return null;

  const url = report ? buildShareUrl(report._id) : "";
  const text = report ? buildShareText(report) : "";

  const trackShare = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/share`,
        { reportId: report._id },
      );
      onShared?.(report._id);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const handleOption = async (id) => {
    if (!report) return;

    switch (id) {
      case "copy": {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        showToast("Link copied to clipboard!");
        await trackShare();
        setTimeout(() => onClose(), 600);
        break;
      }
      case "whatsapp": {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
          "_blank",
          "noopener,noreferrer",
        );
        await trackShare();
        showToast("Opening WhatsApp…");
        setTimeout(() => onClose(), 400);
        break;
      }
      case "twitter": {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer",
        );
        await trackShare();
        showToast("Opening X…");
        setTimeout(() => onClose(), 400);
        break;
      }
      case "telegram": {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer",
        );
        await trackShare();
        showToast("Opening Telegram…");
        setTimeout(() => onClose(), 400);
        break;
      }
      case "facebook": {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer",
        );
        await trackShare();
        showToast("Opening Facebook…");
        setTimeout(() => onClose(), 400);
        break;
      }
      case "native": {
        if (navigator.share) {
          try {
            await navigator.share({ title: report.title, text, url });
            await trackShare();
            showToast("Shared successfully!");
            setTimeout(() => onClose(), 500);
          } catch (err) {
            if (err.name !== "AbortError") console.error(err);
          }
        } else {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          showToast("Link copied — native share not available");
          await trackShare();
          setTimeout(() => onClose(), 600);
        }
        break;
      }
      default:
        break;
    }
  };

  const options = SHARE_OPTIONS.filter(
    (o) => o.id !== "native" || typeof navigator !== "undefined",
  );

  return (
    <div className={`x-sheet-root ${open ? "x-sheet-open" : "x-sheet-closing"}`}>
      <div className="x-sheet-backdrop" onClick={onClose} />

      <div className="x-sheet x-share-sheet">
        <div className="x-sheet-handle" />

        <div className="x-sheet-header">
          <div>
            <h2 className="font-bold text-lg">Share report</h2>
            <p className="text-x-text-secondary text-sm">Choose how to share</p>
          </div>
          <button onClick={onClose} className="x-btn-ghost text-x-text-secondary">
            <X size={20} />
          </button>
        </div>

        {report && (
          <div className="px-4 pb-2">
            <div className="x-panel flex items-start gap-3 x-share-preview">
              <div className="w-10 h-10 rounded-xl bg-x-accent/10 flex items-center justify-center shrink-0">
                <Link2 size={18} className="text-x-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{report.title}</p>
                <p className="text-x-text-secondary text-xs truncate mt-0.5">
                  {url}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="x-sheet-body pt-2 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt, i) => {
              const Icon = opt.icon;
              const isCopy = opt.id === "copy";
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOption(opt.id)}
                  className={`x-share-option flex flex-col items-center gap-2 p-3 rounded-2xl border border-x-border hover:border-x-accent/30 hover:bg-x-bg-hover transition-all active:scale-95`}
                  style={{ animationDelay: `${0.04 + i * 0.05}s` }}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${opt.bg} flex items-center justify-center`}
                  >
                    {isCopy && copied ? (
                      <Check size={22} className="text-green-500" />
                    ) : Icon ? (
                      <Icon size={22} className={opt.iconColor} />
                    ) : (
                      <span className={`text-lg font-bold ${opt.iconColor}`}>
                        {opt.letter}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                    <p className="text-[10px] text-x-text-secondary mt-0.5 leading-tight">
                      {opt.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleOption("copy")}
            className="x-share-option x-btn x-btn-secondary x-btn-full mt-4 gap-2"
            style={{ animationDelay: "0.35s" }}
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy link to clipboard"}
          </button>
        </div>

        {toast && (
          <div className="x-share-toast">
            <ExternalLink size={14} />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
