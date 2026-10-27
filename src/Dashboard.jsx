import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useOverview } from "./useOverview";
import Icon from "./Icon";
import { Brand, EmptyState, HelpDialog } from "./components";
import { categories, statuses, filterTickets } from "./tickets";
import Sidebar from "./Sidebar";
import { OverviewCards, Insights } from "./OverviewPanels";
import TicketCard from "./TicketCard";
import TicketForm from "./TicketForm";

export default function Dashboard({ user, onLogout }) {
  const staff = user.role === "admin" || user.role === "warden";
  const [block, setBlock] = useState(staff ? "" : user.hostel_block);
  const [view, setView] = useState("all");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [menu, setMenu] = useState(false);
  const searchInput = useRef(null);
  const overview = useOverview(block);
  const { data, loading, refreshing, refresh } = overview;
  const tickets = data?.tickets || [];
  const stats = data?.stats;
  const visibleTickets = filterTickets(tickets, {
    status,
    category,
    search,
    sort,
    mine: view === "mine" ? user.id : null,
  });
  const hostelName = block || "All hostels";
  useEffect(() => {
    function keyboard(event) {
      if (event.key === "Escape") setMenu(false);
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName,
        )
      ) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(nextView, nextStatus = "All") {
    setView(nextView);
    setStatus(nextStatus);
    setCategory("All");
    setSearch("");
    setMenu(false);
  }
  async function mutate(path, options, message) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api(path, options);
      const refreshed = await refresh();
      setNotice(
        message +
          (refreshed ? "" : " Refresh the overview to see the latest counts."),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function created(ticket) {
    // A successful ticket should be visible even if the previous view was filtered.
    setView("all");
    setStatus("All");
    setCategory("All");
    setSearch("");
    setSort("newest");
    const refreshed = await refresh();
    setShowForm(false);
    setNotice(
      `Ticket #${ticket.id} raised successfully.${refreshed ? " Your hostel's counts are up to date." : " Please refresh the overview to update your counts."}`,
    );
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/logout", { method: "POST" });
      onLogout();
    } catch (err) {
      setError(`Could not sign out: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }
  function clearFilters() {
    setSearch("");
    setStatus("All");
    setCategory("All");
  }
  const filtered = search || status !== "All" || category !== "All";
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <Sidebar
        {...{
          user,
          staff,
          block,
          setBlock,
          view,
          status,
          navigate,
          stats,
          menu,
          setMenu,
          logout,
          busy,
        }}
        showHelp={() => setShowHelp(true)}
      />
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={menu}
              aria-controls="workspace-navigation"
              onClick={() => setMenu(!menu)}
            >
              <Icon name="menu" />
            </button>
            <span>Workspace</span>
            <Icon name="chevron" size={13} />
            <strong>{hostelName}</strong>
          </div>
          <div className="topbar-right">
            <span className="today">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(new Date())}
            </span>
            <span className="role-pill">
              <Icon name={staff ? "shield" : "lock"} size={13} />
              {staff ? "Staff access" : "Hostel-only access"}
            </span>
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {staff
                  ? "A LITTLE ATTENTION. A LOT OF DIFFERENCE."
                  : "YOUR SPACE TO MAKE THINGS BETTER"}
              </p>
              <h1>
                {staff
                  ? "A happier campus starts here."
                  : `Hey ${user.name.split(" ")[0]}, welcome home.`}
                <span className="greeting-spark">✧</span>
              </h1>
              <p className="muted">
                {staff
                  ? "Every hostel, every grievance. Keep care moving in the right direction."
                  : `Here's what's happening in ${user.hostel_block}. Let's make it a little better, together.`}
              </p>
            </div>
            <button
              className={`button secondary refresh-button ${refreshing ? "is-refreshing" : ""}`}
              onClick={() => refresh()}
              disabled={refreshing}
              aria-label="Refresh tickets and counts"
            >
              <Icon name="refresh" size={17} />
              <span>{refreshing ? "Updating…" : "Refresh"}</span>
            </button>
          </div>
          <div className="welcome-banner">
            <div>
              <span className="banner-kicker">
                <span className="live-dot" />
                {staff
                  ? "ALL HOSTELS. ONE COMMUNITY."
                  : `${user.hostel_block} COMMUNITY`}
              </span>
              <h2>
                {staff
                  ? "Good care is in the details."
                  : "Something not quite right?"}
              </h2>
              <p>
                {staff
                  ? "Turn everyday concerns into everyday improvements."
                  : "A broken tap or patchy Wi-Fi? Tell us. Your voice makes a difference."}
              </p>
              {!staff && (
                <button
                  className="button banner-button"
                  onClick={() => setShowForm(true)}
                >
                  <Icon name="plus" size={17} />
                  Raise a grievance
                  <Icon name="arrow" size={17} />
                </button>
              )}
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="banner-orbit" />
              <span className="art-ticket">
                <Icon name="ticket" size={50} />
                <span>
                  <Icon name="check" size={16} />
                </span>
              </span>
              <span className="art-spark one">✧</span>
              <span className="art-spark two">✦</span>
              <span className="art-label">A little care changes a lot.</span>
            </div>
          </div>
          <OverviewCards
            {...{ staff, hostelName, stats, loading }}
            error={overview.error}
            updatedAt={data?.updated_at}
          />
          {(error || overview.error) && (
            <div className="error" role="alert">
              <Icon name="alert" size={18} />
              <span>{error || overview.error}</span>
              <button
                className="text-button"
                onClick={() => {
                  setError("");
                  refresh();
                }}
              >
                Try again
              </button>
            </div>
          )}
          <div className="dashboard-columns">
            <section className="grievances">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">LET'S KEEP THINGS MOVING</span>
                  <h2>
                    {view === "mine"
                      ? "Your raised tickets"
                      : "Community grievances"}
                    <span className="count-pill">
                      {loading ? "—" : visibleTickets.length}
                    </span>
                  </h2>
                </div>
                {stats?.overdue > 0 && (
                  <button
                    className="overdue-filter"
                    aria-pressed={status === "Overdue"}
                    onClick={() =>
                      setStatus(status === "Overdue" ? "All" : "Overdue")
                    }
                  >
                    <span />
                    {stats.overdue} overdue
                  </button>
                )}
              </div>
              <div className="ticket-toolbar">
                <div className="search-field">
                  <Icon name="search" size={18} />
                  <input
                    ref={searchInput}
                    aria-label="Search grievances"
                    placeholder="Search grievances or ticket ID…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <kbd>/</kbd>
                </div>
                <select
                  aria-label="Category filter"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="All">All categories</option>
                  {categories.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="list-controls">
                <div className="status-tabs" aria-label="Filter by status">
                  {["All", ...statuses].map((value) => (
                    <button
                      key={value}
                      aria-pressed={status === value}
                      className={status === value ? "selected" : ""}
                      onClick={() => setStatus(value)}
                    >
                      {value === "All" ? "All tickets" : value}
                    </button>
                  ))}
                </div>
                <select
                  className="sort-select"
                  aria-label="Sort grievances"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="votes">Most upvoted</option>
                </select>
              </div>
              <div className="ticket-list" aria-busy={loading}>
                {loading ? (
                  [0, 1, 2].map((value) => (
                    <div className="ticket-skeleton" key={value}>
                      <span className="skeleton" />
                      <span className="skeleton" />
                      <span className="skeleton" />
                    </div>
                  ))
                ) : !data ? (
                  <EmptyState
                    icon="wifi"
                    title="We couldn't connect"
                    text="Your grievances are safe. Try refreshing the workspace."
                    action={
                      <button
                        className="button secondary"
                        onClick={() => refresh()}
                      >
                        Try again
                      </button>
                    }
                  />
                ) : visibleTickets.length ? (
                  visibleTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      user={user}
                      staff={staff}
                      busy={busy}
                      vote={() =>
                        mutate(
                          `/api/tickets/${ticket.id}/vote`,
                          { method: "POST", body: {} },
                          "Your upvote counts. Thanks for speaking up!",
                        )
                      }
                      updateStatus={(value) =>
                        mutate(
                          `/api/tickets/${ticket.id}/status`,
                          { method: "PATCH", body: { status: value } },
                          `Ticket #${ticket.id} is now ${value.toLowerCase()}.`,
                        )
                      }
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={filtered ? "search" : "ticket"}
                    title={
                      filtered
                        ? "No matches this time."
                        : "A fresh start for your hostel."
                    }
                    text={
                      filtered
                        ? "Try a different search or clear the filters."
                        : "Nothing has been raised here yet. If something needs attention, we're listening."
                    }
                    action={
                      <button
                        className="button secondary"
                        onClick={() => {
                          if (filtered) clearFilters();
                          else if (!staff) setShowForm(true);
                          else refresh();
                        }}
                      >
                        {filtered
                          ? "Clear filters"
                          : staff
                            ? "Refresh workspace"
                            : "Raise your first grievance"}
                      </button>
                    }
                  />
                )}
              </div>
              {!loading && data && (
                <p className="list-footnote">
                  Showing {visibleTickets.length} of {stats.total} hostel
                  tickets <span>Updates every 30 seconds</span>
                </p>
              )}
            </section>
            <Insights
              {...{ tickets, stats, loading }}
              showMostVoted={() => {
                setSort("votes");
                setView("all");
                clearFilters();
              }}
            />
          </div>
          <footer className="workspace-footer">
            <Brand />
            <span>Thoughtful care. Better hostel living.</span>
            <span>
              {staff
                ? "All-hostel management"
                : `${user.hostel_block} · Your community, your space`}
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <span>
            <Icon name="checkcircle" size={21} />
          </span>
          <p>{notice}</p>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {showForm && (
        <TicketForm
          user={user}
          close={() => setShowForm(false)}
          onCreated={created}
        />
      )}
      {showHelp && <HelpDialog close={() => setShowHelp(false)} />}
    </div>
  );
}
