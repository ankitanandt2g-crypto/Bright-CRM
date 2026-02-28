import React, { useEffect } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  InputNumber,
  Divider,
  Button,
  Space,
} from "antd";

const { TextArea } = Input;

const STATUS = [
  "Draft",
  "Sent",
  "Client Viewed",
  "Approved",
  "Rejected",
  "Expired",
  "Converted to Job",
];

export default function QuoteForm({
  form,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      {/* ✅ Hidden leadId for backend mapping */}
      <Form.Item name="leadId" hidden>
        <Input />
      </Form.Item>

      <Divider orientation="left">Customer (from Lead)</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Client Name" name="customerName" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Contact Person" name="contactPerson">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Project</Divider>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item label="Site Address" name="siteAddress" rules={[{ required: true }]}>
            <TextArea rows={2} disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Project Type" name="projectType" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Balustrade Type" name="balustradeType" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Lead Source" name="leadSource">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select options={STATUS.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Scope (Mandatory)</Divider>
      <Form.Item label="Scope Definition" name="scope" rules={[{ required: true }]}>
        <TextArea rows={3} placeholder="Detailed work breakdown..." />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Inclusions" name="inclusions" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="What is included?" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Exclusions" name="exclusions" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="What is excluded?" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Assumptions" name="assumptions">
        <TextArea rows={3} placeholder="Assumptions / constraints..." />
      </Form.Item>

      <Divider orientation="left">Estimation</Divider>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item label="Material Cost" name="materialCost">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Labor Cost" name="laborCost">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Installation Cost" name="installCost">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Total Quote Value (Estimated)" name="totalAmount" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Planning Estimates</Divider>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item label="Expected Drafting Hours" name="expectedDraftHours">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Expected Fabrication Hours" name="expectedFabHours">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Expected Installation Hours" name="expectedInstallHours">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Crew Size" name="crewSize">
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </Col>
      </Row>

      <Divider />
      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Quote
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </Form>
  );
}