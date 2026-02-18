import { useEffect, useState } from "react";
import { Button, Table, Space, Popconfirm, Select, Tag, message } from "antd";
import { useNavigate } from "react-router-dom";

import LeadForm from "./LeadForm";
import { getLeads, createLead, updateLead, deleteLead, createJobFromLead } from "./leadApi";

const { Option } = Select;

// ✅ status color helper
const statusColor = (status) => {
  switch (status) {
    case "Converted":
      return "green";
    case "Qualified":
      return "blue";
    case "Contacted":
      return "gold";
    case "Lost":
      return "red";
    default:
      return "default";
  }
};

export default function Lead() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editData?._id) {
        await updateLead(editData._id, values);
        message.success("Lead updated");
      } else {
        await createLead(values);
        message.success("Lead created");
      }
      setOpen(false);
      setEditData(null);
      await fetchLeads();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLead(id);
      message.success("Deleted");
      await fetchLeads();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (value, record) => {
    try {
      await updateLead(record._id, { status: value });
      await fetchLeads();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Status update failed");
    }
  };

  // ✅ Lead -> Job (+ Customer auto-create happens in backend)
  const handleConvertToJob = async (leadId) => {
    try {
      await createJobFromLead(leadId);
      message.success("Job created + Customer added");
      await fetchLeads();
      navigate("/admin/jobs");
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Convert failed");
    }
  };

  const columns = [
    { title: "Client Name", dataIndex: "clientName" },
    { title: "Contact", render: (_, r) => `${r.phone || ""}${r.email ? ` | ${r.email}` : ""}` },
    { title: "Site Address", dataIndex: "siteAddress" },
    { title: "Project Type", dataIndex: "projectType" },
    { title: "Balustrade Type", dataIndex: "balustradeType" },
    {
      title: "Lead Source",
      dataIndex: "leadSource",
      render: (v) => <Tag>{v}</Tag>,
    },

    // ✅ Status with colored tag
    {
      title: "Status",
      render: (_, record) => (
        <Space>
          <Tag color={statusColor(record.status)} style={{ minWidth: 90, textAlign: "center" }}>
            {record.status || "New"}
          </Tag>

          <Select
            value={record.status || "New"}
            style={{ width: 140 }}
            onChange={(v) => handleStatusChange(v, record)}
          >
            <Option value="New">New</Option>
            <Option value="Contacted">Contacted</Option>
            <Option value="Qualified">Qualified</Option>
            <Option value="Converted">Converted</Option>
            <Option value="Lost">Lost</Option>
          </Select>
        </Space>
      ),
    },

    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setEditData(record);
              setOpen(true);
            }}
          >
            Edit
          </Button>

          <Popconfirm title="Delete lead?" onConfirm={() => handleDelete(record._id)}>
            <Button danger>Delete</Button>
          </Popconfirm>

          <Button
            type={record.status === "Converted" ? "default" : "primary"}
            disabled={record.status === "Converted"}
            onClick={() => handleConvertToJob(record._id)}
          >
            {record.status === "Converted" ? "Converted" : "Convert to Job"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Lead Generation & Qualification</h2>

      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => {
          setEditData(null);
          setOpen(true);
        }}
      >
        + Add Lead
      </Button>

      <Table
        columns={columns}
        dataSource={leads}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <LeadForm
        open={open}
        onCancel={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editData}
      />
    </div>
  );
}
