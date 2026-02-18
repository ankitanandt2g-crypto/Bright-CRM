{/*import { Navigate, Outlet } from "react-router-dom";

const getRole = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.role || null;
  } catch {
    return null;
  }
};

const redirectByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "worker") return "/worker";
  if (role === "customer") return "/portal";
  return "/login";
};

export default function ProtectedRoute({ allowRoles = [] }) {
  const token = localStorage.getItem("token");
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;

  if (!role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (allowRoles.length && !allowRoles.includes(role)) {
    return <Navigate to={redirectByRole(role)} replace />;
  }

  return <Outlet />;
}
*/}


import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowRoles = [] }) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles.length && !allowRoles.includes(user.role)) {
    // role mismatch -> send to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
