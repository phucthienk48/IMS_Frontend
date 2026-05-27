import { useEffect, useState } from "react";

export default function AdminApplication() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/application");
      const data = await res.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách hồ sơ:", err);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này không?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/application/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Xóa hồ sơ thành công!");
        fetchApplications();
      } else {
        alert(data.message || "Xóa hồ sơ thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi kết nối server");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>⏳ Đang tải danh sách hồ sơ...</p>;

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
      {/* Page Title */}
      <h2 style={styles.pageTitle}>
        <i className="bi bi-file-earmark-text-fill" style={styles.titleIcon}></i>
        QUẢN LÝ YÊU CẦU / HỒ SƠ ỨNG TUYỂN
      </h2>

      {/* Thống kê nhanh */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #2563eb" }}>
          <span style={styles.statsLabel}>Tổng số hồ sơ</span>
          <span style={{ ...styles.statsValue, color: "#2563eb" }}>{stats.total}</span>
        </div>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #d97706" }}>
          <span style={styles.statsLabel}>Chờ duyệt</span>
          <span style={{ ...styles.statsValue, color: "#d97706" }}>{stats.pending}</span>
        </div>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #16a34a" }}>
          <span style={styles.statsLabel}>Đã duyệt</span>
          <span style={{ ...styles.statsValue, color: "#16a34a" }}>{stats.approved}</span>
        </div>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #dc2626" }}>
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
            placeholder="Tìm theo tên, MSSV, ngành..."
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

      {/* Danh sách hồ sơ dạng bảng */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Thông tin sinh viên</th>
              <th style={styles.th}>Ngành & Khóa</th>
              <th style={styles.th}>Liên hệ</th>
              <th style={styles.thCenter}>CV / Bảng điểm</th>
              <th style={styles.th}>Ghi chú</th>
              <th style={styles.thCenter}>Trạng thái</th>
              <th style={styles.thCenter}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentApps.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: 30, color: "#6b7280" }}>
                  Không tìm thấy hồ sơ nào phù hợp.
                </td>
              </tr>
            ) : (
              currentApps.map((app) => (
                <tr key={app._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>{app.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>MSSV: {app.studentCode}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{app.major}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>Khóa: {app.course}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{app.email}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>SĐT: {app.sdt}</div>
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
                    <div style={{ maxWidth: 180, fontSize: "13px", color: "#4b5563", wordBreak: "break-word" }}>
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
                            title="Duyệt hồ sơ"
                          >
                            <i className="bi bi-check-lg"></i> Duyệt
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                            onClick={() => handleUpdateStatus(app._id, "từ chối")}
                            title="Từ chối hồ sơ"
                          >
                            <i className="bi bi-x-lg"></i> Từ chối
                          </button>
                        </>
                      )}
                      {app.status !== "chờ duyệt" && (
                        <button
                          style={{ ...styles.actionBtn, ...styles.resetBtn }}
                          onClick={() => handleUpdateStatus(app._id, "chờ duyệt")}
                          title="Đặt lại trạng thái về Chờ duyệt"
                        >
                          <i className="bi bi-arrow-counterclockwise"></i> Đặt lại
                        </button>
                      )}
                      <button
                        style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                        onClick={() => handleDelete(app._id)}
                        title="Xóa hồ sơ"
                      >
                        <i className="bi bi-trash-fill"></i> Xóa
                      </button>
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
    padding: 10,
    background: "#f4f6f9",
  },

  pageTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 22,
    fontWeight: 700,
    padding: "12px 18px",
    background: "#eff6ff",
    color: "#1e40af",
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
    textTransform: "uppercase",
  },

  titleIcon: {
    fontSize: 26,
    color: "#3b82f6",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },

  statsCard: {
    background: "#fff",
    padding: "16px 20px",
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  statsLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },

  statsValue: {
    fontSize: 28,
    fontWeight: 800,
  },

  filterBar: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 260,
  },

  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 16,
    color: "#9ca3af",
  },

  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s",
  },

  filterSelect: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff",
    outline: "none",
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.08)",
    border: "1px solid #dbeafe",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "14px 16px",
    background: "#eff6ff",
    fontWeight: 600,
    color: "#1e3a8a",
    borderBottom: "2px solid #bfdbfe",
    textAlign: "left",
    fontSize: 14,
  },

  thCenter: {
    padding: "14px 16px",
    background: "#eff6ff",
    fontWeight: 600,
    color: "#1e3a8a",
    borderBottom: "2px solid #bfdbfe",
    textAlign: "center",
    fontSize: 14,
  },

  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },

  td: {
    padding: "14px 16px",
    color: "#374151",
    fontSize: 14,
    verticalAlign: "middle",
  },

  tdCenter: {
    padding: "14px 16px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 14,
  },

  badge: {
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    textTransform: "capitalize",
    display: "inline-block",
  },

  fileLink: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#4b5563",
    fontSize: 12,
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s",
  },

  actionGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  actionBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "all 0.2s",
  },

  approveBtn: {
    background: "#16a34a",
    color: "#fff",
    boxShadow: "0 2px 5px rgba(22, 163, 74, 0.2)",
  },

  rejectBtn: {
    background: "#dc2626",
    color: "#fff",
    boxShadow: "0 2px 5px rgba(220, 38, 38, 0.2)",
  },

  resetBtn: {
    background: "#4b5563",
    color: "#fff",
    boxShadow: "0 2px 5px rgba(75, 85, 99, 0.2)",
  },

  deleteBtn: {
    background: "#991b1b",
    color: "#fff",
    boxShadow: "0 2px 5px rgba(153, 27, 27, 0.2)",
  },

  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  pageBtn: {
    minWidth: 36,
    height: 36,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #dbeafe",
    background: "#ffffff",
    color: "#1e3a8a",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s ease",
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
