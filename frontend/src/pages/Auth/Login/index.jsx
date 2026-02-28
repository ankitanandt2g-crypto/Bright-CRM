import { useState } from "react";
import { Card, Form, Input, Button, Select, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;

const API = "http://localhost:8888/api/auth/login";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        role: values.role,
        identifier: values.identifier?.trim(),
        password: values.password,
      };

      const res = await axios.post(API, payload);
      const data = res?.data;

      if (!data?.success) {
        message.error(data?.message || "Login failed");
        return;
      }

      const token = data?.result?.token;
      const user = data?.result?.user;

      if (!token || !user) {
        message.error("Login response missing token/user");
        return;
      }

      // ✅ 1) Save token/user in multiple keys (Idurar modules may read different keys)
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("jwt", token);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("currentUser", JSON.stringify(user));

      // ✅ Often templates store a combined auth object
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token,
          user,
          current: user,
          isLoggedIn: true,
          loggedIn: true,
          role: user.role,
        })
      );

      // ✅ 2) Set axios default header globally (VERY IMPORTANT)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      // ✅ 3) Redux backup dispatch (in case modules rely on redux state)
      const authPayload = {
        token,
        user,
        current: user,
        isLoggedIn: true,
        loggedIn: true,
        role: user.role,
      };

      dispatch({ type: "AUTH_SUCCESS", payload: authPayload });
      dispatch({ type: "LOGIN_SUCCESS", payload: authPayload });
      dispatch({ type: "AUTH_LOGIN_SUCCESS", payload: authPayload });

      message.success("Login successful");

      // ✅ role based redirect
      if (user.role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (user.role === "worker") navigate("/worker", { replace: true });
      else navigate("/portal", { replace: true });
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Network error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "#0b1220",
      }}
    >
      <Card style={{ width: 420, borderRadius: 12 }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          Idurar CRM
        </Title>
        <Text type="secondary">Login as Admin / Worker / Customer</Text>

        <div style={{ height: 16 }} />

        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: "admin" }}>
          <Form.Item
            label="Login as"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select onChange={(v) => setRole(v)}>
              <Option value="admin">Admin</Option>
              <Option value="worker">Worker</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={role === "worker" ? "Worker ID" : "Email"}
            name="identifier"
            rules={[
              {
                required: true,
                message: role === "worker" ? "Worker ID required" : "Email required",
              },
            ]}
          >
            <Input placeholder={role === "worker" ? "e.g. WRK-001" : "name@email.com"} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password required" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign in
          </Button>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
            <Text
              style={{ cursor: "pointer", color: "#1677ff" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </Text>

            <Text
              style={{ cursor: "pointer", color: "#1677ff" }}
              onClick={() => navigate("/register")}
            >
              Customer Sign Up
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}