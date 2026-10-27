import { useEffect, useState } from "react";
import { api } from "./api";
import Icon from "./Icon";
import { categoryIcons, statuses, formatDate } from "./tickets";

export default function TicketCard({
  ticket,
  user,
  staff,
  busy,
  vote,
  updateStatus,
}) {
  const [expanded, setExpanded] = useState(false);
  const state =
    ticket.status === "Resolved"
      ? "resolved"
      : ticket.status === "In Progress"
        ? "progress"
        : "open";
  return (
    <article className={`ticket-card ticket-${state}`}>
      <div className="ticket-body">
        <div className="ticket-heading">
          <span
            className={`category-icon icon-${categoryIcons[ticket.category]}`}
          >
            <Icon name={categoryIcons[ticket.category]} size={22} />
          </span>
          <div className="ticket-heading-text">
            <div className="ticket-top">
              <span className="ticket-number">
                HC-{String(ticket.id).padStart(3, "0")}
              </span>
              <span className="ticket-block">{ticket.hostel_block}</span>
              {ticket.user_id === user.id && (
                <span className="your-ticket">Your ticket</span>
              )}
            </div>
            <h3>{ticket.category}</h3>
          </div>
          <span className={`status status-${state}`}>
            <i />
            {ticket.status}
          </span>
        </div>
        <p className="ticket-description">{ticket.description}</p>
        <div className="ticket-location">
          <Icon name="building" size={13} />
          {ticket.hostel_block}
          {ticket.floor ? ` · Floor ${ticket.floor}` : " · Shared facility"}
          {ticket.room_no ? ` · Room ${ticket.room_no}` : ""}
          <span>·</span>
          <time dateTime={ticket.created_at.replace(" ", "T") + "Z"}>
            {formatDate(ticket.created_at)}
          </time>
        </div>
        {ticket.overdue && (
          <p className="overdue-note">
            <Icon name="clock" size={13} />
            Waiting over 48 hours — needs attention
          </p>
        )}
        {ticket.resolved_at && (
          <p className="resolution-note">
            <Icon name="checkcircle" size={13} />
            Resolved {formatDate(ticket.resolved_at)}
          </p>
        )}
        <div className="ticket-footer">
          <button
            className={`discussion-button ${expanded ? "selected" : ""}`}
            aria-expanded={expanded}
            aria-controls={`comments-${ticket.id}`}
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name="message" size={16} />
            {expanded ? "Close discussion" : "Discussion"}
            <Icon name="down" size={13} />
          </button>
          {staff ? (
            <label className="status-control">
              <span>Update status</span>
              <select
                aria-label={`Status for ticket ${ticket.id}`}
                value={ticket.status}
                disabled={busy}
                onChange={(event) => updateStatus(event.target.value)}
              >
                {statuses.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <small>{ticket.vote_count} upvotes</small>
            </label>
          ) : (
            <button
              className={`vote-button ${ticket.has_voted ? "voted" : ""}`}
              disabled={
                busy || ticket.has_voted || ticket.status === "Resolved"
              }
              onClick={vote}
              aria-label={`${ticket.has_voted ? "Already upvoted" : "Upvote"} ticket ${ticket.id}; ${ticket.vote_count} votes`}
            >
              <Icon name={ticket.has_voted ? "check" : "up"} size={16} />
              <strong>{ticket.vote_count}</strong>
              <span>{ticket.has_voted ? "Upvoted" : "Upvote"}</span>
            </button>
          )}
        </div>
      </div>
      {expanded && <Comments ticketId={ticket.id} />}
    </article>
  );
}

function Comments({ ticketId }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api(`/api/tickets/${ticketId}/comments`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setComments(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, [ticketId, revision]);
  async function submit(event) {
    event.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const comment = await api(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        body: { text },
      });
      setComments((previous) => [...(previous || []), comment]);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      id={`comments-${ticketId}`}
      className="comments"
      aria-label={`Discussion for ticket ${ticketId}`}
    >
      <h4>
        <Icon name="message" size={16} />
        The conversation
      </h4>
      {error && (
        <div className="error" role="alert">
          {error}
          <button
            className="text-button"
            onClick={() => {
              setError("");
              setRevision((value) => value + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      {comments === null ? (
        !error && (
          <p className="muted" role="status">
            Loading discussion…
          </p>
        )
      ) : comments.length ? (
        <ol className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <span className="comment-avatar">
                {comment.author_name.charAt(0)}
              </span>
              <div>
                <strong>{comment.author_name}</strong>
                <span className="comment-role">{comment.author_role}</span>
                <time>{formatDate(comment.created_at)}</time>
                <p>{comment.text}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">No updates yet. Start the conversation.</p>
      )}
      <form onSubmit={submit}>
        <label htmlFor={`comment-${ticketId}`}>Add an update</label>
        <textarea
          id={`comment-${ticketId}`}
          value={text}
          disabled={busy}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
          placeholder="Share a useful detail or a progress update…"
          rows={3}
          required
        />
        <button
          className="button primary small"
          disabled={busy || !text.trim() || comments === null}
        >
          {busy ? "Posting…" : "Post update"}
          <Icon name="arrow" size={15} />
        </button>
      </form>
    </section>
  );
}
