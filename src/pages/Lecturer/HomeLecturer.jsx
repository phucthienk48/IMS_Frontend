import { useNavigate } from "react-router-dom";

export default function HomeLecturer() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const menuItems = [
    {
      path: "/lecturer/applications",
      icon: "bi-file-earmark-text-fill",
      title: "Duyệt hồ sơ thực tập",
      desc: "Kiểm tra hồ sơ đăng ký, thông tin sinh viên và tài liệu đính kèm.",
    },
    {
      path: "/lecturer/topics",
      icon: "bi-journal-text",
      title: "Quản lý đề tài",
      desc: "Cập nhật đề tài, doanh nghiệp, người hướng dẫn và thời gian thực tập.",
    },
    {
      path: "/lecturer/students",
      icon: "bi-people-fill",
      title: "Sinh viên hướng dẫn",
      desc: "Theo dõi báo cáo tiến độ, nhận xét và thông tin biểu mẫu của sinh viên.",
    },
    {
      path: "/lecturer/profile",
      icon: "bi-person-circle",
      title: "Hồ sơ cá nhân",
      desc: "Kiểm tra thông tin tài khoản giảng viên dùng trong hệ thống.",
    },
  ];

  const reviewSteps = [
    "Tiếp nhận hồ sơ sinh viên gửi lên hệ thống.",
    "Kiểm tra đề tài, doanh nghiệp và thông tin người hướng dẫn.",
    "Theo dõi báo cáo tiến độ hàng tuần và nhập nhận xét.",
    "Hỗ trợ sinh viên hoàn thiện các phiếu Word theo mẫu.",
  ];

  return (
    <div style={styles.container}>
      <section className="ims-page-heading">
        <div>
          <div className="ims-kicker">Khu vực giảng viên</div>
          <h1 className="ims-page-title">
            <i className="bi bi-person-workspace"></i>
            Bảng điều khiển giảng viên
          </h1>
          <p className="ims-page-subtitle">
            Quản lý hồ sơ, đề tài và tiến độ thực tập của sinh viên được phân công.
          </p>
        </div>
        <div style={styles.userBadge}>
          <i className="bi bi-person-badge-fill"></i>
          {user.username || "Giảng viên"}
        </div>
      </section>

      <section style={styles.summaryGrid}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Nhiệm vụ xử lý</h2>
          <p style={styles.panelDesc}>
            Các chức năng bên dưới được sắp theo luồng làm việc của giảng viên hướng dẫn.
          </p>
          <div style={styles.actionGrid}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                type="button"
                style={styles.actionCard}
                onClick={() => navigate(item.path)}
              >
                <span className="ims-icon-box">
                  <i className={`bi ${item.icon}`}></i>
                </span>
                <span style={styles.actionText}>
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </span>
                <i className="bi bi-chevron-right" style={styles.chevron}></i>
              </button>
            ))}
          </div>
        </div>

        <aside style={styles.panel}>
          <h2 style={styles.panelTitle}>Quy trình theo dõi</h2>
          <ol style={styles.stepList}>
            {reviewSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </aside>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "70vh",
  },
  userBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  panel: {
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
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
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
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
  actionText: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  chevron: {
    color: "#083c73",
  },
  stepList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    margin: "14px 0 0",
    paddingLeft: 18,
    color: "#334155",
    fontSize: 14,
  },
};
