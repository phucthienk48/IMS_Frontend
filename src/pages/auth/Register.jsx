import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // nhập dữ liệu
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !form.username ||
      !form.email ||
      !form.password
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/register",
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
        throw new Error(
          result.message || "Đăng ký thất bại"
        );
      }

      alert("Đăng ký thành công");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* LEFT */}
        <div style={styles.left}>
          <i
            className="bi bi-person-plus-fill"
            style={styles.logo}
          ></i>

          <h1>IMS SYSTEM</h1>

          <p>Internship Management System</p>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <form onSubmit={handleSubmit}>
            <h2 style={styles.title}>Đăng ký</h2>

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {/* username */}
            <input
              type="text"
              name="username"
              placeholder="Nhập username"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
            />

            {/* email */}
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />

            {/* password */}
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />



            {/* button */}
            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading
                ? "Đang đăng ký..."
                : "Đăng ký"}
            </button>

            <p style={styles.text}>
              Đã có tài khoản?{" "}
              <Link to="/login" style={styles.link}>
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
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
      "linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6)",

    fontFamily: "Arial",
  },

  card: {
    width: "850px",

    display: "flex",

    background: "#fff",

    borderRadius: 20,

    overflow: "hidden",

    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  left: {
    flex: 1,

    background: "#1e40af",

    color: "#fff",

    display: "flex",
    flexDirection: "column",

    justifyContent: "center",
    alignItems: "center",

    padding: 40,
  },

  logo: {
    fontSize: 60,

    marginBottom: 20,
  },

  right: {
    flex: 1,

    padding: 50,
  },

  title: {
    marginBottom: 25,

    color: "#1e3a8a",
  },

  input: {
    width: "100%",

    padding: 14,

    marginBottom: 16,

    borderRadius: 8,

    border: "1px solid #ccc",

    fontSize: 15,
  },

  button: {
    width: "100%",

    padding: 14,

    border: "none",

    borderRadius: 8,

    background: "#2563eb",

    color: "#fff",

    fontSize: 16,
    fontWeight: "bold",

    cursor: "pointer",
  },

  error: {
    background: "#fee2e2",

    color: "#b91c1c",

    padding: 10,

    borderRadius: 6,

    marginBottom: 16,
  },

  text: {
    marginTop: 20,

    textAlign: "center",

    fontSize: 14,
  },

  link: {
    color: "#2563eb",

    fontWeight: "bold",

    textDecoration: "none",
  },
};