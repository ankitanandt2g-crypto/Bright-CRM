import { Layout, Button, Typography } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../../../apps/Navigation/NavigationContainer";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* ✅ Existing Sidebar */}
      <Navigation basePath="/admin" />

      {/* ✅ Main Area */}
      <Layout
        style={{
          // Sidebar has left:20px in your NavigationContainer, so give some gap
          marginLeft: 20,
          marginTop: 20,
          marginRight: 20,
          background: "transparent",
        }}
      >
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontWeight: 600 }}>
            Admin Panel{user?.name ? ` — ${user.name}` : ""}
          </Text>

          <Button danger onClick={logout}>
            Logout
          </Button>
        </Header>

        <Content
          style={{
            marginTop: 16,
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            minHeight: "calc(100vh - 20px - 64px - 16px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
