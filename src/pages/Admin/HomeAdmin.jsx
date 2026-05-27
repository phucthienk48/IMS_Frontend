import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeAdmin() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    approved: 0,
    pending: 0,
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users"),
          fetch("http://localhost:5000/api/application"),
        ]);
        const usersData = await usersRes.json();
        const appsData = await appsRes.json();

        const applications = appsData.data || [];
        setStats({
          totalUsers: (usersData.data || []).length,
          totalApplications: applications.length,
          approved: applications.filter((a) => a.status === "đã duyệt").length,
          pending: applications.filter((a) => a.status === "chờ duyệt").length,
        });
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      id: 1,
      path: "/admin/users",
      icon: "bi-people-fill",
      title: "Quản lý tài khoản",
      desc: "Tạo, chỉnh sửa và phân quyền tài khoản của sinh viên, giảng viên trong hệ thống.",
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    },
    {
      id: 2,
      path: "/admin/application",
      icon: "bi-file-earmark-text-fill",
      title: "Quản lý hồ sơ",
      desc: "Xem xét, phê duyệt và quản lý toàn bộ hồ sơ đăng ký thực tập của sinh viên.",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    },
    {
      id: 3,
      path: "/admin/student",
      icon: "bi-mortarboard-fill",
      title: "Quản lý sinh viên",
      desc: "Theo dõi danh sách sinh viên thực tập, tiến độ và kết quả đánh giá.",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      id: 4,
      path: "/admin/internship",
      icon: "bi-book-fill",
      title: "Quản lý đề tài",
      desc: "Tạo và quản lý các đề tài thực tập, kết nối doanh nghiệp với sinh viên.",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    },
  ];

  const statCards = [
    {
      label: "Tổng tài khoản",
      value: stats.totalUsers,
      icon: "bi-people-fill",
      color: "#2563eb",
      bg: "rgba(37, 99, 235, 0.08)",
    },
    {
      label: "Tổng hồ sơ",
      value: stats.totalApplications,
      icon: "bi-file-earmark-text-fill",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.08)",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: "bi-check-circle-fill",
      color: "#16a34a",
      bg: "rgba(22, 163, 74, 0.08)",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: "bi-hourglass-split",
      color: "#d97706",
      bg: "rgba(217, 119, 6, 0.08)",
    },
  ];

  return (
    <div style={styles.container}>
      {/* HERO WELCOME BANNER */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <span style={styles.heroBadge}>
                <i className="bi bi-shield-check me-1"></i> Admin Portal
              </span>
              <h2 style={styles.heroTitle}>
                Xin chào, {user.username || "Administrator"} 👋
              </h2>
              <p style={styles.heroDesc}>
                Chào mừng quay trở lại hệ thống quản lý IMS. Bạn có thể quản lý tài khoản, phê duyệt hồ sơ thực tập và kiểm soát toàn bộ hoạt động của hệ thống từ đây.
              </p>
              <button
                style={styles.heroBtn}
                onClick={() => navigate("/admin/application")}
              >
                Xem hồ sơ chờ duyệt <i className="bi bi-arrow-right-short ms-1"></i>
              </button>
            </div>
            <div className="col-md-4 text-center d-none d-md-block">
              <div style={styles.heroBlobWrap}>
                <div style={styles.heroBlob}></div>
                <i className="bi bi-speedometer2" style={styles.heroIcon}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE STATS */}
      <div style={styles.statsGrid}>
        {statCards.map((s, i) => (
          <div
            key={i}
            style={{ ...styles.statCard, background: s.bg, borderColor: s.color + "22" }}
          >
            <div style={{ ...styles.statIconBox, background: s.color }}>
              <i className={`bi ${s.icon} text-white`} style={{ fontSize: 20 }}></i>
            </div>
            <div>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MENU ACTIONS */}
      <div style={{ marginBottom: 10 }}>
        <h3 style={styles.sectionTitle}>
          <i className="bi bi-grid-fill me-2" style={{ color: "#2563eb" }}></i>
          Chức năng quản trị
        </h3>
      </div>
      <div style={styles.menuGrid}>
        {menuItems.map((item) => {
          const isHovered = hoveredCard === item.id;
          return (
            <div
              key={item.id}
              style={{
                ...styles.menuCard,
                ...(isHovered ? styles.menuCardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(item.path)}
            >
              <div
                style={{
                  ...styles.menuIconBox,
                  background: item.gradient,
                  transform: isHovered ? "scale(1.1) rotate(4deg)" : "none",
                }}
              >
                <i className={`bi ${item.icon} text-white fs-3`}></i>
              </div>
              <h4 style={styles.menuTitle}>{item.title}</h4>
              <p style={styles.menuDesc}>{item.desc}</p>
              <div
                style={{
                  ...styles.menuLink,
                  color: item.color,
                  opacity: isHovered ? 1 : 0.75,
                }}
              >
                Truy cập ngay <i className="bi bi-chevron-right ms-1"></i>
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
    padding: "4px 0 20px",
    background: "#f8fafc",
  },

  /* ── HERO ── */
  heroBanner: {
    position: "relative",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: "20px",
    padding: "40px 36px",
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.15)",
    marginBottom: "32px",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 80% 15%, rgba(59, 130, 246, 0.18) 0%, transparent 55%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
  },

  heroBadge: {
    display: "inline-block",
    padding: "4px 14px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#93c5fd",
    marginBottom: "14px",
  },

  heroTitle: {
    fontSize: "26px",
    fontWeight: "800",
    marginBottom: "10px",
  },

  heroDesc: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "640px",
    marginBottom: "22px",
  },

  heroBtn: {
    padding: "10px 22px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
    transition: "all 0.2s",
  },

  heroBlobWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "120px",
    height: "120px",
  },

  heroBlob: {
    position: "absolute",
    inset: 0,
    background: "rgba(96, 165, 250, 0.2)",
    borderRadius: "50%",
    filter: "blur(20px)",
  },

  heroIcon: {
    fontSize: "56px",
    color: "#60a5fa",
    position: "relative",
    zIndex: 1,
  },

  /* ── STATS ── */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 20px",
    borderRadius: "14px",
    border: "1px solid",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },

  statIconBox: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statValue: {
    fontSize: "26px",
    fontWeight: "800",
    lineHeight: 1,
    marginBottom: "4px",
  },

  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },

  /* ── SECTION TITLE ── */
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
  },

  /* ── MENU GRID ── */
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },

  menuCard: {
    background: "#fff",
    padding: "28px 22px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  menuCardHover: {
    transform: "translateY(-6px)",
    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.07)",
    borderColor: "#cbd5e1",
  },

  menuIconBox: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  menuTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
  },

  menuDesc: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "18px",
    flex: 1,
  },

  menuLink: {
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    transition: "opacity 0.2s",
  },
};