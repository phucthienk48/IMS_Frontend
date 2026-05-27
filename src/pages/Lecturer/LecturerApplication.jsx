import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LecturerApplication() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/application");
      const data = await res.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách hồ sơ đăng ký:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/application/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Cập nhật trạng thái hồ sơ thành công!");
        fetchApplications();
      } else {
        alert(data.message || "Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi kết nối server");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>⏳ Đang tải hồ sơ đăng ký thực tập...</p>;

  // Thống kê số lượng
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "chờ duyệt").length,
    approved: applications.filter((app) => app.status === "đã duyệt").length,
    rejected: applications.filter((app) => app.status === "từ chối").length,
  };

  // Lọc hồ sơ
  const filteredApps = applications.filter((app) => {
    const matchSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.major.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || app.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApps = filteredApps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  const getBadgeStyle = (status) => {
    switch (status) {
      case "đã duyệt":
        return { background: "#dcfce7", color: "#166534" };
      case "từ chối":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#fef3c7", color: "#92400e" };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/lecturer")}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h2 style={styles.pageTitle}>
            <i className="bi bi-file-earmark-text-fill" style={styles.titleIcon}></i>
            QUẢN LÝ HỒ SƠ THỰC TẬP
          </h2>
          <p style={styles.subTitle}>Dành cho giảng viên hướng dẫn: {user.username}</p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #2563eb" }}>
          <span style={styles.statsLabel}>Tổng số hồ sơ</span>
          <span style={{ ...styles.statsValue, color: "#2563eb" }}>{stats.total}</span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #d97706" }}>
          <span style={styles.statsLabel}>Chờ duyệt</span>
          <span style={{ ...styles.statsValue, color: "#d97706" }}>{stats.pending}</span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #16a34a" }}>
          <span style={styles.statsLabel}>Đã duyệt</span>
          <span style={{ ...styles.statsValue, color: "#16a34a" }}>{stats.approved}</span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #dc2626" }}>
          <span style={styles.statsLabel}>Từ chối</span>
          <span style={{ ...styles.statsValue, color: "#dc2626" }}>{stats.rejected}</span>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo tên, MSSV, ngành học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="chờ duyệt">Chờ duyệt</option>
          <option value="đã duyệt">Đã duyệt</option>
          <option value="từ chối">Từ chối</option>
        </select>
      </div>

      {/* Bảng hồ sơ */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sinh viên</th>
              <th style={styles.th}>Ngành & Khóa</th>
              <th style={styles.th}>Liên hệ</th>
              <th style={styles.thCenter}>Tài liệu hồ sơ</th>
              <th style={styles.th}>Ghi chú</th>
              <th style={styles.thCenter}>Trạng thái</th>
              <th style={styles.thCenter}>Duyệt hồ sơ</th>
            </tr>
          </thead>
          <tbody>
            {currentApps.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: 30, color: "#6b7280" }}>
                  Chưa có hồ sơ đăng ký nào.
                </td>
              </tr>
            ) : (
              currentApps.map((app) => (
                <tr key={app._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>{app.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>MSSV: {app.studentCode}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{app.major}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Khóa: {app.course}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{app.email}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>SĐT: {app.sdt}</div>
                  </td>
                  <td style={styles.tdCenter}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                      {app.cvFile && (
                        <a
                          href={`http://localhost:5000${app.cvFile}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.fileLink}
                        >
                          <i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i> CV File
                        </a>
                      )}
                      {app.transcriptFile && (
                        <a
                          href={`http://localhost:5000${app.transcriptFile}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.fileLink}
                        >
                          <i className="bi bi-file-earmark-spreadsheet-fill text-success me-1"></i> Bảng điểm
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ maxWidth: 180, fontSize: "13px", color: "#475569", wordBreak: "break-word" }}>
                      {app.note || "---"}
                    </div>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={{ ...styles.badge, ...getBadgeStyle(app.status) }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    <div style={styles.actionGroup}>
                      {app.status === "chờ duyệt" && (
                        <>
                          <button
                            style={{ ...styles.actionBtn, ...styles.approveBtn }}
                            onClick={() => handleUpdateStatus(app._id, "đã duyệt")}
                          >
                            <i className="bi bi-check2-circle"></i> Duyệt
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                            onClick={() => handleUpdateStatus(app._id, "từ chối")}
                          >
                            <i className="bi bi-x-circle"></i> Từ chối
                          </button>
                        </>
                      )}
                      {app.status !== "chờ duyệt" && (
                        <button
                          style={{ ...styles.actionBtn, ...styles.resetBtn }}
                          onClick={() => handleUpdateStatus(app._id, "chờ duyệt")}
                        >
                          <i className="bi bi-arrow-counterclockwise"></i> Đặt lại
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={{
              ...styles.pageBtn,
              ...(currentPage === 1 && styles.pageBtnDisabled),
            }}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === page && styles.pageBtnActive),
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            style={{
              ...styles.pageBtn,
              ...(currentPage === totalPages && styles.pageBtnDisabled),
            }}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ➡
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    marginBottom: "24px",
  },

  backBtn: {
    padding: "6px 12px",
    background: "transparent",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "12px",
    transition: "0.2s",
  },

  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e3a8a",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  titleIcon: {
    color: "#2563eb",
  },

  subTitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statsCard: {
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  statsLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 500,
  },

  statsValue: {
    fontSize: "24px",
    fontWeight: "bold",
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: "250px",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "14px",
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 36px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },

  filterSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#fff",
    outline: "none",
  },

  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px 16px",
    background: "#f1f5f9",
    fontWeight: "bold",
    color: "#1e293b",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "left",
    fontSize: "14px",
  },

  thCenter: {
    padding: "12px 16px",
    background: "#f1f5f9",
    fontWeight: "bold",
    color: "#1e293b",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "center",
    fontSize: "14px",
  },

  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },

  td: {
    padding: "12px 16px",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  tdCenter: {
    padding: "12px 16px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "14px",
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
  },

  fileLink: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    textDecoration: "none",
    fontWeight: 500,
  },

  actionGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
  },

  actionBtn: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  approveBtn: {
    background: "#22c55e",
    color: "#fff",
  },

  rejectBtn: {
    background: "#ef4444",
    color: "#fff",
  },

  resetBtn: {
    background: "#64748b",
    color: "#fff",
  },

  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },

  pageBtn: {
    minWidth: "32px",
    height: "32px",
    padding: "0 8px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#1e293b",
    cursor: "pointer",
    fontSize: "13px",
  },

  pageBtnActive: {
    background: "#2563eb",
    color: "#fff",
    border: "1px solid #2563eb",
  },

  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
