import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Layout, Menu } from "antd";

import { useAppContext } from "@/context/appContext";
import useLanguage from "@/locale/useLanguage";

import logoIcon from "@/style/images/logo-icon.png";

import useResponsive from "@/hooks/useResponsive";

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  ReconciliationOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  ToolOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  BuildOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function Navigation({ basePath = "" }) {
  const { isMobile } = useResponsive();

  return isMobile ? (
    <MobileSidebar basePath={basePath} />
  ) : (
    <Sidebar collapsible={false} basePath={basePath} />
  );
}

function Sidebar({ collapsible, isMobile = false, basePath = "" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;

  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState("dashboard");
  const [openKeys, setOpenKeys] = useState([]);

  const translate = useLanguage();

  const go = (p) => `${basePath}${p}`;

  const items = useMemo(
    () => [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link to={go("/")}>{translate("Dashboard") || "Dashboard"}</Link>,
      },

      {
        key: "sales-group",
        icon: <AppstoreOutlined />,
        label: "Sales",
        children: [
          {
            key: "lead",
            icon: <UserOutlined />,
            label: <Link to={go("/lead")}>Leads</Link>,
          },
          {
            key: "quotes",
            icon: <FileTextOutlined />,
            label: <Link to={go("/quotes")}>Quotes</Link>,
          },
          {
            key: "jobs",
            icon: <FileOutlined />,
            label: <Link to={go("/jobs")}>Jobs</Link>,
          },
        ],
      },

      {
        key: "planning-group",
        icon: <FolderOpenOutlined />,
        label: "Planning",
        children: [
          {
            key: "site-measurement",
            icon: <TagOutlined />,
            label: <Link to={go("/site-measurement")}>Site Measurement</Link>,
          },
          {
            key: "planning",
            icon: <TagOutlined />,
            label: <Link to={go("/planning")}>Planning</Link>,
          },
          {
            key: "drafting",
            icon: <FileTextOutlined />,
            label: <Link to={go("/drafting")}>Drafting</Link>,
          },
        ],
      },

      {
        key: "production-group",
        icon: <BuildOutlined />,
        label: "Production",
        children: [
          {
            key: "job-scheduling",
            icon: <FilterOutlined />,
            label: <Link to={go("/kanban")}>Job Scheduling</Link>,
          },
          {
            key: "material-purchase",
            icon: <ToolOutlined />,
            label: <Link to={go("/material-purchase")}>Material Purchase</Link>,
          },
          {
            key: "fabrication",
            icon: <TagsOutlined />,
            label: <Link to={go("/fabrication")}>Fabrication</Link>,
          },
          {
            key: "qc",
            icon: <ContainerOutlined />,
            label: <Link to={go("/qc")}>Quality Control</Link>,
          },
        ],
      },

      {
        key: "execution-group",
        icon: <DeploymentUnitOutlined />,
        label: "Execution",
        children: [
          {
            key: "installation",
            icon: <ShopOutlined />,
            label: <Link to={go("/installation")}>Installation</Link>,
          },
        ],
      },

      {
        key: "business-group",
        icon: <TeamOutlined />,
        label: "Business",
        children: [
          {
            key: "customer",
            icon: <CustomerServiceOutlined />,
            label: <Link to={go("/customer")}>Customers</Link>,
          },
          {
            key: "contact-requests",
            icon: <MailOutlined />,
            label: <Link to={go("/contact-requests")}>Contact Requests</Link>,
          },
          {
            key: "invoice",
            icon: <ContainerOutlined />,
            label: <Link to={go("/invoice")}>Invoices</Link>,
          },
          {
            key: "payment",
            icon: <CreditCardOutlined />,
            label: <Link to={go("/payment")}>Payments</Link>,
          },
        ],
      },

      {
        key: "hr-group",
        icon: <UserOutlined />,
        label: "HR",
        children: [
                    {
            key: "employee",
            icon: <UserOutlined />,
            label: <Link to={go("/employee")}>Employee</Link>,
          },
          {
            key: "attendance",
            icon: <UserOutlined />,
            label: <Link to={go("/attendance")}>Attendance</Link>,
          },
        ],
      },

      {
        key: "system-group",
        icon: <SettingOutlined />,
        label: "System",
        children: [
          {
            key: "settings",
            icon: <SettingOutlined />,
            label: <Link to={go("/settings/company")}>Settings</Link>,
          },
          {
            key: "about",
            icon: <ReconciliationOutlined />,
            label: <Link to={go("/about")}>About</Link>,
          },
        ],
      },
    ],
    [basePath, translate]
  );

  const pathToGroupMap = {
    dashboard: "",
    lead: "sales-group",
    quotes: "sales-group",
    jobs: "sales-group",

    "site-measurement": "planning-group",
    planning: "planning-group",
    drafting: "planning-group",

    "job-scheduling": "production-group",
    "material-purchase": "production-group",
    fabrication: "production-group",
    qc: "production-group",

    installation: "execution-group",

    customer: "business-group",
    "contact-requests": "business-group",
    invoice: "business-group",
    payment: "business-group",
    
    employee: "hr-group",
    attendance: "hr-group",

    settings: "system-group",
    about: "system-group",
  };

  useEffect(() => {
    if (!location) return;

    const path = location.pathname;
    const cleaned =
      basePath && path.startsWith(basePath)
        ? path.slice(basePath.length)
        : path;

    let normalized = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;

    if (!normalized || normalized === "") {
      normalized = "dashboard";
    } else {
      normalized = normalized.split("/")[0];
    }

    // settings/company => settings
    if (normalized === "settings") {
      setCurrentPath("settings");
      setOpenKeys(["system-group"]);
      return;
    }

    setCurrentPath(normalized);

    const parentGroup = pathToGroupMap[normalized];
    if (parentGroup) {
      setOpenKeys([parentGroup]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname, basePath]);

  useEffect(() => {
    if (isNavMenuClose) setLogoApp(true);
    const timer = setTimeout(() => setLogoApp(isNavMenuClose), 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const onCollapse = () => navMenu.collapse();

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: "auto",
        height: "100vh",
        position: isMobile ? "absolute" : "relative",
        bottom: "20px",
        ...(!isMobile && {
          left: "20px",
          top: "20px",
        }),
      }}
      theme="light"
    >
      <div className="logo"
      onClick={()=>navigate(go("/"))}
      style={{cursor:"pointer"}}
      >
        <img
        src={logoIcon}
        alt="Tech2Globe"
        style={{
          height:"42px",
          maxWidth: "190px",
          objectFit: "container",
          marginFit: "6px",
        }}
          />
      </div>
      <Menu
        items={items}
        mode="inline"
        theme="light"
        selectedKeys={[currentPath]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        style={{ width: 256 }}
      />
    </Sider>
  );
}

function MobileSidebar({ basePath = "" }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={() => setVisible(true)}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>

      <Drawer
        width={250}
        placement="left"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} basePath={basePath} />
      </Drawer>
    </>
  );
}