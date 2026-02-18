import { useEffect, useState } from "react";
import { Table, Tag, Button, message, Space, Typography, Input, Card } from "antd";
import { useNavigate } from "react-router-dom";

import CustomerLayout from "../CustomerLayout";
import { getCustomerProjects } from "../../../api/customerPortalApi";

const { Title, Text } = Typography;

export default function CustomerProjects() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCustomerProjects();
      const list = Array.isArray(data?.result) ? data.result : [];
      setProjects(list);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = projects.filter((p) => {
    const name = (p?.name || "").toLowerCase();
    const code = (p?.code || "").toLowerCase();
    const status = (p?.status || "").toLowerCase();
    const query = q.toLowerCase();
    return name.includes(query) || code.includes(query) || status.includes(query);
  });

  const columns = [
    {
      title: "Project",
      dataIndex: "name",
      key: "name",
      render: (v) => <Text strong>{v || "-"}</Text>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (v) => <Text>{v || "-"}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (v) => <Tag>{v || "NA"}</Tag>,
    },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      width: 140,
      render: (v) => <Text>{v || "-"}</Text>,
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      width: 140,
      render: (v) => <Text>{v || "-"}</Text>,
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/portal/projects/${row?._id}`)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <CustomerLayout title="My Projects">
      <Card style={{ borderRadius: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Projects
            </Title>
            <Text type="secondary">Search and view your ongoing/completed projects.</Text>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Input
              placeholder="Search by name / code / status"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Button onClick={load} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <Table
          rowKey={(r) => r?._id}
          loading={loading}
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </CustomerLayout>
  );
}
