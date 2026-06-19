import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return (
      <div style={styles.deniedWrap}>
        <div style={styles.deniedCard}>
          <i className="bi bi-shield-slash" style={styles.deniedIcon}></i>
          <h2 style={styles.deniedTitle}>Truy cập bị từ chối</h2>
          <p style={styles.deniedText}>
            Bạn không có quyền quản trị để vào khu vực này.
          </p>
          <button style={styles.primaryBtn} onClick={() => navigate("/")}>
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: "/admin", icon: "bi-speedometer2", label: "Tổng quan" },
    { path: "/admin/internship-center", icon: "bi-building-gear", label: "Trung tâm thực tập" },
    { path: "/admin/users", icon: "bi-people-fill", label: "Quản lý tài khoản" },
    { path: "/admin/students", icon: "bi-mortarboard-fill", label: "Quản lý sinh viên" },
    { path: "/admin/internship", icon: "bi-book-fill", label: "Quản lý đề tài" },
    { path: "/admin/application", icon: "bi-file-earmark-text-fill", label: "Quản lý hồ sơ" },
  ];

  const activeItem =
    menuItems.find((item) => location.pathname === item.path) || menuItems[0];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="ims-admin-shell" style={styles.wrapper}>
      <aside className="ims-admin-sidebar" style={styles.sidebar}>
        <div style={styles.brandArea}>
          <div style={styles.logoBox}>
            <i className="bi bi-building-fill-gear"></i>
          </div>
          <div>
            <div style={styles.brandTitle}>IMS ADMIN</div>
            <div style={styles.brandSub}>CUSC Internship System</div>
          </div>
        </div>

        <div style={styles.userPanel}>
          <img
            src={`https://ui-avatars.com/api/?name=${user.username || "Admin"}&background=083c73&color=fff`}
            alt="avatar"
            style={styles.avatar}
          />
          <div style={styles.userText}>
            <div style={styles.userName}>{user.username || "Quản trị viên"}</div>
            <div style={styles.userRole}>Quản trị hệ thống</div>
          </div>
        </div>

        <nav style={styles.navMenu}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuActive : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                <i className={`bi ${item.icon}`} style={styles.menuIcon}></i>
                <span>{item.label}</span>
                {isActive && <span style={styles.activeBar}></span>}
              </button>
            );
          })}
        </nav>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          Đăng xuất
        </button>
      </aside>

      <main className="ims-admin-content" style={styles.content}>
        <header className="ims-admin-topbar" style={styles.topbar}>
          <div>
            <div style={styles.breadcrumb}>IMS / {activeItem.label}</div>
            <h1 style={styles.topbarTitle}>{activeItem.label}</h1>
          </div>
          <div style={styles.systemBadge}>
            <i className="bi bi-shield-check"></i>
            Hệ thống quản trị
          </div>
        </header>

        <section className="ims-admin-inner" style={styles.innerContent}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#eef2f6",
    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: 264,
    minHeight: "100vh",
    background: "#083c73",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "18px 14px",
    position: "fixed",
    inset: "0 auto 0 0",
    borderRight: "4px solid #f29111",
    zIndex: 100,
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 8px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.14)",
  },
  logoBox: {
    width: 42,
    height: 42,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "rgba(255,255,255,0.12)",
    color: "#f29111",
    fontSize: 20,
    flex: "0 0 auto",
  },
  brandTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  brandSub: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: 600,
  },
  userPanel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "18px 0",
    padding: 10,
    borderRadius: 8,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 8,
    flex: "0 0 auto",
  },
  userText: {
    minWidth: 0,
  },
  userName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: 600,
  },
  navMenu: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  menuItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "11px 12px",
    border: "1px solid transparent",
    borderRadius: 8,
    background: "transparent",
    color: "rgba(255,255,255,0.82)",
    cursor: "pointer",
    textAlign: "left",
    fontSize: 14,
    fontWeight: 700,
  },
  menuActive: {
    background: "rgba(255,255,255,0.13)",
    borderColor: "rgba(255,255,255,0.16)",
    color: "#fff",
  },
  menuIcon: {
    width: 22,
    textAlign: "center",
    fontSize: 15,
  },
  activeBar: {
    position: "absolute",
    left: -14,
    top: 10,
    bottom: 10,
    width: 4,
    background: "#f29111",
    borderRadius: "0 4px 4px 0",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "11px 12px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 8,
    background: "rgba(185, 28, 28, 0.18)",
    color: "#fee2e2",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  content: {
    flex: 1,
    marginLeft: 264,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    minWidth: 0,
  },
  topbar: {
    minHeight: 74,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 28px",
    background: "#fff",
    borderBottom: "1px solid #d7dee8",
    boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
  },
  breadcrumb: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  topbarTitle: {
    color: "#083c73",
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
  },
  systemBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "7px 10px",
    borderRadius: 8,
    border: "1px solid #d7dee8",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  innerContent: {
    flex: 1,
    padding: 24,
    background: "#eef2f6",
    minWidth: 0,
    overflowX: "hidden",
  },
  deniedWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "#eef2f6",
  },
  deniedCard: {
    width: "min(100%, 420px)",
    textAlign: "center",
    padding: 28,
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    boxShadow: "0 8px 22px rgba(15,23,42,0.08)",
  },
  deniedIcon: {
    color: "#b91c1c",
    fontSize: 48,
  },
  deniedTitle: {
    margin: "12px 0 8px",
    color: "#0f2f4f",
    fontSize: 24,
    fontWeight: 800,
  },
  deniedText: {
    color: "#64748b",
    marginBottom: 18,
  },
  primaryBtn: {
    padding: "10px 16px",
    border: "1px solid #083c73",
    borderRadius: 8,
    background: "#083c73",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};
