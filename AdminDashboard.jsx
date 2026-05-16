import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LogOut, Search, Trash2, Phone, MessageCircle, Mail, MapPin, Download } from "lucide-react";
import {
  apiListEnquiries, apiStats, apiUpdateStatus, apiDeleteEnquiry,
  clearToken, getToken, formatApiErrorDetail, authHeaders,
} from "../lib/auth";
import { waLink } from "../lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUSES = ["new", "contacted", "closed"];

function StatCard({ label, value, testid }) {
  return (
    <div className="admin-stat" data-testid={testid}>
      <div className="admin-stat-num">{value == null ? 0 : value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!getToken()) { nav("/admin/login"); return; }
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    setLoading(true);
    setErr("");
    try {
      const [s, list] = await Promise.all([apiStats(), apiListEnquiries()]);
      setStats(s);
      setEnquiries(list);
    } catch (e) {
      if (e.response?.status === 401) {
        clearToken();
        nav("/admin/login");
        return;
      }
      setErr(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { clearToken(); nav("/admin/login"); };

  const exportCsv = async () => {
    try {
      const res = await fetch(`${API}/admin/enquiries.csv`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.download = `dlas-enquiries-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr("CSV export failed");
    }
  };

  const onStatusChange = async (id, status) => {
    try {
      await apiUpdateStatus(id, status);
      await refresh();
    } catch (e) { setErr("Status update failed"); }
  };

  const onDelete = async (id) => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    try {
      await apiDeleteEnquiry(id);
      await refresh();
    } catch (e) { setErr("Delete failed"); }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (filter !== "all" && (e.status || "new") !== filter) return false;
      if (!q) return true;
      return [
        e.full_name, e.business_name, e.phone, e.email,
        e.city_state, e.category, e.message,
      ].some((v) => v && v.toLowerCase().includes(q));
    });
  }, [enquiries, filter, query]);

  if (!getToken()) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-shell admin-dashboard" data-testid="page-admin-dashboard">
      <header className="admin-header">
        <div>
          <div className="admin-logo-row">
            <span className="logo-top" style={{ color: "var(--primary)" }}>Dream's</span>
            <span className="logo-bottom" style={{ marginLeft: 10 }}>Admin</span>
          </div>
          <p className="admin-header-sub">Wholesale Enquiries Dashboard</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-outline-dark" onClick={exportCsv} data-testid="admin-export-csv-btn">
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-outline-dark" onClick={logout} data-testid="admin-logout-btn">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <section className="admin-stats-row" data-testid="admin-stats">
        <StatCard label="Total Enquiries"   value={stats?.total}     testid="stat-total" />
        <StatCard label="New / Open"        value={stats?.new}       testid="stat-new" />
        <StatCard label="Contacted"         value={stats?.contacted} testid="stat-contacted" />
        <StatCard label="Closed"            value={stats?.closed}    testid="stat-closed" />
      </section>

      <section className="admin-toolbar">
        <div className="admin-filters">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              className={`admin-pill ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
              data-testid={`admin-filter-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="admin-search">
          <Search size={14} />
          <input
            type="search"
            placeholder="Search name, business, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="admin-search"
          />
        </div>
      </section>

      {err && <div className="err-msg" style={{ margin: "0 32px 16px" }}>{err}</div>}

      <section className="admin-enquiries">
        {loading ? (
          <div className="admin-empty">Loading enquiries…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty" data-testid="admin-empty">
            {enquiries.length === 0 ? "No enquiries yet." : "No enquiries match your filter."}
          </div>
        ) : (
          filtered.map((e) => (
            <article key={e.id} className={`admin-card status-${e.status || "new"}`} data-testid={`enq-${e.id}`}>
              <div className="admin-card-head">
                <div>
                  <h3>{e.full_name}</h3>
                  <p className="admin-biz">{e.business_name}</p>
                </div>
                <div className="admin-card-actions">
                  <select
                    value={e.status || "new"}
                    onChange={(ev) => onStatusChange(e.id, ev.target.value)}
                    className={`status-select status-${e.status || "new"}`}
                    data-testid={`status-${e.id}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="icon-btn" onClick={() => onDelete(e.id)} aria-label="Delete" data-testid={`delete-${e.id}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="admin-card-grid">
                <div className="admin-field">
                  <Phone size={14} />
                  <a href={`tel:${e.phone}`}>{e.phone}</a>
                </div>
                <div className="admin-field">
                  <MessageCircle size={14} />
                  <a href={waLink(`Hello ${e.full_name}, regarding your enquiry for ${e.category}…`)} target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
                {e.email && (
                  <div className="admin-field"><Mail size={14} /><a href={`mailto:${e.email}`}>{e.email}</a></div>
                )}
                {e.city_state && (
                  <div className="admin-field"><MapPin size={14} />{e.city_state}</div>
                )}
                <div className="admin-field"><span className="admin-tag">{e.category}</span></div>
                {e.quantity && <div className="admin-field"><strong>Qty:</strong>&nbsp;{e.quantity}</div>}
              </div>

              {e.message && <p className="admin-message">{e.message}</p>}

              <div className="admin-meta">
                <span>{new Date(e.created_at).toLocaleString("en-IN")}</span>
                <span className="admin-id">#{e.id.slice(0, 8)}</span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
