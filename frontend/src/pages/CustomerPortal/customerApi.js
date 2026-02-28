// frontend/src/pages/CustomerPortal/customerApi.js
import axios from "axios";

const API_BASE = "http://localhost:8888/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const customerGetMe = async () => {
  const res = await axios.get(`${API_BASE}/customer/me`, { headers: authHeaders() });
  return res.data?.result;
};

export const customerGetProjects = async () => {
  const res = await axios.get(`${API_BASE}/customer/projects`, { headers: authHeaders() });
  return res.data?.result || [];
};

export const customerGetProjectById = async (id) => {
  const res = await axios.get(`${API_BASE}/customer/projects/${id}`, { headers: authHeaders() });
  return res.data?.result;
};

export const customerGetPaymentSummary = async () => {
  const res = await axios.get(`${API_BASE}/customer/payments/summary`, { headers: authHeaders() });
  return res.data?.result;
};

export const customerSubmitEnquiry = async (payload) => {
  const res = await axios.post(`${API_BASE}/customer/enquiry`, payload, { headers: authHeaders() });
  return res.data;
};