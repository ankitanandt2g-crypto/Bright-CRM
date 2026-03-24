import {
  Table,
  Button,
  DatePicker,
  TimePicker,
  Select,
  Tag,
  Modal,
  Form,
  Input,
  Card,
  Row,
  Col,
  Space,
  message,
  Typography,
  Divider,
  Empty,
} from "antd";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function Attendance() {
  // Change role to "worker" to test worker view
  const currentUserRole = "admin";
  const currentWorkerEmail = "rahul@example.com";

  // ---------------- WORKERS ----------------
  const [workers, setWorkers] = useState([
    {
      key: 1,
      name: "Rahul",
      email: "rahul@example.com",
      phone: "9876543210",
      designation: "Welder",
      department: "Fabrication",
      joiningDate: "01-01-2026",
      employeeId: "EMP001",
      status: "Active",
      address: "Noida",
    },
    {
      key: 2,
      name: "Amit",
      email: "amit@example.com",
      phone: "9876501234",
      designation: "Installer",
      department: "Installation",
      joiningDate: "05-01-2026",
      employeeId: "EMP002",
      status: "Active",
      address: "Ghaziabad",
    },
  ]);

  // ---------------- ATTENDANCE ----------------
  const [attendanceData, setAttendanceData] = useState([
    {
      key: 1,
      workerName: "Rahul",
      workerEmail: "rahul@example.com",
      employeeId: "EMP001",
      designation: "Welder",
      department: "Fabrication",
      date: "24-03-2026",
      checkin: "09:00",
      checkout: "18:00",
      hours: 9,
      status: "Full Day",
      source: "Manual",
    },
    {
      key: 2,
      workerName: "Rahul",
      workerEmail: "rahul@example.com",
      employeeId: "EMP001",
      designation: "Welder",
      department: "Fabrication",
      date: "23-03-2026",
      checkin: "09:20",
      checkout: "17:10",
      hours: 7.83,
      status: "Half Day",
      source: "Manual",
    },
    {
      key: 3,
      workerName: "Amit",
      workerEmail: "amit@example.com",
      employeeId: "EMP002",
      designation: "Installer",
      department: "Installation",
      date: "24-03-2026",
      checkin: "08:55",
      checkout: "18:15",
      hours: 9.33,
      status: "Full Day",
      source: "Manual",
    },
  ]);

  // ---------------- MODALS ----------------
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [editAttendanceModalOpen, setEditAttendanceModalOpen] = useState(false);

  const [workerForm] = Form.useForm();
  const [attendanceForm] = Form.useForm();
  const [editAttendanceForm] = Form.useForm();

  const [editingRecord, setEditingRecord] = useState(null);

  // ---------------- FILTERS ----------------
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [viewType, setViewType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [customRange, setCustomRange] = useState([]);

  // ---------------- HELPERS ----------------
  const getStatusFromHours = (hours) => {
    if (hours >= 8) return "Full Day";
    if (hours > 0) return "Half Day";
    return "Absent";
  };

  const getStatusColor = (status) => {
    if (status === "Full Day") return "green";
    if (status === "Half Day") return "orange";
    return "red";
  };

  const calculateHours = (checkin, checkout) => {
    const totalMinutes = checkout.diff(checkin, "minute");
    if (totalMinutes < 0) return null;
    return +(totalMinutes / 60).toFixed(2);
  };

  const isDateInSelectedFilter = (dateStr) => {
    const recordDate = dayjs(dateStr, "DD-MM-YYYY");

    if (viewType === "daily") {
      return recordDate.isSame(selectedDate, "day");
    }

    if (viewType === "weekly") {
      const startOfWeek = selectedWeek.startOf("week");
      const endOfWeek = selectedWeek.endOf("week");
      return (
        (recordDate.isAfter(startOfWeek, "day") || recordDate.isSame(startOfWeek, "day")) &&
        (recordDate.isBefore(endOfWeek, "day") || recordDate.isSame(endOfWeek, "day"))
      );
    }

    if (viewType === "monthly") {
      return recordDate.isSame(selectedMonth, "month");
    }

    if (viewType === "custom" && customRange?.length === 2) {
      const start = customRange[0].startOf("day");
      const end = customRange[1].endOf("day");
      return (
        (recordDate.isAfter(start, "day") || recordDate.isSame(start, "day")) &&
        (recordDate.isBefore(end, "day") || recordDate.isSame(end, "day"))
      );
    }

    return true;
  };

  const activeWorkers = useMemo(
    () => workers.filter((worker) => worker.status === "Active"),
    [workers]
  );

  const filteredAttendance = useMemo(() => {
    let result = [...attendanceData];

    if (currentUserRole === "worker") {
      result = result.filter((item) => item.workerEmail === currentWorkerEmail);
    }

    if (selectedWorker !== "all" && currentUserRole === "admin") {
      result = result.filter((item) => item.workerEmail === selectedWorker);
    }

    result = result.filter((item) => isDateInSelectedFilter(item.date));

    return result.sort(
      (a, b) =>
        dayjs(b.date, "DD-MM-YYYY").valueOf() - dayjs(a.date, "DD-MM-YYYY").valueOf()
    );
  }, [
    attendanceData,
    selectedWorker,
    viewType,
    selectedDate,
    selectedWeek,
    selectedMonth,
    customRange,
  ]);

  const summary = useMemo(() => {
    const total = filteredAttendance.length;
    const fullDay = filteredAttendance.filter((i) => i.status === "Full Day").length;
    const halfDay = filteredAttendance.filter((i) => i.status === "Half Day").length;
    const absent = filteredAttendance.filter((i) => i.status === "Absent").length;
    const totalHours = filteredAttendance.reduce(
      (sum, item) => sum + Number(item.hours || 0),
      0
    );

    return {
      total,
      fullDay,
      halfDay,
      absent,
      totalHours: totalHours.toFixed(2),
    };
  }, [filteredAttendance]);

  // ---------------- CREATE WORKER ----------------
  const handleCreateWorker = async () => {
    try {
      const values = await workerForm.validateFields();

      const emailExists = workers.some(
        (worker) => worker.email.toLowerCase() === values.email.toLowerCase()
      );

      if (emailExists) {
        message.error("Worker with this email already exists");
        return;
      }

      const employeeIdExists = workers.some(
        (worker) => worker.employeeId.toLowerCase() === values.employeeId.toLowerCase()
      );

      if (employeeIdExists) {
        message.error("Employee ID already exists");
        return;
      }

      const newWorker = {
        key: Date.now(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        designation: values.designation,
        department: values.department,
        joiningDate: values.joiningDate.format("DD-MM-YYYY"),
        employeeId: values.employeeId,
        status: values.status,
        address: values.address || "",
      };

      setWorkers((prev) => [...prev, newWorker]);
      workerForm.resetFields();
      setWorkerModalOpen(false);
      message.success("Worker created successfully");
    } catch (error) {}
  };

  // ---------------- ADD ATTENDANCE ----------------
  const handleAddAttendance = async () => {
    try {
      const values = await attendanceForm.validateFields();

      const selectedWorkerObj = workers.find((w) => w.email === values.workerEmail);

      if (!selectedWorkerObj) {
        message.error("Selected worker not found");
        return;
      }

      if (selectedWorkerObj.status !== "Active") {
        message.error("Inactive worker attendance cannot be added");
        return;
      }

      const hours = calculateHours(values.checkin, values.checkout);

      if (hours === null) {
        message.error("Check-out time must be after check-in time");
        return;
      }

      const dateStr = values.date.format("DD-MM-YYYY");

      const existingIndex = attendanceData.findIndex(
        (item) =>
          item.workerEmail === values.workerEmail &&
          item.date === dateStr
      );

      const newRecord = {
        key: existingIndex > -1 ? attendanceData[existingIndex].key : Date.now(),
        workerName: selectedWorkerObj.name,
        workerEmail: selectedWorkerObj.email,
        employeeId: selectedWorkerObj.employeeId,
        designation: selectedWorkerObj.designation,
        department: selectedWorkerObj.department,
        date: dateStr,
        checkin: values.checkin.format("HH:mm"),
        checkout: values.checkout.format("HH:mm"),
        hours,
        status: getStatusFromHours(hours),
        source: "Manual",
      };

      if (existingIndex > -1) {
        const updated = [...attendanceData];
        updated[existingIndex] = newRecord;
        setAttendanceData(updated);
        message.success("Attendance updated for this date");
      } else {
        setAttendanceData((prev) => [...prev, newRecord]);
        message.success("Attendance added successfully");
      }

      attendanceForm.resetFields();
      setAttendanceModalOpen(false);
    } catch (error) {}
  };

  // ---------------- EDIT ATTENDANCE ----------------
  const openEditAttendance = (record) => {
    setEditingRecord(record);
    editAttendanceForm.setFieldsValue({
      workerEmail: record.workerEmail,
      date: dayjs(record.date, "DD-MM-YYYY"),
      checkin: dayjs(record.checkin, "HH:mm"),
      checkout: dayjs(record.checkout, "HH:mm"),
    });
    setEditAttendanceModalOpen(true);
  };

  const handleEditAttendance = async () => {
    try {
      const values = await editAttendanceForm.validateFields();

      const selectedWorkerObj = workers.find((w) => w.email === values.workerEmail);

      if (!selectedWorkerObj) {
        message.error("Worker not found");
        return;
      }

      if (selectedWorkerObj.status !== "Active") {
        message.error("Inactive worker attendance cannot be updated");
        return;
      }

      const hours = calculateHours(values.checkin, values.checkout);

      if (hours === null) {
        message.error("Check-out time must be after check-in time");
        return;
      }

      const updatedRecord = {
        ...editingRecord,
        workerName: selectedWorkerObj.name,
        workerEmail: selectedWorkerObj.email,
        employeeId: selectedWorkerObj.employeeId,
        designation: selectedWorkerObj.designation,
        department: selectedWorkerObj.department,
        date: values.date.format("DD-MM-YYYY"),
        checkin: values.checkin.format("HH:mm"),
        checkout: values.checkout.format("HH:mm"),
        hours,
        status: getStatusFromHours(hours),
        source: "Manual",
      };

      setAttendanceData((prev) =>
        prev.map((item) => (item.key === editingRecord.key ? updatedRecord : item))
      );

      setEditAttendanceModalOpen(false);
      setEditingRecord(null);
      editAttendanceForm.resetFields();
      message.success("Attendance edited successfully");
    } catch (error) {}
  };

  // ---------------- TABLE COLUMNS ----------------
  const columns = [
    {
      title: "Worker",
      dataIndex: "workerName",
    },
    {
      title: "Employee ID",
      dataIndex: "employeeId",
    },
    {
      title: "Email",
      dataIndex: "workerEmail",
    },
    {
      title: "Designation",
      dataIndex: "designation",
    },
    {
      title: "Department",
      dataIndex: "department",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Check In",
      dataIndex: "checkin",
    },
    {
      title: "Check Out",
      dataIndex: "checkout",
    },
    {
      title: "Hours",
      dataIndex: "hours",
    },
    {
      title: "Status",
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    ...(currentUserRole === "admin"
      ? [
          {
            title: "Action",
            render: (_, record) => (
              <Button type="link" onClick={() => openEditAttendance(record)}>
                Edit
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 20 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {currentUserRole === "admin"
              ? "Worker Attendance Management"
              : "My Attendance"}
          </Title>
          <Text type="secondary">
            {currentUserRole === "admin"
              ? "Create workers, add manual attendance, edit attendance, and track records by date range"
              : "View your attendance records"}
          </Text>
        </Col>

        {currentUserRole === "admin" && (
          <Col>
            <Space wrap>
              <Button type="primary" onClick={() => setWorkerModalOpen(true)}>
                + Create Worker
              </Button>
              <Button onClick={() => setAttendanceModalOpen(true)}>
                + Add Attendance
              </Button>
            </Space>
          </Col>
        )}
      </Row>

      <Divider />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          {currentUserRole === "admin" && (
            <Col xs={24} sm={12} md={6}>
              <Text strong>Select Worker</Text>
              <Select
                style={{ width: "100%", marginTop: 6 }}
                value={selectedWorker}
                onChange={setSelectedWorker}
              >
                <Option value="all">All Workers</Option>
                {workers.map((worker) => (
                  <Option key={worker.email} value={worker.email}>
                    {worker.name} ({worker.employeeId})
                  </Option>
                ))}
              </Select>
            </Col>
          )}

          <Col xs={24} sm={12} md={6}>
            <Text strong>View Type</Text>
            <Select
              style={{ width: "100%", marginTop: 6 }}
              value={viewType}
              onChange={setViewType}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
          </Col>

          {viewType === "daily" && (
            <Col xs={24} sm={12} md={6}>
              <Text strong>Select Date</Text>
              <DatePicker
                style={{ width: "100%", marginTop: 6 }}
                value={selectedDate}
                onChange={(value) => setSelectedDate(value)}
                format="DD-MM-YYYY"
              />
            </Col>
          )}

          {viewType === "weekly" && (
            <Col xs={24} sm={12} md={6}>
              <Text strong>Select Week</Text>
              <DatePicker
                style={{ width: "100%", marginTop: 6 }}
                value={selectedWeek}
                onChange={(value) => setSelectedWeek(value)}
                format="DD-MM-YYYY"
              />
            </Col>
          )}

          {viewType === "monthly" && (
            <Col xs={24} sm={12} md={6}>
              <Text strong>Select Month</Text>
              <DatePicker
                picker="month"
                style={{ width: "100%", marginTop: 6 }}
                value={selectedMonth}
                onChange={(value) => setSelectedMonth(value)}
                format="MM-YYYY"
              />
            </Col>
          )}

          {viewType === "custom" && (
            <Col xs={24} sm={24} md={10}>
              <Text strong>Custom Range</Text>
              <RangePicker
                style={{ width: "100%", marginTop: 6 }}
                value={customRange}
                onChange={(value) => setCustomRange(value || [])}
                format="DD-MM-YYYY"
              />
            </Col>
          )}
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text type="secondary">Total Records</Text>
            <Title level={4} style={{ margin: "8px 0 0" }}>
              {summary.total}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text type="secondary">Full Days</Text>
            <Title level={4} style={{ margin: "8px 0 0", color: "#389e0d" }}>
              {summary.fullDay}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text type="secondary">Half Days</Text>
            <Title level={4} style={{ margin: "8px 0 0", color: "#d48806" }}>
              {summary.halfDay}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text type="secondary">Total Hours</Text>
            <Title level={4} style={{ margin: "8px 0 0" }}>
              {summary.totalHours}
            </Title>
          </Card>
        </Col>
      </Row>

      {filteredAttendance.length ? (
        <Table
          columns={columns}
          dataSource={filteredAttendance}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1400 }}
        />
      ) : (
        <Card>
          <Empty description="No attendance records found" />
        </Card>
      )}

      {/* CREATE WORKER MODAL */}
      <Modal
        title="Create Worker"
        open={workerModalOpen}
        onOk={handleCreateWorker}
        onCancel={() => {
          setWorkerModalOpen(false);
          workerForm.resetFields();
        }}
        okText="Create"
      >
        <Form
          form={workerForm}
          layout="vertical"
          initialValues={{ status: "Active" }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Employee ID"
                name="employeeId"
                rules={[{ required: true, message: "Please enter employee ID" }]}
              >
                <Input placeholder="EMP001" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Worker Name"
                name="name"
                rules={[{ required: true, message: "Please enter worker name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email ID"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter worker email" />
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
                <Input placeholder="Enter phone number" maxLength={10} />
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

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <TextArea rows={3} placeholder="Enter address (optional)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ADD ATTENDANCE MODAL */}
      <Modal
        title="Add Manual Attendance"
        open={attendanceModalOpen}
        onOk={handleAddAttendance}
        onCancel={() => {
          setAttendanceModalOpen(false);
          attendanceForm.resetFields();
        }}
        okText="Save"
      >
        <Form form={attendanceForm} layout="vertical">
          <Form.Item
            label="Worker"
            name="workerEmail"
            rules={[{ required: true, message: "Please select worker" }]}
          >
            <Select placeholder="Select worker">
              {activeWorkers.map((worker) => (
                <Option key={worker.email} value={worker.email}>
                  {worker.name} - {worker.employeeId} - {worker.designation}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            label="Check In"
            name="checkin"
            rules={[{ required: true, message: "Please select check-in time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="Check Out"
            name="checkout"
            rules={[{ required: true, message: "Please select check-out time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT ATTENDANCE MODAL */}
      <Modal
        title="Edit Attendance"
        open={editAttendanceModalOpen}
        onOk={handleEditAttendance}
        onCancel={() => {
          setEditAttendanceModalOpen(false);
          setEditingRecord(null);
          editAttendanceForm.resetFields();
        }}
        okText="Update"
      >
        <Form form={editAttendanceForm} layout="vertical">
          <Form.Item
            label="Worker"
            name="workerEmail"
            rules={[{ required: true, message: "Please select worker" }]}
          >
            <Select placeholder="Select worker">
              {activeWorkers.map((worker) => (
                <Option key={worker.email} value={worker.email}>
                  {worker.name} - {worker.employeeId} - {worker.designation}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            label="Check In"
            name="checkin"
            rules={[{ required: true, message: "Please select check-in time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="Check Out"
            name="checkout"
            rules={[{ required: true, message: "Please select check-out time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}