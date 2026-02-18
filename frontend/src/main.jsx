import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRouter from "./router/AppRouter";

// ✅ Idurar AppContext (required for NavigationContainer)
import { AppContextProvider } from "@/context/appContext";

// ✅ If you use JobContext for Jobs/Kanban/Planning flow
import { JobProvider } from "@/context/JobContext";

// ✅ ADD THIS for customer portal auth
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";

import "antd/dist/reset.css";
//import "./style/index.css"; // if your project has it

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <JobProvider>
          {/* ✅ ADD WRAPPER (does not affect old modules) */}
          <CustomerAuthProvider>
            <AppRouter />
          </CustomerAuthProvider>
        </JobProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
