const BASE_URL = "https://fintrack-ai-backend-7qnw.onrender.com";

// ── Auth helpers ──────────────────────────────────────
export const getToken  = () => localStorage.getItem("kharcha_token");
export const getUser   = () => JSON.parse(localStorage.getItem("kharcha_user") || "null");
export const saveAuth  = (data) => {
  localStorage.setItem("kharcha_token", data.token);
  localStorage.setItem("kharcha_user", JSON.stringify({
    name: data.name, email: data.email, user_id: data.user_id
  }));

};
export const clearAuth = () => {
  localStorage.removeItem("kharcha_token");
  localStorage.removeItem("kharcha_user");
};

// ── Global 401 handler ────────────────────────────────
// App.js calls setUnauthorizedHandler once on mount.
// Any 401 from any API call triggers clearAuth + redirect.
let _onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { _onUnauthorized = fn; };

const handle401 = (msg = "Session expired. Please login again.") => {
  clearAuth();
  if (_onUnauthorized) _onUnauthorized(msg);
};

// ── Fetch wrappers ────────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

const authGet = async (url) => {
  const res = await fetch(url, { headers: authHeaders() });
  if (res.status === 401) { handle401(); throw new Error("401"); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const authPost = async (url, body) => {
  const res = await fetch(url, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(body)
  });
  if (res.status === 401) { handle401(); throw new Error("401"); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const authDelete = async (url) => {
  const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
  if (res.status === 401) { handle401(); throw new Error("401"); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ── API calls ─────────────────────────────────────────
export const api = {
  // Public — no token
  register: async (name, email, password) => {
    const res  = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    return data;
  },

  login: async (email, password) => {
    const res  = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    return data;
  },

  predictCategory: async (text) => {
    const res = await fetch(`${BASE_URL}/predict-category`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  // Authed — expenses
  addExpense:    (data)  => authPost(`${BASE_URL}/expenses`, data),
  getExpenses:   (month) => authGet(month ? `${BASE_URL}/expenses?month=${month}` : `${BASE_URL}/expenses`),
  deleteExpense: (id)    => authDelete(`${BASE_URL}/expenses/${id}`),

  // Authed — AI
  getAnalysis:     (month) => authGet(`${BASE_URL}/analysis/${month}`),
  getKharchaScore: (month) => authGet(`${BASE_URL}/kharcha-score/${month}`),
  getSuggestions:  (month) => authGet(`${BASE_URL}/suggestions/${month}`),

  // Authed — budget
  setBudget:  (data)  => authPost(`${BASE_URL}/budgets`, data),
  getBudgets: (month) => authGet(`${BASE_URL}/budgets?month=${month}`),

  // Authed — goals
  predictGoal: (data) => authPost(`${BASE_URL}/goals/predict`, data),
  getGoals:    ()     => authGet(`${BASE_URL}/goals`),
  deleteGoal:  (id)   => authDelete(`${BASE_URL}/goals/${id}`),

  // Auth — change password
  changePassword: (current_password, new_password) =>
    authPost(`${BASE_URL}/auth/change-password`, { current_password, new_password }),
};

export const CATEGORIES = ["Food", "Travel", "Entertainment", "Shopping", "Bills", "Rent"];

export const CATEGORY_COLORS = {
  Food: "#6366f1", Travel: "#f59e0b", Entertainment: "#ec4899",
  Shopping: "#10b981", Bills: "#3b82f6", Rent: "#ef4444",
};

export const CATEGORY_ICONS = {
  Food: "🍔", Travel: "🚗", Entertainment: "🎬",
  Shopping: "🛍️", Bills: "📱", Rent: "🏠",
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
