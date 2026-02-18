import axios from "axios";

const BASE = "http://localhost:8888/api"; // adjust if needed

const customerHeaders = () => {
  const token = localStorage.getItem("customer_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Login
export const customerLogin = async (payload) => {
  // backend suggest: POST /api/customer/auth/login
  const res = await axios.post(`${BASE}/customer/auth/login`, payload);
  return res.data;
};

// ✅ Profile/Details
export const getCustomerMe = async () => {
  // backend suggest: GET /api/customer/me
  const res = await axios.get(`${BASE}/customer/me`, { headers: customerHeaders() });
  return res.data;
};

// ✅ Projects list
export const getCustomerProjects = async () => {
  // backend suggest: GET /api/customer/projects
  const res = await axios.get(`${BASE}/customer/projects`, { headers: customerHeaders() });
  return res.data;
};

// ✅ Project details
export const getCustomerProjectById = async (projectId) => {
  // backend suggest: GET /api/customer/projects/:id
  const res = await axios.get(`${BASE}/customer/projects/${projectId}`, { headers: customerHeaders() });
  return res.data;
};
