import { NavLink, useNavigate } from "react-router-dom";

export default function HeaderLecturer() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      {/* LOGO */}
      <div style={styles.logo} onClick={() => navigate("/lecturer")}>
        <i className="bi bi-mortarboard-fill"></i>
        <span>IMS SYSTEM</span>
      </div>

      {/* MENU */}
      <nav style={styles.menu}>
        <NavLink
          to="/lecturer"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Home
        </NavLink>

        <NavLink
          to="/lecturer/topics"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Đề tài
        </NavLink>

        <NavLink
          to="/lecturer/applications"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Thực tập
        </NavLink>

        <NavLink
          to="/lecturer/students"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Sinh viên
        </NavLink>

        <NavLink
          to="/lecturer/profile"
          title="Hồ sơ"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <i className="bi bi-person-circle" style={styles.profileIcon}></i>
        </NavLink>
      </nav>

      {/* ACTION */}
      <div style={styles.actionArea}>
        {!user ? (
          <button style={styles.loginBtn} onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
        ) : (
          <div style={styles.userBox}>
            <div style={styles.userInfo}>
              <span style={styles.username}>{user.username}</span>
              <NavLink
                to="/lecturer/profile"
                title="Hồ sơ"
                style={styles.profileLink}
              >
                <i
                  className="bi bi-person-circle"
                  style={styles.profileIcon}
                ></i>
              </NavLink>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout}>
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
    fontWeight: 500,

    padding: "8px 10px",
    borderRadius: 10,

    transition: "0.3s",
  },

  activeLink: {
    background: "rgba(255,255,255,0.12)",
  },

  actionArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  profileLink: {
    color: "#dbeafe",
    textDecoration: "none",
    fontSize: 14,
  },

  profileIcon: {
    fontSize: 18,
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

  username: {
    fontSize: 14,
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
