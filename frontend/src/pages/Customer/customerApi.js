import axiosClient from "../../api/axiosClient";

// NOTE: backend endpoints adjust if your routes differ
export const getCustomers = async () => {
  console.log("Calling:", "http://localhost:8888/api/customer/list");
  const res = await axiosClient.get("/api/customer/list");
  return res.data?.result || [];
};


export const createCustomer = async (payload) => {
  const res = await axiosClient.post("/api/customer/create", payload);
  return res.data;
};

export const updateCustomer = async (id, payload) => {
  const res = await axiosClient.put(`/api/customer/update/${id}`, payload);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await axiosClient.delete(`/api/customer/delete/${id}`);
  return res.data;
};
