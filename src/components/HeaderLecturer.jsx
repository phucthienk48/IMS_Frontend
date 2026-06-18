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
    <header className="ims-public-header" style={styles.headerContainer}>
      {/* Tier 1: CUSC Brand Header */}
      <div className="ims-public-topbar" style={styles.topHeader}>
        <div className="ims-public-brand" style={styles.logoGroup} onClick={() => navigate("/lecturer")}>
          {/* Stylized CSS CUSC Logo */}
          <div style={styles.logoBox}>
            <div style={styles.logoTriangle}></div>
            <span style={styles.logoTextMain}>Cusc</span>
            <span style={styles.logoTextRegistered}>®</span>
          </div>
          <div className="ims-public-brand-text" style={styles.logoTextGroup}>
            <h1 style={styles.brandTitle}>TRUNG TÂM CÔNG NGHỆ PHẦN MỀM</h1>
            <h2 style={styles.brandSubtitle}>TRƯỜNG ĐẠI HỌC CẦN THƠ</h2>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="ims-public-actions" style={styles.topRight}>
          <div style={styles.langSelector}>
            <span style={styles.flagIcon}>VI</span>
          </div>

          {user ? (
            <div className="ims-public-user" style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.username}</span>
                <span style={styles.userRole}>Giảng viên</span>
              </div>
              <NavLink to="/lecturer/profile" style={styles.profileBtn} title="Hồ sơ cá nhân">
                <i className="bi bi-person-circle"></i>
              </NavLink>
              <div style={styles.divider}></div>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Đăng xuất
              </button>
            </div>
          ) : (
            <button style={styles.loginBtn} onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Tier 2: Blue Navigation Bar */}
      <div className="ims-public-nav-bar" style={styles.navBar}>
        <nav className="ims-public-nav" style={styles.navMenu}>
          <NavLink
            className="ims-public-nav-link"
            to="/lecturer"
            end
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <i className="bi bi-house-fill" style={styles.navIcon}></i> Trang chủ
          </NavLink>

          <NavLink
            className="ims-public-nav-link"
            to="/lecturer/topics"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <i className="bi bi-journal-bookmark-fill" style={styles.navIcon}></i> Quản lý đề tài
          </NavLink>

          <NavLink
            className="ims-public-nav-link"
            to="/lecturer/applications"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <i className="bi bi-file-earmark-text-fill" style={styles.navIcon}></i> Quản lý yêu cầu
          </NavLink>

          <NavLink
            className="ims-public-nav-link"
            to="/lecturer/students"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <i className="bi bi-people-fill" style={styles.navIcon}></i> Quản lý sinh viên
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 40px",
    background: "#fff",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer",
  },
  logoBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "55px",
    padding: "0 10px",
  },
  logoTriangle: {
    position: "absolute",
    left: 0,
    top: "10%",
    width: 0,
    height: 0,
    borderLeft: "25px solid transparent",
    borderRight: "25px solid transparent",
    borderBottom: "40px solid #f29111",
    opacity: 0.6,
    zIndex: 1,
  },
  logoTextMain: {
    fontSize: "30px",
    fontWeight: "900",
    color: "#083c73",
    zIndex: 2,
    letterSpacing: 0,
    fontFamily: "Georgia, serif",
  },
  logoTextRegistered: {
    fontSize: "10px",
    color: "#083c73",
    alignSelf: "flex-start",
    marginTop: "8px",
    zIndex: 2,
  },
  logoTextGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#083c73",
    margin: 0,
    letterSpacing: 0,
  },
  brandSubtitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#083c73",
    margin: 0,
    letterSpacing: 0,
    opacity: 0.9,
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    borderRight: "1px solid #e2e8f0",
    paddingRight: "15px",
  },
  flagIcon: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#083c73",
    cursor: "pointer",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
  },
  userRole: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500",
  },
  profileBtn: {
    fontSize: "24px",
    color: "#083c73",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  divider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#cbd5e1",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loginBtn: {
    padding: "8px 18px",
    backgroundColor: "#083c73",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  navBar: {
    background: "#083c73",
    padding: "0 40px",
    borderBottom: "3px solid #f29111",
  },
  navMenu: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    padding: "14px 20px",
    transition: "all 0.2s",
    position: "relative",
  },
  navLinkActive: {
    background: "#f29111",
    color: "#fff",
  },
  navIcon: {
    fontSize: "16px",
  },
};
