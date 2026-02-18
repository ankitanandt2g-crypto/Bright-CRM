import React from "react";

import Login from "../pages/Auth/Login";
import AdminDashboard from "../pages/Admin/Dashboard";
import WorkerDashboard from "../pages/Worker/WorkerDashboard";

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
  {
    path: "/portal",
    element: (
      <CustomerProtectedRoute>
        <CustomerDashboard />
      </CustomerProtectedRoute>
    ),
  },
  {
    path: "/portal/projects",
    element: (
      <CustomerProtectedRoute>
        <CustomerProjects />
      </CustomerProtectedRoute>
    ),
  },
  {
    path: "/portal/projects/:id",
    element: (
      <CustomerProtectedRoute>
        <CustomerProjectDetails />
      </CustomerProtectedRoute>
    ),
  },

  // ✅ login page public
  { path: "/portal/login", element: <CustomerLogin /> },
],

export default routes;
