// src/layouts/UserLayout.jsx

import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function UserLayout() {
  return (
    <div
      style={{
        background: "#f0f9ff",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Header />

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