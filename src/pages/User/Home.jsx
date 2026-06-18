import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const destination =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "lecturer"
        ? "/lecturer"
        : "/application";

  const quickActions = [
    {
      icon: "bi-file-earmark-text-fill",
      title: "Hồ sơ thực tập",
      desc: "Tạo, cập nhật và xuất các biểu mẫu thực tập theo đúng mẫu.",
      path: "/application",
    },
    {
      icon: "bi-journal-bookmark-fill",
      title: "Danh sách đề tài",
      desc: "Tra cứu đề tài, thời gian thực tập và thông tin doanh nghiệp.",
      path: "/topics",
    },
    {
      icon: "bi-clipboard-check-fill",
      title: "Kết quả đánh giá",
      desc: "Theo dõi trạng thái đánh giá và kết quả sau kỳ thực tập.",
      path: "/internship-result",
    },
    {
      icon: "bi-person-circle",
      title: "Hồ sơ cá nhân",
      desc: "Cập nhật thông tin tài khoản dùng trong hồ sơ thực tập.",
      path: "/profile",
    },
  ];

  const processItems = [
    "Chọn đề tài hoặc cập nhật thông tin doanh nghiệp thực tập.",
    "Nộp hồ sơ thực tập kèm CV, bảng điểm và thông tin liên hệ.",
    "Ghi nhận báo cáo tiến độ hàng tuần để giảng viên theo dõi.",
    "Xuất phiếu nhận, phiếu giao việc và phiếu theo dõi khi hồ sơ đủ dữ liệu.",
  ];

  return (
    <div style={styles.container}>
      <section className="ims-page-heading">
        <div>
          <div className="ims-kicker">Cổng sinh viên</div>
          <h1 className="ims-page-title">
            <i className="bi bi-grid-1x2-fill"></i>
            Hệ thống quản lý thực tập
          </h1>
          <p className="ims-page-subtitle">
            Quản lý hồ sơ, đề tài, báo cáo tiến độ và kết quả thực tập trên một màn hình làm việc.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => (user ? navigate(destination) : navigate("/login"))}>
          <i className={`bi ${user ? "bi-arrow-right" : "bi-box-arrow-in-right"}`}></i>
          {user ? "Vào khu vực làm việc" : "Đăng nhập hệ thống"}
        </button>
      </section>

      <section style={styles.overviewGrid}>
        <div style={styles.summaryPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Thông tin phiên làm việc</h2>
              <p style={styles.panelDesc}>
                {user
                  ? `Tài khoản ${user.username || "người dùng"} đang được dùng cho quy trình thực tập.`
                  : "Đăng nhập để bắt đầu tạo hồ sơ và theo dõi quy trình thực tập."}
              </p>
            </div>
            <div style={styles.statusPill}>{user ? "Đã đăng nhập" : "Chưa đăng nhập"}</div>
          </div>

          <div style={styles.infoRows}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Vai trò</span>
              <strong>{roleLabel(user?.role)}</strong>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Phạm vi</span>
              <strong>Hồ sơ, đề tài, báo cáo tiến độ</strong>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Biểu mẫu</span>
              <strong>Phiếu nhận, giao việc, theo dõi</strong>
            </div>
          </div>
        </div>

        <div style={styles.processPanel}>
          <h2 style={styles.panelTitle}>Quy trình xử lý</h2>
          <ol style={styles.processList}>
            {processItems.map((item) => (
              <li key={item} style={styles.processItem}>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ims-card-grid" style={{ marginTop: 18 }}>
        {quickActions.map((item) => (
          <button
            key={item.path}
            type="button"
            className="ims-card ims-card-action"
            style={styles.actionCard}
            onClick={() => (user ? navigate(item.path) : navigate("/login"))}
          >
            <span className="ims-icon-box">
              <i className={`bi ${item.icon}`}></i>
            </span>
            <span style={styles.actionTitle}>{item.title}</span>
            <span style={styles.actionDesc}>{item.desc}</span>
            <span style={styles.actionLink}>
              Mở chức năng <i className="bi bi-chevron-right"></i>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function roleLabel(role) {
  if (role === "admin") return "Quản trị viên";
  if (role === "lecturer") return "Giảng viên";
  if (role === "student") return "Sinh viên";
  return "Khách";
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
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  summaryPanel: {
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  processPanel: {
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 16,
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
  statusPill: {
    padding: "6px 10px",
    border: "1px solid #d7dee8",
    borderRadius: 999,
    background: "#f8fafc",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  infoRows: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e5eaf1",
    borderRadius: 8,
    color: "#0f2f4f",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },
  processList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    margin: "14px 0 0",
    paddingLeft: 18,
    color: "#334155",
    fontSize: 14,
  },
  processItem: {
    paddingLeft: 4,
  },
  actionCard: {
    alignItems: "flex-start",
    textAlign: "left",
    color: "#334155",
  },
  actionTitle: {
    color: "#0f2f4f",
    fontSize: 16,
    fontWeight: 800,
  },
  actionDesc: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.5,
    flex: 1,
  },
  actionLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "#083c73",
    fontSize: 13,
    fontWeight: 800,
    marginTop: 4,
  },
};
