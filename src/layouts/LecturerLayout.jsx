// src/layouts/UserLayout.jsx

import { Outlet } from "react-router-dom";
import HeaderLecturer from "../components/HeaderLecturer";

export default function LecturerLayout() {
  return (
    <div
      style={{
        background: "#f0f9ff",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <HeaderLecturer />

      {/* Main Content */}
      <main
        className="container my-4"
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}