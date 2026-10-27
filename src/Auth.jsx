import { useState } from "react";
import { api, saveSession } from "./api";
import Icon from "./Icon";
import { Brand } from "./components";
import { blocks } from "./tickets";

function HostelIllustration() {
  return (
    <div className="hostel-scene" aria-hidden="true">
      <div className="scene-orbit orbit-one" />
      <div className="scene-orbit orbit-two" />
      <div className="scene-sun" />
      <div className="scene-building building-back">
        <span className="roof-label">KP</span>
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="scene-building building-front">
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} />
        ))}
        <div className="building-door" />
      </div>
      <div className="scene-ground" />
      <div className="scene-tree tree-one" />
      <div className="scene-tree tree-two" />
      <div className="scene-note">
        <span className="scene-check">
          <Icon name="check" size={16} />
        </span>
        <div>
          <strong>A little care. A better home.</strong>
          <small>Report. Track. Resolve.</small>
        </div>
      </div>
      <span className="scene-spark spark-one">✧</span>
      <span className="scene-spark spark-two">✧</span>
    </div>
  );
}

export default function Auth({ notice, onLogin }) {
  const [portal, setPortal] = useState("student");
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    hostel_block: "KP-1",
  });
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  function choosePortal(value) {
    setPortal(value);
    setMode("login");
    setError("");
    setForm({ ...form, password: "" });
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await api(`/api/${mode}`, {
        method: "POST",
        publicRequest: true,
        body:
          mode === "signup"
            ? form
            : {
                email: form.email,
                password: form.password,
                portal,
                ...(portal === "student"
                  ? { hostel_block: form.hostel_block }
                  : {}),
              },
      });
      if (!data.token || !data.user?.id)
        throw new Error("The server returned an invalid sign-in response.");
      saveSession(data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="landing">
      <section className="landing-story">
        <Brand light />
        <div className="story-copy">
          <span className="story-kicker">
            <span /> A LITTLE CARE GOES A LONG WAY
          </span>
          <h1>
            Your hostel.
            <br />
            Your voice.
            <br />
            <em>A better everyday.</em>
          </h1>
          <p>
            From the Wi-Fi that won't connect to the tap that won't stop. Bring
            it up. We'll help move it forward.
          </p>
        </div>
        <HostelIllustration />
        <div className="story-footer">
          <span>
            <Icon name="shield" size={16} /> Private to your hostel
          </span>
          <span>Made for campus life</span>
        </div>
      </section>
      <main className="landing-access">
        <div className="access-top">
          <span>YOUR CAMPUS, CONNECTED</span>
          <span className="portal-badge">
            <Icon name="lock" size={13} /> Secure access
          </span>
        </div>
        <div className="auth-card">
          <div className="portal-tabs" aria-label="Choose your portal">
            <button
              className={portal === "student" ? "active" : ""}
              aria-pressed={portal === "student"}
              disabled={busy}
              onClick={() => choosePortal("student")}
            >
              <Icon name="home" size={17} /> Student
            </button>
            <button
              className={portal === "staff" ? "active" : ""}
              aria-pressed={portal === "staff"}
              disabled={busy}
              onClick={() => choosePortal("staff")}
            >
              <Icon name="shield" size={17} /> Warden & admin
            </button>
          </div>
          <span className="eyebrow">
            {mode === "signup"
              ? "LET'S GET YOU SETTLED"
              : "GOOD TO HAVE YOU HERE"}
          </span>
          <h2>
            {mode === "signup" ? "Make yourself at home." : "Welcome back."}
            <span className="heading-spark">✦</span>
          </h2>
          <p className="auth-intro">
            {portal === "staff"
              ? "One place to look after every hostel."
              : mode === "signup"
                ? "Create your account in your hostel's own space."
                : "Choose your hostel and step into your community."}
          </p>
          {notice && (
            <div className="notice" role="status">
              <Icon name="checkcircle" size={18} />
              {notice}
            </div>
          )}
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              {portal === "student" && (
                <fieldset className="hostel-choice">
                  <legend>Your hostel</legend>
                  <div className="hostel-options">
                    {blocks.map((block, index) => (
                      <button
                        type="button"
                        key={block}
                        className={`hostel-option ${form.hostel_block === block ? "selected" : ""}`}
                        aria-pressed={form.hostel_block === block}
                        onClick={() => {
                          setForm({ ...form, hostel_block: block });
                          setError("");
                        }}
                      >
                        <Icon name="building" size={23} />
                        <strong>{block}</strong>
                        <small>
                          Hostel {String(index + 1).padStart(2, "0")}
                        </small>
                        {form.hostel_block === block && (
                          <span className="choice-check">
                            <Icon name="check" size={10} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="input-hint">
                    <Icon name="lock" size={12} /> Your account gives access to
                    your registered hostel only.
                  </p>
                </fieldset>
              )}
              {mode === "signup" && (
                <div className="field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    value={form.name}
                    onChange={update}
                    placeholder="What should we call you?"
                    required
                  />
                </div>
              )}
              <div className="field">
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  maxLength={254}
                  value={form.email}
                  onChange={update}
                  placeholder="you@kiit.ac.in"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="auth-password">Password</label>
                <div className="password-field">
                  <input
                    id="auth-password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    minLength={mode === "signup" ? 8 : 1}
                    maxLength={128}
                    value={form.password}
                    onChange={update}
                    placeholder={
                      mode === "signup"
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    required
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    <Icon name="eye" size={18} />
                  </button>
                </div>
              </div>
              {error && (
                <div className="error" role="alert">
                  <Icon name="alert" size={18} />
                  {error}
                </div>
              )}
              <button className="button primary auth-submit" disabled={busy}>
                {busy ? (
                  <>
                    <span className="loader" /> Just a moment…
                  </>
                ) : (
                  <>
                    {mode === "signup"
                      ? "Create my account"
                      : portal === "staff"
                        ? "Open staff workspace"
                        : `Continue to ${form.hostel_block}`}
                    <Icon name="arrow" size={18} />
                  </>
                )}
              </button>
            </fieldset>
          </form>
          <p className="auth-switch">
            {portal === "staff" ? (
              "Staff accounts are provided by your administrator."
            ) : (
              <>
                {mode === "login"
                  ? "New to HostelCare?"
                  : "Already part of the community?"}{" "}
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                    setForm({ ...form, password: "" });
                  }}
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </div>
        <footer className="access-footer">
          <Icon name="spark" size={15} /> A small step toward a better place to
          live.
        </footer>
      </main>
    </div>
  );
}
