import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

import AdminLayout from "../pages/Admin/Dashboard/AdminLayout";

// ✅ Existing/Completed modules
import Lead from "../pages/Lead";
import Jobs from "../pages/Jobs";
import Kanban from "../pages/Kanban";
import Planning from "../pages/Planning";

// ✅ Other sidebar modules
import Fabrication from "../pages/Fabrication";
import QC from "../pages/Quality";
import Installation from "../pages/Installation";
import Attendance from "../pages/Attendance";
import Customer from "../pages/Customer";
import Invoice from "../pages/Invoice";
import Payment from "../pages/Payment";
//import Settings from "../pages/Settings";
// import About from "../pages/About";

import WorkerDashboard from "../pages/Worker/WorkerDashboard";
import CustomerDashboard from "../pages/CustomerPortal/Dashboard";

export default function AppRouter() {
  return (
    <Routes>
      {/* App open -> Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ✅ Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ✅ Admin (nested) */}
      <Route element={<ProtectedRoute allowRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* ✅ default admin landing */}
          <Route index element={<Lead />} />

          {/* Completed */}
          <Route path="lead" element={<Lead />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="planning" element={<Planning />} />

          {/* Other modules */}
          <Route path="fabrication" element={<Fabrication />} />
          <Route path="qc" element={<QC />} />
          <Route path="installation" element={<Installation />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="customer" element={<Customer />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="payment" element={<Payment />} />
          

          {/* If you keep About in sidebar, create About page and enable this:
          <Route path="about" element={<About />} />
          */}
        </Route>
      </Route>

      {/* ✅ Worker */}
      <Route element={<ProtectedRoute allowRoles={["worker"]} />}>
        <Route path="/worker" element={<WorkerDashboard />} />
      </Route>

      {/* ✅ Customer */}
      <Route element={<ProtectedRoute allowRoles={["customer"]} />}>
        <Route path="/portal" element={<CustomerDashboard />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
