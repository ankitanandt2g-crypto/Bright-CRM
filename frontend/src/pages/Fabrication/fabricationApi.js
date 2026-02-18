import axios from "axios";

const API = "http://localhost:8888/api/fabrication";

const authHeaders = () => {
  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ GET /api/fabrication/list?jobId=xxxx
export const getFabricationItems = async (jobId) => {
  const res = await axios.get(`${API}/list`, {
    params: { jobId },
    headers: { ...authHeaders() },
  });
  return res.data?.result || [];
};

// ✅ POST /api/fabrication/create
export const createFabricationItem = async (payload) => {
  const res = await axios.post(`${API}/create`, payload, {
    headers: { ...authHeaders() },
  });
  return res.data?.result || res.data;
};

// ✅ PATCH /api/fabrication/update/:id
export const updateFabricationItem = async (id, payload) => {
  const res = await axios.patch(`${API}/update/${id}`, payload, {
    headers: { ...authHeaders() },
  });
  return res.data?.result || res.data;
};

// ✅ DELETE /api/fabrication/delete/:id
export const deleteFabricationItem = async (id) => {
  const res = await axios.delete(`${API}/delete/${id}`, {
    headers: { ...authHeaders() },
  });
  return res.data;
};
