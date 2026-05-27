import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HomeLecturer() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const menuItems = [
    {
      id: 1,
      path: "/lecturer/applications",
      icon: "bi-file-earmark-text-fill",
      title: "Hồ sơ thực tập",
      desc: "Xem và phê duyệt các yêu cầu đăng ký thực tập của sinh viên.",
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    },
    {
      id: 2,
      path: "/lecturer/topics", // route path to topics
      icon: "bi-journal-text",
      title: "Quản lý đề tài",
      desc: "Xem, duyệt và thêm mới các đề tài thực tập dành cho sinh viên.",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    },
    {
      id: 3,
      path: "/lecturer/students",
      icon: "bi-people-fill",
      title: "Sinh viên hướng dẫn",
      desc: "Xem danh sách và tiến độ thực tập của sinh viên đang hướng dẫn.",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      id: 4,
      path: "/profile",
      icon: "bi-person-circle",
      title: "Thông tin cá nhân",
      desc: "Xem chi tiết thông tin tài khoản và cấu hình hệ thống.",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    },
  ];

  return (
    <div style={styles.container}>
      {/* HEADER SECTION */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bảng điều khiển Giảng viên</h1>
          <p style={styles.subTitle}>
            Hệ thống Quản lý Thực tập IMS - Portal hỗ trợ giảng dạy & hướng dẫn
          </p>
        </div>
      </div>

      {/* WELCOME BLOCK */}
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeOverlay}></div>
        <div style={styles.welcomeContent}>
          <div className="row align-items-center">
            <div className="col-md-9 text-start">
              <span style={styles.welcomeBadge}>👋 Xin chào Giảng viên</span>
              <h2 style={styles.welcomeName}>
                {user.username || "Thầy / Cô"}
              </h2>
              <p style={styles.welcomeDesc}>
                Chào mừng Thầy/Cô quay trở lại hệ thống IMS. Thầy/Cô có thể dễ dàng quản lý thông tin các sinh viên được phân công hướng dẫn, phê duyệt hồ sơ ứng tuyển thực tập và theo dõi tiến trình thực hiện đề tài.
              </p>
            </div>
            <div className="col-md-3 text-center d-none d-md-block">
              <div style={styles.avatarCircle}>
                <i className="bi bi-person-workspace text-white display-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENU GRID */}
      <div style={styles.grid}>
        {menuItems.map((item) => {
          const isHovered = hoveredCard === item.id;
          return (
            <div
              key={item.id}
              style={{
                ...styles.card,
                ...(isHovered ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(item.path)}
            >
              <div
                style={{
                  ...styles.iconBox,
                  background: item.gradient,
                  transform: isHovered ? "scale(1.1) rotate(5deg)" : "none",
                }}
              >
                <i className={`bi ${item.icon} text-white fs-3`}></i>
              </div>

              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>
              
              <div
                style={{
                  ...styles.cardLink,
                  color: item.color,
                  opacity: isHovered ? 1 : 0.8,
                }}
              >
                Khám phá ngay <i className="bi bi-chevron-right ms-1"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "10px 0",
    background: "#f8fafc",
    minHeight: "85vh",
  },

  header: {
    marginBottom: "30px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e3a8a",
    margin: "0 0 4px 0",
  },

  subTitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },

  welcomeCard: {
    position: "relative",
    background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
    borderRadius: "20px",
    padding: "35px 30px",
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(30, 58, 138, 0.12)",
    marginBottom: "35px",
  },

  welcomeOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.18) 0%, transparent 60%)",
    pointerEvents: "none",
  },

  welcomeContent: {
    position: "relative",
    zIndex: 2,
  },

  welcomeBadge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#93c5fd",
    marginBottom: "12px",
  },

  welcomeName: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "8px",
  },

  welcomeDesc: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "800px",
    margin: 0,
  },

  avatarCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.06)",
    border: "2px solid rgba(255, 255, 255, 0.15)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    padding: "30px 24px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },

  cardHover: {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.06)",
    borderColor: "#cbd5e1",
  },

  iconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "10px",
  },

  cardDesc: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "20px",
    flex: 1,
  },

  cardLink: {
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
};