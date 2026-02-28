import { useEffect, useState } from "react";
import { Card, Form, Input, Button, message, Space, Descriptions } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8888/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Profile() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [me, setMe] = useState(null);

  const loadMe = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/user/me`, { headers: authHeaders() });
      const user = res.data?.result;
      setMe(user);

      form.setFieldsValue({
        name: user?.name || "",
        companyName: user?.companyName || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
      });
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const onSave = async (values) => {
    setSaving(true);
    try {
      // ✅ role wise fields (customer ke liye companyName/mobile required)
      const payload = {
        name: values.name,
        email: values.email,
      };

      if (me?.role === "customer") {
        payload.companyName = values.companyName;
        payload.mobile = values.mobile;
      }

      const res = await axios.patch(`${API_BASE}/user/me`, payload, { headers: authHeaders() });
      message.success(res.data?.message || "Profile updated");

      setEditing(false);
      await loadMe();
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/portal/login", { replace: true });
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <Card
        title="My Profile"
        loading={loading}
        extra={
          <Space>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            ) : (
              <Button
                onClick={() => {
                  setEditing(false);
                  loadMe();
                }}
              >
                Cancel
              </Button>
            )}
            <Button danger onClick={onLogout}>
              Logout
            </Button>
          </Space>
        }
      >
        {/* ✅ SHOW DETAILS */}
        {!editing && me && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Name">{me.name || "-"}</Descriptions.Item>
            <Descriptions.Item label="Role">{me.role || "-"}</Descriptions.Item>

            {me.role === "customer" && (
              <>
                <Descriptions.Item label="Company Name">{me.companyName || "-"}</Descriptions.Item>
                <Descriptions.Item label="Mobile">{me.mobile || "-"}</Descriptions.Item>
              </>
            )}

            <Descriptions.Item label="Email">{me.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="Active">{me.isActive ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {me.createdAt ? new Date(me.createdAt).toLocaleString() : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}

        {/* ✅ EDIT FORM */}
        {editing && (
          <Form form={form} layout="vertical" onFinish={onSave} style={{ marginTop: 16 }}>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
              <Input placeholder="Enter name" />
            </Form.Item>

            {me?.role === "customer" && (
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: "Company name is required" }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            )}

            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}>
              <Input placeholder="Enter email" />
            </Form.Item>

            {me?.role === "customer" && (
              <Form.Item label="Mobile" name="mobile" rules={[{ required: true, message: "Mobile is required" }]}>
                <Input placeholder="Enter mobile" />
              </Form.Item>
            )}

            <Button type="primary" htmlType="submit" loading={saving}>
              Save Changes
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}