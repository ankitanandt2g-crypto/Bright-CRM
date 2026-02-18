import React, { useMemo } from "react";
import { Layout, Menu, Button, Typography } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

export default function CustomerLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, customer } = useCustomerAuth();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/portal/projects")) return "projects";
    return "dashboard";
  }, [location.pathname]);

  const items = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "projects", icon: <ProjectOutlined />, label: "Projects" },
  ];

  const onMenuClick = ({ key }) => {
    if (key === "dashboard") navigate("/portal");
    if (key === "projects") navigate("/portal/projects");
  };

  const onLogout = () => {
    logout();
    // optional: also remove global token if you saved it
    localStorage.removeItem("token");
    navigate("/portal/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} breakpoint="lg" collapsedWidth="0">
        <div style={{ padding: 16 }}>
          <Title level={4} style={{ color: "white", margin: 0 }}>
            Customer Portal
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.7)" }}>
            {customer?.name || "Welcome"}
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={onMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {title || "Customer"}
            </Title>
            <Text type="secondary">{location.pathname}</Text>
          </div>

          <Button danger icon={<LogoutOutlined />} onClick={onLogout}>
            Logout
          </Button>
        </Header>

        <Content style={{ padding: 16, background: "#f5f7fb" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
