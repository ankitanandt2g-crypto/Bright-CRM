import { Table, Button, Select, Tag } from 'antd';
import { useState } from 'react';

export default function Installation() {

  const [data, setData] = useState([
    {
      key: 1,
      item: 'Glass Panels',
      total: 500,
      installed: 300,
    },
    {
      key: 2,
      item: 'Hand Rails',
      total: 200,
      installed: 80,
    },
  ]);

  const columns = [
    {
      title: 'Item',
      dataIndex: 'item',
    },
    {
      title: 'Total Qty',
      dataIndex: 'total',
    },
    {
      title: 'Installed Qty',
      dataIndex: 'installed',
    },
    {
      title: 'Balance',
      render: (_, record) => record.total - record.installed,
    },
    {
      title: 'Status',
      render: (_, record) => {
        if (record.installed === record.total)
          return <Tag color="green">Completed</Tag>;
        if (record.installed > 0)
          return <Tag color="blue">In Progress</Tag>;
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: 'Update',
      render: () => <Button type="link">+ Add Entry</Button>,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Installation Tracking</h2>

      <Select
        placeholder="Select Job"
        style={{ width: 250, marginBottom: 20 }}
      />

      <Table columns={columns} dataSource={data} />
    </div>
  );
}
