import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Empty,
  Space,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function Employee() {
  const [employees, setEmployees] = useState([
    {
      _id: "1",
      employeeId: "EMP123",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      phone: "9876543210",
      designation: "Welder",
      department: "Fabrication",
      joiningDate: "01-02-2026",
      resignationDate: "",
      status: "Active",
      address: "Noida",
    },
    {
      _id: "2",
      employeeId: "EMP124",
      name: "Amit Sharma",
      email: "amit@example.com",
      phone: "9876501234",
      designation: "Installer",
      department: "Installation",
      joiningDate: "10-02-2026",
      resignationDate: "",
      status: "Active",
      address: "Ghaziabad",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // Backend API call here
      // Example:
      // const res = await getEmployees();
      // setEmployees(res?.result || []);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("Failed to fetch employees");
    }
  };

  const summary = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((item) => item.status === "Active").length;
    const inactive = employees.filter((item) => item.status === "Inactive").length;

    return { total, active, inactive };
  }, [employees]);

  const handleCreateEmployee = async () => {
    try {
      const values = await createForm.validateFields();

      const emailExists = employees.some(
        (item) => item.email.toLowerCase() === values.email.toLowerCase()
      );

      if (emailExists) {
        message.error("Employee with this email already exists");
        return;
      }

      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        designation: values.designation,
        department: values.department,
        joiningDate: values.joiningDate
          ? values.joiningDate.format("DD-MM-YYYY")
          : "",
        resignationDate: "",
        status: values.status,
        address: values.address || "",
      };

      // Real backend call:
      // const res = await createEmployee(payload);
      // employeeId backend se auto-generate hoga e.g. EMP123
      // if (res?.success) {
      //   message.success("Employee created successfully");
      //   fetchEmployees();
      // }

      // Temporary local UI testing
      const nextId = 123 + employees.length;
      const newEmployee = {
        _id: Date.now().toString(),
        employeeId: `EMP${nextId}`,
        ...payload,
      };

      setEmployees((prev) => [...prev, newEmployee]);
      createForm.resetFields();
      setIsCreateModalOpen(false);
      message.success("Employee created successfully");
    } catch (error) {}
  };

  const openEditModal = (record) => {
    setEditingEmployee(record);

    editForm.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      designation: record.designation,
      department: record.department,
      joiningDate: record.joiningDate
        ? dayjs(record.joiningDate, "DD-MM-YYYY")
        : null,
      resignationDate: record.resignationDate
        ? dayjs(record.resignationDate, "DD-MM-YYYY")
        : null,
      status: record.status,
      address: record.address,
    });

    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      const values = await editForm.validateFields();

      let resignationDate = "";

      if (values.status === "Inactive") {
        resignationDate = dayjs().format("DD-MM-YYYY");
      }

      if (values.status === "Active") {
        resignationDate = "";
      }

      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        designation: values.designation,
        department: values.department,
        joiningDate: values.joiningDate
          ? values.joiningDate.format("DD-MM-YYYY")
          : "",
        resignationDate,
        status: values.status,
        address: values.address || "",
      };

      // Real backend call:
      // const res = await updateEmployee(editingEmployee._id, payload);
      // if (res?.success) {
      //   message.success(
      //     values.status === "Inactive"
      //       ? "Employee marked as inactive and resignation date updated automatically"
      //       : "Employee updated successfully"
      //   );
      //   fetchEmployees();
      // }

      setEmployees((prev) =>
        prev.map((item) =>
          item._id === editingEmployee._id ? { ...item, ...payload } : item
        )
      );

      setIsEditModalOpen(false);
      setEditingEmployee(null);
      editForm.resetFields();

      message.success(
        values.status === "Inactive"
          ? "Employee marked as inactive and resignation date updated automatically"
          : "Employee updated successfully"
      );
    } catch (error) {}
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "employeeId",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "name",
      width: 170,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 130,
    },
    {
      title: "Designation",
      dataIndex: "designation",
      width: 150,
    },
    {
      title: "Department",
      dataIndex: "department",
      width: 150,
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      width: 130,
    },
    {
      title: "Resignation Date",
      dataIndex: "resignationDate",
      width: 140,
      render: (value) => value || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (value) => (
        <Tag color={value === "Active" ? "green" : "red"}>{value}</Tag>
      ),
    },
    {
      title: "Action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button type="link" onClick={() => openEditModal(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Employee Management
          </Title>
          <Text type="secondary">
            Create and manage employee records under HR module
          </Text>
        </Col>

        <Col>
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Create Employee
          </Button>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Text type="secondary">Total Employees</Text>
            <Title level={4} style={{ margin: "8px 0 0" }}>
              {summary.total}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Text type="secondary">Active Employees</Text>
            <Title level={4} style={{ margin: "8px 0 0", color: "#389e0d" }}>
              {summary.active}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Text type="secondary">Inactive Employees</Text>
            <Title level={4} style={{ margin: "8px 0 0", color: "#cf1322" }}>
              {summary.inactive}
            </Title>
          </Card>
        </Col>
      </Row>

      {employees.length ? (
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={employees}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1400 }}
        />
      ) : (
        <Card>
          <Empty description="No employees found" />
        </Card>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      <Modal
        title="Create Employee"
        open={isCreateModalOpen}
        onOk={handleCreateEmployee}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        okText="Create"
        width={760}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ status: "Active" }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Employee ID">
                <Input value="Auto-generated by backend (e.g. EMP123)" disabled />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Employee Name"
                name="name"
                rules={[{ required: true, message: "Please enter employee name" }]}
              >
                <Input placeholder="Enter employee name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Phone number must be 10 digits",
                  },
                ]}
              >
                <Input placeholder="Enter 10 digit number" maxLength={10} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Designation"
                name="designation"
                rules={[{ required: true, message: "Please enter designation" }]}
              >
                <Input placeholder="Welder / Installer / Supervisor" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: "Please select department" }]}
              >
                <Select placeholder="Select department">
                  <Option value="Fabrication">Fabrication</Option>
                  <Option value="Installation">Installation</Option>
                  <Option value="Quality Control">Quality Control</Option>
                  <Option value="Planning">Planning</Option>
                  <Option value="Drafting">Drafting</Option>
                  <Option value="Site Measurement">Site Measurement</Option>
                  <Option value="Admin">Admin</Option>
                  <Option value="HR">HR</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Joining Date"
                name="joiningDate"
                rules={[{ required: true, message: "Please select joining date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Resignation Date">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD-MM-YYYY"
                  disabled
                  placeholder="Empty by default"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <TextArea rows={3} placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal
        title="Edit Employee"
        open={isEditModalOpen}
        onOk={handleUpdateEmployee}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingEmployee(null);
          editForm.resetFields();
        }}
        okText="Update"
        width={760}
      >
        <Form
          form={editForm}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.status === "Inactive") {
              editForm.setFieldsValue({
                resignationDate: dayjs(),
              });
            }

            if (changedValues.status === "Active") {
              editForm.setFieldsValue({
                resignationDate: null,
              });
            }
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Employee ID">
                <Input value={editingEmployee?.employeeId || ""} disabled />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Employee Name"
                name="name"
                rules={[{ required: true, message: "Please enter employee name" }]}
              >
                <Input placeholder="Enter employee name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Phone number must be 10 digits",
                  },
                ]}
              >
                <Input placeholder="Enter 10 digit number" maxLength={10} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Designation"
                name="designation"
                rules={[{ required: true, message: "Please enter designation" }]}
              >
                <Input placeholder="Enter designation" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: "Please select department" }]}
              >
                <Select placeholder="Select department">
                  <Option value="Fabrication">Fabrication</Option>
                  <Option value="Installation">Installation</Option>
                  <Option value="Quality Control">Quality Control</Option>
                  <Option value="Planning">Planning</Option>
                  <Option value="Drafting">Drafting</Option>
                  <Option value="Site Measurement">Site Measurement</Option>
                  <Option value="Admin">Admin</Option>
                  <Option value="HR">HR</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Joining Date"
                name="joiningDate"
                rules={[{ required: true, message: "Please select joining date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
                extra="If status is changed to Inactive, resignation date will be updated automatically."
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Resignation Date" name="resignationDate">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD-MM-YYYY"
                  disabled
                  placeholder="Auto-updated when employee becomes inactive"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <TextArea rows={3} placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div style={{ marginTop: 8 }}>
          <Space direction="vertical" size={2}>
            <Text type="secondary">
              Default behavior: resignation date remains empty for active employees.
            </Text>
            <Text type="secondary">
              When admin marks employee inactive, resignation date is set automatically.
            </Text>
          </Space>
        </div>
      </Modal>
    </div>
  );
}