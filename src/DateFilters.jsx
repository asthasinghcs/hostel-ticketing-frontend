import { useState } from "react";
import Icon from "./Icon";
import { campusDate } from "./tickets";

export default function DateFilters({
  dateFrom,
  dateTo,
  onChange,
  stats,
  loading,
}) {
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const [error, setError] = useState("");
  const today = campusDate();
  const weekStartDate = new Date(`${today}T00:00:00Z`);
  weekStartDate.setUTCDate(weekStartDate.getUTCDate() - 6);
  const weekStart = weekStartDate.toISOString().slice(0, 10);
  const days = stats?.by_date || [];
  const recent = days.slice(-14);
  const maximum = Math.max(1, ...recent.map((day) => day.total));
  function apply(event) {
    event.preventDefault();
    if (from && to && from > to) {
      setError("Start date must be on or before end date.");
      return;
    }
    onChange(from, to);
    setError("");
  }
  function quick(period) {
    if (period === "all") {
      onChange("", "");
      return;
    }
    const start = new Date(`${today}T00:00:00Z`);
    if (period === "week") start.setUTCDate(start.getUTCDate() - 6);
    onChange(start.toISOString().slice(0, 10), today);
  }
  return (
    <section className="date-tracker" aria-label="Date-wise grievance tracking">
      <div className="date-tracker-heading">
        <div>
          <Icon name="clock" size={17} />
          <strong>Track by date</strong>
          <span>India time · IST</span>
        </div>
        <div className="date-quick-actions">
          <button
            type="button"
            className={!dateFrom && !dateTo ? "selected" : ""}
            onClick={() => quick("all")}
          >
            All time
          </button>
          <button
            type="button"
            className={dateFrom === today && dateTo === today ? "selected" : ""}
            onClick={() => quick("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={
              dateFrom === weekStart && dateTo === today ? "selected" : ""
            }
            onClick={() => quick("week")}
          >
            Last 7 days
          </button>
        </div>
      </div>
      <form className="date-range-form" onSubmit={apply}>
        <label>
          From
          <input
            aria-label="From date"
            type="date"
            min="1970-01-01"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label>
          To
          <input
            aria-label="To date"
            type="date"
            min="1970-01-01"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <button className="button secondary small">
          Apply dates
          <Icon name="arrow" size={14} />
        </button>
      </form>
      {error && (
        <p className="date-error" role="alert">
          {error}
        </p>
      )}
      <p className="date-range-note">
        {dateFrom || dateTo
          ? `Tickets raised ${dateFrom || "at any earlier date"} to ${dateTo || "the latest date"}; end date included.`
          : "Showing tickets from every date."}{" "}
        Status filters only change the list; date filters also update the
        totals.
      </p>
      <details className="daily-activity">
        <summary>
          Daily activity{" "}
          <span>
            {loading
              ? "Loading…"
              : stats
                ? `${stats.total} tickets across ${days.length} ${days.length === 1 ? "date" : "dates"}`
                : "Unavailable"}
          </span>
          <Icon name="down" size={14} />
        </summary>
        {recent.length ? (
          <>
            <div className="daily-bars">
              {recent.map((day) => (
                <button
                  type="button"
                  key={day.date}
                  aria-label={`${day.date}: ${day.total} grievances. Filter this date`}
                  onClick={() => onChange(day.date, day.date)}
                >
                  <strong>{day.total}</strong>
                  <i
                    style={{
                      height: `${Math.max(8, (day.total / maximum) * 65)}px`,
                    }}
                  />
                  <span>
                    {new Date(`${day.date}T00:00:00Z`).toLocaleDateString(
                      undefined,
                      { timeZone: "UTC", month: "short", day: "numeric" },
                    )}
                  </span>
                </button>
              ))}
            </div>
            <p>Latest {recent.length} dates. Select a bar to view that day.</p>
          </>
        ) : (
          <p>No tickets were raised in this date range.</p>
        )}
      </details>
    </section>
  );
}
