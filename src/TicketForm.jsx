import { useState } from "react";
import { api } from "./api";
import Icon from "./Icon";
import { Modal } from "./components";
import { categories } from "./tickets";

export default function TicketForm({ user, close, onCreated }) {
  const [form, setForm] = useState({
    category: "Wi-Fi",
    description: "",
    hostel_block: user.hostel_block,
    floor: "",
    room_no: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdTicket, setCreatedTicket] = useState(null);
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    if (busy || createdTicket) return;
    setBusy(true);
    setError("");
    try {
      const ticket = await api("/api/tickets", { method: "POST", body: form });
      setCreatedTicket(ticket);
      await onCreated(ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal titleId="ticket-form-title" close={close} busy={busy}>
      <div className="modal-header">
        <span className="modal-icon">
          <Icon name="ticket" size={24} />
        </span>
        <button
          className="icon-button"
          aria-label="Close grievance form"
          disabled={busy}
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      <span className="eyebrow">A SMALL STEP TOWARD A FIX</span>
      <h2 id="ticket-form-title">Let's get it sorted.</h2>
      <p className="muted">
        Tell us what's happening. We'll raise it with your hostel team.
      </p>
      <div className="form-hostel">
        <Icon name="building" size={19} />
        <strong>{user.hostel_block}</strong>
        <span>Your registered hostel</span>
        <Icon name="lock" size={14} />
      </div>
      <form onSubmit={submit}>
        <fieldset disabled={busy || Boolean(createdTicket)}>
          <div className="field">
            <label htmlFor="ticket-category">What needs attention?</label>
            <select
              id="ticket-category"
              name="category"
              value={form.category}
              onChange={update}
            >
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="ticket-floor">
                Floor <span>(optional)</span>
              </label>
              <input
                id="ticket-floor"
                name="floor"
                maxLength={30}
                value={form.floor}
                onChange={update}
                placeholder="e.g. 2nd floor"
              />
            </div>
            <div className="field">
              <label htmlFor="ticket-room">
                Room <span>(optional)</span>
              </label>
              <input
                id="ticket-room"
                name="room_no"
                maxLength={30}
                value={form.room_no}
                onChange={update}
                placeholder="e.g. 214"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ticket-description">Tell us a little more</label>
            <textarea
              id="ticket-description"
              name="description"
              rows={5}
              maxLength={4000}
              value={form.description}
              onChange={update}
              placeholder="What's the issue, where is it, and when did it start?"
              required
            />
            <div className="description-hint">
              <span>Clear details help us find the right fix.</span>
              <span>{form.description.length}/4000</span>
            </div>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div className="form-footer">
            <button type="button" className="button secondary" onClick={close}>
              Cancel
            </button>
            <button
              className="button primary"
              disabled={busy || !form.description.trim()}
            >
              {busy ? (
                <>
                  <span className="loader" />
                  {createdTicket
                    ? "Updating your overview…"
                    : "Raising ticket…"}
                </>
              ) : (
                <>
                  Raise grievance
                  <Icon name="arrow" size={17} />
                </>
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
