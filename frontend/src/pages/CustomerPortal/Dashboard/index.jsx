// frontend/src/pages/CustomerPortal/Dashboard/index.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Button, Table, Tag, Form, Input, message, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import {
  customerGetMe,
  customerGetProjects,
  customerGetPaymentSummary,
  customerSubmitEnquiry,
} from "../customerApi";

const stageColor = (stage) => {
  const s = String(stage || "").toLowerCase();
  if (s.includes("planning")) return "blue";
  if (s.includes("fabrication")) return "purple";
  if (s.includes("quality")) return "gold";
  if (s.includes("installation")) return "green";
  if (s.includes("hold")) return "orange";
  if (s.includes("closed") || s.includes("completed")) return "success";
  return "default";
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [me, setMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [payment, setPayment] = useState(null);

  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [meRes, projRes, payRes] = await Promise.all([
        customerGetMe().catch(() => null),
        customerGetProjects().catch(() => []),
        customerGetPaymentSummary().catch(() => null),
      ]);

      setMe(meRes);
      setProjects(Array.isArray(projRes) ? projRes : []);
      setPayment(payRes);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to load customer dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const activeProjects = useMemo(() => {
    return projects.filter((p) => !String(p?.status || "").toLowerCase().includes("closed")).length;
  }, [projects]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0) - new Date(a?.updatedAt || a?.createdAt || 0))
      .slice(0, 5);
  }, [projects]);

  const onSubmitEnquiry = async (values) => {
    setEnquiryLoading(true);
    try {
      const payload = {
        subject: values.subject,
        message: values.message,
        // optional fields:
        // projectId: values.projectId,
      };
      const res = await customerSubmitEnquiry(payload);
      message.success(res?.message || "Enquiry submitted");
      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to submit enquiry");
    } finally {
      setEnquiryLoading(false);
    }
  };

  const columns = [
    { title: "Project", dataIndex: "title", key: "title" },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (v) => <Tag color={stageColor(v)}>{v || "—"}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => <Tag>{v || "—"}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Button type="link" onClick={() => navigate(`/portal/projects/${row?._id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Welcome{me?.name ? `, ${me.name}` : ""} 👋
          </div>
          <div style={{ opacity: 0.7 }}>Track your project progress and payments.</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => navigate("/portal/projects")}>My Projects</Button>
          <Button type="primary" onClick={() => form.scrollToField("subject")}>
            Raise Enquiry
          </Button>
        </div>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="Active Projects" value={activeProjects} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic
              title="Total Due"
              value={Number(payment?.due || 0)}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic
              title="Paid"
              value={Number(payment?.paid || 0)}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            loading={loading}
            title="Recent Projects"
            extra={<Button type="link" onClick={() => navigate("/portal/projects")}>View all</Button>}
          >
            <Table
              rowKey={(r) => r?._id}
              columns={columns}
              dataSource={recentProjects}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card loading={loading} title="Payment Snapshot">
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Statistic title="Invoiced" value={Number(payment?.invoiced || 0)} precision={2} prefix="₹" />
              </Col>
              <Col span={24}>
                <Statistic title="Paid" value={Number(payment?.paid || 0)} precision={2} prefix="₹" />
              </Col>
              <Col span={24}>
                <Statistic title="Due" value={Number(payment?.due || 0)} precision={2} prefix="₹" />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Raise an Enquiry / New Requirement">
            <div style={{ opacity: 0.7, marginBottom: 8 }}>
              Use this form to request a change, new service, or report an issue.
            </div>
            <Divider style={{ margin: "12px 0" }} />

            <Form form={form} layout="vertical" onFinish={onSubmitEnquiry}>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={10}>
                  <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: "Subject is required" }]}
                  >
                    <Input placeholder="e.g., Add new railing section / Fix measurement mismatch" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={14}>
                  <Form.Item
                    label="Message"
                    name="message"
                    rules={[{ required: true, message: "Message is required" }]}
                  >
                    <Input.TextArea rows={3} placeholder="Explain your request in detail..." />
                  </Form.Item>
                </Col>
              </Row>

              <Button type="primary" htmlType="submit" loading={enquiryLoading}>
                Submit Enquiry
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}