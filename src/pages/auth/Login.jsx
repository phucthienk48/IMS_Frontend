import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("token", result.accessToken || result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.user.role === "admin") navigate("/admin");
      else if (result.user.role === "lecturer") navigate("/lecturer");
      else navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authShell}>
      <section style={styles.authCard}>
        <aside style={styles.infoPanel}>
          <div style={styles.logoMark}>
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div>
            <div style={styles.kicker}>IMS CUSC</div>
            <h1 style={styles.infoTitle}>Hệ thống quản lý thực tập</h1>
            <p style={styles.infoText}>
              Đăng nhập để xử lý hồ sơ, đề tài, báo cáo tiến độ và xuất biểu mẫu thực tập.
            </p>
          </div>
          <div style={styles.infoList}>
            <span>
              <i className="bi bi-check-circle-fill"></i>
              Quản lý hồ sơ thực tập tập trung
            </span>
            <span>
              <i className="bi bi-check-circle-fill"></i>
              Theo dõi tiến độ theo từng vai trò
            </span>
            <span>
              <i className="bi bi-check-circle-fill"></i>
              Xuất biểu mẫu Word đúng mẫu
            </span>
          </div>
        </aside>

        <form style={styles.formPanel} onSubmit={handleSubmit}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Đăng nhập</h2>
            <p style={styles.formSubtitle}>Sử dụng tài khoản đã được cấp trong hệ thống.</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <i className="bi bi-exclamation-circle-fill"></i>
              {error}
            </div>
          )}

          <label style={styles.field}>
            <span style={styles.label}>Email</span>
            <span style={styles.inputWrap}>
              <i className="bi bi-envelope-fill"></i>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />
            </span>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Mật khẩu</span>
            <span style={styles.inputWrap}>
              <i className="bi bi-lock-fill"></i>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
              />
            </span>
          </label>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p style={styles.footerText}>
            Chưa có tài khoản? <Link to="/register" style={styles.link}>Đăng ký</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

const styles = {
  authShell: {
    minHeight: "calc(100vh - 220px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  authCard: {
    width: "min(100%, 980px)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    boxShadow: "0 8px 22px rgba(15,23,42,0.08)",
    overflow: "hidden",
  },
  infoPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    padding: 30,
    background: "#083c73",
    color: "#fff",
    borderRight: "4px solid #f29111",
  },
  logoMark: {
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "rgba(255,255,255,0.12)",
    color: "#f29111",
    fontSize: 24,
  },
  kicker: {
    color: "#f29111",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6,
  },
  infoTitle: {
    color: "#fff",
    fontSize: 25,
    fontWeight: 800,
    margin: "0 0 10px",
  },
  infoText: {
    color: "#dbe4f0",
    fontSize: 14,
    lineHeight: 1.6,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    color: "#e8eef6",
    fontSize: 14,
  },
  formPanel: {
    padding: 34,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 16,
  },
  formHeader: {
    marginBottom: 4,
  },
  formTitle: {
    color: "#083c73",
    fontSize: 25,
    fontWeight: 800,
    margin: "0 0 6px",
  },
  formSubtitle: {
    color: "#64748b",
    fontSize: 14,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    border: "1px solid #fecaca",
    borderRadius: 8,
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: 700,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    border: "1px solid #c5cfdd",
    borderRadius: 8,
    background: "#fff",
    color: "#083c73",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    padding: "12px 0",
    color: "#1e293b",
    fontSize: 14,
    background: "transparent",
  },
  submitBtn: {
    minHeight: 42,
    border: "1px solid #083c73",
    borderRadius: 8,
    background: "#083c73",
    color: "#fff",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    color: "#083c73",
    fontWeight: 800,
    textDecoration: "none",
  },
};
