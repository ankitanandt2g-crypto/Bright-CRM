import { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Select, Tag } from "antd";
import JobForm from "./JobForm";
import { getJobs, createJob, deleteJob, updateJob } from "./jobApi";
import { useNavigate } from "react-router-dom";
import { useJob } from "../../context/JobContext";

const { Option } = Select;

const STAGES = [
  "Backlog",
  "Site Measurement",
  "Planning Lock",
  "Drafting",
  "Job Scheduling",
  "Material Purchase",
  "Fabrication",
  "Quality Control",
  "Installation",
  "Closure",
];

const STATUSES = ["Backlog", "Active", "On Hold", "Completed"];

const STAGE_COLORS = {
  Backlog: "default",
  "Site Measurement": "blue",
  "Planning Lock": "purple",
  Drafting: "orange",
  "Job Scheduling": "gold",
  "Material Purchase": "lime",
  Fabrication: "cyan",
  "Quality Control": "magenta",
  Installation: "green",
  Closure: "volcano",
};

const STATUS_COLORS = {
  Backlog: "default",
  Active: "green",
  "On Hold": "orange",
  Completed: "red",
};

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

  const getStageIndex = (stage) => STAGES.indexOf(stage);

  const hasReachedStage = (record, stageName) => {
    const currentIndex = getStageIndex(record?.stage);
    const targetIndex = getStageIndex(stageName);

    if (currentIndex === -1 || targetIndex === -1) return false;
    return currentIndex >= targetIndex;
  };

  const isDraftingComplete = (record) => {
    return (
      record?.draftingCompleted === true ||
      record?.ifcApproved === true ||
      record?.ifcStatus === "Approved" ||
      hasReachedStage(record, "Job Scheduling")
    );
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Failed to fetch jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        jobId: values.jobId || genJobId(),
        customer: values.customer || "",
        site: values.site || "",
        stage: values.stage || "Backlog",
        status: values.status || "Backlog",
      };

      await createJob(payload);
      message.success("Job created");
      setOpen(false);
      setEditData(null);
      await fetchJobs();
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Failed to create job"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      message.success("Job deleted");
      await fetchJobs();
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    }
  };

  const handleJobChange = async (id, payload) => {
    try {
      await updateJob(id, payload);
      await fetchJobs();
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Update failed"
      );
    }
  };

  const setJobContext = (job) => {
    const jobObjectId = job?._id;

    if (!jobObjectId) {
      message.error("Job id missing");
      return false;
    }

    setActiveJobId(jobObjectId);
    localStorage.setItem("activeJobId", jobObjectId);
    localStorage.setItem(`activeJobData_${jobObjectId}`, JSON.stringify(job));
    localStorage.setItem("activeJobData", JSON.stringify(job));
    return true;
  };

  const openJob = (job, route) => {
    const ok = setJobContext(job);
    if (!ok) return;
    navigate(route, { state: { job } });
  };

  const openSiteMeasurement = (job) => {
    const ok = setJobContext(job);
    if (!ok) return;

    navigate(`/admin/site-measurement?jobId=${job._id}`, {
      state: { job },
    });
  };

  const openPlanning = (job) => {
    const ok = setJobContext(job);
    if (!ok) return;

    navigate(`/admin/planning?jobId=${job._id}`, {
      state: { job },
    });
  };

  const openDrafting = (job) => {
    const ok = setJobContext(job);
    if (!ok) return;

    navigate(`/admin/drafting?jobId=${job._id}`, {
      state: { job },
    });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const stageOk = stageFilter === "All" || j.stage === stageFilter;
      const statusOk = statusFilter === "All" || j.status === statusFilter;
      return stageOk && statusOk;
    });
  }, [jobs, stageFilter, statusFilter]);

  const columns = [
    {
      title: "Job ID",
      dataIndex: "jobId",
      width: 150,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      render: (v) => v || "-",
      width: 180,
    },
    {
      title: "Site",
      dataIndex: "site",
      render: (v) => v || "-",
      width: 220,
    },
    {
      title: "Stage",
      dataIndex: "stage",
      width: 220,
      render: (_, record) => (
        <Select
          value={record.stage}
          style={{ width: 210 }}
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
      width: 160,
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 145 }}
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
      title: "Modules",
      width: 760,
      render: (_, record) => {
        const planningOpen = hasReachedStage(record, "Site Measurement");
        const draftingOpen = hasReachedStage(record, "Drafting");
        const afterDraftingOpen = isDraftingComplete(record);

        return (
          <div style={{ maxWidth: 520 }}>
            <Space wrap size={[8, 8]}>
              <Button size="small" onClick={() => openSiteMeasurement(record)}>
                Site Measurement
              </Button>

              <Button
                size="small"
                disabled={!planningOpen}
                onClick={() => openPlanning(record)}
              >
                Planning
              </Button>

              <Button
                size="small"
                disabled={!draftingOpen}
                onClick={() => openDrafting(record)}
              >
                Drafting
              </Button>

              <Button
                size="small"
                disabled={!afterDraftingOpen}
                onClick={() => openJob(record, "/admin/kanban")}
              >
                Scheduling
              </Button>

              <Button
                size="small"
                disabled={!afterDraftingOpen}
                onClick={() => openJob(record, "/admin/material-purchase")}
              >
                Material
              </Button>

              <Button
                size="small"
                disabled={!afterDraftingOpen}
                onClick={() => openJob(record, "/admin/fabrication")}
              >
                Fabrication
              </Button>

              <Button
                size="small"
                disabled={!afterDraftingOpen}
                onClick={() => openJob(record, "/admin/qc")}
              >
                QC
              </Button>

              <Popconfirm
                title="Delete job?"
                onConfirm={() => handleDelete(record._id)}
              >
                <Button danger size="small">
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Jobs Management</h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 15,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Select
          value={stageFilter}
          style={{ width: 240 }}
          onChange={setStageFilter}
        >
          <Option value="All">All Stages</Option>
          {STAGES.map((s) => (
            <Option key={s} value={s}>
              <Tag color={STAGE_COLORS[s]}>{s}</Tag>
            </Option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          style={{ width: 170 }}
          onChange={setStatusFilter}
        >
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
        scroll={{ x: 1700 }}
      />

      <JobForm
        open={open}
        onCancel={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editData}
      />
    </div>
  );
}