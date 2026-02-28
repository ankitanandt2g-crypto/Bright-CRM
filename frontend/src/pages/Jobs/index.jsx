// frontend/src/pages/Jobs/index.jsx
import { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Select, Tag } from "antd";
import JobForm from "./JobForm";
import { getJobs, createJob, deleteJob, updateJob } from "./jobApi";
import { useNavigate } from "react-router-dom";
import { useJob } from "../../context/JobContext";

const { Option } = Select;

const STAGES = [
  "Backlog (Contract Stage)",
  "Site Measurement",
  "Planning Lock",
  "Drafting",
  "Fabrication",
  "Quality Control",
  "Installation",
  "Closure",
];

const STATUSES = ["Backlog", "Active", "On Hold", "Closed"];

const STAGE_COLORS = {
  "Backlog (Contract Stage)": "default",
  "Site Measurement": "blue",
  "Planning Lock": "purple",
  "Drafting": "orange",
  "Fabrication": "cyan",
  "Quality Control": "magenta",
  "Installation": "green",
  "Closure": "volcano",
};

const STATUS_COLORS = {
  Backlog: "default",
  Active: "green",
  "On Hold": "orange",
  Closed: "red",
};

// ✅ generate jobId for manual create (Job schema requires it)
const genJobId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `J-${y}${m}${day}-${rand}`;
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [stageFilter, setStageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const { setActiveJobId } = useJob();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (values) => {
    try {
      // ✅ Job schema requires jobId
      const payload = {
        ...values,
        jobId: values.jobId || genJobId(),
        customer: values.customer || "",
        site: values.site || "",
        stage: values.stage || "Backlog (Contract Stage)",
        status: values.status || "Backlog",
      };

      await createJob(payload);
      message.success("Job created");
      setOpen(false);
      setEditData(null);
      await fetchJobs();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to create job");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      message.success("Job deleted");
      await fetchJobs();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Delete failed");
    }
  };

  const handleJobChange = async (id, payload) => {
    try {
      await updateJob(id, payload);
      await fetchJobs();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Update failed");
    }
  };

  const openJob = (job, route = "/kanban-board") => {
    const jobId = job?._id;

    if (!jobId) {
      message.error("Job id missing");
      return;
    }

    setActiveJobId(jobId);
    localStorage.setItem("activeJobId", jobId);

    localStorage.setItem(`activeJobData_${jobId}`, JSON.stringify(job));
    localStorage.setItem("activeJobData", JSON.stringify(job));

    navigate(route, { state: { job } });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const stageOk = stageFilter === "All" || j.stage === stageFilter;
      const statusOk = statusFilter === "All" || j.status === statusFilter;
      return stageOk && statusOk;
    });
  }, [jobs, stageFilter, statusFilter]);

  const columns = [
    { title: "Job ID", dataIndex: "jobId" },
    { title: "Customer", dataIndex: "customer", render: (v) => v || "-" },
    { title: "Site", dataIndex: "site", render: (v) => v || "-" },

    {
      title: "Stage",
      dataIndex: "stage",
      render: (_, record) => (
        <Select
          value={record.stage}
          style={{ width: 220 }}
          onChange={(v) => handleJobChange(record._id, { stage: v })}
        >
          {STAGES.map((s) => (
            <Option key={s} value={s}>
              <Tag color={STAGE_COLORS[s]}>{s}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 150 }}
          onChange={(v) => handleJobChange(record._id, { status: v })}
        >
          {STATUSES.map((s) => (
            <Option key={s} value={s}>
              <Tag color={STATUS_COLORS[s]}>{s}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },

    {
      title: "Linked Lead",
      dataIndex: "leadId",
      render: (v) => (v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
    },

    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openJob(record, "/admin/kanban")}>
            Kanban
          </Button>

          <Button size="small" onClick={() => openJob(record, "/admin/planning")}>
            Planning
          </Button>

          <Button size="small" onClick={() => openJob(record, "/admin/fabrication")}>
            Fabrication
          </Button>

          <Button size="small" onClick={() => openJob(record, "/admin/qc")}>
            QC
          </Button>

          <Popconfirm title="Delete job?" onConfirm={() => handleDelete(record._id)}>
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Jobs Management (Admin)</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 15, alignItems: "center" }}>
        <Select value={stageFilter} style={{ width: 240 }} onChange={setStageFilter}>
          <Option value="All">All Stages</Option>
          {STAGES.map((s) => (
            <Option key={s} value={s}>
              <Tag color={STAGE_COLORS[s]}>{s}</Tag>
            </Option>
          ))}
        </Select>

        <Select value={statusFilter} style={{ width: 170 }} onChange={setStatusFilter}>
          <Option value="All">All Status</Option>
          {STATUSES.map((s) => (
            <Option key={s} value={s}>
              <Tag color={STATUS_COLORS[s]}>{s}</Tag>
            </Option>
          ))}
        </Select>

        <Button
          onClick={() => {
            setStageFilter("All");
            setStatusFilter("All");
          }}
        >
          Reset
        </Button>

        <Button
          type="primary"
          style={{ marginLeft: "auto" }}
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          + Create Job
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredJobs}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <JobForm open={open} onCancel={() => setOpen(false)} onSubmit={handleSubmit} initialValues={editData} />
    </div>
  );
}