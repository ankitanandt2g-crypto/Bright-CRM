// frontend/src/pages/CustomerPortal/ProjectDetails/index.jsx
import { useEffect, useState } from "react";
import { Card, Descriptions, Tag, Button, Row, Col, Timeline, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { customerGetProjectById } from "../customerApi";

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

export default function CustomerProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await customerGetProjectById(id);
      setProject(res || null);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <Card>
          <Spin />
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: 16 }}>
        <Card
          title="Project Details"
          extra={<Button onClick={() => navigate("/portal/projects")}>Back</Button>}
        >
          Not found.
        </Card>
      </div>
    );
  }

  const history = Array.isArray(project?.history) ? project.history : [];
  // expected format:
  // history: [{ title:"Planning Started", at:"2026-02-10T...", note:"..." }]

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <Card
            title={project?.title || "Project"}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => navigate("/portal/projects")}>Back</Button>
              </div>
            }
          >
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Stage">
                <Tag color={stageColor(project?.stage)}>{project?.stage || "—"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{project?.status || "—"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {project?.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Completion">
                {project?.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString() : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Site / Location" span={2}>
                {project?.siteAddress || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>
                {project?.notes || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Progress Timeline">
            {history.length === 0 ? (
              <div style={{ opacity: 0.7 }}>No updates yet.</div>
            ) : (
              <Timeline
                items={history
                  .sort((a, b) => new Date(b?.at || 0) - new Date(a?.at || 0))
                  .map((h) => ({
                    children: (
                      <div>
                        <div style={{ fontWeight: 600 }}>{h?.title || "Update"}</div>
                        <div style={{ opacity: 0.7, fontSize: 12 }}>
                          {h?.at ? new Date(h.at).toLocaleString() : ""}
                        </div>
                        {h?.note ? <div style={{ marginTop: 6 }}>{h.note}</div> : null}
                      </div>
                    ),
                  }))}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Payment / Invoice Status">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Total Invoiced">
                ₹ {Number(project?.payment?.invoiced || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Paid">
                ₹ {Number(project?.payment?.paid || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Due">
                ₹ {Number(project?.payment?.due || 0).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 12, opacity: 0.7 }}>
              (Optional next step: show invoice list + PDF download)
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}