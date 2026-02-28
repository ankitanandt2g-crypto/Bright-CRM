// frontend/src/pages/CustomerPortal/Projects/index.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, Table, Tag, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { customerGetProjects } from "../customerApi";

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

export default function CustomerProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await customerGetProjects();
      setProjects(Array.isArray(res) ? res : []);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((p) => {
      const title = String(p?.title || "").toLowerCase();
      const status = String(p?.status || "").toLowerCase();
      const stage = String(p?.stage || "").toLowerCase();
      return title.includes(query) || status.includes(query) || stage.includes(query);
    });
  }, [projects, q]);

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
      title: "Last Update",
      key: "updatedAt",
      render: (_, row) => {
        const d = row?.updatedAt || row?.createdAt;
        if (!d) return "—";
        return new Date(d).toLocaleString();
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Button type="link" onClick={() => navigate(`/portal/projects/${row?._id}`)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title="My Projects"
        extra={
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by project, stage, status..."
            style={{ width: 320 }}
            allowClear
          />
        }
      >
        <Table
          rowKey={(r) => r?._id}
          loading={loading}
          columns={columns}
          dataSource={filtered}
        />
      </Card>
    </div>
  );
}