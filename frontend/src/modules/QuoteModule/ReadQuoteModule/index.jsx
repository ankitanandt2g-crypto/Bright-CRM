import NotFound from "@/components/NotFound";
import { ErpLayout } from "@/layout";
import PageLoader from "@/components/PageLoader";

import { erp } from "@/redux/erp/actions";
import { selectReadItem } from "@/redux/erp/selectors";

import { useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import { Card, Descriptions, Divider, Tag, Space, Button, message } from "antd";
import { approveQuote } from "../quoteApi";

const statusColor = (status) => {
  switch (status) {
    case "Approved":
      return "green";
    case "Converted to Job":
      return "blue";
    case "Sent":
      return "gold";
    case "Rejected":
      return "red";
    case "Expired":
      return "volcano";
    case "Client Viewed":
      return "purple";
    default:
      return "default";
  }
};

export default function ReadQuoteModule({ config }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const safeConfig = useMemo(
    () =>
      config || {
        entity: "quote",
      },
    [config]
  );

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: safeConfig.entity, id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } =
    useSelector(selectReadItem);

  const [approving, setApproving] = useState(false);
  const [jobIdCreated, setJobIdCreated] = useState(null);

  const canApprove =
    currentResult &&
    !["Approved", "Converted to Job", "Rejected"].includes(currentResult?.status);

  const handleApprove = async () => {
    try {
      setApproving(true);

      const res = await approveQuote(id);

      message.success("Quote approved. Job created.");

      const jobId = res?.jobId || res?.result?.jobId || res?.result?._id;
      if (jobId) setJobIdCreated(jobId);

      dispatch(erp.read({ entity: safeConfig.entity, id }));
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Approve failed"
      );
    } finally {
      setApproving(false);
    }
  };

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      {isSuccess && currentResult ? (
        <div style={{ padding: 12 }}>
          <Card
            title={
              <Space>
                <span>Quote Details</span>
                <Tag color={statusColor(currentResult.status)}>
                  {currentResult.status || "Draft"}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                <Button onClick={() => navigate("/admin/quotes")}>Back</Button>

                <Button
                  type="primary"
                  disabled={!canApprove}
                  loading={approving}
                  onClick={handleApprove}
                >
                  Approve Quote → Create Job
                </Button>

                {(jobIdCreated || currentResult?.jobId) && (
                  <Button type="default" onClick={() => navigate("/admin/jobs")}>
                    Open Jobs
                  </Button>
                )}
              </Space>
            }
          >
            {/* Summary */}
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Quote No">
                {currentResult.quoteNumber || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Total Quote Value">
                {currentResult.totalAmount ?? "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Created">
                {currentResult.createdAt
                  ? new Date(currentResult.createdAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Quote Valid Until">
                {currentResult.validUntil
                  ? new Date(currentResult.validUntil).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Lead ID">
                {typeof currentResult.leadId === "object"
                  ? currentResult.leadId?._id || "-"
                  : currentResult.leadId || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Job ID">
                {typeof currentResult.jobId === "object"
                  ? currentResult.jobId?._id || "-"
                  : currentResult.jobId || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Approved At">
                {currentResult.approvedAt
                  ? new Date(currentResult.approvedAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {currentResult.status || "Draft"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Customer */}
            <Divider orientation="left">Customer (from Lead)</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Client Name">
                {currentResult.customerName || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Contact Person">
                {currentResult.contactPerson || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Phone">
                {currentResult.phone || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {currentResult.email || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Project */}
            <Divider orientation="left">Project</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Site Address" span={2}>
                {currentResult.siteAddress || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Project Type">
                {currentResult.projectType || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Balustrade Type">
                {currentResult.balustradeType || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Lead Source">
                {currentResult.leadSource || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Current Stage">
                Quote
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Scope */}
            <Divider orientation="left">Scope (Mandatory)</Divider>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Scope Definition">
                {currentResult.scope || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Inclusions">
                {currentResult.inclusions || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Exclusions">
                {currentResult.exclusions || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Assumptions">
                {currentResult.assumptions || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Quote Details */}
            <Divider orientation="left">Quote Details</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Quote Amount">
                {currentResult.totalAmount ?? "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Quote Valid Until">
                {currentResult.validUntil
                  ? new Date(currentResult.validUntil).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {currentResult.status || "Draft"}
              </Descriptions.Item>

              <Descriptions.Item label="Approved At">
                {currentResult.approvedAt
                  ? new Date(currentResult.approvedAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      ) : (
        <NotFound entity={safeConfig.entity} />
      )}
    </ErpLayout>
  );
}