import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Search as SearchIcon, ShieldCheck, UserRound, Users } from "lucide-react";

const GovUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingAction, setPendingAction] = useState("promote");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const token = localStorage.getItem("token");

  const searchUsers = async (term) => {
    if (!term.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gov/user?name=${encodeURIComponent(term)}`,
        { headers: { Authorization: token } },
      );
      if (response.status === 200) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => searchUsers(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    setConfirmLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gov/user/update`,
        {
          role: pendingAction === "promote" ? "gov" : "user",
          update: selectedUser._id,
          token,
        },
      );

      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id
            ? { ...user, role: pendingAction === "promote" ? "gov" : "user" }
            : user,
        ),
      );
      setSelectedUser(null);
      setPendingAction("promote");
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const actionLabel = useMemo(() => {
    return pendingAction === "promote" ? "Promote to Government" : "Demote to Citizen";
  }, [pendingAction]);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-x-bg, #f8fafc)" }}>
      <div
        style={{
          background: "var(--color-x-bg-secondary, #f7f9f9)",
          borderBottom: "1px solid var(--color-x-border, #eff3f4)",
          padding: "24px 28px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--color-x-accent, #1d9bf0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={18} color="#ffffff" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--color-x-text, #0f1419)",
              letterSpacing: "-0.3px",
            }}
          >
            Manage Users
          </h1>
        </div>
        <p
          style={{
            margin: "8px 0 0 48px",
            fontSize: "13.5px",
            color: "var(--color-x-text-secondary, #536471)",
            lineHeight: "1.5",
          }}
        >
          Search citizens and update their access to the government portal.
        </p>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: "680px" }}>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <SearchIcon
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-x-text-secondary, #536471)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 14px 11px 40px",
              fontSize: "14px",
              background: "var(--color-x-bg, #ffffff)",
              border: "1px solid var(--color-x-border, #eff3f4)",
              borderRadius: "12px",
              color: "var(--color-x-text, #0f1419)",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-x-accent, #1d9bf0)";
              e.target.style.boxShadow = "0 0 0 3px rgba(29, 155, 240, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-x-border, #eff3f4)";
              e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
            }}
          />
          {loading && (
            <Loader2
              size={16}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-x-accent, #1d9bf0)",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
        </div>

        {!loading && users.length === 0 && searchTerm && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "var(--color-x-bg, #ffffff)",
              borderRadius: "16px",
              border: "1px solid var(--color-x-border, #eff3f4)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--color-x-bg-secondary, #f7f9f9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <UserRound size={22} color="var(--color-x-text-secondary, #536471)" />
            </div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "var(--color-x-text, #0f1419)" }}>
              No users found
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--color-x-text-secondary, #536471)" }}>
              Try a different name or spelling.
            </p>
          </div>
        )}

        {!loading && users.length === 0 && !searchTerm && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "var(--color-x-bg, #ffffff)",
              borderRadius: "16px",
              border: "1px dashed var(--color-x-border, #eff3f4)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--color-x-bg-secondary, #f7f9f9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <SearchIcon size={20} color="var(--color-x-text-secondary, #536471)" />
            </div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "var(--color-x-text, #0f1419)" }}>
              Start searching
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--color-x-text-secondary, #536471)" }}>
              Enter a citizen's name above to find and manage their access.
            </p>
          </div>
        )}

        {users.length > 0 && (
          <div
            style={{
              background: "var(--color-x-bg, #ffffff)",
              borderRadius: "16px",
              border: "1px solid var(--color-x-border, #eff3f4)",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--color-x-border, #eff3f4)",
                background: "var(--color-x-bg-secondary, #f7f9f9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-x-text-secondary, #536471)",
                }}
              >
                Results
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-x-text-secondary, #536471)",
                  background: "var(--color-x-bg-hover, #f7f9f9)",
                  borderRadius: "20px",
                  padding: "2px 10px",
                }}
              >
                {users.length} {users.length === 1 ? "user" : "users"}
              </span>
            </div>

            {users.map((user, index) => {
              const isGov = user.role === "gov";
              return (
                <div
                  key={user._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    gap: "12px",
                    borderBottom:
                      index < users.length - 1
                        ? "1px solid var(--color-x-border, #eff3f4)"
                        : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-x-bg-secondary, #f7f9f9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: isGov
                          ? "linear-gradient(135deg, var(--color-x-accent, #1d9bf0) 0%, #1d4ed8 100%)"
                          : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: "700",
                        flexShrink: 0,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "var(--color-x-text, #0f1419)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user.name}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        {isGov ? (
                          <ShieldCheck size={12} color="var(--color-x-accent, #1d9bf0)" />
                        ) : (
                          <UserRound size={12} color="var(--color-x-text-secondary, #536471)" />
                        )}
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            color: isGov ? "var(--color-x-accent, #1d9bf0)" : "var(--color-x-text-secondary, #536471)",
                          }}
                        >
                          {isGov ? "Government Official" : "Citizen"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPendingAction(isGov ? "demote" : "promote");
                      setSelectedUser(user);
                    }}
                    style={{
                      flexShrink: 0,
                      padding: "7px 16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      borderRadius: "9px",
                      border: isGov
                        ? "1px solid var(--color-x-border, #eff3f4)"
                        : "1px solid transparent",
                      background: isGov
                        ? "var(--color-x-bg, #ffffff)"
                        : "var(--color-x-accent, #1d9bf0)",
                      color: isGov
                        ? "var(--color-x-text, #0f1419)"
                        : "#ffffff",
                      cursor: "pointer",
                      transition: "opacity 0.15s, background 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.84")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {isGov ? "Demote" : "Promote"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15,23,42,0.55)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => !confirmLoading && setSelectedUser(null)}
          />

          <div
            style={{
              position: "relative",
              background: "var(--color-x-bg, #ffffff)",
              borderRadius: "20px",
              border: "1px solid var(--color-x-border, #eff3f4)",
              width: "100%",
              maxWidth: "360px",
              padding: "28px 24px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              animation: "fadeIn 0.18s ease-out",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background:
                  pendingAction === "promote"
                    ? "rgba(29, 155, 240, 0.15)"
                    : "rgba(239, 68, 68, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {pendingAction === "promote" ? (
                <ShieldCheck size={22} color="var(--color-x-accent, #1d9bf0)" />
              ) : (
                <UserRound size={22} color="#ef4444" />
              )}
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "17px",
                fontWeight: "700",
                color: "var(--color-x-text, #0f1419)",
                letterSpacing: "-0.2px",
              }}
            >
              {actionLabel}?
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "var(--color-x-text-secondary, #536471)",
              }}
            >
              This will change{" "}
              <strong style={{ color: "var(--color-x-text, #0f1419)", fontWeight: "600" }}>
                {selectedUser.name}
              </strong>
              's role to{" "}
              <strong style={{ color: "var(--color-x-text, #0f1419)", fontWeight: "600" }}>
                {pendingAction === "promote" ? "Government Official" : "Citizen"}
              </strong>
              . They'll gain or lose access to the government portal immediately.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => !confirmLoading && setSelectedUser(null)}
                disabled={confirmLoading}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "11px",
                  border: "1px solid var(--color-x-border, #eff3f4)",
                  background: "var(--color-x-bg-secondary, #f7f9f9)",
                  color: "var(--color-x-text, #0f1419)",
                  cursor: confirmLoading ? "not-allowed" : "pointer",
                  opacity: confirmLoading ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={confirmLoading}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "11px",
                  border: "1px solid transparent",
                  background:
                    pendingAction === "promote"
                      ? "var(--color-x-accent, #1d9bf0)"
                      : "#ef4444",
                  color: "#ffffff",
                  cursor: confirmLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: confirmLoading ? 0.75 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {confirmLoading && (
                  <Loader2
                    size={15}
                    style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
                  />
                )}
                {confirmLoading ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GovUsers;