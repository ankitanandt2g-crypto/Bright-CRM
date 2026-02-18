import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("customer_token") || "");

  useEffect(() => {
    if (token) localStorage.setItem("customer_token", token);
    else localStorage.removeItem("customer_token");
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      customer,
      setCustomer,
      login: ({ token, customer }) => {
        setToken(token || "");
        setCustomer(customer || null);
      },
      logout: () => {
        setToken("");
        setCustomer(null);
        localStorage.removeItem("customer_token");
      },
    }),
    [token, customer]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);
