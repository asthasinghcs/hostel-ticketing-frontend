import Icon from "./Icon";
import { Brand } from "./components";
import { hostelGroups, hostelCount } from "./hostels";

export default function Sidebar({
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
  showHelp,
  logout,
  busy,
}) {
  return (
    <>
      <aside
        className={`sidebar ${menu ? "sidebar-open" : ""}`}
        id="workspace-navigation"
      >
        <Brand />
        <div className="workspace-label">
          {staff ? "STAFF WORKSPACE" : "STUDENT WORKSPACE"}
        </div>
        <nav aria-label="Main navigation">
          <button
            className={
              view === "all" && status === "All"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigate("all")}
          >
            <Icon name="grid" />
            Overview
            <span className="nav-indicator" />
          </button>
          {!staff && (
            <button
              className={`nav-link ${view === "mine" ? "active" : ""}`}
              onClick={() => navigate("mine")}
            >
              <Icon name="ticket" />
              My tickets
              <span className="nav-count">{stats?.my_total ?? "—"}</span>
            </button>
          )}
          <button
            className={`nav-link ${status === "Open" ? "active" : ""}`}
            onClick={() => navigate("all", "Open")}
          >
            <Icon name="clock" />
            Open grievances
            <span className="nav-count">{stats?.open ?? "—"}</span>
          </button>
          <button
            className={`nav-link ${status === "Resolved" ? "active" : ""}`}
            onClick={() => navigate("all", "Resolved")}
          >
            <Icon name="checkcircle" />
            Resolved<span className="nav-count">{stats?.resolved ?? "—"}</span>
          </button>
        </nav>
        <div className="sidebar-section-label">
          {staff ? "HOSTEL DIRECTORY" : "YOUR COMMUNITY"}
        </div>
        {staff ? (
          <div className="hostel-directory compact-directory">
            <button
              className={`directory-link ${!block ? "selected" : ""}`}
              disabled={busy}
              onClick={() => {
                setBlock("");
                setMenu(false);
              }}
            >
              <Icon name="building" size={16} /> All hostels{" "}
              <span className="directory-total">{hostelCount}</span>
            </button>
            <label htmlFor="directory-hostel">View a hostel</label>
            <select
              id="directory-hostel"
              value={block}
              disabled={busy}
              onChange={(event) => {
                setBlock(event.target.value);
                setMenu(false);
              }}
            >
              <option value="">All {hostelCount} hostels</option>
              {hostelGroups.map((group) => (
                <optgroup
                  label={`${group.name} (${group.hostels.length})`}
                  key={group.code}
                >
                  {group.hostels.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="directory-summary">
              {hostelGroups.map((group) => (
                <span key={group.code}>
                  {group.code} <strong>{group.hostels.length}</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="student-hostel">
            <span className="hostel-emblem">
              <Icon name="building" size={25} />
            </span>
            <div>
              <strong>{user.hostel_block}</strong>
              <small>Your hostel space</small>
            </div>
            <Icon name="lock" size={15} />
          </div>
        )}
        <div className="sidebar-tip">
          <span className="tip-icon">
            <Icon name="spark" size={20} />
          </span>
          <h3>
            Small reports.
            <br />
            Real improvements.
          </h3>
          <p>A clear description helps your warden get things moving.</p>
          <button
            className="text-button"
            onClick={() => {
              showHelp();
              setMenu(false);
            }}
          >
            How it works <Icon name="arrow" size={15} />
          </button>
        </div>
        <div className="sidebar-profile">
          <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>
              {staff
                ? user.role === "warden"
                  ? "Warden · all hostels"
                  : "Administrator"
                : `${user.hostel_block} resident`}
            </small>
          </div>
          <button
            className="icon-button"
            aria-label="Sign out"
            disabled={busy}
            onClick={logout}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
