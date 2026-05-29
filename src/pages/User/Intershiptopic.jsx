import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";
const API_BASE = `${API}/api/internship-topics`;

export default function Intershiptopic() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const studentId = user._id || user.id;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [applyTopic, setApplyTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState({
    fullName: user.username || "",
    studentCode: "",
    email: user.email || "",
    sdt: "",
    major: "",
    course: "",
    note: "",
  });
  const [applyFiles, setApplyFiles] = useState({
    cvFile: null,
    transcriptFile: null,
  });

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setTopics(data.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đề tài:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API}/api/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.filePath || res.data.path || res.data;
  };

  const resetApply = () => {
    setApplyTopic(null);
    setSubmitting(false);
    setApplyForm({
      fullName: user.username || "",
      studentCode: "",
      email: user.email || "",
      sdt: "",
      major: "",
      course: "",
      note: "",
    });
    setApplyFiles({ cvFile: null, transcriptFile: null });
  };

  const openApplyForm = (topic) => {
    if (!studentId || user.role !== "student") {
      alert("Bạn cần đăng nhập bằng tài khoản sinh viên để nộp hồ sơ.");
      navigate("/login");
      return;
    }
    setApplyTopic(topic._id);
    setExpandedTopic(topic._id);
  };

  const handleApplyChange = (e) => {
    const { name, value } = e.target;
    setApplyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFileChange = (e) => {
    const { name, files } = e.target;
    setApplyFiles((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const handleSubmitApplication = async () => {
    if (!applyTopic) return;
    if (!applyFiles.cvFile || !applyFiles.transcriptFile) {
      alert("Vui lòng chọn cả CV và bảng điểm để nộp hồ sơ.");
      return;
    }
    const selectedTopic = topics.find((topic) => topic._id === applyTopic);
    if (!selectedTopic) {
      alert("Không tìm thấy đề tài để nộp hồ sơ.");
      return;
    }
    setSubmitting(true);
    try {
      const cvPath = await uploadFile(applyFiles.cvFile);
      const transcriptPath = await uploadFile(applyFiles.transcriptFile);

      await axios.post(`${API}/api/application/topic/${selectedTopic._id}`, {
        ...applyForm,
        student: studentId,
        cvFile: cvPath,
        transcriptFile: transcriptPath,
      });

      alert("Nộp hồ sơ thành công. Vui lòng chờ giảng viên phản hồi.");
      resetApply();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || err.message || "Nộp hồ sơ thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((topic) => {
    const query = search.toLowerCase();
    const matchSearch =
      topic.topicname.toLowerCase().includes(query) ||
      topic.department.toLowerCase().includes(query) ||
      topic.position.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.lecturer?.username?.toLowerCase().includes(query);

    const matchStatus = statusFilter === "all" || topic.status === statusFilter;

    return matchSearch && matchStatus;
  });

  if (loading) {
    return <p style={{ padding: 20 }}>⏳ Đang tải danh sách đề tài...</p>;
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Danh sách đề tài thực tập</h2>
          <p style={styles.subtitle}>
            Khám phá các đề tài thực tập được các giảng viên đề xuất
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo đề tài, giảng viên, bộ môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="open">Đang mở</option>
          <option value="closed">Đã đóng</option>
        </select>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Tổng đề tài</span>
          <span style={styles.statValue}>{topics.length}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Đang mở</span>
          <span style={styles.statValue}>
            {topics.filter((t) => t.status === "open").length}
          </span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Đã đóng</span>
          <span style={styles.statValue}>
            {topics.filter((t) => t.status === "closed").length}
          </span>
        </div>
      </div>

      {/* Topics List */}
      <div style={styles.topicsContainer}>
        {filteredTopics.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="bi bi-inbox" style={styles.emptyIcon}></i>
            <p style={styles.emptyText}>Không tìm thấy đề tài phù hợp</p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic._id}
              style={{
                ...styles.topicCard,
                ...(expandedTopic === topic._id ? styles.topicCardActive : {}),
              }}
            >
              {/* Header */}
              <div
                style={styles.topicCardHeader}
                onClick={() =>
                  setExpandedTopic(
                    expandedTopic === topic._id ? null : topic._id,
                  )
                }
              >
                <div style={styles.topicHeader}>
                  <div>
                    <h3 style={styles.topicTitle}>{topic.topicname}</h3>
                    <p style={styles.topicMeta}>
                      <span>
                        <i className="bi bi-person-fill me-1"></i>
                        {topic.lecturer?.username || "Chưa rõ"}
                      </span>
                      <span style={{ marginLeft: "16px" }}>
                        <i className="bi bi-building me-1"></i>
                        {topic.department}
                      </span>
                    </p>
                  </div>
                </div>

                <div style={styles.topicRight}>
                  <span
                    style={
                      topic.status === "open"
                        ? styles.badgeOpen
                        : styles.badgeClosed
                    }
                  >
                    {topic.status === "open" ? "Mở" : "Đóng"}
                  </span>
                  <i
                    className={`bi ${
                      expandedTopic === topic._id
                        ? "bi-chevron-up"
                        : "bi-chevron-down"
                    }`}
                    style={styles.expandIcon}
                  ></i>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTopic === topic._id && (
                <div style={styles.topicContent}>
                  <div style={styles.contentGrid}>
                    <div style={styles.contentItem}>
                      <span style={styles.contentLabel}>Vị trí:</span>
                      <p style={styles.contentValue}>{topic.position}</p>
                    </div>
                    <div style={styles.contentItem}>
                      <span style={styles.contentLabel}>Số lượng:</span>
                      <p style={styles.contentValue}>
                        {topic.quantity} sinh viên
                      </p>
                    </div>
                    <div style={styles.contentItem}>
                      <span style={styles.contentLabel}>Thời gian:</span>
                      <p style={styles.contentValue}>
                        {new Date(topic.startday).toLocaleDateString()} -{" "}
                        {new Date(topic.endday).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={styles.contentItem}>
                      <span style={styles.contentLabel}>Email:</span>
                      <p style={styles.contentValue}>
                        {topic.lecturer?.email || "Chưa rõ"}
                      </p>
                    </div>
                  </div>

                  <div style={styles.contentSection}>
                    <h4 style={styles.sectionTitle}>Mô tả đề tài</h4>
                    <p style={styles.sectionText}>{topic.description}</p>
                  </div>

                  <div style={styles.contentSection}>
                    <h4 style={styles.sectionTitle}>Yêu cầu</h4>
                    <p style={styles.sectionText}>{topic.requirement}</p>
                  </div>

                  {topic.status === "open" && (
                    <button
                      style={styles.registerBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openApplyForm(topic);
                      }}
                    >
                      <i className="bi bi-pencil-square me-2"></i>
                      Nộp hồ sơ ứng tuyển
                    </button>
                  )}

                  {applyTopic === topic._id && (
                    <div style={styles.applyFormCard}>
                      <h4 style={styles.applyFormTitle}>Form nộp hồ sơ</h4>
                      <div style={styles.applyFormGrid}>
                        <input
                          style={styles.input}
                          name="fullName"
                          value={applyForm.fullName}
                          onChange={handleApplyChange}
                          placeholder="Họ và tên"
                          required
                        />
                        <input
                          style={styles.input}
                          name="studentCode"
                          value={applyForm.studentCode}
                          onChange={handleApplyChange}
                          placeholder="MSSV"
                          required
                        />
                        <input
                          style={styles.input}
                          name="email"
                          value={applyForm.email}
                          onChange={handleApplyChange}
                          placeholder="Email"
                          required
                        />
                        <input
                          style={styles.input}
                          name="sdt"
                          value={applyForm.sdt}
                          onChange={handleApplyChange}
                          placeholder="Số điện thoại"
                          required
                        />
                        <input
                          style={styles.input}
                          name="major"
                          value={applyForm.major}
                          onChange={handleApplyChange}
                          placeholder="Ngành"
                          required
                        />
                        <input
                          style={styles.input}
                          name="course"
                          value={applyForm.course}
                          onChange={handleApplyChange}
                          placeholder="Khóa"
                          required
                        />
                        <textarea
                          style={styles.textarea}
                          name="note"
                          value={applyForm.note}
                          onChange={handleApplyChange}
                          placeholder="Ghi chú thêm (nếu có)"
                        />
                        <div style={styles.fileRowForm}>
                          <label style={styles.fileLabel}>
                            CV
                            <input
                              type="file"
                              name="cvFile"
                              accept="application/pdf"
                              onChange={handleApplyFileChange}
                              style={styles.fileInput}
                            />
                          </label>
                          <label style={styles.fileLabel}>
                            Bảng điểm
                            <input
                              type="file"
                              name="transcriptFile"
                              accept="application/pdf"
                              onChange={handleApplyFileChange}
                              style={styles.fileInput}
                            />
                          </label>
                        </div>
                      </div>
                      <div style={styles.applyActions}>
                        <button
                          style={styles.submitApplyBtn}
                          onClick={handleSubmitApplication}
                          disabled={submitting}
                        >
                          {submitting ? "Đang nộp..." : "Gửi hồ sơ"}
                        </button>
                        <button
                          style={styles.cancelApplyBtn}
                          onClick={resetApply}
                          disabled={submitting}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
    fontFamily: "'Inter', sans-serif",
  },

  header: {
    marginBottom: "28px",
    background: "#ffffff",
    borderRadius: "26px",
    padding: "28px 32px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
  },

  title: {
    fontSize: "34px",
    margin: 0,
    color: "#0f172a",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "15px",
    fontWeight: "500",
  },

  filterBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
    alignItems: "center",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "22px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
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
    left: "16px",
    color: "#94a3b8",
    fontSize: 15,
  },

  searchInput: {
    width: "100%",
    height: "52px",
    padding: "0 16px 0 44px",
    border: "1px solid #dbe4f0",
    borderRadius: "16px",
    background: "#f8fafc",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    fontWeight: "500",
  },

  filterSelect: {
    height: "52px",
    padding: "0 16px",
    border: "1px solid #dbe4f0",
    borderRadius: "16px",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
    minWidth: "180px",
    outline: "none",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "22px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  statValue: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1,
  },

  topicsContainer: {
    display: "grid",
    gap: "20px",
  },

  topicCard: {
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    transition: "0.3s ease",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
  },

  topicCardActive: {
    boxShadow: "0 18px 40px rgba(37,99,235,0.12)",
    border: "1px solid #bfdbfe",
  },

  topicCardHeader: {
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    gap: "20px",
  },

  topicHeader: {
    flex: 1,
  },

  topicTitle: {
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 10px 0",
    color: "#0f172a",
    lineHeight: 1.5,
  },

  topicMeta: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    fontWeight: "500",
  },

  topicRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  badgeOpen: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "90px",
  },

  badgeClosed: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "90px",
  },

  expandIcon: {
    fontSize: "18px",
    color: "#64748b",
  },

  topicContent: {
    padding: "0 24px 24px",
    borderTop: "1px solid #f1f5f9",
    background: "#fcfdff",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    margin: "24px 0",
  },

  contentItem: {
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
  },

  contentLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
    fontWeight: "700",
  },

  contentValue: {
    margin: 0,
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: "600",
    lineHeight: 1.6,
  },

  contentSection: {
    marginBottom: "22px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #edf2f7",
  },

  sectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    margin: "0 0 10px 0",
    color: "#0f172a",
  },

  sectionText: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.8",
  },

  registerBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "16px",
    boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
  },

  applyFormCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    marginTop: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
  },

  applyFormTitle: {
    margin: 0,
    marginBottom: "20px",
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "800",
  },

  applyFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    boxSizing: "border-box",
    fontWeight: "500",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    resize: "vertical",
    gridColumn: "1 / -1",
    boxSizing: "border-box",
    fontWeight: "500",
  },

  fileRowForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    gridColumn: "1 / -1",
  },

  fileLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontSize: "14px",
    color: "#334155",
    fontWeight: "600",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "16px",
    border: "1px dashed #cbd5e1",
  },

  fileInput: {
    fontSize: "13px",
    color: "#475569",
  },

  applyActions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  submitApplyBtn: {
    flex: 1,
    minWidth: "180px",
    padding: "14px 18px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(22,163,74,0.25)",
    fontSize: "14px",
  },

  cancelApplyBtn: {
    flex: 1,
    minWidth: "180px",
    padding: "14px 18px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px dashed #cbd5e1",
    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
  },

  emptyIcon: {
    fontSize: "56px",
    color: "#cbd5e1",
    display: "block",
    marginBottom: "16px",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "16px",
    margin: 0,
    fontWeight: "500",
  },
};
