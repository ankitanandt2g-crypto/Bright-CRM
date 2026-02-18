import axios from "axios";

const API_BASE = "http://localhost:8888/api/auth";

export const loginApi = async (payload) => {
  // payload: { role, identifier, password }
  const res = await axios.post(`${API_BASE}/login`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const registerCustomerApi = async (payload) => {
  // payload: { name, email, password }
  const res = await axios.post(`${API_BASE}/customer/register`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const forgotPasswordApi = async (payload) => {
  // payload: { email }
  const res = await axios.post(`${API_BASE}/forgot-password`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const resetPasswordApi = async (payload) => {
  // payload: { token, newPassword }
  const res = await axios.post(`${API_BASE}/reset-password`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
