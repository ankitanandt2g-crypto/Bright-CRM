import { ErpLayout } from "@/layout";
import useLanguage from "@/locale/useLanguage";

// ✅ safer import: directly from file (try these in order)
import CreateItem from "@/modules/ErpPanelModule/CreateItem.jsx"; // ✅ if file is CreateItem.jsx
// if above fails, use: import CreateItem from "@/modules/ErpPanelModule/CreateItem";
// if named export, use: import { CreateItem } from "@/modules/ErpPanelModule/CreateItem";

export default function CreateInvoiceModule({ config }) {
  const translate = useLanguage();

  const safeConfig = config || {
    entity: "invoice",
    CREATE_ENTITY: translate("Create Invoice"),
    UPDATE_ENTITY: translate("Update Invoice"),
    basePath: "/admin",
  };

  if (!safeConfig.basePath) safeConfig.basePath = "/admin";

  return (
    <ErpLayout>
      <CreateItem config={safeConfig} />
    </ErpLayout>
  );
}