import { useEffect, useState } from "react";
import { Card, Tag, Typography, Button, message, Skeleton, Descriptions, Divider, Empty } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import CustomerLayout from "../CustomerLayout";
import { getCustomerProjectById } from "../../../api/customerPortalApi";

const { Title, Text } = Typography;

export default function CustomerProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCustomerProjectById(id);
      setProject(data?.result || null);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const milestones = Array.isArray(project?.milestones) ? project.milestones : [];
  const tasks = Array.isArray(project?.tasks) ? project.tasks : [];

  return (
    <CustomerLayout title="Project Details">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button onClick={() => navigate("/portal/projects")}>Back to Projects</Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        {loading ? (
          <Skeleton active />
        ) : !project ? (
          <Empty description="Project not found" />
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Title level={4} style={{ margin: 0 }}>
                {project?.name || "-"}
              </Title>
              {project?.status ? <Tag>{project.status}</Tag> : null}
            </div>

            <Text type="secondary">
              View project information, dates, milestones and tasks.
            </Text>

            <Divider style={{ margin: "16px 0" }} />

            <Descriptions bordered size="middle" column={{ xs: 1, sm: 2, md: 2, lg: 2 }}>
              <Descriptions.Item label="Project Code">{project?.code || "-"}</Descriptions.Item>
              <Descriptions.Item label="Client / Company">{project?.company || "-"}</Descriptions.Item>

              <Descriptions.Item label="Start Date">{project?.startDate || "-"}</Descriptions.Item>
              <Descriptions.Item label="End Date">{project?.endDate || "-"}</Descriptions.Item>

              <Descriptions.Item label="Budget">{project?.budget || "-"}</Descriptions.Item>
              <Descriptions.Item label="Priority">{project?.priority || "-"}</Descriptions.Item>

              <Descriptions.Item label="Description" span={2}>
                {project?.description || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* ✅ Optional sections (only if backend sends milestones/tasks arrays) */}
            <Divider style={{ margin: "18px 0" }} />

            <Title level={5} style={{ marginBottom: 8 }}>
              Milestones
            </Title>
            {milestones.length === 0 ? (
              <Empty description="No milestones found" />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {milestones.map((m, idx) => (
                  <Card key={m?._id || idx} size="small" style={{ borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <Text strong>{m?.title || `Milestone ${idx + 1}`}</Text>
                      {m?.status ? <Tag>{m.status}</Tag> : null}
                    </div>
                    <Text type="secondary">{m?.dueDate ? `Due: ${m.dueDate}` : ""}</Text>
                    <div style={{ marginTop: 6 }}>
                      <Text>{m?.description || ""}</Text>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Divider style={{ margin: "18px 0" }} />

            <Title level={5} style={{ marginBottom: 8 }}>
              Tasks
            </Title>
            {tasks.length === 0 ? (
              <Empty description="No tasks found" />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {tasks.map((t, idx) => (
                  <Card key={t?._id || idx} size="small" style={{ borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <Text strong>{t?.title || `Task ${idx + 1}`}</Text>
                      {t?.status ? <Tag>{t.status}</Tag> : null}
                    </div>
                    <Text type="secondary">{t?.dueDate ? `Due: ${t.dueDate}` : ""}</Text>
                    <div style={{ marginTop: 6 }}>
                      <Text>{t?.description || ""}</Text>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </CustomerLayout>
  );
}
