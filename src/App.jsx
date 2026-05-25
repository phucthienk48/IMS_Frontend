// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/User/Home";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import Profile from "./pages/auth/Profile";

import HomeAdmin from "./pages/Admin/HomeAdmin";
// import Dashboard from "./pages/Admin/Dashboard";
// import AdminProfile from "./pages/auth/AdminProfile"
// import UserManagement from "./pages/Admin/UserManagement";

// import AdminReport from "./pages/Admin/AdminReport";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* USER */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           <Route path="/profile" element={<Profile />} /> */}

        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<HomeAdmin />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
