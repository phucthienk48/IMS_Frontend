import { useNavigate } from "react-router-dom";

export default function HomeLecturer() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Trang giảng viên
          </h1>

          <p style={styles.subTitle}>
            Hệ thống quản lý thực tập IMS
          </p>
        </div>
      </div>

      {/* WELCOME */}
      <div style={styles.welcomeCard}>
        <h2>
          Xin chào, {user.username || "Giảng viên"}
        </h2>

        <p>
          Chào mừng bạn đến với hệ thống quản lý
          thực tập.
        </p>
      </div>

      {/* MENU */}
      <div style={styles.grid}>
        <div
          style={styles.card}
          onClick={() => navigate("/lecturer/topics")}
        >
          <i
            className="bi bi-journal-text"
            style={styles.icon}
          ></i>

          <h3>Quản lý đề tài</h3>

          <p>Xem và quản lý đề tài thực tập</p>
        </div>

        <div
          style={styles.card}
          onClick={() =>
            navigate("/lecturer/students")
          }
        >
          <i
            className="bi bi-people-fill"
            style={styles.icon}
          ></i>

          <h3>Sinh viên</h3>

          <p>Danh sách sinh viên hướng dẫn</p>
        </div>

        <div
          style={styles.card}
          onClick={() =>
            navigate("/lecturer/applications")
          }
        >
          <i
            className="bi bi-file-earmark-text-fill"
            style={styles.icon}
          ></i>

          <h3>Hồ sơ thực tập</h3>

          <p>Quản lý hồ sơ đăng ký thực tập</p>
        </div>

        <div
          style={styles.card}
          onClick={() =>
            navigate("/lecturer/profile")
          }
        >
          <i
            className="bi bi-person-circle"
            style={styles.icon}
          ></i>

          <h3>Thông tin cá nhân</h3>

          <p>Cập nhật thông tin tài khoản</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",

    background: "#f1f5f9",

    padding: 30,

    fontFamily: "Arial",
  },

  header: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 30,
  },

  title: {
    fontSize: 32,

    color: "#1e3a8a",

    marginBottom: 5,
  },

  subTitle: {
    color: "#64748b",
  },

  logoutBtn: {
    padding: "12px 20px",

    border: "none",

    borderRadius: 8,

    background: "#ef4444",

    color: "#fff",

    fontWeight: "bold",

    cursor: "pointer",
  },

  welcomeCard: {
    background: "#fff",

    padding: 25,

    borderRadius: 15,

    marginBottom: 30,

    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",

    gap: 20,
  },

  card: {
    background: "#fff",

    padding: 30,

    borderRadius: 16,

    textAlign: "center",

    cursor: "pointer",

    transition: "0.3s",

    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: 45,

    color: "#2563eb",

    marginBottom: 15,
  },
};