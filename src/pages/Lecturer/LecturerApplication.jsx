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

  const [topics, setTopics] = useState([]);
  const fetchTopics = async () => {
    try {
      const lecturerId = user._id || user.id;
      const res = await fetch(
        `http://localhost:5000/api/internship-topics/lecturer/${lecturerId}`,
      );
      const data = await res.json();
      setTopics(data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách đề tài:", err);
      setTopics([]);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchTopics();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const getBadgeStyle = (status) => {
    const base = {
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "bold",
      display: "inline-block",
    };
    switch ((status || "").toLowerCase()) {
      case "chờ duyệt":
        return { ...base, background: "#fef3c7", color: "#b45309" };
      case "đã duyệt":
        return { ...base, background: "#dcfce7", color: "#166534" };
      case "từ chối":
        return { ...base, background: "#fee2e2", color: "#991b1b" };
      default:
        return { ...base, background: "#eef2ff", color: "#3730a3" };
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/application/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, approvedBy: user._id || user.id }),
        },
      );
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

  if (loading)
    return <p style={{ padding: 20 }}>Đang tải hồ sơ đăng ký thực tập...</p>;

  // Thống kê số lượng
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "chờ duyệt").length,
    approved: applications.filter((app) => app.status === "đã duyệt").length,
    rejected: applications.filter((app) => app.status === "từ chối").length,
  };

  // Lọc hồ sơ - chỉ hiển thị hồ sơ của đề tài của lecturer hoặc hồ sơ tự do
  const filteredApps = applications.filter((app) => {
    const appTopicId = app.topic && (app.topic._id || app.topic);
    const isInLecturerTopic = topics.some((t) => t._id === appTopicId);
    const isFreeApp = !app.topic;

    const matchSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.major.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || app.status === statusFilter;

    return (isInLecturerTopic || isFreeApp) && matchSearch && matchStatus;
  });

  // Nhóm hồ sơ theo đề tài của lecturer
  // Build grouped list based on lecturer's topics
  const freeApps = [];
  const groupedTopicList = topics.map((t) => {
    const appsForTopic = filteredApps.filter((app) => {
      // support app.topic being object or id string
      const appTopicId = app.topic && (app.topic._id || app.topic);
      return appTopicId === t._id;
    });
    return { topic: t, apps: appsForTopic };
  });

  // apps that don't have a topic (free applications)
  filteredApps.forEach((app) => {
    if (!app.topic) freeApps.push(app);
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/lecturer")}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h2 style={styles.pageTitle}>
            <i
              className="bi bi-file-earmark-text-fill"
              style={styles.titleIcon}
            ></i>
            QUẢN LÝ HỒ SƠ THỰC TẬP
          </h2>
          <p style={styles.subTitle}>
            Dành cho giảng viên hướng dẫn: {user.username}
          </p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #2563eb" }}>
          <span style={styles.statsLabel}>Tổng số hồ sơ</span>
          <span style={{ ...styles.statsValue, color: "#2563eb" }}>
            {stats.total}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #d97706" }}>
          <span style={styles.statsLabel}>Chờ duyệt</span>
          <span style={{ ...styles.statsValue, color: "#d97706" }}>
            {stats.pending}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #16a34a" }}>
          <span style={styles.statsLabel}>Đã duyệt</span>
          <span style={{ ...styles.statsValue, color: "#16a34a" }}>
            {stats.approved}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #dc2626" }}>
          <span style={styles.statsLabel}>Từ chối</span>
          <span style={{ ...styles.statsValue, color: "#dc2626" }}>
            {stats.rejected}
          </span>
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

      {/* Danh sách hồ sơ phân nhóm */}
      {filteredApps.length === 0 ? (
        <div style={styles.emptyBox}>
          <i
            className="bi bi-inbox"
            style={{ fontSize: 48, color: "#cbd5e1" }}
          />
          <p style={{ marginTop: 12, color: "#64748b", fontSize: 16 }}>
            Không tìm thấy hồ sơ đăng ký nào.
          </p>
        </div>
      ) : (
        <div>
          {/* Nhóm theo đề tài */}
          {groupedTopicList.map(({ topic, apps }) => {
            return (
              <div key={topic._id} style={styles.groupWrapper}>
                <div
                  style={{
                    ...styles.groupHeader,
                    borderLeft: "6px solid #16a34a",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.groupTopicTitle}>
                      <i
                        className="bi bi-journal-text"
                        style={{ marginRight: 8, color: "#1e3a8a" }}
                      />
                      Đề tài: {topic.topicname}
                      {/* <span style={styles.myTopicBadge}>Đề tài của tôi</span> */}
                    </h3>
                    <div style={styles.groupTopicMeta}>
                      <span>
                        <strong>Cán bộ:</strong>{" "}
                        {topic.lecturer?.username || "Chưa rõ"}
                      </span>
                      <span style={{ marginLeft: 20 }}>
                        <strong>Vị trí:</strong> {topic.position}
                      </span>
                      <span style={{ marginLeft: 20 }}>
                        <strong>Bộ môn:</strong> {topic.department}
                      </span>
                    </div>
                  </div>
                  <span style={styles.appCountBadge}>{apps.length} hồ sơ</span>
                </div>

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
                      {apps.map((app) => (
                        <tr key={app._id} style={styles.tr}>
                          <td style={styles.td}>
                            <div
                              style={{ fontWeight: "bold", color: "#1e3a8a" }}
                            >
                              {app.fullName}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              MSSV: {app.studentCode}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div>{app.major}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              Khóa: {app.course}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div>{app.email}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              SĐT: {app.sdt}
                            </div>
                          </td>
                          <td style={styles.tdCenter}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              {app.cvFile && (
                                <a
                                  href={`http://localhost:5000${app.cvFile}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={styles.fileLink}
                                >
                                  <i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i>{" "}
                                  CV File
                                </a>
                              )}
                              {app.transcriptFile && (
                                <a
                                  href={`http://localhost:5000${app.transcriptFile}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={styles.fileLink}
                                >
                                  <i className="bi bi-file-earmark-spreadsheet-fill text-success me-1"></i>{" "}
                                  Bảng điểm
                                </a>
                              )}
                              {app.citizenIdFrontFile && (
                                <a
                                  href={`http://localhost:5000${app.citizenIdFrontFile}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={styles.fileLink}
                                >
                                  <i className="bi bi-card-image text-primary me-1"></i>{" "}
                                  CCCD trước
                                </a>
                              )}
                              {app.citizenIdBackFile && (
                                <a
                                  href={`http://localhost:5000${app.citizenIdBackFile}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={styles.fileLink}
                                >
                                  <i className="bi bi-card-image text-primary me-1"></i>{" "}
                                  CCCD sau
                                </a>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div
                              style={{
                                maxWidth: 180,
                                fontSize: "13px",
                                color: "#475569",
                                wordBreak: "break-word",
                              }}
                            >
                              {app.note || "---"}
                            </div>
                          </td>
                          <td style={styles.tdCenter}>
                            <span
                              style={{
                                ...styles.badge,
                                ...getBadgeStyle(app.status),
                              }}
                            >
                              {app.status}
                            </span>
                            {app.status !== "chờ duyệt" && app.approvedBy && (
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                                <i className="bi bi-person-check-fill" style={{ marginRight: 4 }}></i>
                                {app.approvedBy.username || app.approvedBy.email || app.approvedBy}
                              </div>
                            )}
                          </td>
                          <td style={styles.tdCenter}>
                            <div style={styles.actionGroup}>
                              {app.status === "chờ duyệt" && (
                                <>
                                  <button
                                    style={{
                                      ...styles.actionBtn,
                                      ...styles.approveBtn,
                                    }}
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "đã duyệt")
                                    }
                                  >
                                    <i className="bi bi-check2-circle"></i>{" "}
                                    Duyệt
                                  </button>
                                  <button
                                    style={{
                                      ...styles.actionBtn,
                                      ...styles.rejectBtn,
                                    }}
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "từ chối")
                                    }
                                  >
                                    <i className="bi bi-x-circle"></i> Từ chối
                                  </button>
                                </>
                              )}
                              {app.status !== "chờ duyệt" &&
                                app.approvedBy &&
                                (app.approvedBy._id === (user._id || user.id) ||
                                  app.approvedBy === (user._id || user.id)) && (
                                  <button
                                    style={{
                                      ...styles.actionBtn,
                                      ...styles.resetBtn,
                                    }}
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "chờ duyệt")
                                    }
                                  >
                                    <i className="bi bi-arrow-counterclockwise"></i>{" "}
                                    Đặt lại
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Nhóm Hồ sơ tự do */}
          {freeApps.length > 0 && (
            <div style={styles.groupWrapper}>
              <div
                style={{
                  ...styles.groupHeader,
                  borderLeft: "6px solid #64748b",
                  background: "#f1f5f9",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ ...styles.groupTopicTitle, color: "#475569" }}>
                    <i
                      className="bi bi-file-earmark-person-fill"
                      style={{ marginRight: 8, color: "#475569" }}
                    />
                    Danh sách hồ sơ tự do (Không có đề tài)
                  </h3>
                  <div style={styles.groupTopicMeta}>
                    <span>
                      Các hồ sơ độc lập chưa liên kết với đề tài thực tập nào.
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.appCountBadge,
                    background: "#e2e8f0",
                    color: "#475569",
                  }}
                >
                  {freeApps.length} hồ sơ
                </span>
              </div>

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
                    {freeApps.map((app) => (
                      <tr key={app._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>
                            {app.fullName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            MSSV: {app.studentCode}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div>{app.major}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Khóa: {app.course}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div>{app.email}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            SĐT: {app.sdt}
                          </div>
                        </td>
                        <td style={styles.tdCenter}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            {app.cvFile && (
                              <a
                                href={`http://localhost:5000${app.cvFile}`}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.fileLink}
                              >
                                <i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i>{" "}
                                CV File
                              </a>
                            )}
                            {app.transcriptFile && (
                              <a
                                href={`http://localhost:5000${app.transcriptFile}`}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.fileLink}
                              >
                                <i className="bi bi-file-earmark-spreadsheet-fill text-success me-1"></i>{" "}
                                Bảng điểm
                              </a>
                            )}
                            {app.citizenIdFrontFile && (
                              <a
                                href={`http://localhost:5000${app.citizenIdFrontFile}`}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.fileLink}
                              >
                                <i className="bi bi-card-image text-primary me-1"></i>{" "}
                                CCCD trước
                              </a>
                            )}
                            {app.citizenIdBackFile && (
                              <a
                                href={`http://localhost:5000${app.citizenIdBackFile}`}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.fileLink}
                              >
                                <i className="bi bi-card-image text-primary me-1"></i>{" "}
                                CCCD sau
                              </a>
                            )}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div
                            style={{
                              maxWidth: 180,
                              fontSize: "13px",
                              color: "#475569",
                              wordBreak: "break-word",
                            }}
                          >
                            {app.note || "---"}
                          </div>
                        </td>
                        <td style={styles.tdCenter}>
                          <span
                            style={{
                              ...styles.badge,
                              ...getBadgeStyle(app.status),
                            }}
                          >
                            {app.status}
                          </span>
                          {app.status !== "chờ duyệt" && app.approvedBy && (
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                              <i className="bi bi-person-check-fill" style={{ marginRight: 4 }}></i>
                              {app.approvedBy.username || app.approvedBy.email || app.approvedBy}
                            </div>
                          )}
                        </td>
                        <td style={styles.tdCenter}>
                          <div style={styles.actionGroup}>
                            {app.status === "chờ duyệt" && (
                              <>
                                <button
                                  style={{
                                    ...styles.actionBtn,
                                    ...styles.approveBtn,
                                  }}
                                  onClick={() =>
                                    handleUpdateStatus(app._id, "đã duyệt")
                                  }
                                >
                                  <i className="bi bi-check2-circle"></i> Duyệt
                                </button>
                                <button
                                  style={{
                                    ...styles.actionBtn,
                                    ...styles.rejectBtn,
                                  }}
                                  onClick={() =>
                                    handleUpdateStatus(app._id, "từ chối")
                                  }
                                >
                                  <i className="bi bi-x-circle"></i> Từ chối
                                </button>
                              </>
                            )}
                            {app.status !== "chờ duyệt" &&
                              app.approvedBy &&
                              (app.approvedBy._id === (user._id || user.id) ||
                                app.approvedBy === (user._id || user.id)) && (
                                <button
                                  style={{
                                    ...styles.actionBtn,
                                    ...styles.resetBtn,
                                  }}
                                  onClick={() =>
                                    handleUpdateStatus(app._id, "chờ duyệt")
                                  }
                                >
                                  <i className="bi bi-arrow-counterclockwise"></i>{" "}
                                  Đặt lại
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "70vh",
    padding: 0,
    background: "transparent",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },

  header: {
    marginBottom: "18px",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "18px 20px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #d7dee8",
    borderLeft: "4px solid #f29111",
  },

  backBtn: {
    padding: "10px 18px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "12px",
    transition: "0.25s ease",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  pageTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#083c73",
    margin: "0 0 6px 0",
    display: "flex",
    alignItems: "center",
    gap: 12,
    letterSpacing: 0,
  },

  titleIcon: {
    color: "#083c73",
    fontSize: "22px",
  },

  subTitle: {
    color: "#64748b",
    fontSize: "15px",
    margin: 0,
    fontWeight: "500",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "18px",
  },

  statsCard: {
    background: "#ffffff",
    padding: "16px 18px",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    border: "1px solid #e2e8f0",
    transition: "0.25s ease",
  },

  statsLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "600",
  },

  statsValue: {
    fontSize: "24px",
    fontWeight: "800",
    lineHeight: 1.2,
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
    background: "#ffffff",
    padding: "14px",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #d7dee8",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: "280px",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "15px",
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 42px",
    borderRadius: "8px",
    border: "1px solid #c5cfdd",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
  },

  filterSelect: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #c5cfdd",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
    minWidth: "220px",
    color: "#0f172a",
    fontWeight: "500",
  },

  groupWrapper: {
    marginBottom: "18px",
    background: "#ffffff",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #d7dee8",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    maxWidth: "100%",
    minWidth: 0,
  },

  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "22px 24px",
    background:
      "#f8fafc",
    borderBottom: "1px solid #e5eaf1",
  },

  groupTopicTitle: {
    margin: 0,
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  myTopicBadge: {
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "700",
    padding: "6px 12px",
    borderRadius: "999px",
  },

  groupTopicMeta: {
    marginTop: "10px",
    color: "#64748b",
    fontSize: "14px",
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
  },

  appCountBadge: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    boxShadow: "none",
  },

  tableWrapper: {
    overflowX: "auto",
    maxWidth: "100%",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "1100px",
  },

  th: {
    padding: "16px",
    background: "#f8fafc",
    fontWeight: "700",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    fontSize: "14px",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },

  thCenter: {
    padding: "16px",
    background: "#f8fafc",
    fontWeight: "700",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
    fontSize: "14px",
  },

  tr: {
    transition: "0.2s ease",
  },

  td: {
    padding: "18px 16px",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
    background: "#fff",
  },

  tdCenter: {
    padding: "18px 16px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "14px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fff",
  },

  badge: {
    padding: "7px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "90px",
  },

  fileLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "13px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "0.2s ease",
  },

  actionGroup: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
  },

  actionBtn: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "0.2s ease",
    minWidth: "110px",
  },

  approveBtn: {
    background: "#15803d",
    color: "#fff",
    boxShadow: "none",
  },

  rejectBtn: {
    background: "#b91c1c",
    color: "#fff",
    boxShadow: "none",
  },

  resetBtn: {
    background: "#475569",
    color: "#fff",
    boxShadow: "none",
  },

  emptyBox: {
    background: "#ffffff",
    borderRadius: "8px",
    padding: "60px 20px",
    textAlign: "center",
    border: "1px dashed #cbd5e1",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },

  pagination: {
    marginTop: "28px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },

  pageBtn: {
    minWidth: "40px",
    height: "40px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  pageBtnActive: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
    boxShadow: "none",
  },

  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
