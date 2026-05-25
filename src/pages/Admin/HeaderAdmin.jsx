import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HeaderAdmin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [isHoverBtn, setIsHoverBtn] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      {/* Hiệu ứng nền */}
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        {/* ===== LOGO IMS ===== */}
        <div style={styles.logo} onClick={() => navigate("/admin")}>
          <div style={styles.logoIcon}>
            <i className="bi bi-mortarboard-fill"></i>
          </div>

          <div style={styles.logoText}>
            <span style={styles.brandMain}>IMS SYSTEM</span>
            <span style={styles.brandSub}>
              Internship Management System
            </span>
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div style={styles.actions}>
          {/* USER INFO */}
          <div
            style={styles.userCard}
            onClick={() => navigate("/admin/profile")}
          >
            <div style={styles.avatarWrapper}>
              <img
                src={`https://ui-avatars.com/api/?name=${
                  user?.username || "Admin"
                }&background=2563eb&color=fff`}
                alt="avatar"
                style={styles.avatar}
              />

              <div style={styles.onlineStatus}></div>
            </div>

            <div style={styles.userInfo}>
              <span style={styles.username}>
                {user?.username || "Administrator"}
              </span>

              <span style={styles.roleTag}>
                {user?.role || "admin"}
              </span>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            style={{
              ...styles.logoutBtn,
              ...(isHoverBtn ? styles.logoutBtnHover : {}),
            }}
            onMouseEnter={() => setIsHoverBtn(true)}
            onMouseLeave={() => setIsHoverBtn(false)}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,

    background:
      "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",

    height: "75px",
    padding: "0 24px",

    display: "flex",
    alignItems: "center",

    boxShadow: "0 4px 20px rgba(37, 99, 235, 0.25)",
    overflow: "hidden",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to right, rgba(255,255,255,0.05), transparent)",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    position: "relative",
    zIndex: 2,
  },

  /* ===== LOGO ===== */

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
  },

  logoIcon: {
    width: 48,
    height: 48,

    borderRadius: 14,

    background: "#fff",
    color: "#2563eb",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: 24,

    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  logoText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },

  brandMain: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: 1,
    color: "#fff",
  },

  brandSub: {
    fontSize: 11,
    color: "#dbeafe",
    marginTop: 4,
    fontWeight: 500,
  },

  /* ===== ACTIONS ===== */

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,

    background: "rgba(255,255,255,0.12)",

    padding: "6px 16px 6px 8px",

    borderRadius: 50,

    border: "1px solid rgba(255,255,255,0.2)",

    backdropFilter: "blur(6px)",

    cursor: "pointer",

    transition: "0.25s",
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 40,
    height: 40,

    borderRadius: "50%",

    objectFit: "cover",

    border: "2px solid #fff",
  },

  onlineStatus: {
    position: "absolute",
    bottom: 1,
    right: 1,

    width: 11,
    height: 11,

    borderRadius: "50%",

    background: "#22c55e",

    border: "2px solid #fff",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
  },

  username: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
  },

  roleTag: {
    color: "#dbeafe",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: 600,
  },

  /* ===== LOGOUT ===== */

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,

    padding: "10px 18px",

    background: "transparent",
    color: "#fff",

    border: "1px solid rgba(255,255,255,0.35)",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
    fontSize: 14,

    transition: "all 0.25s ease",
  },

  logoutBtnHover: {
    background: "#ef4444",
    borderColor: "#ef4444",

    transform: "translateY(-2px)",

    boxShadow: "0 6px 14px rgba(239, 68, 68, 0.35)",
  },
};