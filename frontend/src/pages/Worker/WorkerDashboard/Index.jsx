import { Button, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function WorkerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ padding: 20 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Worker Dashboard</Title>
          <Text>Welcome, {user?.name || "Worker"}</Text>
        </Col>

        <Col>
          <Button type="primary" danger onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      <div style={{ marginTop: 20 }}>
        <Text>Worker task panel</Text>
      </div>
    </div>
  );
}
