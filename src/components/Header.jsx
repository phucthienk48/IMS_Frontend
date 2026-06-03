import { NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate("/")}>
        <div style={styles.logoIcon}>
          <i className="bi bi-mortarboard-fill"></i>
        </div>

        <div style={styles.logoText}>
          <span style={styles.logoMain}>IMS</span>
          <span style={styles.logoSub}>INTERNSHIP SYSTEM</span>
        </div>
      </div>

      {/* Menu */}
      <nav style={styles.menu}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-house-fill"></i>
          Home
        </NavLink>

        <NavLink
          to="/topics"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-journal-bookmark-fill"></i>
          Đề tài
        </NavLink>

        <NavLink
          to="/application"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-file-earmark-text-fill"></i>
          Thực tập
        </NavLink>

        <NavLink
          to="/internship-result"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-clipboard-check-fill"></i>
          Kết quả
        </NavLink>
      </nav>

      {/* User */}
      <div style={styles.actionArea}>
        {!user ? (
          <button
            style={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        ) : (
          <div style={styles.userBox}>
            <div style={styles.userInfo}>
              <span style={styles.username}>{user.username}</span>
              <span style={styles.role}>Sinh viên</span>
            </div>

            <NavLink
              to="/profile"
              style={styles.profileBtn}
              title="Hồ sơ cá nhân"
            >
              <i className="bi bi-person-fill"></i>
            </NavLink>

            <div style={styles.divider}></div>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
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
    height: "90px",
    background:
      "linear-gradient(135deg,#08203a 0%,#1d4ed8 50%,#3b82f6 100%)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 35px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  /* Logo */
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    cursor: "pointer",
  },

  logoIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },

  logoText: {
    display: "flex",
    flexDirection: "column",
  },

  logoMain: {
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  logoSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: "1px",
  },

  /* Menu */
  menu: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "700",
    padding: "12px 18px",
    borderRadius: "14px",
  },

  activeLink: {
    background: "rgba(255,255,255,0.2)",
  },

  /* User */
  actionArea: {
    display: "flex",
    alignItems: "center",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    textAlign: "right",
  },

  username: {
    fontSize: "15px",
    fontWeight: "700",
  },

  role: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.75)",
  },

  profileBtn: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    border: "2px solid rgba(255,255,255,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    color: "#fff",
    fontSize: "20px",
  },

  divider: {
    width: "1px",
    height: "34px",
    background: "rgba(255,255,255,0.2)",
  },

  loginBtn: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "14px",
    background: "#fff",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.25)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
};