import React, { useState } from "react";
import "./LoginSignup.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function LoginSignup({ onLogin }) {
  const [action, setAction] = useState("Log In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async () => {
    setError("");

    const url =
      action === "Sign Up"
        ? "http://localhost:8080/api/signup"
        : "http://localhost:8080/api/login";

    const body =
      action === "Sign Up" ? { name, email, password } : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Failed to ${action.toLowerCase()}`);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.name,
          email: data.email,
        })
      );

      onLogin();
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="container" style={{ width: "40%" }}>
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
        <div className="switch-action">
          {action === "Sign Up" ? (
            <span>
              Already have an account?{" "}
              <button onClick={() => setAction("Log In")}>Log In</button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button onClick={() => setAction("Sign Up")}>Sign Up</button>
            </span>
          )}
        </div>
      </div>

      <div className="inputs">
        {action === "Sign Up" && (
          <div className="input">
            <i className="bi bi-person-fill icon"></i>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="input">
          <i className="bi bi-envelope-fill icon"></i>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <i className="bi bi-lock-fill icon"></i>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="ErrorMsg">{error}</p>}

      <button onClick={handleSubmit} className="submit">
        {action}
      </button>
    </div>
  );
}
