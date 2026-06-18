import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Đăng ký thất bại");
      }

      alert("Đăng ký tài khoản thành công!");
      navigate("/login");
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
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div>
            <div style={styles.kicker}>Tài khoản IMS</div>
            <h1 style={styles.infoTitle}>Đăng ký tài khoản hệ thống</h1>
            <p style={styles.infoText}>
              Tài khoản dùng để nộp hồ sơ, theo dõi tiến độ và nhận thông tin xử lý thực tập.
            </p>
          </div>
          <div style={styles.infoList}>
            <span>
              <i className="bi bi-check-circle-fill"></i>
              Khởi tạo thông tin đăng nhập
            </span>
            <span>
              <i className="bi bi-check-circle-fill"></i>
              Bổ sung hồ sơ sau khi đăng nhập
            </span>
            <span>
              <i className="bi bi-check-circle-fill"></i>
              Quản lý biểu mẫu theo quy trình
            </span>
          </div>
        </aside>

        <form style={styles.formPanel} onSubmit={handleSubmit}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Đăng ký</h2>
            <p style={styles.formSubtitle}>Nhập thông tin tài khoản cơ bản để bắt đầu sử dụng IMS.</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <i className="bi bi-exclamation-circle-fill"></i>
              {error}
            </div>
          )}

          <label style={styles.field}>
            <span style={styles.label}>Tên đăng nhập</span>
            <span style={styles.inputWrap}>
              <i className="bi bi-person-fill"></i>
              <input
                type="text"
                name="username"
                placeholder="Nhập username"
                value={form.username}
                onChange={handleChange}
                style={styles.input}
              />
            </span>
          </label>

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
            {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
          </button>

          <p style={styles.footerText}>
            Đã có tài khoản? <Link to="/login" style={styles.link}>Đăng nhập</Link>
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
    gap: 15,
  },
  formHeader: {
    marginBottom: 2,
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
