import axios from "axios";

const API_BASE = "/api/installation";

export const getInstallationItems = async (jobId) => {
    if (!jobId) return [];
    const res = await axios.get(`${API_BASE}/list/${jobId}`);
    return res?.data?.result || [];
};

export const getInstallationItem = async (id) => {
    const res = await axios.get(`${API_BASE}/read/${id}`);
    return res?.data?.result || null;
};

export const createInstallationItem = async (payload) => {
    const res = await axios.post(`${API_BASE}/create`, payload);
    return res?.data;
};

export const updateInstallationItem = async (id, payload) => {
    const res = await axios.patch(`${API_BASE}/update/${id}`, payload);
    return res?.data;
};

export const deleteInstallationItem = async (id) => {
    const res = await axios.delete(`${API_BASE}/delete/${id}`);
    return res?.data;
};

export const markInstallationComplete = async (jobId) => {
    const res = await axios.patch(`${API_BASE}/complete/${jobId}`);
    return res?.data;
};