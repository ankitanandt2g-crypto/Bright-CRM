import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Select,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Empty, // ✅ added
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useJob } from "../../context/JobContext";
import {
  getFabricationItems,
  createFabricationItem,
  updateFabricationItem,
  deleteFabricationItem,
} from "./fabricationApi";
import { getJobById } from "../Jobs/jobApi";

const { Option } = Select;

export default function Fabrication() {
  const navigate = useNavigate();
  const { activeJobId, setActiveJobId } = useJob();

  const jobId = activeJobId || localStorage.getItem("activeJobId");
  const jobKey = jobId ? `activeJobData_${jobId}` : null;

  const [jobData, setJobData] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!jobId) {
      message.warning("Please open a Job first");
      navigate("/jobs");
      return;
    }

    if (!activeJobId && jobId) setActiveJobId(jobId);

    // ✅ load header from localStorage first
    if (jobKey) {
      const saved = localStorage.getItem(jobKey);
      if (saved) {
        try {
          setJobData(JSON.parse(saved));
        } catch {}
      }
    }

    fetchJobInfo(jobId);
    fetchItems(jobId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchJobInfo = async (jid) => {
    try {
      const info = await getJobById(jid);
      const normalized = info?.result || info;

      setJobData(normalized || null);

      if (jobKey && normalized) {
        localStorage.setItem(jobKey, JSON.stringify(normalized));
      }
    } catch (err) {
      console.error("getJobById failed:", err);
    }
  };

  const fetchItems = async (jid) => {
    setLoading(true);
    try {
      const data = await getFabricationItems(jid);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchItems failed:", err);
      setRows([]);
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch fabrication items"
      );
    } finally {
      setLoading(false);
    }
  };

  const statusTag = (s) => {
    if (s === "Done") return <Tag color="green">Done</Tag>;
    if (s === "In Progress") return <Tag color="blue">In Progress</Tag>;
    if (s === "Blocked") return <Tag color="red">Blocked</Tag>;
    return <Tag color="orange">Pending</Tag>;
  };

  const header = useMemo(() => {
    const j = jobData || {};
    return {
      job: j.jobId || j._id || jobId,
      customer:
        j.customer || j.client || j.customerName || j?.customerDetails?.name || "-",
      site: j.site || j.projectSite || j.siteName || "-",
      stage: j.stage || j.currentStage || j.jobStage || "-",
      status: j.status || j.jobStatus || "-",
      customerPhone: j?.customerPhone || j?.customerDetails?.phone || "",
      customerEmail: j?.customerEmail || j?.customerDetails?.email || "",
    };
  }, [jobData, jobId]);

  const onSave = async (values) => {
    const payload = {
      jobId,
      itemName: values.itemName,
      material: values.material,
      qty: values.qty,
      dueDate: values?.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
      status: values.status || "Pending", // ✅ FIX (no form change)
      notes: values.notes || "",
    };

    try {
      if (editRow?._id) {
        const updated = await updateFabricationItem(editRow._id, payload);
        setRows((prev) =>
          prev.map((r) =>
            r._id === editRow._id
              ? updated?._id
                ? updated
                : { ...r, ...payload }
              : r
          )
        );
        message.success("Fabrication item updated");
      } else {
        const created = await createFabricationItem(payload);
        setRows((prev) =>
          created?._id
            ? [created, ...prev]
            : [{ _id: `tmp_${Date.now()}`, ...payload }, ...prev]
        );
        message.success("Fabrication item added");
      }

      setOpen(false);
      setEditRow(null);
      form.resetFields();
    } catch (err) {
      console.error("Save failed:", err);
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Save failed"
      );
    }
  };

  const onDelete = async (row) => {
    const old = rows;
    setRows((prev) => prev.filter((r) => r._id !== row._id));

    try {
      await deleteFabricationItem(row._id);
      message.success("Deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      message.error(err?.response?.data?.message || err?.message || "Delete failed");
      setRows(old);
    }
  };

  const updateStatus = async (row, newStatus) => {
    const oldStatus = row.status;

    setRows((prev) =>
      prev.map((r) => (r._id === row._id ? { ...r, status: newStatus } : r))
    );

    try {
      await updateFabricationItem(row._id, { status: newStatus });
    } catch (err) {
      console.error("Status update failed:", err);
      message.error(
        err?.response?.data?.message || err?.message || "Status update failed"
      );
      setRows((prev) =>
        prev.map((r) => (r._id === row._id ? { ...r, status: oldStatus } : r))
      );
    }
  };

  const columns = [
    { title: "Item", dataIndex: "itemName" },
    { title: "Material", dataIndex: "material", render: (v) => <Tag>{v}</Tag> },
    { title: "Qty", dataIndex: "qty" },
    { title: "Due Date", dataIndex: "dueDate" },
    { title: "Status", dataIndex: "status", render: (v) => statusTag(v) },
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
          <Option value="Blocked">Blocked</Option>
          <Option value="Done">Done</Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditRow(record);
              setOpen(true);

              form.setFieldsValue({
                itemName: record.itemName,
                material: record.material,
                qty: record.qty,
                status: record.status, // unchanged
                notes: record.notes,
                dueDate: record.dueDate ? dayjs(record.dueDate) : null,
              });
            }}
          >
            Edit
          </Button>

          <Popconfirm title="Delete this item?" onConfirm={() => onDelete(record)}>
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!jobId) return null;

  const isEmpty = !loading && rows.length === 0;

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
        <div>
          <h2 style={{ margin: 0 }}>Fabrication (Admin)</h2>

          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color="blue">Job: {header.job}</Tag>
            <Tag color="green">Customer: {header.customer}</Tag>
            <Tag color="purple">Site: {header.site}</Tag>
            <Tag color="geekblue">Stage: {header.stage}</Tag>
            <Tag color="volcano">Status: {header.status}</Tag>

            {!!header.customerPhone && <Tag>📞 {header.customerPhone}</Tag>}
            {!!header.customerEmail && <Tag>✉️ {header.customerEmail}</Tag>}
          </div>
        </div>

        <Space>
          <Button onClick={() => navigate("/admin/jobs")}>Back to Jobs</Button>
          <Button
            type="primary"
            onClick={() => {
              setEditRow(null);
              setOpen(true);
              form.resetFields();
              form.setFieldsValue({ status: "Pending" }); // ✅ only sets default value, no input change
            }}
          >
            + Add Fabrication Item
          </Button>
        </Space>
      </Space>

      {/* ✅ Empty OR Table */}
      {isEmpty ? (
        <div style={{ marginTop: 30 }}>
          <Empty description="No fabrication items currently for this job." />
        </div>
      ) : (
        <Table
          style={{ marginTop: 16 }}
          columns={columns}
          dataSource={rows}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editRow?._id ? "Edit Fabrication Item" : "Add Fabrication Item"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditRow(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Save"
      >
        {/* ✅ FORM INPUTS KEPT SAME */}
        <Form layout="vertical" form={form} onFinish={onSave} initialValues={{ status: "Pending" }}>
          <Form.Item
            name="itemName"
            label="Item Name"
            rules={[{ required: true, message: "Item name required" }]}
          >
            <Input placeholder="e.g. Glass Panel Set" />
          </Form.Item>

          <Form.Item
            name="material"
            label="Material"
            rules={[{ required: true, message: "Material required" }]}
          >
            <Select placeholder="Select material">
              <Option value="Glass">Glass</Option>
              <Option value="Stainless Steel">Stainless Steel</Option>
              <Option value="Aluminium">Aluminium</Option>
              <Option value="Wood">Wood</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="qty"
            label="Quantity"
            rules={[{ required: true, message: "Quantity required" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Blocked">Blocked</Option>
              <Option value="Done">Done</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional notes..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
