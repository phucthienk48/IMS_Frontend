import { useEffect, useState } from "react";
import {
  defaultInternshipCenter,
  fetchInternshipCenter,
} from "../../config/internshipCenter";

const API_BASE = "http://localhost:5000/api/internship-topics";

const emptyTopicForm = {
  topicname: "",
  description: "",
  requirement: "",
  workDaysPerWeek: "",
  workHoursPerDay: "",
  startday: "",
  endday: "",
};

const numberOrBlank = (value) =>
  value === undefined || value === null ? "" : value;

const nullableNumber = (value) => (value === "" ? null : Number(value));

export default function LecturerIntershiptopic() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const lecturerId = user._id || user.id;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(emptyTopicForm);
  const [center, setCenter] = useState(defaultInternshipCenter);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      if (!lecturerId) {
        console.warn("Không tìm thấy ID giảng viên");
        setTopics([]);
        return;
      }
      const res = await fetch(`${API_BASE}/lecturer/${lecturerId}`);
      const data = await res.json();
      setTopics(data.data || []);
    } catch (err) {
      console.error("Lỗi khi tải đề tài giảng viên:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchInternshipCenter("http://localhost:5000").then(setCenter);
  }, [lecturerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue =
      type === "checkbox"
        ? checked
        : ["workDaysPerWeek", "workHoursPerDay"].includes(name)
          ? value === ""
            ? ""
            : Number(value)
          : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleEdit = (topic) => {
    setEditingId(topic._id);
    setForm({
      topicname: topic.topicname || "",
      description: topic.description || "",
      requirement: topic.requirement || "",
      workDaysPerWeek: numberOrBlank(topic.workDaysPerWeek),
      workHoursPerDay: numberOrBlank(topic.workHoursPerDay),
      startday: topic.startday ? topic.startday.split("T")[0] : "",
      endday: topic.endday ? topic.endday.split("T")[0] : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyTopicForm);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowCreateForm(false);
    resetForm();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setShowCreateForm(true);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lecturerId) {
      alert("Không tìm thấy thông tin giảng viên.");
      return;
    }

    if (form.startday && form.endday && form.startday > form.endday) {
      alert("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    if (form.workDaysPerWeek !== "" && (form.workDaysPerWeek < 1 || form.workDaysPerWeek > 7)) {
      alert("Số ngày thực tập mỗi tuần phải từ 1 đến 7.");
      return;
    }
    if (form.workHoursPerDay !== "" && (form.workHoursPerDay < 1 || form.workHoursPerDay > 24)) {
      alert("Số giờ thực tập mỗi ngày phải từ 1 đến 24.");
      return;
    }

    const payload = {
      ...form,
      workDaysPerWeek: nullableNumber(form.workDaysPerWeek),
      workHoursPerDay: nullableNumber(form.workHoursPerDay),
      lecturer: lecturerId,
    };

    if (editingId) {
      try {
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Cập nhật đề tài thất bại");
        setTopics((prev) =>
          prev.map((topic) =>
            topic._id === editingId ? { ...topic, ...data.data } : topic,
          ),
        );
        handleCancel();
        alert("Đã cập nhật đề tài thành công.");
      } catch (err) {
        console.error(err);
        alert(err.message || "Không thể cập nhật đề tài.");
      }
    } else {
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, status: "open" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Tạo đề tài thất bại");
        setTopics((prev) => [data.data, ...prev]);
        handleCancel();
        alert("Đã tạo đề tài mới thành công.");
      } catch (err) {
        console.error(err);
        alert(err.message || "Không thể tạo đề tài.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có muốn xoá đề tài này?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xoá thất bại");
      setTopics((prev) => prev.filter((topic) => topic._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể xoá đề tài.");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    const confirmMessage =
      newStatus === "closed"
        ? "Bạn có muốn đóng đăng ký đề tài này?"
        : "Bạn có muốn mở lại đăng ký đề tài này?";
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Thay đổi trạng thái thất bại");
      setTopics((prev) =>
        prev.map((topic) =>
          topic._id === id ? { ...topic, status: newStatus } : topic
        )
      );
      alert(
        newStatus === "closed"
          ? "Đã đóng đề tài thành công."
          : "Đã mở lại đề tài thành công."
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể thay đổi trạng thái đề tài.");
    }
  };

  const filteredTopics = topics.filter((topic) => {
    const query = search.trim().toLowerCase();
    return (
      (topic.topicname || "").toLowerCase().includes(query) ||
      (topic.description || "").toLowerCase().includes(query) ||
      (topic.requirement || "").toLowerCase().includes(query) ||
      (topic.lecturer?.username || "").toLowerCase().includes(query)
    );
  });

  const formatDate = (value) => {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Chưa cập nhật"
      : date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Đang tải đề tài...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .lit-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        .lit-row:hover td { background: #f8faff !important; }

        .lit-edit-btn:hover {
          background: #1d4ed8 !important;
        }
        .lit-delete-btn:hover {
          background: #991b1b !important;
        }

        .lit-input:focus, .lit-textarea:focus {
          border-color: #3b82f6 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .lit-search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #fff;
        }

        .lit-spinner {
          width: 44px;
          height: 44px;
          border: 4px solid #e0e7ff;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lit-badge-open {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 999px;
          color: #166534; background: #dcfce7;
          font-weight: 700; font-size: 12px;
          border: 1px solid #bbf7d0;
        }
        .lit-badge-closed {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 999px;
          color: #991b1b; background: #fee2e2;
          font-weight: 700; font-size: 12px;
          border: 1px solid #fecaca;
        }

        .lit-status-btn-close {
          background: #d97706 !important;
          box-shadow: none !important;
        }
        .lit-status-btn-close:hover {
          background: #b45309 !important;
        }
        .lit-status-btn-open {
          background: #15803d !important;
          box-shadow: none !important;
        }
        .lit-status-btn-open:hover {
          background: #166534 !important;
        }
      `}</style>

      <div className="lit-page" style={styles.page}>
        {/* TOP HEADER SECTION */}
        <div style={styles.topSection}>
          <div style={styles.topLeft}>
            <div style={styles.titleBadge}>
              <i
                className="bi bi-journal-bookmark-fill"
                style={{ color: "#3b82f6" }}
              ></i>
              <span>Quản lý đề tài</span>
            </div>
            <h2 style={styles.title}>Đề tài của tôi</h2>
            <p style={styles.subtitle}>
              Xem và quản lý các đề tài thực tập do bạn đề xuất.
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
                {topics.filter((t) => t.status === "open").length}
              </span>
              <span style={{ ...styles.statLabel, color: "#166534" }}>
                Đang mở
              </span>
            </div>
            <button style={styles.createTopicBtn} onClick={handleOpenCreate}>
              <i className="bi bi-plus-circle"></i>
              Tạo đề tài mới
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={styles.searchWrapper}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            className="lit-search-input"
            style={styles.searchInput}
            placeholder="Tìm theo tên đề tài, nội dung công việc hoặc cán bộ phụ trách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <span style={styles.clearSearch} onClick={() => setSearch("")}>
              <i className="bi bi-x-circle-fill"></i>
            </span>
          )}
        </div>

        {(showCreateForm || editingId) && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.formTitleGroup}>
                <div style={styles.formIconBadge}>
                  <i
                    className={`bi ${editingId ? "bi-pencil-fill" : "bi-plus-circle"}`}
                    style={{ color: "#3b82f6", fontSize: 14 }}
                  ></i>
                </div>
                <div>
                  <h3 style={styles.formTitle}>
                    {editingId ? "Cập nhật đề tài" : "Tạo đề tài mới"}
                  </h3>
                  <p style={styles.formSubtitle}>
                    {editingId
                      ? "Chỉnh sửa thông tin đề tài bên dưới"
                      : "Điền thông tin đề tài mới và lưu lại."}
                  </p>
                </div>
              </div>
              <button
                style={styles.formCloseBtn}
                onClick={handleCancel}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form style={styles.formGrid} onSubmit={handleSubmit}>
              <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Tên đề tài</label>
                <input
                  className="lit-input"
                  style={styles.input}
                  name="topicname"
                  value={form.topicname}
                  onChange={handleChange}
                  placeholder="Nhập tên đề tài thực tập"
                  required
                />
              </div>

              <div style={styles.formSectionTitle}>Thời gian thực tập</div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Ngày bắt đầu</label>
                <input
                  className="lit-input"
                  style={styles.input}
                  name="startday"
                  type="date"
                  value={form.startday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Ngày kết thúc</label>
                <input
                  className="lit-input"
                  style={styles.input}
                  name="endday"
                  type="date"
                  value={form.endday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Số ngày / tuần</label>
                <input
                  className="lit-input"
                  style={styles.input}
                  name="workDaysPerWeek"
                  type="number"
                  min="1"
                  max="7"
                  value={form.workDaysPerWeek}
                  onChange={handleChange}
                  placeholder="Ví dụ: 3"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Số giờ / ngày</label>
                <input
                  className="lit-input"
                  style={styles.input}
                  name="workHoursPerDay"
                  type="number"
                  min="1"
                  max="24"
                  value={form.workHoursPerDay}
                  onChange={handleChange}
                  placeholder="Ví dụ: 8"
                />
              </div>

              <div style={styles.formSectionTitle}>Nội dung biểu mẫu</div>

              <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Mô tả công việc</label>
                <textarea
                  className="lit-textarea"
                  style={styles.textarea}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả nội dung thực tập, phạm vi công việc..."
                  required
                />
              </div>

              <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Yêu cầu / kế hoạch dự kiến</label>
                <textarea
                  className="lit-textarea"
                  style={styles.textarea}
                  name="requirement"
                  value={form.requirement}
                  onChange={handleChange}
                  placeholder="Nhập yêu cầu, kỹ năng hoặc kế hoạch công việc dự kiến..."
                  required
                />
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.submitBtn}>
                  <i className="bi bi-check-circle-fill"></i>
                  {editingId ? "Lưu thay đổi" : "Tạo đề tài"}
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={handleCancel}
                >
                  <i className="bi bi-x-circle"></i>
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        )}

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
                  <th style={styles.th}>Tên đề tài</th>
                  <th style={styles.th}>Trung tâm tiếp nhận</th>
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
                    <td colSpan="6" style={styles.emptyCell}>
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
                      className="lit-row"
                      style={{
                        ...styles.tableRow,
                        background:
                          editingId === topic._id ? "#eff6ff" : "#fff",
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.topicName}>{topic.topicname}</div>
                        <div style={styles.mutedText}>
                          {topic.requirement || topic.description}
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
                          <span className="lit-badge-open">
                            <i
                              className="bi bi-circle-fill"
                              style={{ fontSize: 7 }}
                            ></i>
                            Mở
                          </span>
                        ) : (
                          <span className="lit-badge-closed">
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
                            className={`lit-status-btn ${topic.status === "open" ? "lit-status-btn-close" : "lit-status-btn-open"}`}
                            style={styles.statusBtn}
                            onClick={() => handleToggleStatus(topic._id, topic.status)}
                            title={topic.status === "open" ? "Đóng đề tài" : "Mở đề tài"}
                          >
                            <i className={`bi ${topic.status === "open" ? "bi-lock-fill" : "bi-unlock-fill"}`}></i>
                            {topic.status === "open" ? "Đóng" : "Mở"}
                          </button>
                          <button
                            className="lit-edit-btn"
                            style={styles.editBtn}
                            onClick={() => handleEdit(topic)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil-fill"></i>
                            Sửa
                          </button>
                          <button
                            className="lit-delete-btn"
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
    minHeight: "70vh",
    padding: 0,
    background: "transparent",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
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
  createTopicBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    borderRadius: 8,
    border: "none",
    background: "#083c73",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.22s ease",
    whiteSpace: "nowrap",
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
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  clearSearch: {
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    marginLeft: 8,
  },
  noticeCard: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: 8,
    padding: "18px 22px",
    marginBottom: 24,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  noticeIcon: {
    width: 46,
    minWidth: 46,
    height: 46,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 18,
  },
  noticeTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },
  noticeText: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.6,
  },

  // FORM CARD (edit only)
  formCard: {
    marginBottom: 24,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #d7dee8",
    overflow: "hidden",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 28px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5eaf1",
  },
  formTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  formIconBadge: {
    width: 40,
    height: 40,
    background: "#dbeafe",
    border: "1.5px solid #bfdbfe",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 18,
    fontWeight: 800,
  },
  formSubtitle: {
    margin: "2px 0 0",
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: 500,
  },
  formCloseBtn: {
    width: 36,
    height: 36,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10,
    cursor: "pointer",
    color: "#ef4444",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    padding: "28px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  checkboxGroup: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: "12px 14px",
    background: "#ffffff",
    cursor: "pointer",
  },
  checkboxInput: {
    width: 18,
    height: 18,
    accentColor: "#083c73",
  },
  checkboxText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  checkboxTitle: {
    color: "#0f172a",
    fontSize: 13,
  },
  checkboxHint: {
    color: "#64748b",
    fontSize: 12,
  },
  formSectionTitle: {
    gridColumn: "1 / -1",
    color: "#083c73",
    fontSize: 13,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 18,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#f8fafc",
    transition: "all 0.2s ease",
    fontWeight: 500,
    boxSizing: "border-box",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    resize: "vertical",
    background: "#f8fafc",
    transition: "all 0.2s ease",
    fontWeight: 500,
    boxSizing: "border-box",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  buttonGroup: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: 12,
    marginTop: 4,
  },
  submitBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "13px 20px",
    borderRadius: 8,
    border: "none",
    background: "#083c73",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "none",
    transition: "0.25s ease",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  cancelBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "13px 20px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "0.25s ease",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },

  // TABLE
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
    color: "#64748b",
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
    minWidth: 980,
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
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.22s ease",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
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
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  statusBtn: {
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
    transition: "all 0.22s ease",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
};
