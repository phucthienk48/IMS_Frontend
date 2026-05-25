// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import HeaderAdmin from "../pages/Admin/HeaderAdmin";
import Dashboard from "../pages/Admin/Dashboard"

export default function AdminLayout() {
  return (
    <>
      <HeaderAdmin />
      <div className="admin-layout">
      <Dashboard />
        <section>
          {/* <Outlet /> */}
        </section>
      </div>
    </>
  );
}
