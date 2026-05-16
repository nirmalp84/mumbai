import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { apiLogin, getToken, formatApiErrorDetail } from "../lib/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  if (getToken()) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await apiLogin(email.trim().toLowerCase(), password);
      nav("/admin");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell" data-testid="page-admin-login">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="logo-top" style={{ color: "var(--primary)" }}>Dream's</span>
          <span className="logo-line" />
          <span className="logo-bottom">Latkans &amp; Laces</span>
        </div>
        <h1 className="admin-login-title">Admin Login</h1>
        <p className="admin-login-sub">Manage wholesale enquiries</p>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required
              data-testid="admin-email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" required
              data-testid="admin-password"
            />
          </div>
          {err && <div className="err-msg" data-testid="admin-login-error" style={{ marginBottom: 12 }}>{err}</div>}
          <button type="submit" className="btn btn-gold btn-block" disabled={loading} data-testid="admin-login-submit">
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}
