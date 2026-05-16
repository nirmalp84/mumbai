import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "dlas_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const apiLogin = async (email, password) => {
  const { data } = await axios.post(`${API}/auth/login`, { email, password });
  setToken(data.token);
  return data;
};

export const apiMe = async () => {
  const { data } = await axios.get(`${API}/auth/me`, { headers: authHeaders() });
  return data;
};

export const apiListEnquiries = async () => {
  const { data } = await axios.get(`${API}/admin/enquiries`, { headers: authHeaders() });
  return data;
};

export const apiStats = async () => {
  const { data } = await axios.get(`${API}/admin/stats`, { headers: authHeaders() });
  return data;
};

export const apiUpdateStatus = async (id, status) => {
  const { data } = await axios.patch(`${API}/admin/enquiries/${id}`, { status }, { headers: authHeaders() });
  return data;
};

export const apiDeleteEnquiry = async (id) => {
  const { data } = await axios.delete(`${API}/admin/enquiries/${id}`, { headers: authHeaders() });
  return data;
};

export const formatApiErrorDetail = (detail) => {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
};
