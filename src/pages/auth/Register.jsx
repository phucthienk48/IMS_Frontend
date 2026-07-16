import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", code: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const postAuth = async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Thao tác thất bại");
    return result;
  };

  const requestOtp = async () => {
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Vui lòng nhập email để nhận mã xác thực");
      return;
    }

    try {
      setLoading(true);
      const result = await postAuth("/register/request-otp", { email: form.email });
      setOtpSent(true);
      setMessage(result.message || "Mã xác thực đã được gửi đến email");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.username || !form.email || !form.password || !form.code) {
      setError("Vui lòng nhập đầy đủ thông tin và mã xác thực");
      return;
    }

    try {
      setLoading(true);
      await postAuth("/register", form);
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
        <form style={styles.formPanel} onSubmit={handleSubmit}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Đăng ký tài khoản</h2>
            <p style={styles.formSubtitle}>
              Nhập thông tin, nhận mã xác thực qua email rồi hoàn tất đăng ký.
            </p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={styles.successBox}>
              <i className="bi bi-check-circle-fill"></i>
              <span>{message}</span>
            </div>
          )}

          <label style={styles.field}>
            <span style={styles.label}>Tên đăng nhập</span>
            <div style={styles.inputWrap}>
              <i className="bi bi-person-fill"></i>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Email</span>
            <div style={styles.inputWrap}>
              <i className="bi bi-envelope-fill"></i>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </label>

          <button type="button" style={styles.secondaryBtn} onClick={requestOtp} disabled={loading}>
            {otpSent ? "Gửi lại mã xác thực" : "Gửi mã xác thực"}
          </button>

          <label style={styles.field}>
            <span style={styles.label}>Mã xác thực</span>
            <div style={styles.inputWrap}>
              <i className="bi bi-shield-lock-fill"></i>
              <input
                type="text"
                name="code"
                inputMode="numeric"
                placeholder="Nhập mã 6 số"
                value={form.code}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Mật khẩu</span>
            <div style={styles.inputWrap}>
              <i className="bi bi-lock-fill"></i>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </label>

          <button type="submit" style={styles.submitBtn} disabled={loading || !otpSent}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <p style={styles.footerText}>
            Đã có tài khoản?{" "}
            <Link to="/login" style={styles.link}>
              Đăng nhập
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
    padding: "24px",
    background: "#f5f7fb",
  },
  authCard: {
    width: "100%",
    maxWidth: "450px",
    background: "#fff",
    border: "1px solid #d7dee8",
    borderRadius: "10px",
    boxShadow: "0 8px 22px rgba(15,23,42,0.08)",
  },
  formPanel: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "8px",
  },
  formTitle: {
    margin: 0,
    color: "#083c73",
    fontSize: "28px",
    fontWeight: 700,
  },
  formSubtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
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
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: 600,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    color: "#083c73",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
    color: "#1e293b",
  },
  secondaryBtn: {
    height: "42px",
    border: "1px solid #083c73",
    borderRadius: "8px",
    background: "#fff",
    color: "#083c73",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  submitBtn: {
    height: "44px",
    border: "none",
    borderRadius: "8px",
    background: "#083c73",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  footerText: {
    margin: 0,
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
  link: {
    color: "#083c73",
    textDecoration: "none",
    fontWeight: 600,
  },
};
