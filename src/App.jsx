// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import LecturerLayout from "./layouts/LecturerLayout";

import Home from "./pages/User/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
// import Profile from "./pages/auth/Profile";
import Application from "./pages/User/Application";
import Intershiptopic from "./pages/User/Intershiptopic";

import HomeAdmin from "./pages/Admin/HomeAdmin";
import UserManagement from "./pages/Admin/UserManagement";
import AdminApplication from "./pages/Admin/AdminApplication";
import AdminInternshiptopic from "./pages/Admin/AdminInternshiptopic";

// import AdminReport from "./pages/Admin/AdminReport";

import HomeLecturer from "./pages/Lecturer/HomeLecturer";
import LecturerApplication from "./pages/Lecturer/LecturerApplication";
import LecturerIntershiptopic from "./pages/Lecturer/LecturerIntershiptopic";

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
          <Route path="/topics" element={<Intershiptopic />} />
          <Route path="/application" element={<Application />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/internship" element={<AdminInternshiptopic />} />
          <Route path="/admin/application" element={<AdminApplication />} />
        </Route>

        <Route element={<LecturerLayout />}>
          <Route path="/lecturer" element={<HomeLecturer />} />
          <Route path="/lecturer/topics" element={<LecturerIntershiptopic />} />
          <Route
            path="/lecturer/applications"
            element={<LecturerApplication />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
