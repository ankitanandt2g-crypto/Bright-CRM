import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Layout, Menu } from "antd";

import { useAppContext } from "@/context/appContext";
import useLanguage from "@/locale/useLanguage";

import logoIcon from "@/style/images/logo-icon.svg";
import logoText from "@/style/images/logo-text.svg";

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
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();

  // ✅ helper: make links work inside /admin/*
  const go = (p) => `${basePath}${p}`;

const items = [
  // DASHBOARD
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: <Link to={go("/")}>Dashboard</Link>,
  },

  // LEADS
  {
    key: "lead",
    icon: <UserOutlined />,
    label: <Link to={go("/lead")}>Leads</Link>,
  },

  // QUOTES ✅ ADD THIS
  {
    key: "quotes",
    icon: <FileTextOutlined />,
    label: <Link to={go("/quotes")}>Quotes</Link>,
  },

  // OPERATIONS
  {
    key: "jobs",
    icon: <FileOutlined />,
    label: <Link to={go("/jobs")}>Jobs</Link>,
  },
  {
    key: "kanban",
    icon: <FilterOutlined />,
    label: <Link to={go("/kanban")}>Task Pipeline</Link>,
  },
  {
    key: "planning",
    icon: <TagOutlined />,
    label: <Link to={go("/planning")}>Planning</Link>,
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
  {
    key: "installation",
    icon: <ShopOutlined />,
    label: <Link to={go("/installation")}>Installation</Link>,
  },

  // HRMS
  {
    key: "attendance",
    icon: <UserOutlined />,
    label: <Link to={go("/attendance")}>Attendance</Link>,
  },

  // CRM
  {
    key: "customer",
    icon: <CustomerServiceOutlined />,
    label: <Link to={go("/customer")}>Customers</Link>,
  },

  // FINANCE
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

  // SETTINGS
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: <Link to={go("/settings/company")}>Settings</Link>,
  },

  // ABOUT
  {
    key: "about",
    icon: <ReconciliationOutlined />,
    label: <Link to={go("/about")}>About</Link>,
  },
];

  useEffect(() => {
    if (!location) return;

    // ✅ when inside /admin/... make selected key correct
    const path = location.pathname;

    // basePath removed from currentPath for selection
    const cleaned = basePath && path.startsWith(basePath) ? path.slice(basePath.length) : path;

    if (cleaned === "/" || cleaned === "") setCurrentPath("dashboard");
    else setCurrentPath(cleaned.startsWith("/") ? cleaned.slice(1) : cleaned);
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
      <div
        className="logo"
        onClick={() => navigate(go("/"))}
        style={{ cursor: "pointer" }}
      >
        <img src={logoIcon} alt="Logo" style={{ marginLeft: "-5px", height: "40px" }} />

        {!showLogoApp && (
          <img
            src={logoText}
            alt="Logo"
            style={{
              marginTop: "3px",
              marginLeft: "10px",
              height: "38px",
            }}
          />
        )}
      </div>

      <Menu
        items={items}
        mode="inline"
        theme="light"
        selectedKeys={[currentPath]}
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
