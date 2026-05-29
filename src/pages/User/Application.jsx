import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

export default function Application() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const id_user = user?.id || user?._id;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(Boolean(id_user));
  const [editModal, setEditModal] = useState(null); // application being edited
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (!id_user) {
      return;
    }

    const loadApplications = async () => {
      try {
        const res = await axios.get(`${API}/api/application/user/${id_user}`);
        setApplications(res.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadTopics = async () => {
      try {
        const res = await axios.get(`${API}/api/internship-topics`);
        setTopics(res.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách đề tài:", error);
      }
    };

    loadApplications();
    loadTopics();
  }, [id_user]);

  // ── Xóa hồ sơ ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/application/${id}`);
      setApplications((prev) => prev.filter((item) => item._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      alert("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: user?.username || "",
    studentCode: "",
    email: user?.email || "",
    sdt: "",
    major: "",
    course: "",
    note: "",
    topic: "",
  });
  const [createFiles, setCreateFiles] = useState({
    cvFile: null,
    transcriptFile: null,
  });

  const handleCreateChange = (e) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateFileChange = (e) => {
    const { name, files } = e.target;
    setCreateFiles((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API}/api/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.filePath;
  };

  const handleCreateSubmit = async () => {
    if (!createFiles.cvFile || !createFiles.transcriptFile) {
      return alert("Vui lòng chọn cả CV và bảng điểm để tạo hồ sơ.");
    }

    setSaving(true);

    try {
      const cvPath = await uploadFile(createFiles.cvFile);
      const transcriptPath = await uploadFile(createFiles.transcriptFile);

      const postForm = { ...createForm };
      if (!postForm.topic) {
        delete postForm.topic;
      }

      const res = await axios.post(`${API}/api/application`, {
        ...postForm,
        student: id_user,
        cvFile: cvPath,
        transcriptFile: transcriptPath,
      });

      const newApplication = res.data.data || res.data;
      
      // Populate topic details locally if topic is selected
      if (newApplication.topic && typeof newApplication.topic === "string") {
        const foundTopic = topics.find(t => t._id === newApplication.topic);
        if (foundTopic) {
          newApplication.topic = {
            _id: foundTopic._id,
            topicname: foundTopic.topicname,
            department: foundTopic.department,
            position: foundTopic.position,
            status: foundTopic.status,
            lecturer: foundTopic.lecturer
          };
        }
      }

      setApplications((prev) => [newApplication, ...prev]);
      setCreateModal(false);
      setCreateForm({
        fullName: user?.username || "",
        studentCode: "",
        email: user?.email || "",
        sdt: "",
        major: "",
        course: "",
        note: "",
        topic: "",
      });
      setCreateFiles({ cvFile: null, transcriptFile: null });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Tạo hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ── Mở modal sửa ────────────────────────────────────────────────────────────
  const openEdit = (item) => {
    setEditModal(item);
    setEditForm({
      fullName: item.fullName || "",
      studentCode: item.studentCode || "",
      email: item.email || "",
      sdt: item.sdt || "",
      major: item.major || "",
      course: item.course || "",
      note: item.note || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/application/${editModal._id}`, editForm);
      setApplications((prev) =>
        prev.map((item) =>
          item._id === editModal._id ? { ...item, ...editForm } : item,
        ),
      );
      setEditModal(null);
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ── Thống kê ────────────────────────────────────────────────────────────────
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "chờ duyệt").length,
    approved: applications.filter((a) => a.status === "đã duyệt").length,
    rejected: applications.filter((a) => a.status === "từ chối").length,
  };

  // ── Badge trạng thái ────────────────────────────────────────────────────────
  const getBadgeStyle = (status) => {
    switch (status) {
      case "đã duyệt":
      case "approved":
        return {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #bbf7d0",
        };
      case "từ chối":
      case "rejected":
        return {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        };
      default:
        return {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "đã duyệt":
      case "approved":
        return "✅ Đã duyệt";
      case "từ chối":
      case "rejected":
        return "❌ Từ chối";
      default:
        return "⏳ Chờ duyệt";
    }
  };

  const getFileLink = (path) => {
    if (!path) return "#";
    return path.startsWith("http") ? path : `${API}${path}`;
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: "#64748b", marginTop: 16 }}>
          Đang tải hồ sơ của bạn...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left" /> Quay lại
          </button>
          <h2 style={styles.pageTitle}>
            <i
              className="bi bi-folder2-open-fill"
              style={{ color: "#2563eb" }}
            />{" "}
            HỒ SƠ CỦA TÔI
          </h2>
          <p style={styles.subTitle}>
            Xin chào, <strong>{user?.username || "Sinh viên"}</strong> — Quản lý
            hồ sơ ứng tuyển thực tập của bạn
          </p>
        </div>
        <button style={styles.createBtn} onClick={() => setCreateModal(true)}>
          <i className="bi bi-plus-circle-fill" /> Tạo hồ sơ mới
        </button>
      </div>

      {/* ── Thống kê ── */}
      <div style={styles.statsGrid}>
        {[
          {
            label: "Tổng hồ sơ",
            value: stats.total,
            color: "#2563eb",
            bg: "#eff6ff",
          },
          {
            label: "Chờ duyệt",
            value: stats.pending,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Đã duyệt",
            value: stats.approved,
            color: "#16a34a",
            bg: "#f0fdf4",
          },
          {
            label: "Từ chối",
            value: stats.rejected,
            color: "#dc2626",
            bg: "#fef2f2",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              ...styles.statsCard,
              background: s.bg,
              borderTop: `4px solid ${s.color}`,
            }}
          >
            <span style={styles.statsLabel}>{s.label}</span>
            <span style={{ ...styles.statsValue, color: s.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Danh sách hồ sơ ── */}
      {applications.length === 0 ? (
        <div style={styles.emptyBox}>
          <i
            className="bi bi-inbox"
            style={{ fontSize: 48, color: "#cbd5e1" }}
          />
          <p style={{ marginTop: 12, color: "#64748b", fontSize: 16 }}>
            Bạn chưa có hồ sơ nào.
          </p>
          <button style={styles.createBtn} onClick={() => setCreateModal(true)}>
            <i className="bi bi-plus-circle-fill" /> Tạo hồ sơ ngay
          </button>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {applications.map((item) => (
            <div key={item._id} style={styles.card}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {(item.fullName || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.cardName}>
                    {item.fullName || "Ứng viên"}
                  </div>
                  <div style={styles.cardMSSV}>
                    MSSV: {item.studentCode || "---"}
                  </div>
                </div>
                <span
                  style={{ ...styles.badge, ...getBadgeStyle(item.status) }}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>

              {/* Card Body */}
              <div style={styles.cardBody}>
                {item.topic ? (
                  <>
                    <InfoRow
                      icon="bi-journal-text"
                      label="Đề tài"
                      value={item.topic.topicname}
                    />
                    <InfoRow
                      icon="bi-person-badge-fill"
                      label="Cán bộ hướng dẫn"
                      value={item.topic.lecturer?.username || "Chưa có"}
                    />
                    <InfoRow
                      icon="bi-briefcase-fill"
                      label="Vị trí thực tập"
                      value={item.topic.position}
                    />
                    <InfoRow
                      icon="bi-building"
                      label="Bộ môn"
                      value={item.topic.department}
                    />
                  </>
                ) : (
                  <InfoRow
                    icon="bi-journal-text"
                    label="Đề tài"
                    value={
                      <span style={{ color: "#64748b", fontStyle: "italic", fontWeight: 500 }}>
                        Hồ sơ tự do (Không có đề tài)
                      </span>
                    }
                  />
                )}

                <div style={{ borderTop: "1px dashed #e2e8f0", margin: "8px 0" }} />

                <InfoRow
                  icon="bi-envelope-fill"
                  label="Email liên hệ"
                  value={item.email}
                />
                <InfoRow
                  icon="bi-telephone-fill"
                  label="Số điện thoại"
                  value={item.sdt}
                />
                <InfoRow
                  icon="bi-mortarboard-fill"
                  label="Chuyên ngành"
                  value={item.major}
                />
                <InfoRow
                  icon="bi-calendar3"
                  label="Khóa học"
                  value={item.course}
                />
                {item.note && (
                  <InfoRow
                    icon="bi-sticky-fill"
                    label="Ghi chú"
                    value={item.note}
                  />
                )}
                <InfoRow
                  icon="bi-clock-fill"
                  label="Ngày tạo"
                  value={
                    item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                      : "---"
                  }
                />
              </div>

              {/* File links */}
              {(item.cvFile || item.transcriptFile) && (
                <div style={styles.fileRow}>
                  {item.cvFile && (
                    <a
                      href={getFileLink(item.cvFile)}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.fileLink}
                    >
                      <i className="bi bi-file-earmark-pdf-fill text-danger" />{" "}
                      CV
                    </a>
                  )}
                  {item.transcriptFile && (
                    <a
                      href={getFileLink(item.transcriptFile)}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.fileLink}
                    >
                      <i className="bi bi-file-earmark-spreadsheet-fill text-success" />{" "}
                      Bảng điểm
                    </a>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={styles.cardFooter}>
                <button
                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                  onClick={() => openEdit(item)}
                  disabled={item.status === "đã duyệt"}
                  title={
                    item.status === "đã duyệt"
                      ? "Hồ sơ đã duyệt, không thể chỉnh sửa"
                      : ""
                  }
                >
                  <i className="bi bi-pencil-fill" /> Sửa
                </button>
                <button
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                  onClick={() => setDeleteConfirm(item._id)}
                >
                  <i className="bi bi-trash3-fill" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Xác nhận xóa ── */}
      {deleteConfirm && (
        <ModalOverlay onClose={() => setDeleteConfirm(null)}>
          <div style={styles.confirmBox}>
            <i
              className="bi bi-exclamation-triangle-fill"
              style={{ fontSize: 40, color: "#ef4444" }}
            />
            <h4 style={{ margin: "12px 0 6px", color: "#1e293b" }}>
              Xác nhận xóa
            </h4>
            <p style={{ color: "#64748b", marginBottom: 20 }}>
              Bạn có chắc muốn xóa hồ sơ này không? Hành động này không thể hoàn
              tác.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                style={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </button>
              <button
                style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                <i className="bi bi-trash3-fill" /> Xóa hồ sơ
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {createModal && (
        <ModalOverlay onClose={() => setCreateModal(false)}>
          <div style={styles.editBox}>
            <div style={styles.editHeader}>
              <h4 style={{ margin: 0, color: "#1e3a8a" }}>
                <i className="bi bi-file-earmark-plus-fill" /> Tạo hồ sơ mới
              </h4>
              <button
                style={styles.closeBtn}
                onClick={() => setCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.editBody}>
              <div style={styles.formGrid}>
                <FormField
                  label="Họ và tên"
                  name="fullName"
                  value={createForm.fullName}
                  onChange={handleCreateChange}
                />
                <FormField
                  label="Mã số sinh viên"
                  name="studentCode"
                  value={createForm.studentCode}
                  onChange={handleCreateChange}
                />
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                />
                <FormField
                  label="Số điện thoại"
                  name="sdt"
                  value={createForm.sdt}
                  onChange={handleCreateChange}
                />
                <FormField
                  label="Chuyên ngành"
                  name="major"
                  value={createForm.major}
                  onChange={handleCreateChange}
                />
                <FormField
                  label="Khóa học"
                  name="course"
                  value={createForm.course}
                  onChange={handleCreateChange}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={styles.formLabel}>Đề tài thực tập</label>
                <select
                  name="topic"
                  value={createForm.topic}
                  onChange={handleCreateChange}
                  style={styles.formInput}
                >
                  <option value="">-- Hồ sơ tự do (Không cần đề tài) --</option>
                  {topics
                    .filter((t) => t.status === "open")
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.topicname} - {t.lecturer?.username || "Cán bộ"} ({t.position})
                      </option>
                    ))}
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={styles.formLabel}>Ghi chú</label>
                <textarea
                  name="note"
                  value={createForm.note}
                  onChange={handleCreateChange}
                  rows={3}
                  style={{ ...styles.formInput, resize: "vertical" }}
                  placeholder="Nhập ghi chú (nếu có)..."
                />
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
                <div>
                  <label style={styles.formLabel}>CV</label>
                  <input
                    type="file"
                    name="cvFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCreateFileChange}
                    style={styles.formInput}
                  />
                  {createFiles.cvFile && (
                    <small style={{ color: "#334155" }}>
                      Đã chọn: {createFiles.cvFile.name}
                    </small>
                  )}
                </div>
                <div>
                  <label style={styles.formLabel}>Bảng điểm</label>
                  <input
                    type="file"
                    name="transcriptFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCreateFileChange}
                    style={styles.formInput}
                  />
                  {createFiles.transcriptFile && (
                    <small style={{ color: "#334155" }}>
                      Đã chọn: {createFiles.transcriptFile.name}
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.editFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => setCreateModal(false)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                style={{ ...styles.actionBtn, ...styles.saveBtn }}
                onClick={handleCreateSubmit}
                disabled={saving}
              >
                {saving ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <i className="bi bi-save-fill" /> Tạo hồ sơ
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal Sửa hồ sơ ── */}
      {editModal && (
        <ModalOverlay onClose={() => setEditModal(null)}>
          <div style={styles.editBox}>
            <div style={styles.editHeader}>
              <h4 style={{ margin: 0, color: "#1e3a8a" }}>
                <i className="bi bi-pencil-square" /> Chỉnh sửa hồ sơ
              </h4>
              <button
                style={styles.closeBtn}
                onClick={() => setEditModal(null)}
              >
                ✕
              </button>
            </div>

            <div style={styles.editBody}>
              {editModal.topic ? (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>Đề tài đăng ký:</div>
                  <div style={{ fontSize: 14, color: "#1e3a8a", marginTop: 2, fontWeight: 600 }}>
                    {editModal.topic.topicname}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Cán bộ hướng dẫn: <strong>{editModal.topic.lecturer?.username || "Chưa rõ"}</strong> | Vị trí: <strong>{editModal.topic.position}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Loại hồ sơ:</div>
                  <div style={{ fontSize: 14, color: "#334155", marginTop: 2, fontStyle: "italic" }}>
                    Hồ sơ tự do (Không đăng ký đề tài)
                  </div>
                </div>
              )}
              <div style={styles.formGrid}>
                <FormField
                  label="Họ và tên"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                />
                <FormField
                  label="Mã số sinh viên"
                  name="studentCode"
                  value={editForm.studentCode}
                  onChange={handleEditChange}
                />
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
                <FormField
                  label="Số điện thoại"
                  name="sdt"
                  value={editForm.sdt}
                  onChange={handleEditChange}
                />
                <FormField
                  label="Chuyên ngành"
                  name="major"
                  value={editForm.major}
                  onChange={handleEditChange}
                />
                <FormField
                  label="Khóa học"
                  name="course"
                  value={editForm.course}
                  onChange={handleEditChange}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={styles.formLabel}>Ghi chú</label>
                <textarea
                  name="note"
                  value={editForm.note}
                  onChange={handleEditChange}
                  rows={3}
                  style={{ ...styles.formInput, resize: "vertical" }}
                  placeholder="Nhập ghi chú (nếu có)..."
                />
              </div>
            </div>

            <div style={styles.editFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => setEditModal(null)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                style={{ ...styles.actionBtn, ...styles.saveBtn }}
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <i className="bi bi-check2-circle" /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div style={styles.infoRow}>
      <i className={`bi ${icon}`} style={styles.infoIcon} />
      <span style={styles.infoLabel}>{label}:</span>
      <span style={styles.infoValue}>{value || "---"}</span>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={styles.formLabel}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={styles.formInput}
        placeholder={`Nhập ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  container: {
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },

  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  },

  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },

  backBtn: {
    padding: "6px 14px",
    background: "transparent",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 10,
    transition: "0.2s",
    display: "block",
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#1e3a8a",
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

  createBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
    transition: "0.2s",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },

  statsCard: {
    padding: "18px 20px",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  statsLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },

  statsValue: {
    fontSize: 28,
    fontWeight: 800,
  },

  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: 16,
    border: "2px dashed #e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s, transform 0.2s",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "18px 20px 14px",
    borderBottom: "1px solid #f1f5f9",
    background: "linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(37,99,235,0.25)",
  },

  cardName: {
    fontWeight: 700,
    color: "#1e3a8a",
    fontSize: 15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  cardMSSV: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  cardBody: {
    padding: "16px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 13,
    color: "#334155",
  },

  infoIcon: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 1,
    flexShrink: 0,
  },

  infoLabel: {
    fontWeight: 600,
    flexShrink: 0,
    color: "#475569",
  },

  infoValue: {
    color: "#334155",
    wordBreak: "break-word",
  },

  fileRow: {
    display: "flex",
    gap: 10,
    padding: "10px 20px",
    borderTop: "1px solid #f1f5f9",
    flexWrap: "wrap",
  },

  fileLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    textDecoration: "none",
    fontWeight: 500,
    transition: "0.2s",
  },

  cardFooter: {
    display: "flex",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #f1f5f9",
    background: "#fafafa",
  },

  actionBtn: {
    flex: 1,
    padding: "9px 14px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "0.2s",
  },

  editBtn: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
  },

  deleteBtn: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  saveBtn: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
  },

  cancelBtn: {
    padding: "9px 20px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },

  // ── Modal ──
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
    backdropFilter: "blur(4px)",
  },

  confirmBox: {
    background: "#fff",
    borderRadius: 16,
    padding: "36px 32px",
    textAlign: "center",
    maxWidth: 400,
    width: "100%",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  },

  editBox: {
    background: "#fff",
    borderRadius: 16,
    maxWidth: 640,
    width: "100%",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  editHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    background: "linear-gradient(135deg, #f8faff, #eff6ff)",
    borderRadius: "16px 16px 0 0",
  },

  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#64748b",
    lineHeight: 1,
    padding: 4,
  },

  editBody: {
    padding: "24px",
  },

  editFooter: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
    background: "#fafafa",
    borderRadius: "0 0 16px 16px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 14,
  },

  formLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 6,
  },

  formInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    transition: "border-color 0.2s",
  },
};
