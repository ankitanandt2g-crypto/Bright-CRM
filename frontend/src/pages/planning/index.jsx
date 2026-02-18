import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Select,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Popconfirm,
  message,
  Empty,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useJob } from "../../context/JobContext";
import {
  getPlanningTasks,
  createPlanningTask,
  updatePlanningTask,
  deletePlanningTask,
} from "./planningApi";

const { Option } = Select;

export default function Planning() {
  const navigate = useNavigate();
  const location = useLocation();

  const { activeJobId, setActiveJobId } = useJob();

  // ✅ safe job id (context OR localStorage)
  const jobId = activeJobId || localStorage.getItem("activeJobId");
  const jobKey = jobId ? `activeJobData_${jobId}` : null;

  // ✅ show job info on header (customer/site/stage/status)
  const [jobData, setJobData] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // ✅ guard + restore job + load job header data (dynamic)
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

    // job info from route state OR job-specific localStorage
    const incomingJob = location.state?.job || location.state?.fromJob;

    if (incomingJob) {
      setJobData(incomingJob);
      if (jobKey) localStorage.setItem(jobKey, JSON.stringify(incomingJob));
      // optional backward compat
      localStorage.setItem("activeJobData", JSON.stringify(incomingJob));
    } else {
      const saved = jobKey ? localStorage.getItem(jobKey) : null;
      if (saved) setJobData(JSON.parse(saved));
      else {
        // fallback old key (optional)
        const old = localStorage.getItem("activeJobData");
        if (old) {
          try {
            const parsed = JSON.parse(old);
            setJobData(parsed);
          } catch {}
        }
      }
    }

    fetchTasks(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, location.state]);

  const fetchTasks = async (jobIdParam) => {
    const id = jobIdParam || jobId;
    if (!id) return;

    setLoading(true);
    try {
      const tasks = await getPlanningTasks(id);
      setData(Array.isArray(tasks) ? tasks : []);
    } catch (err) {
      message.error("Failed to fetch tasks");
      setData([]); // show empty if error
    } finally {
      setLoading(false);
    }
  };

  const onAddTask = async (values) => {
    const start = values?.range?.[0]?.format("YYYY-MM-DD");
    const end = values?.range?.[1]?.format("YYYY-MM-DD");

    const payload = {
      jobId,
      task: values.task,
      start,
      end,
      workers: values.workers,
      hours: values.hours,
      status: values.status, // ✅ no default
    };

    try {
      const created = await createPlanningTask(payload);

      if (created?._id) {
        setData((prev) => [created, ...prev]);
      } else {
        setData((prev) => [{ _id: `tmp_${Date.now()}`, ...payload }, ...prev]);
      }

      message.success("Task added");
    } catch (err) {
      message.error("Task add failed");
    }

    setOpen(false);
    form.resetFields();
  };

  const updateStatus = async (taskRow, newStatus) => {
    const oldStatus = taskRow.status;

    // optimistic update
    setData((prev) =>
      prev.map((t) => (t._id === taskRow._id ? { ...t, status: newStatus } : t))
    );

    try {
      if (!String(taskRow._id).startsWith("tmp_")) {
        await updatePlanningTask(taskRow._id, { status: newStatus });
      }
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Status update failed");

      // revert
      setData((prev) =>
        prev.map((t) => (t._id === taskRow._id ? { ...t, status: oldStatus } : t))
      );
    }
  };

  const removeTask = async (taskRow) => {
    const old = data;

    setData((prev) => prev.filter((t) => t._id !== taskRow._id));

    try {
      if (!String(taskRow._id).startsWith("tmp_")) {
        await deletePlanningTask(taskRow._id);
      }
      message.success("Deleted");
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Delete failed");
      setData(old);
    }
  };

  const columns = [
    { title: "Task", dataIndex: "task" },
    { title: "Start", dataIndex: "start" },
    { title: "End", dataIndex: "end" },
    { title: "Workers", dataIndex: "workers" },
    { title: "Hours", dataIndex: "hours" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Done" ? "green" : status === "In Progress" ? "blue" : "orange"}>
          {status || "-"}
        </Tag>
      ),
    },
    {
      title: "Update Status",
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 140 }}
          onChange={(v) => updateStatus(record, v)}
        >
          <Option value="Pending">Pending</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Done">Done</Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Popconfirm title="Delete this task?" onConfirm={() => removeTask(record)}>
          <Button danger size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const jobLabel = useMemo(() => (jobId ? `Active Job: ${jobId}` : ""), [jobId]);

  if (!jobId) return null;

  const isEmpty = !loading && data.length === 0;

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
        <div>
          <h2 style={{ margin: 0 }}>Planning (Admin)</h2>

          {/* ✅ Job Summary */}
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
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

      {/* ✅ Empty state instead of default sample tasks */}
      {isEmpty ? (
        <div style={{ marginTop: 30 }}>
          <Empty description="No planning tasks currently for this job." />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          style={{ marginTop: 20 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Add Task Modal */}
      <Modal
        title="Add Planning Task"
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={onAddTask}>
          <Form.Item
            name="task"
            label="Task"
            rules={[{ required: true, message: "Task is required" }]}
          >
            <Input placeholder="e.g. Site Measurement" />
          </Form.Item>

          <Form.Item
            name="range"
            label="Start - End"
            rules={[{ required: true, message: "Select date range" }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="workers"
            label="Workers"
            rules={[{ required: true, message: "Workers required" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="hours"
            label="Hours"
            rules={[{ required: true, message: "Hours required" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {/* ✅ no default status now */}
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select placeholder="Select status">
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Done">Done</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
