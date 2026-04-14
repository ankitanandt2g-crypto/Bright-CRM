import axios from "axios";
const API = "http://localhost:8888/api/quote";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createQuote = async (payload) => {
  const res = await axios.post(`${API}/create`, payload, {
    headers: { ...authHeaders() },
  });
  return res.data;
};

export const approveQuote = async (quoteId, payload = {}) => {
  const res = await axios.post(`${API}/approve/${quoteId}`, payload, {
    headers: { ...authHeaders() },
  });
  return res.data;
};