// leadApi.js
import axios from "axios";

const API = "http://localhost:8888/api/lead";

// ✅ helper: attach token in headers
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getLeads = async () => {
  const res = await axios.get(`${API}/list`, {
    headers: {
      ...authHeaders(),
    },
  });

  // ✅ Your backend response looks like: { success, result, message }
  // so return result safelyfrontend/src/
  return res.data?.result || [];
};

export const createLead = async (payload) => {
  const res = await axios.post(`${API}/create`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
};

export const updateLead = async (id, payload) => {
  const res = await axios.patch(`${API}/update/${id}`, payload, {
    headers: { ...authHeaders() },
  });
  return res.data;
};

export const deleteLead = async (id) => {
  const res = await axios.delete(`${API}/delete/${id}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
};

{/*export const createJobFromLead = async (leadId) => {
  const res = await axios.post(`${API}/convert-to-job/${leadId}`, {}, {
    headers: { ...authHeaders() },
  });

  return res.data?.result; // { job, customer }
};*/}

export const createJobFromLead = async (leadId) => {
  const res = await axios.post(`${API}/convert-to-job/${leadId}`, {}, {
    headers: { ...authHeaders() },
  });
  return res.data?.result;
};