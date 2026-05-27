import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-start">
              <span style={styles.heroBadge}>✨ IMS Platform v1.0</span>
              <h1 style={styles.heroTitle}>
                Hệ Thống Quản Lý <br />
                <span style={styles.gradientText}>Thực Tập Sinh</span>
              </h1>
              <p style={styles.heroDesc}>
                Cổng thông tin tối ưu kết nối Sinh viên, Giảng viên hướng dẫn và Doanh nghiệp đối tác.
                Quản lý hồ sơ ứng tuyển, phê duyệt đề tài và theo dõi tiến độ thực tập chuyên nghiệp.
              </p>
              
              <div style={styles.btnGroup}>
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <button
                        style={{ ...styles.primaryBtn, ...(hoveredBtn ? styles.primaryBtnHover : {}) }}
                        onMouseEnter={() => setHoveredBtn(true)}
                        onMouseLeave={() => setHoveredBtn(false)}
                        onClick={() => navigate("/admin")}
                      >
                        Vào trang Quản trị <i className="bi bi-arrow-right-short ms-2"></i>
                      </button>
                    )}
                    {user.role === "lecturer" && (
                      <button
                        style={{ ...styles.primaryBtn, ...(hoveredBtn ? styles.primaryBtnHover : {}) }}
                        onMouseEnter={() => setHoveredBtn(true)}
                        onMouseLeave={() => setHoveredBtn(false)}
                        onClick={() => navigate("/lecturer")}
                      >
                        Vào trang Giảng viên <i className="bi bi-arrow-right-short ms-2"></i>
                      </button>
                    )}
                    {user.role === "student" && (
                      <button
                        style={{ ...styles.primaryBtn, ...(hoveredBtn ? styles.primaryBtnHover : {}) }}
                        onMouseEnter={() => setHoveredBtn(true)}
                        onMouseLeave={() => setHoveredBtn(false)}
                        onClick={() => navigate("/application")}
                      >
                        Xem hồ sơ của tôi <i className="bi bi-arrow-right-short ms-2"></i>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      style={{ ...styles.primaryBtn, ...(hoveredBtn ? styles.primaryBtnHover : {}) }}
                      onMouseEnter={() => setHoveredBtn(true)}
                      onMouseLeave={() => setHoveredBtn(false)}
                      onClick={() => navigate("/login")}
                    >
                      Bắt đầu ngay <i className="bi bi-box-arrow-in-right ms-2"></i>
                    </button>
                    <button
                      style={styles.secondaryBtn}
                      onClick={() => navigate("/register")}
                    >
                      Đăng ký tài khoản
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="col-lg-5 text-center position-relative">
              <div style={styles.glowingBlob}></div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
                alt="IMS Logo"
                style={styles.heroImage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê nổi bật */}
      <div style={styles.statsSection}>
        <div className="row g-4">
          {[
            { value: "1,200+", label: "Sinh viên tham gia", color: "#3b82f6" },
            { value: "150+", label: "Doanh nghiệp liên kết", color: "#10b981" },
            { value: "850+", label: "Hồ sơ đã duyệt", color: "#f59e0b" },
            { value: "98%", label: "Tỷ lệ hoàn thành", color: "#8b5cf6" }
          ].map((stat, i) => (
            <div className="col-md-6 col-lg-3" key={i}>
              <div style={styles.statsCard}>
                <h3 style={{ ...styles.statsVal, color: stat.color }}>{stat.value}</h3>
                <span style={styles.statsLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tính năng chính */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Tính năng cốt lõi</h2>
        <p style={styles.sectionDesc}>Hệ thống IMS được thiết kế giúp tự động hóa và nâng cao hiệu quả quản lý</p>
        
        <div className="row g-4 mt-2">
          {[
            {
              id: 1,
              icon: "bi-shield-check",
              title: "Quản lý hồ sơ an toàn",
              desc: "Sinh viên dễ dàng upload CV, bảng điểm trực tuyến. Lưu trữ thông tin an toàn và bảo mật cao.",
              gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            },
            {
              id: 2,
              icon: "bi-arrow-repeat",
              title: "Theo dõi tiến độ thực tế",
              desc: "Giám sát quy trình duyệt hồ sơ, phê duyệt đề tài và phản hồi kết quả thực tập theo thời gian thực.",
              gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)"
            },
            {
              id: 3,
              icon: "bi-cpu-fill",
              title: "Tự động hóa phê duyệt",
              desc: "Cung cấp giao diện duyệt hồ sơ nhanh chóng cho giảng viên và admin. Gửi thông báo kết quả tức thì.",
              gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
            }
          ].map((feat) => {
            const isHovered = hoveredCard === feat.id;
            return (
              <div className="col-md-4" key={feat.id}>
                <div
                  style={{
                    ...styles.featureCard,
                    ...(isHovered ? styles.featureCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard(feat.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ ...styles.iconBox, background: feat.gradient }}>
                    <i className={`bi ${feat.icon} text-white fs-3`}></i>
                  </div>
                  <h4 style={styles.cardTitle}>{feat.title}</h4>
                  <p style={styles.cardDesc}>{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner chân trang */}
      <div style={styles.ctaBanner}>
        <div style={styles.ctaOverlay}></div>
        <div style={styles.ctaContent}>
          <h3 style={styles.ctaTitle}>Khởi đầu hành trình thực tập chuyên nghiệp</h3>
          <p style={styles.ctaDesc}>
            Hãy đăng nhập hệ thống để chuẩn bị tốt nhất cho đợt thực tập của bạn.
          </p>
          {!user && (
            <button
              style={styles.ctaBtn}
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "10px 0",
    background: "#f8fafc",
  },

  heroSection: {
    position: "relative",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: "24px",
    padding: "60px 40px",
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
    marginBottom: "50px",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
  },

  heroBadge: {
    display: "inline-block",
    padding: "6px 14px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#93c5fd",
    marginBottom: "20px",
  },

  heroTitle: {
    fontSize: "48px",
    fontWeight: "900",
    lineHeight: "1.15",
    letterSpacing: "-1px",
    marginBottom: "20px",
  },

  gradientText: {
    background: "linear-gradient(to right, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroDesc: {
    fontSize: "17px",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "580px",
    marginBottom: "35px",
  },

  btnGroup: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)",
    transition: "all 0.3s ease",
  },

  primaryBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 25px rgba(37, 99, 235, 0.4)",
  },

  secondaryBtn: {
    padding: "14px 28px",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  glowingBlob: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "280px",
    height: "280px",
    background: "rgba(96, 165, 250, 0.25)",
    filter: "blur(50px)",
    borderRadius: "50%",
    zIndex: 1,
  },

  heroImage: {
    position: "relative",
    width: "240px",
    zIndex: 2,
    filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.3))",
    animation: "float 6s ease-in-out infinite",
  },

  statsSection: {
    marginBottom: "60px",
  },

  statsCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
    border: "1px solid #f1f5f9",
    textAlign: "center",
  },

  statsVal: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  statsLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },

  featuresSection: {
    textAlign: "center",
    marginBottom: "60px",
  },

  sectionTitle: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "10px",
  },

  sectionDesc: {
    fontSize: "16px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
  },

  featureCard: {
    background: "#fff",
    padding: "35px 25px",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    height: "100%",
  },

  featureCardHover: {
    transform: "translateY(-8px)",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.08)",
    borderColor: "#e2e8f0",
  },

  iconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "12px",
  },

  cardDesc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: 0,
  },

  ctaBanner: {
    position: "relative",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
    borderRadius: "20px",
    padding: "45px 30px",
    textAlign: "center",
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(30, 58, 138, 0.15)",
  },

  ctaOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 40%)",
    pointerEvents: "none",
  },

  ctaContent: {
    position: "relative",
    zIndex: 2,
  },

  ctaTitle: {
    fontSize: "26px",
    fontWeight: "800",
    marginBottom: "10px",
  },

  ctaDesc: {
    fontSize: "16px",
    opacity: 0.9,
    maxWidth: "500px",
    margin: "0 auto 24px",
  },

  ctaBtn: {
    padding: "12px 28px",
    background: "#fff",
    color: "#1e3a8a",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    transition: "all 0.2s",
  },
};