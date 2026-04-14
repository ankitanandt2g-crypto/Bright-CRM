import { useEffect, useMemo, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Typography,
  Divider,
  Space,
  Dropdown,
} from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  DollarOutlined,
  MailOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logoIcon from "@/style/images/logo-icon.png";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const API_BASE = "http://localhost:8888/api";

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [customerName, setCustomerName] = useState("Customer");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/customer/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const me = res.data?.result;
        setCustomerName(
          me?.name || me?.fullName || me?.customerName || "Customer"
        );
      } catch (e) {
        console.error("Failed to load customer profile:", e);
      }
    })();
  }, []);

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/portal/projects")) return "projects";
    if (location.pathname.startsWith("/portal/contact-us")) return "contact-us";
    if (location.pathname.startsWith("/portal/enquiry")) return "contact-us";
    if (location.pathname.startsWith("/portal/invoices")) return "invoices";
    if (location.pathname.startsWith("/portal/payments")) return "payments";
    if (location.pathname.startsWith("/portal/profile")) return "profile";
    if (
      location.pathname === "/portal" ||
      location.pathname.startsWith("/portal/dashboard")
    ) {
      return "dashboard";
    }
    return "dashboard";
  }, [location.pathname]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("customer");
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
      key: "contact-us",
      icon: <MailOutlined />,
      label: <Link to="/portal/contact-us">Contact Us</Link>,
    },
    {
      key: "invoices",
      icon: <DollarOutlined />,
      label: <Link to="/portal/invoices">My Invoices</Link>,
    },
    {
      key: "payments",
      icon: <CheckCircleOutlined />,
      label: <Link to="/portal/payments">Payments</Link>,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/portal/profile">Profile</Link>,
    },
  ];

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/portal/profile">Profile</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={onLogout}>Logout</span>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Sider
        width={260}
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="light"
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Logo section */}
        <div
          style={{
            padding: "14px 16px",
            minHeight: 72,
            cursor: "pointer",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
          }}
          onClick={() => navigate("/portal/dashboard")}
        >
          <img
            src={logoIcon}
            alt="Tech2Globe"
            style={{
              height: 42,
              width: collapsed ? 42 : 180,
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Customer card */}
        <div style={{ padding: "16px 16px 12px" }}>
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: 12,
              padding: collapsed ? 10 : 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid #ececec",
            }}
          >
            <Avatar icon={<UserOutlined />} />
            {!collapsed && (
              <div style={{ color: "#000", overflow: "hidden" }}>
                <Text
                  style={{
                    color: "#000",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  strong
                >
                  {customerName}
                </Text>
                <div style={{ fontSize: 12, color: "#666" }}>Customer</div>
              </div>
            )}
          </div>
        </div>

        <Divider style={{ margin: "8px 0 12px", borderColor: "#f0f0f0" }} />

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            borderRight: 0,
            background: "#fff",
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((prev) => !prev)}
            style={{ fontSize: 16 }}
          />

          <Space size={12}>
            <Dropdown
              menu={{ items: profileMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{customerName}</span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ background: "#f5f7fb", padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}