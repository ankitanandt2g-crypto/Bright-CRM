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
    default:
      return "default";
  }
};

export default function ReadQuoteModule({ config }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ Safe config so it won't crash if config missing
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

      // ✅ Backend should: approve quote + create job + return jobId
      const res = await approveQuote(id);

      message.success("Quote approved. Job created.");

      // if backend returns jobId
      const jobId = res?.jobId || res?.result?.jobId || res?.result?._id;
      if (jobId) setJobIdCreated(jobId);

      // refresh read data
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
          {/* Header */}
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

                {/* ✅ Approve button (PPT/SOW key requirement) */}
                <Button
                  type="primary"
                  disabled={!canApprove}
                  loading={approving}
                  onClick={handleApprove}
                >
                  Approve Quote → Create Job
                </Button>

                {/* show after approve */}
                {(jobIdCreated || currentResult?.jobId) && (
                  <Button
                    type="default"
                    onClick={() => navigate("/admin/jobs")}
                  >
                    Open Jobs
                  </Button>
                )}
              </Space>
            }
          >
            {/* Quote summary */}
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
              <Descriptions.Item label="Lead ID">
                {currentResult.leadId || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* ✅ Customer section (from Lead) */}
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

            {/* ✅ Project section */}
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
              <Descriptions.Item label="Status">
                {currentResult.status || "Draft"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* ✅ Scope section (PPT/SOW mandatory) */}
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

            {/* ✅ Estimation section */}
            <Divider orientation="left">Estimation</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Material Cost">
                {currentResult.materialCost ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Labor Cost">
                {currentResult.laborCost ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Installation Cost">
                {currentResult.installCost ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {currentResult.totalAmount ?? "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* ✅ Planning estimates */}
            <Divider orientation="left">Planning Estimates</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Expected Draft Hours">
                {currentResult.expectedDraftHours ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Fabrication Hours">
                {currentResult.expectedFabHours ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Installation Hours">
                {currentResult.expectedInstallHours ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Crew Size">
                {currentResult.crewSize ?? "-"}
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