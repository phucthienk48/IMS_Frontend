import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-5 shadow rounded bg-white">
          <i className="bi bi-shield-slash text-danger display-1"></i>
          <h2 className="mt-3">Truy cập bị từ chối</h2>
          <p className="text-muted">
            Bạn không có quyền quản trị để vào khu vực này.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      path: "/admin",
      icon: "bi-graph-up-arrow",
      label: "Quản lý báo cáo",
    },
    {
      path: "/admin/users",
      icon: "bi-people-fill",
      label: "Quản lý tài khoản",
    },
    {
      path: "/admin/student",
      icon: "bi-mortarboard-fill",
      label: "Quản lý sinh viên",
    },
    {
      path: "/admin/internship",
      icon: "bi-book-fill",
      label: "Quản lý đề tài",
    },
    {
      path: "/admin/application",
      icon: "bi-file-earmark-text-fill",
      label: "Quản lý yêu cầu",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brandArea}>
          <div style={styles.logoCircle}>
            <i className="bi bi-mortarboard-fill text-white fs-4"></i>
          </div>

          {/* <div className="ms-3">
            <h6 className="mb-0 fw-bold text-white">
              INTERNSHIP ADMIN
            </h6>
            <small style={{ fontSize: "10px", color: "#bde0fe" }}>
              HỆ THỐNG QUẢN LÝ THỰC TẬP
            </small>
          </div> */}
        </div>

        <div style={styles.divider}></div>

        {/* User */}
        <div style={styles.userProfile}>
          <img
            src={`https://ui-avatars.com/api/?name=${
              user.username || "Admin"
            }&background=1d3557&color=fff`}
            alt="avatar"
            style={styles.avatar}
          />

          <div className="ms-2 overflow-hidden">
            <div className="text-truncate fw-bold text-white small">
              {user.username || "Quản trị viên"}
            </div>
            <div style={{ fontSize: "11px", color: "#90e0ef" }}>
              Đang hoạt động
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav style={styles.navMenu}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuActive : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                <i className={`bi ${item.icon}`} style={styles.icon}></i>
                <span style={styles.menuLabel}>{item.label}</span>

                {isActive && <div style={styles.activeIndicator}></div>}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={styles.logoutWrapper}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main style={styles.content}>
        <div style={styles.topHeader}>
          <h5 className="mb-0 fw-bold text-secondary">
            Dashboard /
            <span className="text-dark ms-2">
              {menuItems.find((i) => i.path === location.pathname)
                ?.label || "Tổng quan"}
            </span>
          </h5>

          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-bell-fill fs-5 text-muted"></i>
            <span className="badge bg-primary">
              Internship Management v1.0
            </span>
          </div>
        </div>

        <div style={styles.innerContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "'Segoe UI', sans-serif",
  },

  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg, #1d3557 0%, #0b132b 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px 15px",
    position: "fixed",
    height: "100vh",
    zIndex: 100,
    boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    paddingBottom: "20px",
  },

  logoCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    marginBottom: "20px",
  },

  userProfile: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    marginBottom: "25px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
  },

  navMenu: {
    flex: 1,
    overflowY: "auto",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "0.3s",
    position: "relative",
    color: "rgba(255,255,255,0.75)",
  },

  menuActive: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontWeight: "bold",
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    width: "4px",
    height: "20px",
    background: "#00b4d8",
    borderRadius: "0 4px 4px 0",
  },

  icon: {
    fontSize: "1.1rem",
    marginRight: "12px",
    width: "25px",
  },

  menuLabel: {
    fontSize: "0.95rem",
  },

  logoutWrapper: {
    paddingTop: "20px",
  },

  logoutBtn: {
    width: "100%",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(231, 76, 60, 0.15)",
    color: "#ff7675",
    fontWeight: "bold",
    cursor: "pointer",
  },

  content: {
    flex: 1,
    marginLeft: "260px",
    display: "flex",
    flexDirection: "column",
  },

  topHeader: {
    height: "70px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },

  innerContent: {
    padding: "30px",
    flex: 1,
    overflowY: "auto",
  },
};
