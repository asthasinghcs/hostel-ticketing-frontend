import { useEffect, useState } from "react";
import "./App.css";

const API = "https://hostel-ticketing-backend.onrender.com";

const categories = [
  "Wi-Fi",
  "AC",
  "Water Purifier",
  "Sanitation",
  "Mess Food",
  "Other",
];

const blocks = ["KP-1", "KP-2", "KP-3"];
const statuses = ["Open", "In Progress", "Resolved"];

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Auth
        mode={mode}
        setMode={setMode}
        setUser={setUser}
        loading={loading}
        setLoading={setLoading}
      />
    );
  }

  return user.role === "admin" ? (
    <AdminDashboard user={user} logout={() => setUser(null)} />
  ) : (
    <StudentDashboard user={user} logout={() => setUser(null)} />
  );
}

function Auth({ mode, setMode, setUser, loading, setLoading }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    hostel_block: "KP-1",
    role: "student",
  });

  const [error, setError] = useState("");

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/signup";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : form;

      const response = await fetch(API + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      const loggedUser = data.user || data;

      setUser(loggedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">H</div>
          <div>
            <h1>HostelCare</h1>
            <p>Grievance & Maintenance Portal</p>
          </div>
        </div>

        <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="muted">
          {mode === "login"
            ? "Sign in to manage your hostel grievances."
            : "Create your hostel portal account."}
        </p>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Your name"
                required
              />
            </>
          )}

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            placeholder="you@kiit.ac.in"
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            placeholder="Password"
            required
          />

          {mode === "signup" && (
            <>
              <label>Hostel Block</label>
              <select
                name="hostel_block"
                value={form.hostel_block}
                onChange={update}
              >
                {blocks.map((block) => (
                  <option key={block}>{block}</option>
                ))}
              </select>

              <label>Account Type</label>
              <select name="role" value={form.role} onChange={update}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          {error && <div className="error">{error}</div>}

          <button className="primary" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <button
          className="switch"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function StudentDashboard({ user, logout }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [block, setBlock] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const params = new URLSearchParams({
        hostel_block: block,
        status,
        sort,
      });

      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/tickets?${params}`),
        fetch(`${API}/api/stats`),
      ]);

      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();

      setTickets(
        Array.isArray(ticketsData)
          ? ticketsData
          : ticketsData.tickets || []
      );

      setStats(statsData);
    } catch {
      setMessage("Could not load data from the backend.");
    }
  };

  useEffect(() => {
    loadData();
  }, [block, status, sort]);

  const vote = async (id) => {
    await fetch(`${API}/api/tickets/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });

    loadData();
  };

  return (
    <DashboardShell
      title="Student Dashboard"
      user={user}
      logout={logout}
    >
      <div className="welcome">
        <div>
          <p className="eyebrow">HOSTELCARE</p>
          <h2>Good to see you, {user.name || "Student"}</h2>
          <p className="muted">
            Submit and track hostel maintenance grievances.
          </p>
        </div>

        <button className="primary small" onClick={() => setShowForm(true)}>
          + New Ticket
        </button>
      </div>

      <div className="stats-grid">
        <Stat label="Total" value={stats.total ?? 0} />
        <Stat label="Open" value={stats.open ?? 0} />
        <Stat label="In Progress" value={stats.in_progress ?? 0} />
        <Stat label="Resolved" value={stats.resolved ?? 0} />
      </div>

      {showForm && (
        <TicketForm
          user={user}
          close={() => setShowForm(false)}
          refresh={loadData}
        />
      )}

      <div className="section-header">
        <div>
          <h2>Tickets</h2>
          <p className="muted">View hostel grievances and their status.</p>
        </div>

        <div className="filters">
          <select value={block} onChange={(e) => setBlock(e.target.value)}>
            <option value="">All Blocks</option>
            {blocks.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="votes">Most Votes</option>
          </select>
        </div>
      </div>

      {message && <div className="error">{message}</div>}

      <div className="ticket-list">
        {tickets.length === 0 ? (
          <div className="empty">No tickets found.</div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              vote={() => vote(ticket.id)}
            />
          ))
        )}
      </div>
    </DashboardShell>
  );
}

function AdminDashboard({ user, logout }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});

  const load = async () => {
    const [ticketsRes, statsRes] = await Promise.all([
      fetch(`${API}/api/tickets`),
      fetch(`${API}/api/stats`),
    ]);

    const ticketData = await ticketsRes.json();
    const statsData = await statsRes.json();

    setTickets(
      Array.isArray(ticketData) ? ticketData : ticketData.tickets || []
    );
    setStats(statsData);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await fetch(`${API}/api/tickets/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    load();
  };

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={user}
      logout={logout}
    >
      <div className="welcome">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h2>Ticket Management</h2>
          <p className="muted">
            Review and manage all hostel grievances.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat label="Total" value={stats.total ?? 0} />
        <Stat label="Open" value={stats.open ?? 0} />
        <Stat label="In Progress" value={stats.in_progress ?? 0} />
        <Stat label="Resolved" value={stats.resolved ?? 0} />
      </div>

      <div className="section-header">
        <div>
          <h2>All Tickets</h2>
          <p className="muted">Update ticket status directly.</p>
        </div>
      </div>

      <div className="admin-table">
        <div className="table-head">
          <span>Ticket</span>
          <span>Category</span>
          <span>Location</span>
          <span>Status</span>
        </div>

        {tickets.map((ticket) => (
          <div className="table-row" key={ticket.id}>
            <div>
              <strong>#{ticket.id}</strong>
              <p>{ticket.description}</p>

              {ticket.overdue && (
                <span className="overdue">OVERDUE</span>
              )}
            </div>

            <span>{ticket.category}</span>

            <span>
              {ticket.hostel_block}
              <br />
              Floor {ticket.floor}, Room {ticket.room_no}
            </span>

            <select
              value={ticket.status}
              onChange={(e) =>
                updateStatus(ticket.id, e.target.value)
              }
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function TicketForm({ user, close, refresh }) {
  const [form, setForm] = useState({
    category: categories[0],
    description: "",
    hostel_block: user.hostel_block || "KP-1",
    floor: "",
    room_no: "",
  });

  const [error, setError] = useState("");

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        user_id: user.id,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Could not create ticket.");
      return;
    }

    close();
    refresh();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>Submit a Ticket</h2>
            <p className="muted">
              Describe the problem clearly.
            </p>
          </div>

          <button className="close" onClick={close}>
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <label>Category</label>
          <select name="category" value={form.category} onChange={update}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <label>Hostel Block</label>
          <select
            name="hostel_block"
            value={form.hostel_block}
            onChange={update}
          >
            {blocks.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <div className="two-col">
            <div>
              <label>Floor</label>
              <input
                name="floor"
                value={form.floor}
                onChange={update}
                required
              />
            </div>

            <div>
              <label>Room Number</label>
              <input
                name="room_no"
                value={form.room_no}
                onChange={update}
                required
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            placeholder="Describe the issue..."
            rows="5"
            required
          />

          {error && <div className="error">{error}</div>}

          <button className="primary">Submit Ticket</button>
        </form>
      </div>
    </div>
  );
}

function TicketCard({ ticket, vote }) {
  return (
    <div className="ticket-card">
      <div className="ticket-main">
        <div className="ticket-top">
          <span className="ticket-id">#{ticket.id}</span>
          <span className={`status ${statusClass(ticket.status)}`}>
            {ticket.status}
          </span>

          {ticket.overdue && (
            <span className="overdue">OVERDUE</span>
          )}
        </div>

        <h3>{ticket.category}</h3>

        <p>{ticket.description}</p>

        <div className="ticket-meta">
          {ticket.hostel_block} · Floor {ticket.floor} · Room{" "}
          {ticket.room_no}
        </div>
      </div>

      <button className="vote" onClick={vote}>
        ▲
        <strong>{ticket.votes ?? ticket.vote_count ?? 0}</strong>
        <small>votes</small>
      </button>
    </div>
  );
}

function DashboardShell({ title, user, logout, children }) {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">H</div>
          <div>
            <strong>HostelCare</strong>
            <small>{title}</small>
          </div>
        </div>

        <div className="user-area">
          <div>
            <strong>{user.name || user.email}</strong>
            <small>{user.role}</small>
          </div>

          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function statusClass(status) {
  if (status === "Resolved") return "resolved";
  if (status === "In Progress") return "progress";
  return "open";
}

export default App;
