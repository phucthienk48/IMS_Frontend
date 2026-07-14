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
        <form style={styles.formPanel} onSubmit={handleSubmit}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Đăng nhập</h2>
            <p style={styles.formSubtitle}>
              Đăng nhập để truy cập Hệ thống Quản lý Thực tập.
            </p>
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
            Chưa có tài khoản?{" "}
            <Link to="/register" style={styles.link}>
              Đăng ký
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}

const styles = {
  authShell: {
    minHeight: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    padding: "24px",
  },

  authCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #d7dee8",
    boxShadow: "0 8px 22px rgba(15,23,42,.08)",
  },

  formPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "32px",
  },

  formHeader: {
    textAlign: "center",
    marginBottom: "8px",
  },

  formTitle: {
    margin: 0,
    color: "#083c73",
    fontSize: "28px",
    fontWeight: "700",
  },

  formSubtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "14px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#083c73",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
  },

  submitBtn: {
    height: "44px",
    border: "none",
    borderRadius: "8px",
    background: "#083c73",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  footerText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },

  link: {
    color: "#083c73",
    textDecoration: "none",
    fontWeight: "600",
  },
};
