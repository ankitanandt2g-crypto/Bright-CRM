import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';

const { Option } = Select;

export default function LeadForm({ open, onCancel, onSubmit, initialValues }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        leadSource: 'Manual Entry',
        status: 'New',
        ...initialValues,
      });
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      title={initialValues?._id ? 'Edit Lead' : 'Add Lead'}
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={() => form.submit()}
      okText="Save"
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {/* Mandatory Fields */}
        <Form.Item
          name="clientName"
          label="Client Name"
          rules={[{ required: true, message: 'Client name is required' }]}
        >
          <Input placeholder="Enter client name" />
        </Form.Item>

        <Form.Item name="contactPerson" label="Contact Person">
          <Input placeholder="Enter contact person name" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ required: true, message: 'Phone is required' }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="siteAddress"
          label="Site Address"
          rules={[{ required: true, message: 'Site address is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Enter site address" />
        </Form.Item>

        <Form.Item
          name="projectType"
          label="Project Type"
          rules={[{ required: true, message: 'Project type is required' }]}
        >
          <Select placeholder="Select project type">
            <Option value="Residential">Residential</Option>
            <Option value="Commercial">Commercial</Option>
            <Option value="Industrial">Industrial</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="balustradeType"
          label="Balustrade Type"
          rules={[{ required: true, message: 'Balustrade type is required' }]}
        >
          <Select placeholder="Select balustrade type">
            <Option value="Glass">Glass</Option>
            <Option value="Stainless Steel">Stainless Steel</Option>
            <Option value="Aluminium">Aluminium</Option>
            <Option value="Wood">Wood</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="leadSource"
          label="Lead Source"
          rules={[{ required: true, message: 'Lead source is required' }]}
        >
          <Select>
            <Option value="Manual Entry">Manual Entry</Option>
            <Option value="Website Enquiries">Website Enquiries</Option>
            <Option value="Phone Calls">Phone Calls</Option>
            <Option value="Referrals">Referrals</Option>
          </Select>
        </Form.Item>

        {/* Optional */}
        <Form.Item name="status" label="Status">
          <Select>
            <Option value="New">New</Option>
            <Option value="Contacted">Contacted</Option>
            <Option value="Qualified">Qualified</Option>
            <Option value="Converted">Converted</Option>
            <Option value="Lost">Lost</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Any notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
