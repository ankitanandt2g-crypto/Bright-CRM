import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Popconfirm,
  Empty,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { useJob } from "../../context/JobContext";
import { getJobById } from "../Jobs/jobApi";
import { getQcItems, createQcItem, updateQcItem, deleteQcItem } from "./qcApi";

export default function Quality() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeJobId, setActiveJobId } = useJob();

  // ✅ safe job id (context OR localStorage)
  const safeJobId = activeJobId || localStorage.getItem("activeJobId");

  const [jobInfo, setJobInfo] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form] = Form.useForm();

  // ✅ load job info (from route state OR localStorage OR API)
  useEffect(() => {
    if (!activeJobId && safeJobId) setActiveJobId(safeJobId);

    if (!safeJobId) {
      message.warning("Please open a Job first");
      navigate("/jobs");
      return;
    }

    // 1) from route state (fastest)
    const stateJob = location?.state?.job || null;

    // 2) from localStorage (saved when openJob clicked)
    const lsJob = (() => {
      try {
        const raw = localStorage.getItem(`activeJobData_${safeJobId}`);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    const best = stateJob || lsJob;
    if (best) setJobInfo(best);

    // 3) fallback API if still missing important info
    (async () => {
      try {
        if (!best || !best.customer || !best.site || !best.stage || !best.status) {
          const j = await getJobById(safeJobId);
          if (j) setJobInfo(j);
        }
      } catch {
        // ignore
      }
    })();

    fetchQc(safeJobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeJobId]);

  const fetchQc = async (jid) => {
    setLoading(true);
    try {
      const data = await getQcItems(jid);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const qcStatusTag = (record) => {
    const rejected = Number(record.rejected || 0);
    if (rejected === 0) return <Tag color="green">Perfect</Tag>;
    if (rejected < 20) return <Tag color="orange">Minor Defects</Tag>;
    return <Tag color="red">High Rejection</Tag>;
  };

  const openInspect = (row = null) => {
    setEditRow(row);
    setOpen(true);

    if (row) {
      form.setFieldsValue({
        item: row.item,
        checked: row.checked,
        passed: row.passed,
        rejected: row.rejected,
        inspector: row.inspector,
        inspectionDate: row.inspectionDate ? dayjs(row.inspectionDate) : null,
        notes: row.notes,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ inspector: "QC Team" });
    }
  };

  const onSave = async (values) => {
    const checked = Number(values.checked || 0);
    const passed = Number(values.passed || 0);
    const rejected = Number(values.rejected || 0);

    if (passed + rejected !== checked) {
      message.error("Passed + Rejected must equal Checked");
      return;
    }

    const payload = {
      jobId: safeJobId,
      item: values.item,
      checked,
      passed,
      rejected,
      inspector: values.inspector || "",
      inspectionDate: values.inspectionDate
        ? values.inspectionDate.format("YYYY-MM-DD")
        : null,
      notes: values.notes || "",
    };

    try {
      if (editRow?._id) {
        const updated = await updateQcItem(editRow._id, payload);
        setRows((prev) =>
          prev.map((r) => (r._id === editRow._id ? (updated?.result || updated || { ...r, ...payload }) : r))
        );
        message.success("QC updated");
      } else {
        const created = await createQcItem(payload);
        const createdRow = created?.result || created;
        if (createdRow?._id) setRows((prev) => [createdRow, ...prev]);
        else setRows((prev) => [{ _id: `tmp_${Date.now()}`, ...payload }, ...prev]);
        message.success("QC added");
      }
    } catch (err) {
      // local fallback so UI doesn't break
      if (editRow?._id) {
        setRows((prev) => prev.map((r) => (r._id === editRow._id ? { ...r, ...payload } : r)));
        message.success("Updated (local)");
      } else {
        setRows((prev) => [{ _id: `tmp_${Date.now()}`, ...payload }, ...prev]);
        message.success("Added (local)");
      }
    } finally {
      setOpen(false);
      setEditRow(null);
      form.resetFields();
    }
  };

  const onDelete = async (row) => {
    const old = rows;
    setRows((prev) => prev.filter((r) => r._id !== row._id));

    try {
      if (!String(row._id).startsWith("tmp_")) await deleteQcItem(row._id);
      message.success("Deleted");
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Delete failed");
      setRows(old);
    }
  };

  const header = useMemo(() => {
    const jobCode = jobInfo?.jobId || "Not loaded";
    const customer = jobInfo?.customer || "Customer not available";
    const site = jobInfo?.site || "Site not available";
    const stage = jobInfo?.stage || "Stage not set";
    const status = jobInfo?.status || "Status not set";
    return { jobCode, customer, site, stage, status };
  }, [jobInfo]);

  const tableColumns = [
    { title: "Item", dataIndex: "item" },
    { title: "Checked", dataIndex: "checked" },
    { title: "Passed", dataIndex: "passed" },
    { title: "Rejected", dataIndex: "rejected" },
    { title: "Status", render: (_, record) => qcStatusTag(record) },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openInspect(record)}>
            Inspect
          </Button>

          <Popconfirm title="Delete this QC record?" onConfirm={() => onDelete(record)}>
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!safeJobId) return null;

  return (
    <div style={{ padding: 20 }}>
      <Space
        style={{ width: "100%", justifyContent: "space-between" }}
        align="start"
      >
        <div>
          <h2 style={{ margin: 0 }}>Quality Control (Admin)</h2>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Tag color="blue">Job: {header.jobCode}</Tag>
            <Tag color="green">Customer: {header.customer}</Tag>
            <Tag color="purple">Site: {header.site}</Tag>
            <Tag color="geekblue">Stage: {header.stage}</Tag>
            <Tag color="volcano">Status: {header.status}</Tag>
          </div>
        </div>

        <Space>
          <Button onClick={() => navigate("/admin/jobs")}>Back to Jobs</Button>
          <Button type="primary" onClick={() => setOpen(true)}>
            + New Inspection
          </Button>
        </Space>
      </Space>

      <Table
        style={{ marginTop: 16 }}
        columns={tableColumns}
        dataSource={rows}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: (
            <Empty
              description="No QC records found for this job. Click “New Inspection” to add."
            />
          ),
        }}
      />

      <Modal
        title={editRow?._id ? "Update Inspection" : "New Inspection"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditRow(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={onSave}>
          <Form.Item name="item" label="Item" rules={[{ required: true, message: "Item required" }]}>
            <Input placeholder="e.g. Glass Panels" />
          </Form.Item>

          <Form.Item name="inspectionDate" label="Inspection Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="inspector" label="Inspector">
            <Input placeholder="QC Team / Person name" />
          </Form.Item>

          <Form.Item name="checked" label="Checked Qty" rules={[{ required: true, message: "Checked qty required" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="passed" label="Passed Qty" rules={[{ required: true, message: "Passed qty required" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="rejected" label="Rejected Qty" rules={[{ required: true, message: "Rejected qty required" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional defects/remarks..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
