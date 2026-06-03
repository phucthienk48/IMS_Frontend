import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  // đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // active menu
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header style={styles.header}>
      {/* LOGO */}
      <div style={styles.logo} onClick={() => navigate("/")}>
        <i className="bi bi-mortarboard-fill"></i>
        <span>IMS SYSTEM</span>
      </div>

      {/* MENU */}
      <nav style={styles.menu}>
        <Link
          to="/"
          style={{
            ...styles.link,
            ...(isActive("/") && styles.activeLink),
          }}
        >
          Home
        </Link>

        <Link
          to="/topics"
          style={{
            ...styles.link,
            ...(isActive("/topics") && styles.activeLink),
          }}
        >
          Đề tài
        </Link>

        <Link
          to="/application"
          style={{
            ...styles.link,
            ...(isActive("/application") && styles.activeLink),
          }}
        >
          Thực tập
        </Link>

        <Link
          to="/internship-result"
          style={{
            ...styles.link,
            ...(isActive("/internship-result") && styles.activeLink),
          }}
        >
          Kết quả
        </Link>

        <Link
          to="/notifications"
          style={{
            ...styles.link,
            ...(isActive("/notifications") && styles.activeLink),
          }}
        >
          Thông báo
        </Link>

      </nav>

      {/* ACTION */}
      <div>
        {!user ? (
          <button
            style={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        ) : (
          <div style={styles.userBox}>
            <span style={styles.username}>
              Xin chào, {user.username}
            </span>

            <button
              style={styles.logoutBtn}
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 70,
    background: "#1e3a8a",
    color: "#fff",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "0 40px",

    position: "sticky",
    top: 0,
    zIndex: 1000,

    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,

    fontSize: 24,
    fontWeight: "bold",

    cursor: "pointer",
  },

  menu: {
    display: "flex",
    gap: 25,
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 600,

    padding: "6px 6px",
    borderRadius: 8,

    transition: "0.3s",
  },

  activeLink: {
    background: "#2563eb",
  },

  loginBtn: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,

    background: "#fff",
    color: "#1e3a8a",

    fontWeight: "bold",
    cursor: "pointer",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  username: {
    fontSize: 16,
    fontWeight: 500,
  },

  logoutBtn: {
    padding: "8px 14px",
    border: "none",
    borderRadius: 8,

    background: "#ef4444",
    color: "#fff",

    cursor: "pointer",
    fontWeight: "bold",
  },
};