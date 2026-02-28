import { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Button, Avatar, Typography, Divider } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  DollarOutlined,
  FormOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const API_BASE = "http://localhost:8888/api";

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [companyName, setCompanyName] = useState("Company");
  const [logoUrl, setLogoUrl] = useState("");
  const [customerName, setCustomerName] = useState("Customer");

  // ✅ fetch company settings (logo + name)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings/public`);
        const s = res.data?.result;
        setCompanyName(s?.companyName || "Company");
        setLogoUrl(s?.logoUrl || "");
      } catch (e) {}
    })();
  }, []);

  // ✅ optional: customer name show (if customer/me exists)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/customer/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const me = res.data?.result;
        setCustomerName(me?.name || me?.fullName || "Customer");
      } catch (e) {
        // ignore if API not ready
      }
    })();
  }, []);

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/portal/projects")) return "projects";
    if (location.pathname.startsWith("/portal/payments")) return "payments";
    if (location.pathname.startsWith("/portal/enquiry")) return "enquiry";
    if (location.pathname.startsWith("/portal/profile")) return "profile";
    return "dashboard";
  }, [location.pathname]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/portal/login", { replace: true });
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/portal/dashboard">Dashboard</Link>,
    },
    {
      key: "projects",
      icon: <ProjectOutlined />,
      label: <Link to="/portal/projects">My Projects</Link>,
    },
    {
      key: "payments",
      icon: <DollarOutlined />,
      label: <Link to="/portal/payments">Payments</Link>,
    },
    {
      key: "enquiry",
      icon: <FormOutlined />,
      label: <Link to="/portal/enquiry">Raise Enquiry</Link>,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/portal/profile">Profile</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ✅ SIDEBAR */}
      <Sider
        width={260}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: "#001529" }}
      >
        {/* Logo header */}
        <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {logoUrl ? (
              <img
                src={`http://localhost:8888${logoUrl}`}
                alt="logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontWeight: 800 }}>C</span>
            )}
          </div>

          {!collapsed && (
            <div style={{ color: "#fff", lineHeight: 1.1 }}>
              <div style={{ fontWeight: 800 }}>{companyName}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Customer Portal</div>
            </div>
          )}
        </div>

        {/* customer mini card */}
        <div style={{ padding: "0 16px 12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: collapsed ? 10 : 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Avatar icon={<UserOutlined />} />
            {!collapsed && (
              <div style={{ color: "#fff", overflow: "hidden" }}>
                <Text style={{ color: "#fff" }} strong>
                  {customerName}
                </Text>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Customer</div>
              </div>
            )}
          </div>
        </div>

        <Divider style={{ margin: "8px 0", borderColor: "rgba(255,255,255,0.08)" }} />

        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>

      {/* ✅ MAIN */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
        </Header>

        <Content style={{ background: "#f5f7fb", padding: 16 }}>
          {/* ✅ IMPORTANT: this renders customer pages inside layout */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}