import React from "react";
import { Navigate } from "react-router-dom";

export default function CustomerProtectedRoute({ children }) {
  const token = localStorage.getItem("customer_token");

  if (!token) {
    return <Navigate to="/portal/login" replace />;
  }

  return children;
}
