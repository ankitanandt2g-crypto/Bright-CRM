import axios from "axios";

const API_BASE = "http://localhost:8888/api";

// change this if your backend route is different:
export const loginRequest = async (payload) => {
  const res = await axios.post(`${API_BASE}/auth/login`, payload);
  return res.data;
};
