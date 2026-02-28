import axios from "axios";

const API_BASE = "http://localhost:8888/api";

export const getPublicSettings = async () => {
  const res = await axios.get(`${API_BASE}/settings/public`);
  return res.data?.result;
};