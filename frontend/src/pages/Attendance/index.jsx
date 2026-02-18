import { Table, Button, DatePicker, TimePicker, Select, Tag } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function Attendance() {

  const [data, setData] = useState([
    {
      key: 1,
      worker: 'Rahul',
      date: '11-02-2026',
      checkin: '09:00',
      checkout: '18:00',
      hours: 9,
    },
  ]);

  const columns = [
    {
      title: 'Worker',
      dataIndex: 'worker',
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Check In',
      dataIndex: 'checkin',
    },
    {
      title: 'Check Out',
      dataIndex: 'checkout',
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
    },
    {
      title: 'Status',
      render: (_, record) => (
        <Tag color={record.hours >= 8 ? 'green' : 'orange'}>
          {record.hours >= 8 ? 'Full Day' : 'Half Day'}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Worker Attendance</h2>

      <Button type="primary" style={{ marginBottom: 20 }}>
        + Add Attendance
      </Button>

      <Table columns={columns} dataSource={data} />
    </div>
  );
}
