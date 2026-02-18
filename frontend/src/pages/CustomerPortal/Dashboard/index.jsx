import CustomerLayout from "../CustomerLayout";

import { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Button, message, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import { getCustomerMe } from "../../../api/customerPortalApi";
import { useCustomerAuth } from "../../../context/CustomerAuthContext";

const { Title, Text } = Typography;

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();
  const { logout } = useCustomerAuth();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCustomerMe();
      // expected: { success:true, result:{...customer} }
      setMe(data?.result || null);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0 }}>Customer Dashboard</Title>
        <Button danger onClick={() => { logout(); navigate("/customer/login"); }}>
          Logout
        </Button>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card title="My Details" style={{ borderRadius: 12 }}>
            {loading ? (
              <Skeleton active />
            ) : (
              <>
                <Text strong>Name:</Text> <Text>{me?.name || "-"}</Text><br />
                <Text strong>Email:</Text> <Text>{me?.email || "-"}</Text><br />
                <Text strong>Phone:</Text> <Text>{me?.phone || "-"}</Text><br />
                <Text strong>Company:</Text> <Text>{me?.company || "-"}</Text><br />
                <Text strong>Address:</Text> <Text>{me?.address || "-"}</Text>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card title="My Projects" style={{ borderRadius: 12 }}>
            <Text type="secondary">
              View your ongoing/completed projects, status, milestones and tasks.
            </Text>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button type="primary" onClick={() => navigate("/customer/projects")}>
                Open Projects
              </Button>
              <Button onClick={load}>Refresh</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
