import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  DatePicker,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { useJob } from "../../context/JobContext";
import { getJobs, updateJob } from "../Jobs/jobApi";
import {
  getInstallationItems,
  createInstallationItem,
  updateInstallationItem,
  deleteInstallationItem,
  markInstallationComplete,
} from "./installationApi";

const { Option } = Select;
const { TextArea } = Input;

const ACTIVITY_STATUSES = ["Pending", "In Progress", "Completed", "Hold", "Snag"];

const STATUS_COLORS = {
  Pending: "default",
  "In Progress": "blue",
  Completed: "green",
  Hold: "orange",
  Snag: "red",
};

export default function Installation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeJobId, setActiveJobId } = useJob?.() || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [items, setItems] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!jobs.length) return;

    const stateJob = location?.state?.fromJob;
    if (stateJob?._id) {
      setSelectedJob(stateJob);
      setActiveJobId?.(stateJob._id);
      return;
    }

    if (activeJobId) {
      const found = jobs.find((j) => j._id === activeJobId);
      if (found) setSelectedJob(found);
    }
  }, [jobs, activeJobId, location?.state, setActiveJobId]);

  useEffect(() => {
    if (selectedJob?._id) {
      loadInstallationItems(selectedJob._id);
    } else {
      setItems([]);
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobList = await getJobs();

      const normalizedJobs = Array.isArray(jobList)
        ? jobList
        : Array.isArray(jobList?.result)
          ? jobList.result
          : Array.isArray(jobList?.data)
            ? jobList.data
            : [];

      setJobs(normalizedJobs);
    } catch (err) {
      console.error(err);
      message.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadInstallationItems = async (jobId) => {
    try {
      setLoading(true);
      const data = await getInstallationItems(jobId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load installation activities");
    } finally {
      setLoading(false);
    }
  };

  const eligibleJobs = useMemo(() => {
    return jobs.filter((job) => {
      const stage = String(job?.stage || "").trim().toLowerCase();
      return stage === "installation" || stage === "closure";
    });
  }, [jobs]);

  const currentInstallationStatus = useMemo(() => {
    if (!items.length) return "No Activities";
    if (items.every((x) => x.status === "Completed")) return "Completed";
    if (items.some((x) => x.status === "Snag")) return "Snag";
    if (items.some((x) => x.status === "Hold")) return "Hold";
    if (items.some((x) => x.status === "In Progress")) return "In Progress";
    return "Pending";
  }, [items]);

  const canMarkComplete = useMemo(() => {
    if (!selectedJob?._id) return false;
    if (!items.length) return false;
    return items.every((item) => item.status === "Completed");
  }, [items, selectedJob]);

  const openCreateModal = () => {
    if (!selectedJob?._id) {
      message.warning("Please select a job first");
      return;
    }

    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      activityName: "",
      locationArea: "",
      assignedTeam: [],
      plannedDate: null,
      completedDate: null,
      status: "Pending",
      snagIssue: "",
      remarks: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      activityName: record.activityName || "",
      locationArea: record.locationArea || "",
      assignedTeam: record.assignedTeam || [],
      plannedDate: record.plannedDate ? dayjs(record.plannedDate) : null,
      completedDate: record.completedDate ? dayjs(record.completedDate) : null,
      status: record.status || "Pending",
      snagIssue: record.snagIssue || "",
      remarks: record.remarks || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const ensureJobStaysInstallation = async (jobId) => {
    try {
      await updateJob(jobId, {
        stage: "Installation",
        status: "Active",
      });
    } catch (err) {
      console.warn("Could not force job stage to Installation:", err);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedJob?._id) {
        message.warning("Please select a job first");
        return;
      }

      setSaving(true);

      const payload = {
        jobId: selectedJob._id,
        activityName: values.activityName,
        locationArea: values.locationArea || "",
        assignedTeam: values.assignedTeam || [],
        plannedDate: values.plannedDate
          ? values.plannedDate.format("YYYY-MM-DD")
          : "",
        completedDate: values.completedDate
          ? values.completedDate.format("YYYY-MM-DD")
          : "",
        status: values.status,
        snagIssue: values.snagIssue || "",
        remarks: values.remarks || "",
      };

      if (editingItem?._id) {
        await updateInstallationItem(editingItem._id, payload);
        message.success("Installation activity updated");
      } else {
        await createInstallationItem(payload);
        message.success("Installation activity created");
      }

      await ensureJobStaysInstallation(selectedJob._id);
      closeModal();
      await loadInstallationItems(selectedJob._id);
    } catch (err) {
      console.error(err);
      if (err?.errorFields) return;
      message.error("Failed to save installation activity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInstallationItem(id);
      message.success("Installation activity deleted");
      if (selectedJob?._id) {
        await loadInstallationItems(selectedJob._id);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete installation activity");
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedJob?._id) {
      message.warning("Please select a job first");
      return;
    }

    if (!canMarkComplete) {
      message.warning(
        "All installation activities must be Completed before marking installation complete"
      );
      return;
    }

    try {
      setSaving(true);
      await markInstallationComplete(selectedJob._id);
      message.success("Installation marked complete and job moved to Closure");

      await loadJobs();
      const updatedSelected = {
        ...selectedJob,
        stage: "Closure",
        status: "Completed",
      };
      setSelectedJob(updatedSelected);
      await loadInstallationItems(selectedJob._id);
    } catch (err) {
      console.error(err);
      message.error("Failed to mark installation complete");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Activity Name",
      dataIndex: "activityName",
      key: "activityName",
    },
    {
      title: "Location / Area",
      dataIndex: "locationArea",
      key: "locationArea",
      render: (value) => value || "—",
    },
    {
      title: "Assigned Team",
      dataIndex: "assignedTeam",
      key: "assignedTeam",
      render: (value) =>
        Array.isArray(value) && value.length ? value.join(", ") : "—",
    },
    {
      title: "Planned Date",
      dataIndex: "plannedDate",
      key: "plannedDate",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "—"),
    },
    {
      title: "Completed Date",
      dataIndex: "completedDate",
      key: "completedDate",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>{status || "—"}</Tag>
      ),
    },
    {
      title: "Snag Issue",
      dataIndex: "snagIssue",
      key: "snagIssue",
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this activity?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Installation"
            extra={
              <Space wrap>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/jobs")}
                >
                  Back to Jobs
                </Button>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                  disabled={!selectedJob}
                >
                  Add Installation Activity
                </Button>

                <Button
                  type="primary"
                  success="true"
                  onClick={handleMarkComplete}
                  loading={saving}
                  disabled={!canMarkComplete}
                >
                  Mark Installation Complete
                </Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 8, color: "#666" }}>
              Only QC-cleared jobs are available here
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Search Eligible Job">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <div style={{ marginBottom: 6, fontWeight: 500 }}>Search Eligible Job</div>
                <Select
                  placeholder="Select Installation / Closure job"
                  style={{ width: "100%" }}
                  value={selectedJob?._id}
                  onChange={(value) => {
                    const found = jobs.find((j) => j._id === value);
                    setSelectedJob(found || null);
                    setActiveJobId?.(value);
                  }}
                  allowClear
                >
                  {eligibleJobs.map((job) => (
                    <Option key={job._id} value={job._id}>
                      {(job.jobId || job.code || "Job")} -{" "}
                      {job.clientName || job.customerName || job.client || "Customer"}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={7}>
                <div style={{ marginBottom: 6, fontWeight: 500 }}>Current Selection</div>
                <div>{selectedJob ? selectedJob.jobId || selectedJob.code || "Selected" : "—"}</div>
              </Col>

              <Col xs={24} md={7}>
                <div style={{ marginBottom: 6, fontWeight: 500 }}>Installation Status</div>
                <Tag color={STATUS_COLORS[currentInstallationStatus] || "default"}>
                  {currentInstallationStatus}
                </Tag>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Job Summary">
            {selectedJob ? (
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Job ID">
                  {selectedJob?.jobId || selectedJob?.code || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  {selectedJob?.clientName ||
                    selectedJob?.customerName ||
                    selectedJob?.client ||
                    "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Site">
                  {selectedJob?.siteAddress || selectedJob?.site || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Stage">
                  <Tag color="blue">{selectedJob?.stage || "—"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedJob?.status === "Completed" ? "green" : "gold"}>
                    {selectedJob?.status || "—"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Select a job to view installation details" />
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Installation Activities">
            <Spin spinning={loading}>
              <Table
                rowKey="_id"
                dataSource={items}
                columns={columns}
                scroll={{ x: 1200 }}
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      <Modal
        open={modalOpen}
        title={editingItem ? "Edit Installation Activity" : "Add Installation Activity"}
        onCancel={closeModal}
        onOk={handleSave}
        confirmLoading={saving}
        width={760}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Activity Name"
                name="activityName"
                rules={[{ required: true, message: "Please enter activity name" }]}
              >
                <Input placeholder="e.g. Glass Panel Fixing" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Location / Area" name="locationArea">
                <Input placeholder="e.g. Front Balcony" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Assigned Team" name="assignedTeam">
                <Select mode="tags" placeholder="Add assigned team members">
                  <Option value="Installer 1">Installer 1</Option>
                  <Option value="Installer 2">Installer 2</Option>
                  <Option value="Installer 3">Installer 3</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Planned Date" name="plannedDate">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Completed Date" name="completedDate">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  {ACTIVITY_STATUSES.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Snag Issue" name="snagIssue">
                <Input placeholder="Enter snag / issue" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Remarks" name="remarks">
                <TextArea rows={4} placeholder="Enter remarks" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}