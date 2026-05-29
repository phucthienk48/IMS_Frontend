import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api/internship-topics";

export default function AdminInternshiptopic() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setTopics(data.data || []);
    } catch (err) {
      console.error("Lỗi khi tải đề tài:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");
      setTopics((prev) =>
        prev.map((topic) =>
          topic._id === id ? { ...topic, status: newStatus } : topic,
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể thay đổi trạng thái đề tài.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá đề tài này?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xoá thất bại");
      setTopics((prev) => prev.filter((topic) => topic._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể xoá đề tài.");
    }
  };

  const filteredTopics = topics.filter((topic) => {
    const query = search.toLowerCase();
    return (
      topic.topicname.toLowerCase().includes(query) ||
      topic.department.toLowerCase().includes(query) ||
      topic.position.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.requirement.toLowerCase().includes(query) ||
      topic.lecturer?.username?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <p style={{ padding: 20 }}>⏳ Đang tải đề tài thực tập...</p>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Quản lý đề tài thực tập</h2>
          <p style={styles.subtitle}>
            Xem, lọc và quản lý toàn bộ đề tài do giảng viên đề xuất.
          </p>
        </div>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo đề tài, giảng viên, bộ môn,..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Tổng đề tài</span>
          <span style={styles.statValue}>{topics.length}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Mở đăng ký</span>
          <span style={styles.statValue}>
            {topics.filter((item) => item.status === "open").length}
          </span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Đã đóng</span>
          <span style={styles.statValue}>
            {topics.filter((item) => item.status === "closed").length}
          </span>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Đề tài</th>
              <th style={styles.th}>Giảng viên</th>
              <th style={styles.th}>Bộ môn / Vị trí</th>
              <th style={styles.th}>Yêu cầu</th>
              <th style={styles.th}>Số lượng</th>
              <th style={styles.th}>Thời gian</th>
              <th style={styles.thCenter}>Trạng thái</th>
              <th style={styles.thCenter}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.emptyCell}>
                  Không tìm thấy đề tài phù hợp.
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => (
                <tr key={topic._id}>
                  <td style={styles.td}>
                    <div style={styles.topicName}>{topic.topicname}</div>
                    <div style={styles.topicDesc}>{topic.description}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{topic.lecturer?.username || "Chưa rõ"}</div>
                    <div style={styles.mutedText}>
                      {topic.lecturer?.email || ""}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div>{topic.department}</div>
                    <div style={styles.mutedText}>{topic.position}</div>
                  </td>
                  <td style={styles.td}>{topic.requirement}</td>
                  <td style={styles.tdCenter}>{topic.quantity}</td>
                  <td style={styles.td}>
                    {new Date(topic.startday).toLocaleDateString()} -{" "}
                    {new Date(topic.endday).toLocaleDateString()}
                  </td>
                  <td style={styles.tdCenter}>
                    <span
                      style={
                        topic.status === "open"
                          ? styles.badgeOpen
                          : styles.badgeClosed
                      }
                    >
                      {topic.status === "open" ? "Mở" : "Đóng"}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    <button
                      style={styles.actionBtn}
                      onClick={() =>
                        handleToggleStatus(topic._id, topic.status)
                      }
                    >
                      {topic.status === "open" ? "Đóng" : "Mở"}
                    </button>
                    <button
                      style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                      onClick={() => handleDelete(topic._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
    minHeight: "85vh",
    background: "#f8fafc",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    margin: 0,
    color: "#1f2937",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#475569",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "10px 14px",
    minWidth: "280px",
  },
  searchIcon: {
    color: "#6b7280",
    fontSize: 18,
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#111827",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
  },
  statLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(15, 23, 42, 0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
  },
  th: {
    textAlign: "left",
    padding: "18px 20px",
    color: "#475569",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    borderBottom: "1px solid #e5e7eb",
  },
  thCenter: {
    textAlign: "center",
    padding: "18px 20px",
    color: "#475569",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "16px 20px",
    verticalAlign: "top",
    borderBottom: "1px solid #e5e7eb",
    color: "#334155",
    fontSize: "14px",
  },
  tdCenter: {
    padding: "16px 20px",
    textAlign: "center",
    verticalAlign: "top",
    borderBottom: "1px solid #e5e7eb",
    color: "#334155",
    fontSize: "14px",
  },
  emptyCell: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "15px",
  },
  topicName: {
    fontWeight: 700,
    marginBottom: "6px",
    color: "#111827",
  },
  topicDesc: {
    color: "#6b7280",
    fontSize: "13px",
  },
  mutedText: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px",
  },
  badgeOpen: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    color: "#166534",
    background: "#d1fae5",
    fontWeight: 600,
    fontSize: "13px",
  },
  badgeClosed: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    color: "#991b1b",
    background: "#fee2e2",
    fontWeight: 600,
    fontSize: "13px",
  },
  actionBtn: {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    marginRight: "8px",
  },
  deleteBtn: {
    background: "#ef4444",
  },
};
