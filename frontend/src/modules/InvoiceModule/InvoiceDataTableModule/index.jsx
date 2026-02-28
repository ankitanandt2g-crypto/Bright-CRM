import { ErpLayout } from "@/layout";
import ErpPanel from "@/modules/ErpPanelModule";
import useLanguage from "@/locale/useLanguage";
import { CreditCardOutlined } from "@ant-design/icons";

export default function InvoiceDataTableModule({ config }) {
  const translate = useLanguage();

  // ✅ IMPORTANT:
  // - If router doesn't pass config, don't crash.
  // - Also provide basePath because your app routes are under /admin/*
  const safeConfig = config || {
    entity: "invoice",
    DATATABLE_TITLE: translate("Invoices"),
    ADD_NEW_ENTITY: translate("Add New Invoice"),
    dataTableColumns: [],
    disableAdd: false,
    searchConfig: { entity: "client" },
    basePath: "/admin", // ✅ makes navigation go to /admin/invoice/...
  };

  // ensure basePath exists even if config came from outside
  if (!safeConfig.basePath) safeConfig.basePath = "/admin";

  return (
    <ErpLayout>
      <ErpPanel
        config={safeConfig}
        extra={[
          {
            label: translate("Record Payment"),
            key: "recordPayment",
            icon: <CreditCardOutlined />,
          },
        ]}
      />
    </ErpLayout>
  );
}