import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

      const res = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.user.role === "admin") {
        navigate("/admin");
      } 
      else if (result.user.role === "lecturer"){
        navigate("/lecturer");
      }
      else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // particles animation
  const particles = Array.from({ length: 12 });

  return (
    <div style={styles.container}>
      {/* Background particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
          }}
          animate={{
            y: [0, -700],
            opacity: [0, 0.8, 0],
            x: [0, Math.sin(i) * 50],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={styles.card}
      >
        {/* LEFT */}
        <div style={styles.leftSide}>
          <div style={styles.overlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div style={styles.logoBox}>
                <i
                  className="bi bi-mortarboard-fill"
                  style={styles.logoIcon}
                ></i>
              </div>

              <h1 style={styles.brandTitle}>IMS SYSTEM</h1>

              <p style={styles.brandDesc}>
                Internship Management System
              </p>

              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Quản lý thực tập sinh</span>
                </div>

                <div style={styles.featureItem}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Quản lý giảng viên hướng dẫn</span>
                </div>

                <div style={styles.featureItem}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Quản lý hồ sơ thực tập</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.rightSide}>
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.header}>
              <h2 style={styles.title}>Đăng Nhập</h2>

              <p style={styles.subtitle}>
                Hệ thống quản lý thực tập IMS
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={styles.errorBox}
                >
                  <i
                    className="bi bi-exclamation-circle-fill"
                    style={{ marginRight: 8 }}
                  ></i>

                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>

              <div style={styles.inputWrapper}>
                <i
                  className="bi bi-envelope-fill"
                  style={styles.icon}
                ></i>

                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mật khẩu</label>

              <div style={styles.inputWrapper}>
                <i
                  className="bi bi-lock-fill"
                  style={styles.icon}
                ></i>

                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* BUTTON */}
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.disabled : {}),
              }}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </motion.button>

            <p style={styles.footerText}>
              Chưa có tài khoản?{" "}
              <Link to="/register" style={styles.link}>
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    background:
      "linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #3b82f6 100%)",

    overflow: "hidden",
    position: "relative",

    fontFamily:
      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  particle: {
    position: "absolute",
    bottom: -100,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    zIndex: 1,
  },

  card: {
    width: "950px",
    height: "600px",

    background: "#fff",

    borderRadius: 35,

    overflow: "hidden",

    display: "flex",

    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",

    position: "relative",
    zIndex: 10,
  },

  /* LEFT */

  leftSide: {
    flex: 1.1,

    background:
      "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop') center/cover",

    position: "relative",
  },

  overlay: {
    position: "absolute",
    inset: 0,

    background:
      "linear-gradient(to bottom, rgba(30,58,138,0.5), rgba(30,64,175,0.92))",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    textAlign: "center",
    color: "#fff",

    padding: 40,
  },

  logoBox: {
    width: 90,
    height: 90,

    borderRadius: 20,

    background: "rgba(255,255,255,0.15)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    margin: "0 auto 20px",

    backdropFilter: "blur(8px)",

    border: "1px solid rgba(255,255,255,0.25)",
  },

  logoIcon: {
    fontSize: 42,
    color: "#fff",
  },

  brandTitle: {
    fontSize: 46,
    fontWeight: 900,
    letterSpacing: 1,
    marginBottom: 10,
  },

  brandDesc: {
    fontSize: 16,
    opacity: 0.95,
    marginBottom: 35,
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    alignItems: "flex-start",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,

    fontSize: 15,
    fontWeight: 500,
  },

  /* RIGHT */

  rightSide: {
    flex: 1,

    background: "#fff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: 50,
  },

  form: {
    width: "100%",
  },

  header: {
    marginBottom: 35,
  },

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: "#1e3a8a",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },

  errorBox: {
    background: "#fef2f2",
    color: "#dc2626",

    padding: 14,

    borderRadius: 12,

    marginBottom: 20,

    fontSize: 14,

    borderLeft: "4px solid #dc2626",
  },

  inputGroup: {
    marginBottom: 22,
  },

  label: {
    display: "block",

    marginBottom: 8,

    fontSize: 13,
    fontWeight: 700,

    color: "#334155",

    textTransform: "uppercase",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",

    background: "#f8fafc",

    border: "1px solid #dbeafe",

    borderRadius: 14,

    padding: "0 14px",
  },

  icon: {
    color: "#2563eb",
    fontSize: 18,
  },

  input: {
    flex: 1,

    border: "none",
    outline: "none",

    background: "transparent",

    padding: 15,

    fontSize: 15,
  },

  options: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 28,

    fontSize: 14,
    color: "#64748b",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  forgot: {
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
  },

  submitBtn: {
    width: "100%",

    border: "none",

    padding: 16,

    borderRadius: 14,

    background:
      "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",

    color: "#fff",

    fontSize: 16,
    fontWeight: 700,

    cursor: "pointer",

    boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
  },

  disabled: {
    background: "#94a3b8",
    boxShadow: "none",
  },

  footerText: {
    marginTop: 24,

    textAlign: "center",

    fontSize: 14,

    color: "#64748b",
  },

  link: {
    color: "#2563eb",
    fontWeight: 700,
    textDecoration: "none",
  },
};