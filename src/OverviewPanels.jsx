import Icon from "./Icon";
import { categories, categoryIcons, formatDate } from "./tickets";

export function OverviewCards({
  staff,
  hostelName,
  stats,
  loading,
  error,
  updatedAt,
}) {
  return (
    <>
      <div className="overview-heading">
        <h2>
          The bigger picture <span>{hostelName}</span>
        </h2>
        <span className="sync-note">
          {error ? (
            "Update needs attention"
          ) : loading ? (
            "Connecting…"
          ) : (
            <>
              <span className="live-dot" /> Updated {formatDate(updatedAt)}
            </>
          )}
        </span>
      </div>
      <div
        className="stats-grid"
        aria-label="Ticket totals"
        aria-busy={loading}
      >
        {[
          ["Tickets raised", "total", "ticket", "violet"],
          ["Open", "open", "clock", "orange"],
          ["In progress", "in_progress", "refresh", "blue"],
          ["Resolved", "resolved", "checkcircle", "green"],
        ].map(([label, key, icon, color]) => (
          <div className={`stat-card stat-${color}`} key={key}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-icon">
                <Icon name={icon} size={19} />
              </span>
            </div>
            {loading ? (
              <span className="skeleton stat-skeleton" />
            ) : (
              <strong key={stats?.[key]}>{stats?.[key] ?? "—"}</strong>
            )}
            <small>
              {key === "total"
                ? staff
                  ? "Across selected hostels"
                  : `You've raised ${stats?.my_total ?? "—"}`
                : key === "open"
                  ? "Waiting for a little attention"
                  : key === "in_progress"
                    ? "A fix is on the way"
                    : "One less thing to worry about"}
            </small>
          </div>
        ))}
      </div>
    </>
  );
}
export function Insights({ tickets, stats, loading, showMostVoted }) {
  const unavailable = loading || !stats;
  const total = stats?.total || 0;
  const resolutionRate = total ? Math.round((stats.resolved / total) * 100) : 0;
  return (
    <aside className="insights">
      <section className="pulse-card">
        <div className="insight-heading">
          <h3>Hostel pulse</h3>
          <Icon name="spark" size={18} />
        </div>
        <p>A little progress, every day.</p>
        <div className="resolution-chart">
          <svg
            viewBox="0 0 120 120"
            aria-label={
              unavailable
                ? "Resolution rate unavailable"
                : `${resolutionRate}% of tickets resolved`
            }
            role="img"
          >
            <circle className="ring-track" cx="60" cy="60" r="49" />
            <circle
              className="ring-progress"
              cx="60"
              cy="60"
              r="49"
              strokeDasharray={`${resolutionRate * 3.07876} 307.876`}
            />
          </svg>
          <div>
            <strong>{unavailable ? "—" : `${resolutionRate}%`}</strong>
            <small>resolved</small>
          </div>
        </div>
        <div className="pulse-caption">
          <span className="live-dot" />
          {unavailable
            ? "Awaiting overview"
            : `${stats.resolved} resolved · ${Math.max(total - stats.resolved, 0)} to go`}
        </div>
        <div className="category-breakdown">
          <h4>What's coming up</h4>
          {categories.map((name) => {
            const count = tickets.filter(
              (ticket) =>
                ticket.category === name && ticket.status !== "Resolved",
            ).length;
            return (
              <div className="category-row" key={name}>
                <div>
                  <Icon name={categoryIcons[name]} size={14} />
                  <span>{name}</span>
                  <strong>{unavailable ? "—" : count}</strong>
                </div>
                <span className="category-track">
                  <i
                    style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="help-card">
        <span className="help-star">✦</span>
        <h3>Better together.</h3>
        <p>
          Facing the same issue? Upvote an existing ticket so your warden knows
          it matters to more people.
        </p>
        <button className="text-button" onClick={showMostVoted}>
          See most upvoted <Icon name="arrow" size={16} />
        </button>
      </section>
    </aside>
  );
}
