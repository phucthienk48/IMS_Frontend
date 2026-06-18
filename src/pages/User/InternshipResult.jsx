import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

const statusLabels = {
  "đang thực tập": "Đang thực tập",
  "đã hoàn thành": "Đã hoàn thành",
  "tạm dừng": "Tạm dừng",
};

const statusStyles = {
  "đang thực tập": {
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
  },
  "đã hoàn thành": {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  "tạm dừng": {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
};

export default function InternshipResult() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const idUser = user?.id || user?._id;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(Boolean(idUser));

  useEffect(() => {
    if (!idUser) {
      setLoading(false);
      return;
    }

    const loadApplications = async () => {
      try {
        const res = await axios.get(`${API}/api/application/user/${idUser}`);
        setApplications(res.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy kết quả thực tập:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [idUser]);

  const evaluatedApplications = useMemo(() => {
    return applications.filter((item) => {
      if (item.status !== "đã duyệt") return false;
      const hasScore = item.score !== null && item.score !== undefined;
      const hasFeedback = Boolean(item.feedback && item.feedback.trim());
      const hasInternshipStatus = Boolean(item.internshipStatus);
      return hasScore || hasFeedback || hasInternshipStatus;
    });
  }, [applications]);

  const evaluatedCount = evaluatedApplications.length;
  const completedCount = evaluatedApplications.filter(
    (item) => item.internshipStatus === "đã hoàn thành",
  ).length;
  const averageScore = (() => {
    const scored = evaluatedApplications.filter(
      (item) => item.score !== null && item.score !== undefined,
    );
    if (!scored.length) return "---";
    const total = scored.reduce((sum, item) => sum + Number(item.score), 0);
    return (total / scored.length).toFixed(1);
  })();

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Đang tải kết quả thực tập...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left" /> Quay lại
          </button>
          <h2 style={styles.pageTitle}>
            <i className="bi bi-award-fill" style={{ color: "#2563eb" }} /> KẾT QUẢ
            THỰC TẬP
          </h2>
          <p style={styles.subTitle}>
            Theo dõi điểm số, nhận xét và tiến độ thực tập sau khi giảng viên đánh
            giá.
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #2563eb" }}>
          <span style={styles.statsLabel}>Hồ sơ đã đánh giá</span>
          <span style={{ ...styles.statsValue, color: "#2563eb" }}>
            {evaluatedCount}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #16a34a" }}>
          <span style={styles.statsLabel}>Đã hoàn thành</span>
          <span style={{ ...styles.statsValue, color: "#16a34a" }}>
            {completedCount}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #d97706" }}>
          <span style={styles.statsLabel}>Điểm trung bình</span>
          <span style={{ ...styles.statsValue, color: "#d97706" }}>
            {averageScore}
          </span>
        </div>
      </div>

      {evaluatedApplications.length === 0 ? (
        <div style={styles.emptyBox}>
          <i className="bi bi-hourglass-split" style={styles.emptyIcon} />
          <p style={styles.emptyText}>
            Chưa có kết quả đánh giá. Khi giảng viên cập nhật điểm/nhận xét, kết quả
            sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {evaluatedApplications.map((item) => (
            <div key={item._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.topicName}>
                    {item.topic?.topicname || "Hồ sơ tự do"}
                  </div>
                  <div style={styles.topicMeta}>
                    Giảng viên: {item.topic?.lecturer?.username || "Chưa rõ"}
                  </div>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...(statusStyles[item.internshipStatus] ||
                      statusStyles["đang thực tập"]),
                  }}
                >
                  {statusLabels[item.internshipStatus] || "Đang thực tập"}
                </span>
              </div>

              <div style={styles.content}>
                <InfoRow
                  icon="bi-person-badge-fill"
                  label="Sinh viên"
                  value={item.fullName}
                />
                <InfoRow
                  icon="bi-card-list"
                  label="MSSV"
                  value={item.studentCode}
                />
                <InfoRow
                  icon="bi-award-fill"
                  label="Điểm số"
                  value={
                    item.score !== null && item.score !== undefined
                      ? `${item.score} / 10`
                      : "Chưa có điểm"
                  }
                  highlight={item.score !== null && item.score !== undefined}
                />
                <InfoRow
                  icon="bi-chat-left-text-fill"
                  label="Nhận xét"
                  value={item.feedback || "Chưa có nhận xét"}
                />
                <InfoRow
                  icon="bi-calendar-check-fill"
                  label="Cập nhật gần nhất"
                  value={
                    item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString("vi-VN")
                      : "---"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, highlight = false }) {
  return (
    <div style={styles.infoRow}>
      <i className={`bi ${icon}`} style={styles.infoIcon} />
      <span style={styles.infoLabel}>{label}:</span>
      <span style={{ ...styles.infoValue, ...(highlight ? styles.highlight : {}) }}>
        {value}
      </span>
    </div>
  );
}

const styles = {
  container: {
    padding: 0,
    minHeight: "70vh",
    background: "transparent",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 18,
    background: "#fff",
    border: "1px solid #d7dee8",
    borderLeft: "4px solid #f29111",
    borderRadius: 8,
    padding: "18px 20px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  backBtn: {
    padding: "6px 14px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#083c73",
    margin: "0 0 4px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  subTitle: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    padding: "16px 18px",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    background: "#fff",
    border: "1px solid #d7dee8",
  },
  statsLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 800,
  },
  emptyBox: {
    textAlign: "center",
    padding: "56px 24px",
    background: "#fff",
    borderRadius: 8,
    border: "1px dashed #cbd5e1",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  emptyIcon: {
    fontSize: 46,
    color: "#cbd5e1",
  },
  emptyText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 15,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #d7dee8",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: "16px 18px",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
  },
  topicName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#083c73",
  },
  topicMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  content: {
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 13,
  },
  infoIcon: {
    color: "#2563eb",
    marginTop: 1,
  },
  infoLabel: {
    fontWeight: 600,
    color: "#475569",
    minWidth: 96,
  },
  infoValue: {
    color: "#334155",
    wordBreak: "break-word",
  },
  highlight: {
    color: "#d97706",
    fontWeight: 700,
  },
};
