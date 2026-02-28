import React from "react";
import { Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import AdminDashboard from "../pages/Admin/Dashboard";
import WorkerDashboard from "../pages/Worker/WorkerDashboard";

// ✅ Customer Portal Layout (Sidebar + Dynamic Logo)
import CustomerLayout from "../apps/Navigation/CustomerLayout";

// ✅ Customer Portal Pages
import CustomerDashboard from "../pages/CustomerPortal/Dashboard";
import CustomerLogin from "../pages/CustomerPortal/Login";
import CustomerProjects from "../pages/CustomerPortal/Projects";
import CustomerProjectDetails from "../pages/CustomerPortal/ProjectDetails";

import CustomerProtectedRoute from "./CustomerProtectedRoute";

const routes = {
  default: [
    { path: "/login", element: <Login /> },
    { path: "*", element: <div>Route not found</div> },
  ],

  admin: [{ path: "/admin", element: <AdminDashboard /> }],

  worker: [{ path: "/worker", element: <WorkerDashboard /> }],

  customer: [
    // ✅ Customer login page (PUBLIC)
    { path: "/portal/login", element: <CustomerLogin /> },

    // ✅ Customer Portal Layout (PROTECTED)
    {
      path: "/portal",
      element: (
        <CustomerProtectedRoute>
          <CustomerLayout />
        </CustomerProtectedRoute>
      ),
      children: [
        // ✅ /portal -> /portal/dashboard redirect
        { index: true, element: <Navigate to="dashboard" replace /> },

        { path: "dashboard", element: <CustomerDashboard /> },
        { path: "projects", element: <CustomerProjects /> },
        { path: "projects/:id", element: <CustomerProjectDetails /> },

        // ✅ placeholders (so sidebar routes won't break)
        { path: "payments", element: <div style={{ padding: 16 }}>Payments Page</div> },
        { path: "enquiry", element: <div style={{ padding: 16 }}>Enquiry Page</div> },
        { path: "profile", element: <div style={{ padding: 16 }}>Profile Page</div> },
      ],
    },
  ],
};

export default routes;