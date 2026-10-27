import { useEffect, useRef } from "react";
import Icon from "./Icon";

export function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <Icon name="building" size={23} />
      </span>
      <span>
        hostel<span className="brand-light-word">care</span>
        <span className="brand-dot">.</span>
      </span>
    </div>
  );
}
export function Modal({ titleId, close, busy = false, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) close();
      }}
    >
      {children}
    </dialog>
  );
}
export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function HelpDialog({ close }) {
  return (
    <Modal titleId="help-title" close={close}>
      <div className="modal-header">
        <span className="modal-icon">
          <Icon name="spark" size={24} />
        </span>
        <button className="icon-button" aria-label="Close help" onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <h2 id="help-title">A clearer path to a fix.</h2>
      <p className="muted">A few small steps make a real difference.</p>
      <ol className="help-steps">
        <li>
          <span>01</span>
          <div>
            <h3>Tell us what's happening</h3>
            <p>
              Pick a category and describe the issue in your hostel. Shared
              facilities don't need a room number.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Support a shared concern</h3>
            <p>
              Upvote a ticket if you're facing the same problem. One ticket can
              speak for a whole corridor.
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Stay in the conversation</h3>
            <p>
              Follow status changes and add useful updates. Wardens manage
              concerns across hostels.
            </p>
          </div>
        </li>
      </ol>
      <button className="button primary full-width" onClick={close}>
        Got it
        <Icon name="check" size={17} />
      </button>
    </Modal>
  );
}
