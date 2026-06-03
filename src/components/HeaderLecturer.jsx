import { NavLink, useNavigate } from "react-router-dom";

export default function HeaderLecturer() {
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
      <div style={styles.logo} onClick={() => navigate("/lecturer")}>
        <div style={styles.logoIcon}>
          <i className="bi bi-mortarboard-fill"></i>
        </div>

        <div style={styles.logoText}>
          <span style={styles.logoMain}>IMS</span>
          <span style={styles.logoSub}>INTERNSHIP SYSTEM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <NavLink
          to="/lecturer"
          end
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-house-fill" style={styles.navIcon}></i>
          Home
        </NavLink>

        <NavLink
          to="/lecturer/topics"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i
            className="bi bi-journal-bookmark-fill"
            style={styles.navIcon}
          ></i>
          Đề tài
        </NavLink>

        <NavLink
          to="/lecturer/applications"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i
            className="bi bi-file-earmark-text-fill"
            style={styles.navIcon}
          ></i>
          Thực tập
        </NavLink>

        <NavLink
          to="/lecturer/students"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-people-fill" style={styles.navIcon}></i>
          Sinh viên
        </NavLink>
      </nav>

      {/* User */}
      <div style={styles.action}>
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
              <span style={styles.role}>Giảng viên</span>
            </div>

            <NavLink
              to="/lecturer/profile"
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
        "linear-gradient(135deg, #08203a 0%, #1d4ed8 50%, #3b82f6 100%)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 35px",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    },

    logo: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      cursor: "pointer",
    },

    logoIcon: {
      width: "55px",
      height: "55px",
      borderRadius: "14px",
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      color: "#fff",
    },

    logoText: {
      display: "flex",
      flexDirection: "column",
    },

    logoMain: {
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "2px",
      lineHeight: 1,
    },

    logoSub: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.8)",
      letterSpacing: "1px",
      marginTop: "4px",
    },

    nav: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
    },

    navLink: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textDecoration: "none",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "700",
      padding: "14px 22px",
      borderRadius: "14px",
      transition: "0.3s",
    },

    activeLink: {
      background: "rgba(255,255,255,0.2)",
    },

    navIcon: {
      fontSize: "24px",
    },

    action: {
      display: "flex",
      alignItems: "center",
    },

    userBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "8px 14px",
      borderRadius: "20px",
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
      color: "#fff",
    },

    role: {
      fontSize: "12px",
      color: "rgba(255,255,255,0.75)",
    },

    profileBtn: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.15)",
      border: "2px solid rgba(255,255,255,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      color: "#fff",
      fontSize: "20px",
    },

    divider: {
      width: "1px",
      height: "35px",
      background: "rgba(255,255,255,0.2)",
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
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
    },

    loginBtn: {
      padding: "12px 22px",
      border: "none",
      borderRadius: "14px",
      background: "#fff",
      color: "#1d4ed8",
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
    },
  };