import { useEffect, useState } from "react";
import ActionMenu from "../../components/ActionMenu";
import Pagination from "../../components/Pagination";
import {
  defaultInternshipCenter,
  fetchInternshipCenter,
} from "../../config/internshipCenter";

const API_BASE = "http://localhost:5000/api/internship-topics";

export default function AdminInternshiptopic() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [center, setCenter] = useState(defaultInternshipCenter);
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
    fetchInternshipCenter("http://localhost:5000").then(setCenter);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

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
          topic._id === id ? { ...topic, ...data.data } : topic,
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
    const query = search.trim().toLowerCase();
    return (
      (topic.topicname || "").toLowerCase().includes(query) ||
      (topic.description || "").toLowerCase().includes(query) ||
      (topic.requirement || "").toLowerCase().includes(query) ||
      topic.lecturer?.username?.toLowerCase().includes(query)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTopics = filteredTopics.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (value) => {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Chưa cập nhật"
      : date.toLocaleDateString("vi-VN");
  };

  const renderTopicActions = (topic) => (
    <ActionMenu
      items={[
        {
          label: topic.status === "open" ? "Đóng đăng ký" : "Mở đăng ký",
          icon: topic.status === "open" ? "bi-lock" : "bi-unlock",
          onClick: () => handleToggleStatus(topic._id, topic.status),
        },
        {
          label: "Xóa đề tài",
          icon: "bi-trash-fill",
          variant: "danger",
          onClick: () => handleDelete(topic._id),
        },
      ]}
    />
  );

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
          filter: brightness(0.95);
        }
        .ait-delete-btn:hover {
          background: #991b1b !important;
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
                background: "#f0fdf4",
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
                background: "#fef2f2",
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
            placeholder="Tìm theo tên đề tài, giảng viên hoặc nội dung công việc..."
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
                  <th style={styles.th}>Trung tâm tiếp nhận</th>
                  <th style={styles.th}>Sinh viên</th>
                  <th style={styles.th}>Thời gian</th>
                  <th style={styles.th}>Điều kiện</th>
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
                  pagedTopics.map((topic) => (
                    <tr
                      key={topic._id}
                      className="ait-row"
                      style={styles.tableRow}
                    >
                      <td style={styles.td}>
                        <div style={styles.topicName}>{topic.topicname}</div>
                        <div style={styles.mutedText}>
                          {topic.requirement || topic.description}
                        </div>
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
                        <div style={styles.deptLabel}>
                          {center.name}
                        </div>
                        <div style={styles.mutedText}>
                          Cán bộ: {topic.lecturer?.username || "Chưa rõ"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.quantityBadge}>
                          {topic.acceptedCount || 0}/{topic.quantity || 1}
                        </span>
                        <div style={styles.mutedText}>
                          {topic.remainingSlots > 0
                            ? `Còn ${topic.remainingSlots} chỗ`
                            : "Đã đủ sinh viên"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateRow}>
                          <i
                            className="bi bi-calendar-event"
                            style={{ color: "#94a3b8", fontSize: 12 }}
                          ></i>
                          {formatDate(topic.startday)}
                        </div>
                        <div style={{ ...styles.dateRow, marginTop: 4 }}>
                          <i
                            className="bi bi-calendar-check"
                            style={{ color: "#94a3b8", fontSize: 12 }}
                          ></i>
                          {formatDate(topic.endday)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.conditionStack}>
                          <span style={styles.conditionPill}>
                            {topic.workDaysPerWeek
                              ? `${topic.workDaysPerWeek} ngày/tuần`
                              : "Chưa nhập ngày/tuần"}
                          </span>
                          <span style={styles.conditionPill}>
                            {topic.workHoursPerDay
                              ? `${topic.workHoursPerDay} giờ/ngày`
                              : "Chưa nhập giờ/ngày"}
                          </span>
                          <span
                            style={
                              center.hasOffice
                                ? styles.conditionOk
                                : styles.conditionMuted
                            }
                          >
                            Nơi làm việc
                          </span>
                          <span
                            style={
                              center.hasComputer
                                ? styles.conditionOk
                                : styles.conditionMuted
                            }
                          >
                            Máy tính
                          </span>
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
                        {renderTopicActions(topic)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} total={filteredTopics.length} pageSize={pageSize} onChange={setPage} />
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    padding: 0,
    background: "transparent",
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
    background: "#fff",
    border: "1px solid #d7dee8",
    borderLeft: "4px solid #f29111",
    borderRadius: 8,
    padding: "22px 24px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    color: "#334155",
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
    background: "#f8fafc",
    border: "1px solid #d7dee8",
    borderRadius: 999,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#083c73",
    width: "fit-content",
    letterSpacing: 0,
  },
  title: {
    fontSize: 22,
    margin: 0,
    color: "#083c73",
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
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
    background: "#f8fafc",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: "14px 22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    minWidth: 90,
  },
  statNum: {
    fontSize: 28,
    fontWeight: 800,
    color: "#083c73",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 600,
    letterSpacing: 0,
    textTransform: "uppercase",
  },

  // SEARCH
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 20px",
    height: 52,
    marginBottom: 24,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
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
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #d7dee8",
    overflow: "hidden",
    maxWidth: "100%",
    minWidth: 0,
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
    maxWidth: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1120,
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
    letterSpacing: 0,
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
  conditionStack: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    maxWidth: 240,
  },
  conditionPill: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #d7dee8",
    borderRadius: 999,
    background: "#f8fafc",
    color: "#475569",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 9px",
  },
  conditionOk: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #bbf7d0",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 9px",
  },
  conditionMuted: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: 999,
    background: "#f8fafc",
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 9px",
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
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.22s ease",
    fontFamily: "'Inter', sans-serif",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#b91c1c",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.22s ease",
    fontFamily: "'Inter', sans-serif",
  },
};
