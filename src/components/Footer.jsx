export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brandBlock}>
          <div style={styles.kicker}>CUSC</div>
          <h4 style={styles.title}>TRUNG TÂM CÔNG NGHỆ PHẦN MỀM</h4>
          <p style={styles.subtitle}>TRƯỜNG ĐẠI HỌC CẦN THƠ</p>
          <div style={styles.infoList}>
            <span>
              <i className="bi bi-geo-alt-fill" style={styles.icon}></i>
              Số 01 Lý Tự Trọng, phường Ninh Kiều, TP. Cần Thơ
            </span>
            <span>
              <i className="bi bi-telephone-fill" style={styles.icon}></i>
              (0292) 3731072 - Fax: (0292) 3731071
            </span>
          </div>
        </div>

        <div style={styles.linkGroup}>
          <a href="#" style={styles.link}>
            <i className="bi bi-envelope-fill"></i>
            Liên hệ
          </a>
          <a href="#" style={styles.link}>
            <i className="bi bi-diagram-3-fill"></i>
            Sơ đồ hệ thống
          </a>
          <a href="#" style={styles.link}>
            <i className="bi bi-shield-lock-fill"></i>
            Chính sách bảo mật
          </a>
        </div>
      </div>

      <div style={styles.copyright}>
        © {new Date().getFullYear()} CUSC - Internship Management System
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#083c73",
    color: "#e8eef6",
    padding: "28px 20px 16px",
    borderTop: "4px solid #f29111",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  container: {
    width: "min(100%, 1240px)",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },
  brandBlock: {
    flex: "1 1 460px",
  },
  kicker: {
    color: "#f29111",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: 800,
    margin: "0 0 2px",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: 700,
    margin: "0 0 14px",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "#dbe4f0",
    fontSize: 13,
  },
  icon: {
    color: "#f29111",
    marginRight: 8,
  },
  linkGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    color: "#ffffff",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 700,
  },
  copyright: {
    width: "min(100%, 1240px)",
    margin: "18px auto 0",
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    color: "#aab8ca",
    fontSize: 12,
  },
};
