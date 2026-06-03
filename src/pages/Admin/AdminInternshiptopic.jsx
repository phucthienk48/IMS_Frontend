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
    return (
      <div style={styles.loadingWrapper}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Đang tải đề tài...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .ait-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        .ait-row:hover td { background: #f8faff !important; }

        .ait-toggle-btn:hover {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16,185,129,0.35) !important;
        }
        .ait-delete-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(239,68,68,0.35) !important;
        }

        .ait-badge-open {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 999px;
          color: #166534; background: #dcfce7;
          font-weight: 700; font-size: 12px;
          border: 1px solid #bbf7d0;
        }
        .ait-badge-closed {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 999px;
          color: #991b1b; background: #fee2e2;
          font-weight: 700; font-size: 12px;
          border: 1px solid #fecaca;
        }

        .ait-search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #fff;
        }
      `}</style>

      <div className="ait-page" style={styles.page}>
        {/* TOP HEADER SECTION */}
        <div style={styles.topSection}>
          <div style={styles.topLeft}>
            <div style={styles.titleBadge}>
              <i
                className="bi bi-shield-check"
                style={{ color: "#3b82f6" }}
              ></i>
              <span>Quản lý hệ thống</span>
            </div>
            <h2 style={styles.title}>Quản lý đề tài</h2>
            <p style={styles.subtitle}>
              Xem, lọc và quản lý toàn bộ đề tài do giảng viên đề xuất.
            </p>
          </div>

          <div style={styles.topRight}>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{topics.length}</span>
              <span style={styles.statLabel}>Tổng đề tài</span>
            </div>
            <div
              style={{
                ...styles.statCard,
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                border: "1px solid #86efac",
              }}
            >
              <span style={{ ...styles.statNum, color: "#166534" }}>
                {topics.filter((item) => item.status === "open").length}
              </span>
              <span style={{ ...styles.statLabel, color: "#166534" }}>
                Mở đăng ký
              </span>
            </div>
            <div
              style={{
                ...styles.statCard,
                background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                border: "1px solid #fca5a5",
              }}
            >
              <span style={{ ...styles.statNum, color: "#991b1b" }}>
                {topics.filter((item) => item.status === "closed").length}
              </span>
              <span style={{ ...styles.statLabel, color: "#991b1b" }}>
                Đã đóng
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={styles.searchWrapper}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            className="ait-search-input"
            style={styles.searchInput}
            placeholder="Tìm theo tên đề tài, giảng viên, bộ môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <span style={styles.clearSearch} onClick={() => setSearch("")}>
              <i className="bi bi-x-circle-fill"></i>
            </span>
          )}
        </div>

        {/* TOPICS TABLE */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <span style={styles.tableHeaderTitle}>
              Danh sách đề tài
              {search && (
                <span style={styles.resultCount}>
                  — {filteredTopics.length} kết quả
                </span>
              )}
            </span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Đề tài</th>
                  <th style={styles.th}>Giảng viên</th>
                  <th style={styles.th}>Bộ môn / Vị trí</th>
                  <th style={{ ...styles.th, width: "20%" }}>Yêu cầu</th>
                  <th
                    style={{ ...styles.th, textAlign: "center", width: "8%" }}
                  >
                    Số lượng
                  </th>
                  <th style={styles.th}>Thời gian</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>
                    Trạng thái
                  </th>
                  <th style={{ ...styles.th, textAlign: "center" }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={styles.emptyCell}>
                      <div style={styles.emptyState}>
                        <i
                          className="bi bi-journal-x"
                          style={styles.emptyIcon}
                        ></i>
                        <p style={styles.emptyText}>
                          {search
                            ? "Không tìm thấy đề tài phù hợp."
                            : "Chưa có đề tài nào."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTopics.map((topic) => (
                    <tr
                      key={topic._id}
                      className="ait-row"
                      style={styles.tableRow}
                    >
                      <td style={styles.td}>
                        <div style={styles.topicName}>{topic.topicname}</div>
                        <div style={styles.mutedText}>{topic.description}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.lecturerName}>
                          {topic.lecturer?.username || "Chưa rõ"}
                        </div>
                        <div style={styles.mutedText}>
                          {topic.lecturer?.email || ""}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.deptLabel}>{topic.department}</div>
                        <div style={styles.positionBadge}>{topic.position}</div>
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        <div style={styles.requirementText}>
                          {topic.requirement}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={styles.quantityBadge}>
                          {topic.quantity} SV
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateRow}>
                          <i
                            className="bi bi-calendar-event"
                            style={{ color: "#94a3b8", fontSize: 12 }}
                          ></i>
                          {new Date(topic.startday).toLocaleDateString("vi-VN")}
                        </div>
                        <div style={{ ...styles.dateRow, marginTop: 4 }}>
                          <i
                            className="bi bi-calendar-check"
                            style={{ color: "#94a3b8", fontSize: 12 }}
                          ></i>
                          {new Date(topic.endday).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {topic.status === "open" ? (
                          <span className="ait-badge-open">
                            <i
                              className="bi bi-circle-fill"
                              style={{ fontSize: 7 }}
                            ></i>
                            Mở
                          </span>
                        ) : (
                          <span className="ait-badge-closed">
                            <i
                              className="bi bi-circle-fill"
                              style={{ fontSize: 7 }}
                            ></i>
                            Đóng
                          </span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <div style={styles.actionGroup}>
                          <button
                            className="ait-toggle-btn"
                            style={{
                              ...styles.toggleBtn,
                              background:
                                topic.status === "open"
                                  ? "linear-gradient(135deg, #10b981, #059669)"
                                  : "linear-gradient(135deg, #f59e0b, #d97706)",
                            }}
                            onClick={() =>
                              handleToggleStatus(topic._id, topic.status)
                            }
                            title={
                              topic.status === "open"
                                ? "Đóng đề tài"
                                : "Mở lại đề tài"
                            }
                          >
                            <i
                              className={`bi ${topic.status === "open" ? "bi-lock" : "bi-unlock"}`}
                            ></i>
                            {topic.status === "open" ? "Đóng" : "Mở"}
                          </button>
                          <button
                            className="ait-delete-btn"
                            style={styles.deleteBtn}
                            onClick={() => handleDelete(topic._id)}
                            title="Xoá đề tài"
                          >
                            <i className="bi bi-trash-fill"></i>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px 32px",
    background: "linear-gradient(160deg, #f0f4ff 0%, #f8fafc 60%, #fff 100%)",
    fontFamily: "'Inter', sans-serif",
  },

  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  loadingSpinner: {
    width: 44,
    height: 44,
    border: "4px solid #e0e7ff",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: 600,
  },

  // TOP SECTION
  topSection: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 24,
    background:
      "radial-gradient(circle at top left, rgba(96,165,250,0.2), transparent 45%), linear-gradient(135deg, #1f2937, #1e40af)",
    borderRadius: 24,
    padding: "32px 36px",
    boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
    color: "#fff",
  },
  topLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 540,
  },
  titleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 999,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#bfdbfe",
    width: "fit-content",
    letterSpacing: "0.4px",
    backdropFilter: "blur(4px)",
  },
  title: {
    fontSize: 32,
    margin: 0,
    color: "#fff",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: 500,
  },
  topRight: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  statCard: {
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: "14px 22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    backdropFilter: "blur(6px)",
    minWidth: 90,
  },
  statNum: {
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  // SEARCH
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 16,
    padding: "0 20px",
    height: 52,
    marginBottom: 24,
    boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
    transition: "border-color 0.2s",
  },
  searchIcon: {
    color: "#94a3b8",
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    background: "transparent",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
  },
  clearSearch: {
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    marginLeft: 8,
  },

  // TABLE CARD
  tableCard: {
    background: "#fff",
    borderRadius: 24,
    boxShadow: "0 8px 32px rgba(15,23,42,0.07)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "20px 28px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fafbff",
  },
  tableHeaderTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },
  resultCount: {
    color: "#3b82f6",
    fontWeight: 600,
    fontSize: 14,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1200,
  },
  tableRow: {
    transition: "background 0.15s",
  },
  th: {
    padding: "14px 20px",
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "16px 20px",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: 14,
    transition: "background 0.15s",
  },

  topicName: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  mutedText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  lecturerName: {
    fontWeight: 600,
    color: "#334155",
    fontSize: 13,
    marginBottom: 4,
  },
  deptLabel: {
    fontWeight: 600,
    color: "#334155",
    fontSize: 13,
    marginBottom: 4,
  },
  positionBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#3b82f6",
    fontSize: 11,
    fontWeight: 700,
    border: "1px solid #bfdbfe",
  },
  requirementText: {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.5,
  },
  quantityBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px 12px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#475569",
    fontWeight: 700,
    fontSize: 13,
    border: "1px solid #e2e8f0",
  },
  dateRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#475569",
    fontSize: 12,
    fontWeight: 500,
  },
  emptyCell: {
    padding: 0,
    background: "#fff",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
    color: "#cbd5e1",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
    transition: "all 0.22s ease",
    fontFamily: "'Inter', sans-serif",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(239,68,68,0.2)",
    transition: "all 0.22s ease",
    fontFamily: "'Inter', sans-serif",
  },
};
