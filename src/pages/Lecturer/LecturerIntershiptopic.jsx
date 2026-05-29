import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api/internship-topics";

export default function LecturerIntershiptopic() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  // Hỗ trợ cả _id và id
  const lecturerId = user._id || user.id;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    department: "",
    position: "",
    topicname: "",
    description: "",
    requirement: "",
    quantity: 1,
    startday: "",
    endday: "",
  });

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
  }, [lecturerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleEdit = (topic) => {
    setEditingId(topic._id);
    setForm({
      department: topic.department,
      position: topic.position,
      topicname: topic.topicname,
      description: topic.description,
      requirement: topic.requirement,
      quantity: topic.quantity,
      startday: topic.startday.split("T")[0],
      endday: topic.endday.split("T")[0],
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      department: "",
      position: "",
      topicname: "",
      description: "",
      requirement: "",
      quantity: 1,
      startday: "",
      endday: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lecturerId) {
      alert("Không tìm thấy thông tin giảng viên.");
      return;
    }

    if (editingId) {
      // Chế độ cập nhật
      try {
        const payload = {
          ...form,
          lecturer: lecturerId,
        };
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
      // Chế độ tạo mới
      try {
        const payload = {
          ...form,
          lecturer: lecturerId,
          status: "open",
        };
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Tạo đề tài thất bại");
        setTopics((prev) => [data.data, ...prev]);
        setForm({
          department: "",
          position: "",
          topicname: "",
          description: "",
          requirement: "",
          quantity: 1,
          startday: "",
          endday: "",
        });
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
      topic.description.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p>⏳ Đang tải đề tài của bạn...</p>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
          Giảng viên ID: {lecturerId || "Không tìm thấy"}
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topSection}>
        <div>
          <h2 style={styles.title}>Đề tài của giảng viên</h2>
          <p style={styles.subtitle}>
            Tạo mới, xem và quản lý đề tài thực tập do bạn đề xuất.
          </p>
        </div>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo đề tài, bộ môn hoặc vị trí..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>
          {editingId ? "Cập nhật đề tài" : "Tạo đề tài mới"}
        </h3>
        <form style={styles.formGrid} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            name="topicname"
            value={form.topicname}
            onChange={handleChange}
            placeholder="Tên đề tài"
            required
          />
          <input
            style={styles.input}
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Bộ môn"
            required
          />
          <input
            style={styles.input}
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Vị trí/Loại đề tài"
            required
          />
          <input
            style={styles.input}
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Số lượng sinh viên"
            required
          />
          <input
            style={styles.input}
            name="startday"
            type="date"
            value={form.startday}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="endday"
            type="date"
            value={form.endday}
            onChange={handleChange}
            required
          />
          <textarea
            style={styles.textarea}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả đề tài"
            required
          />
          <textarea
            style={styles.textarea}
            name="requirement"
            value={form.requirement}
            onChange={handleChange}
            placeholder="Yêu cầu đề tài"
            required
          />
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitBtn}>
              {editingId ? "Cập nhật" : "Lưu đề tài"}
            </button>
            {editingId && (
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={handleCancel}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tên đề tài</th>
              <th style={styles.th}>Bộ môn / Vị trí</th>
              <th style={styles.th}>Số lượng</th>
              <th style={styles.th}>Thời gian</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.thCenter}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyCell}>
                  Chưa có đề tài nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => (
                <tr key={topic._id}>
                  <td style={styles.td}>
                    <div style={styles.topicName}>{topic.topicname}</div>
                    <div style={styles.mutedText}>{topic.description}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{topic.department}</div>
                    <div style={styles.mutedText}>{topic.position}</div>
                  </td>
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
                      style={{ ...styles.actionBtn, ...styles.editBtn }}
                      onClick={() => handleEdit(topic)}
                    >
                      Sửa
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
    minHeight: "100vh",
    padding: "28px",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #eef4ff 45%, #f8fafc 100%)",
    fontFamily: "'Inter', sans-serif",
  },

  topSection: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "26px 30px",
    boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
    border: "1px solid #e2e8f0",
  },

  title: {
    fontSize: "34px",
    margin: 0,
    color: "#0f172a",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
    fontWeight: "500",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #dbe4f0",
    borderRadius: "16px",
    padding: "0 16px",
    minWidth: "320px",
    height: "52px",
  },

  searchIcon: {
    color: "#94a3b8",
    fontSize: 16,
    position: "absolute",
    left: "16px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#0f172a",
    background: "transparent",
    paddingLeft: "28px",
    fontWeight: "500",
  },

  formCard: {
    marginBottom: "30px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "26px",
    boxShadow: "0 15px 40px rgba(15,23,42,0.06)",
    border: "1px solid #e2e8f0",
  },

  formTitle: {
    margin: 0,
    marginBottom: "24px",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "800",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },

  buttonGroup: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "14px",
    marginTop: "8px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #dbe4f0",
    borderRadius: "16px",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    transition: "0.2s ease",
    fontWeight: "500",
    boxSizing: "border-box",
  },

  textarea: {
    minHeight: "120px",
    padding: "14px 16px",
    border: "1px solid #dbe4f0",
    borderRadius: "16px",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    resize: "vertical",
    background: "#f8fafc",
    transition: "0.2s ease",
    fontWeight: "500",
    boxSizing: "border-box",
  },

  submitBtn: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37,99,235,0.25)",
    transition: "0.25s ease",
  },

  cancelBtn: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#64748b",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "0.25s ease",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#ffffff",
    borderRadius: "26px",
    boxShadow: "0 15px 40px rgba(15,23,42,0.06)",
    border: "1px solid #e2e8f0",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "980px",
  },

  th: {
    textAlign: "left",
    padding: "20px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },

  thCenter: {
    textAlign: "center",
    padding: "20px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },

  td: {
    padding: "20px",
    verticalAlign: "top",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px",
    background: "#fff",
  },

  tdCenter: {
    padding: "20px",
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px",
    background: "#fff",
  },

  emptyCell: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px",
    background: "#fff",
  },

  topicName: {
    fontWeight: "700",
    marginBottom: "8px",
    color: "#0f172a",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  mutedText: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "8px",
    lineHeight: 1.6,
  },

  badgeOpen: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    color: "#166534",
    background: "#dcfce7",
    fontWeight: "700",
    fontSize: "13px",
    minWidth: "80px",
  },

  badgeClosed: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    color: "#991b1b",
    background: "#fee2e2",
    fontWeight: "700",
    fontSize: "13px",
    minWidth: "80px",
  },

  actionBtn: {
    border: "none",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    marginRight: "8px",
    transition: "0.25s ease",
    minWidth: "72px",
  },

  editBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    boxShadow: "0 8px 18px rgba(59,130,246,0.25)",
  },

  deleteBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    boxShadow: "0 8px 18px rgba(239,68,68,0.25)",
  },
};
