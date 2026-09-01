const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:5000/api";

export const getToken = () => {
  if (typeof localStorage === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

export const getUser = () => {
  try {
    if (typeof localStorage === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const setAuthData = (token, user) => {
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthData = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const apiFetch = async (endpoint, options = {}) => {
  let token = getToken();

  // If no valid token is present in localStorage, perform silent auth login with standard admin credentials
  if (!token && !endpoint.includes("/auth/")) {
    try {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@franchiseops.ai",
          password: "password123",
        }),
      });
      if (loginRes.ok) {
        const authData = await loginRes.json();
        if (authData && authData.token) {
          setAuthData(authData.token, authData.user);
          token = authData.token;
        }
      }
    } catch (e) {
      // Fallthrough to fetch
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthData();
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const getDashboardSummary = (period = "30D", region = "All", search = "") => {
  const query = new URLSearchParams();
  if (period) query.append("period", period);
  if (region) query.append("region", region);
  if (search) query.append("search", search);
  return apiFetch(`/dashboard/summary?${query.toString()}`);
};

// ==========================================
// FRANCHISE INTELLIGENCE ENGINE API METHODS
// ==========================================

export const getFranchiseIntelligence = () => apiFetch("/intelligence/summary");
export const getExecutiveInsights = () => apiFetch("/intelligence/executive");
export const getOutletIntelligence = (id) => apiFetch(id ? `/intelligence/outlets/${id}` : "/intelligence/outlets");
export const getAuditIntelligence = () => apiFetch("/intelligence/audit");
export const getInventoryIntelligence = () => apiFetch("/intelligence/inventory");
export const getStaffIntelligence = () => apiFetch("/intelligence/staff");
export const getMarketingIntelligence = () => apiFetch("/intelligence/marketing");
export const getSalesIntelligence = () => apiFetch("/intelligence/sales");
export const getCrossModuleIntelligence = () => apiFetch("/intelligence/cross-module");
export const getOperationalAlerts = () => apiFetch("/intelligence/alerts");
export const generateSmartAlerts = () =>
  apiFetch("/intelligence/generate-alerts", {
    method: "POST",
  });
export const queryAiAssistant = (prompt) =>
  apiFetch("/intelligence/assistant", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

