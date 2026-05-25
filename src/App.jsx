// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import LecturerLayout from "./layouts/LecturerLayout";

import Home from "./pages/User/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
// import Profile from "./pages/auth/Profile";

import HomeAdmin from "./pages/Admin/HomeAdmin";
import UserManagement from "./pages/Admin/UserManagement";
// import AdminProfile from "./pages/auth/AdminProfile"
// import UserManagement from "./pages/Admin/UserManagement";

// import AdminReport from "./pages/Admin/AdminReport";

import HomeLecturer from "./pages/Lecturer/HomeLecturer";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* USER */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           {/* <Route path="/profile" element={<Profile />} /> */}

        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/admin/users" element={<UserManagement />} />

        </Route>

        <Route element={<LecturerLayout />}>
          <Route path="/lecturer" element={<HomeLecturer/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
