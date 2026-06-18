import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    approved: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError("");
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
          approved: applications.filter((item) => item.status === "đã duyệt").length,
          pending: applications.filter((item) => item.status === "chờ duyệt").length,
        });
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
        setError("Không thể tải thống kê. Vui lòng kiểm tra backend và cơ sở dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Tổng tài khoản",
      value: stats.totalUsers,
      icon: "bi-people-fill",
      tone: "blue",
    },
    {
      label: "Tổng hồ sơ",
      value: stats.totalApplications,
      icon: "bi-file-earmark-text-fill",
      tone: "teal",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: "bi-check-circle-fill",
      tone: "green",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: "bi-hourglass-split",
      tone: "orange",
    },
  ];

  const menuItems = [
    {
      path: "/admin/users",
      icon: "bi-people-fill",
      title: "Quản lý tài khoản",
      desc: "Tạo, chỉnh sửa và phân quyền tài khoản sinh viên, giảng viên.",
    },
    {
      path: "/admin/application",
      icon: "bi-file-earmark-text-fill",
      title: "Quản lý hồ sơ",
      desc: "Kiểm tra, phê duyệt và theo dõi hồ sơ đăng ký thực tập.",
    },
    {
      path: "/admin/students",
      icon: "bi-mortarboard-fill",
      title: "Quản lý sinh viên",
      desc: "Theo dõi sinh viên thực tập, báo cáo tiến độ và kết quả.",
    },
    {
      path: "/admin/internship",
      icon: "bi-book-fill",
      title: "Quản lý đề tài",
      desc: "Cập nhật đề tài, doanh nghiệp, giảng viên và thời gian thực tập.",
    },
  ];

  return (
    <div style={styles.container}>
      <section className="ims-page-heading">
        <div>
          <div className="ims-kicker">Tổng quan quản trị</div>
          <h1 className="ims-page-title">
            <i className="bi bi-speedometer2"></i>
            Bảng điều khiển hệ thống
          </h1>
          <p className="ims-page-subtitle">
            Xin chào, <strong>{user.username || "Quản trị viên"}</strong>. Theo dõi nhanh tài khoản,
            hồ sơ và các chức năng quản trị chính.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => navigate("/admin/application")}>
          <i className="bi bi-inbox-fill"></i>
          Xem hồ sơ
        </button>
      </section>

      {error && (
        <div style={styles.alertBox}>
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
        </div>
      )}

      <section style={styles.statsGrid}>
        {statCards.map((item) => (
          <div key={item.label} style={styles.statCard}>
            <span style={{ ...styles.statIcon, ...toneStyle(item.tone) }}>
              <i className={`bi ${item.icon}`}></i>
            </span>
            <div>
              <div style={styles.statValue}>{loading ? "..." : item.value}</div>
              <div style={styles.statLabel}>{item.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Chức năng quản trị</h2>
            <p style={styles.panelDesc}>Các nhóm chức năng vận hành chính của hệ thống IMS.</p>
          </div>
        </div>

        <div style={styles.menuGrid}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              style={styles.menuCard}
              onClick={() => navigate(item.path)}
            >
              <span className="ims-icon-box">
                <i className={`bi ${item.icon}`}></i>
              </span>
              <span style={styles.menuBody}>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </span>
              <i className="bi bi-chevron-right" style={styles.chevron}></i>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function toneStyle(tone) {
  const tones = {
    blue: { background: "#e8eef6", color: "#083c73" },
    teal: { background: "#e6f4f1", color: "#0f766e" },
    green: { background: "#eaf7ee", color: "#15803d" },
    orange: { background: "#fff4e5", color: "#b45309" },
  };
  return tones[tone] || tones.blue;
}

const styles = {
  container: {
    minHeight: "70vh",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 40,
    padding: "9px 16px",
    border: "1px solid #083c73",
    borderRadius: 8,
    background: "#083c73",
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 14px",
    marginBottom: 18,
    border: "1px solid #fed7aa",
    borderRadius: 8,
    background: "#fff7ed",
    color: "#9a3412",
    fontSize: 14,
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 16,
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  statIcon: {
    width: 42,
    height: 42,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    fontSize: 18,
    flex: "0 0 auto",
  },
  statValue: {
    color: "#0f2f4f",
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 800,
    marginBottom: 4,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
  panel: {
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  panelHeader: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottom: "1px solid #e5eaf1",
  },
  panelTitle: {
    margin: 0,
    color: "#0f2f4f",
    fontSize: 18,
    fontWeight: 800,
  },
  panelDesc: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 14,
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  menuCard: {
    display: "grid",
    gridTemplateColumns: "40px minmax(0, 1fr) 18px",
    alignItems: "center",
    gap: 12,
    width: "100%",
    minHeight: 104,
    padding: 14,
    border: "1px solid #d7dee8",
    borderRadius: 8,
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    textAlign: "left",
  },
  menuBody: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  chevron: {
    color: "#083c73",
  },
};
