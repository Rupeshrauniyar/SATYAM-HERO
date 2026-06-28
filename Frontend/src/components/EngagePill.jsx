export default function EngagePill({
  icon: Icon,
  count,
  active = false,
  variant = "default",
  onClick,
  label,
  disabled = false,
}) {
  const isActive = Boolean(active);
  const variantClass = {
    up: "x-engage-up",
    down: "x-engage-down",
    like: "x-engage-like",
    comment: "x-engage-comment",
    share: "x-engage-share",
    insight: "x-engage-insight",
    default: "",
  }[variant];

  const showCount =
    variant === "up" ||
    variant === "down" ||
    variant === "like" ||
    variant === "comment" ||
    count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isActive}
      data-active={isActive}
      className={`x-engage-pill ${variantClass} ${isActive ? "x-engage-pill-active" : ""}`.trim()}
    >
      <span className="x-engage-pill-icon">
        <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
      </span>
      {showCount && (
        <span className="x-engage-pill-count">{count}</span>
      )}
    </button>
  );
}
