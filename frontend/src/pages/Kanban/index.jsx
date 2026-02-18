import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Empty,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useJob } from "../../context/JobContext";
import {
  getKanbanTasks,
  createKanbanTask,
  updateKanbanTask,
  deleteKanbanTask,
} from "./kanbanApi";

const { Option } = Select;

const columns = ["Backlog", "Active", "On Hold", "Closed"];

// ✅ Exact colors like your screenshot
const STATUS_STYLES = {
  Backlog: {
    color: "#595959",
    backgroundColor: "#f5f5f5",
    borderColor: "#d9d9d9",
  },
  Active: {
    color: "#389e0d",
    backgroundColor: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  "On Hold": {
    color: "#d46b08",
    backgroundColor: "#fff7e6",
    borderColor: "#ffd591",
  },
  Closed: {
    color: "#cf1322",
    backgroundColor: "#fff1f0",
    borderColor: "#ffa39e",
  },
};

const statusTagStyle = (status) => ({
  ...(STATUS_STYLES[status] || STATUS_STYLES.Backlog),
  border: "1px solid",
  fontWeight: 500,
});

export default function Kanban() {
  const navigate = useNavigate();
  const location = useLocation();

  const { activeJobId, setActiveJobId } = useJob();

  const jobId = activeJobId || localStorage.getItem("activeJobId");
  const jobKey = jobId ? `activeJobData_${jobId}` : null;

  const [jobData, setJobData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // ✅ Guard + restore job info (DYNAMIC)
  useEffect(() => {
    if (!jobId) {
      message.warning("Please open a Job first");
      navigate("/jobs");
      return;
    }

    // restore context from localStorage
    if (!activeJobId && jobId) {
      setActiveJobId(jobId);
    }

    // clear old job header when job changes
    setJobData(null);

    // ✅ prefer incoming state else job-specific localStorage
    const incomingJob = location.state?.job || location.state?.fromJob;

    if (incomingJob) {
      setJobData(incomingJob);
      if (jobKey) localStorage.setItem(jobKey, JSON.stringify(incomingJob));
    } else {
      const saved = jobKey ? localStorage.getItem(jobKey) : null;
      if (saved) setJobData(JSON.parse(saved));
    }

    fetchTasks(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, location.state]);

  // ✅ fetch tasks
  const fetchTasks = async (jobIdParam) => {
    const id = jobIdParam || jobId;
    if (!id) return;

    setLoading(true);
    try {
      const data = await getKanbanTasks(id);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ group by status column
  const grouped = useMemo(() => {
    const map = {};
    columns.forEach((c) => (map[c] = []));
    tasks.forEach((t) => {
      const key = columns.includes(t.status) ? t.status : "Backlog";
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  // ✅ Add task
  const onAddTask = async (values) => {
    const payload = {
      jobId,
      title: values.title,
      description: values.description || "",
      status: "Backlog",
    };

    try {
      const created = await createKanbanTask(payload);
      setTasks((prev) =>
        created?._id
          ? [created, ...prev]
          : [{ _id: `tmp_${Date.now()}`, ...payload }, ...prev]
      );
      message.success("Task added");
    } catch {
      message.error("Task add failed");
    }

    setOpen(false);
    form.resetFields();
  };

  // ✅ Move task + status style auto updates
  const moveTask = async (task, newStatus) => {
    const oldStatus = task.status;

    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      if (!String(task._id).startsWith("tmp_")) {
        await updateKanbanTask(task._id, { status: newStatus });
      }
    } catch {
      message.error("Move failed");
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: oldStatus } : t))
      );
    }
  };

  // ✅ Delete task
  const removeTask = async (task) => {
    const oldTasks = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== task._id));

    try {
      if (!String(task._id).startsWith("tmp_")) {
        await deleteKanbanTask(task._id);
      }
      message.success("Deleted");
    } catch {
      message.error("Delete failed");
      setTasks(oldTasks);
    }
  };

  if (!jobId) return null;

  const isEmpty = !loading && tasks.length === 0;

  return (
    <div style={{ padding: 20 }}>
      <Space
        style={{ width: "100%", justifyContent: "space-between" }}
        align="start"
      >
        <div>
          <h2 style={{ margin: 0 }}>Kanban Board (Admin)</h2>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Tag color="blue">Job: {jobData?.jobId || jobData?._id || jobId}</Tag>
            <Tag color="green">Customer: {jobData?.customer || "-"}</Tag>
            <Tag color="purple">Site: {jobData?.site || "-"}</Tag>
            <Tag color="geekblue">Stage: {jobData?.stage || "-"}</Tag>
            <Tag color="volcano">Status: {jobData?.status || "-"}</Tag>
          </div>
        </div>

        <Space>
          <Button onClick={() => navigate("/admin/jobs")}>Back to Jobs</Button>
          <Button type="primary" onClick={() => setOpen(true)}>
            + Add Task
          </Button>
        </Space>
      </Space>

      {isEmpty ? (
        <div style={{ marginTop: 30 }}>
          <Empty description="No tasks currently for this job." />
        </div>
      ) : (
        <Row gutter={16} style={{ marginTop: 16 }}>
          {columns.map((col) => (
            <Col span={6} key={col}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                <Tag style={statusTagStyle(col)}>{col}</Tag>{" "}
                <Tag>{grouped[col]?.length || 0}</Tag>
              </div>

              {(grouped[col] || []).map((task) => (
                <Card
                  key={task._id}
                  size="small"
                  loading={loading}
                  style={{ marginBottom: 10 }}
                  title={task.title}
                  extra={<Tag style={statusTagStyle(task.status)}>{task.status}</Tag>}
                >
                  <div style={{ marginBottom: 10 }}>{task.description}</div>

                  <Space>
                    <Select
                      value={task.status}
                      style={{ width: 140 }}
                      onChange={(v) => moveTask(task, v)}
                    >
                      {columns.map((s) => (
                        <Option key={s} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Select>

                    <Popconfirm
                      title="Delete this task?"
                      onConfirm={() => removeTask(task)}
                    >
                      <Button danger size="small">
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </Card>
              ))}
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Add Kanban Task"
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onAddTask}>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="e.g. Site Measurement" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional details..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
