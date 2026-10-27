import { useEffect, useState } from "react";
import { api, hasSession, saveSession } from "./api";
import { Brand } from "./components";
import Icon from "./Icon";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(hasSession);
  const [restoreError, setRestoreError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [user]);
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setChecking(false);
      setRestoreError("");
      setNotice("Your session ended. Please sign in again.");
    };
    window.addEventListener("hostelcare:expired", expired);
    return () => window.removeEventListener("hostelcare:expired", expired);
  }, []);
  useEffect(() => {
    if (!hasSession()) return;
    const controller = new AbortController();
    api("/api/me", { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setUser(data.user);
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.status !== 401)
          setRestoreError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, [attempt]);
  if (checking || restoreError)
    return (
      <div className="session-screen">
        <Brand />
        <div className="session-card">
          {checking ? (
            <>
              <span className="loader" />
              <h1>Getting your space ready</h1>
              <p>Restoring your secure session…</p>
            </>
          ) : (
            <>
              <Icon name="alert" />
              <h1>Let's reconnect</h1>
              <p role="alert">{restoreError}</p>
              <button
                className="button primary"
                onClick={() => {
                  setChecking(true);
                  setRestoreError("");
                  setAttempt((value) => value + 1);
                }}
              >
                Try again
              </button>
              <button
                className="text-button"
                onClick={() => {
                  saveSession(null);
                  setRestoreError("");
                }}
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    );
  if (!user)
    return (
      <Auth
        notice={notice}
        onLogin={(value) => {
          setUser(value);
          setNotice("");
        }}
      />
    );
  return (
    <Dashboard
      key={user.id}
      user={user}
      onLogout={() => {
        saveSession(null);
        setUser(null);
        setNotice("You have signed out safely.");
      }}
    />
  );
}
export default App;
