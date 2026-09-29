import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Products from "./components/Products";
import Billing from "./components/Billing";
import Reports from "./components/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "clients", Component: Clients },
      { path: "products", Component: Products },
      { path: "billing", Component: Billing },
      { path: "reports", Component: Reports },
    ],
  },
]);
