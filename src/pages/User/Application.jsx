import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DocumentExportModal from "../../components/DocumentExportModal";
import {
  defaultInternshipCenter,
  fetchInternshipCenter,
} from "../../config/internshipCenter";
import { fetchProgressData } from "../../utils/progressData";

const API = "http://localhost:5000";

const REPORT_STATUS_STYLE = {
  "chờ duyệt": { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
  "đã duyệt": { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
  "cần chỉnh sửa": { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const formatDateVN = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
};

const reportDateRange = (report) => {
  const from = formatDateVN(report?.fromDate);
  const to = formatDateVN(report?.toDate);
  if (from && to) return `${from} - ${to}`;
  if (from) return `Từ ${from}`;
  if (to) return `Đến ${to}`;
  return "Chưa nhập thời gian";
};

const validateInternshipForm = (form) => {
  if (!form.fullName?.trim()) return "Vui lòng nhập họ tên sinh viên.";
  if (!form.studentCode?.trim()) return "Vui lòng nhập mã số sinh viên.";
  if (!form.major?.trim()) return "Vui lòng nhập chuyên ngành.";
  return "";
};

export default function Application() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const id_user = user?.id || user?._id;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(Boolean(id_user));
  const [editModal, setEditModal] = useState(null); // application being edited
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Báo cáo tiến độ ─────────────────────────────────────────────────────────
  const [reportModal, setReportModal] = useState(null); // application đang xem báo cáo
  const [reports, setReports] = useState([]); // danh sách báo cáo của application đang mở
  const [weeklyAssignments, setWeeklyAssignments] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [newReportForm, setNewReportForm] = useState({ week: "", content: "", fromDate: "", toDate: "", hoursOrSessions: "" });
  const [reportSaving, setReportSaving] = useState(false);
  const [editReportId, setEditReportId] = useState(null);
  const [editReportForm, setEditReportForm] = useState({ content: "", fromDate: "", toDate: "", hoursOrSessions: "" });
  const [documentModal, setDocumentModal] = useState(null);
  const [documentReports, setDocumentReports] = useState([]);
  const [documentAssignments, setDocumentAssignments] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [center, setCenter] = useState(defaultInternshipCenter);

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

    loadApplications();
    fetchInternshipCenter(API).then(setCenter);
  }, [id_user]);

  // ── Báo cáo tiến độ ─────────────────────────────────────────────────────────
  const openReportModal = async (application) => {
    setReportModal(application);
    setReportsLoading(true);
    setNewReportForm({ week: "", content: "", fromDate: "", toDate: "", hoursOrSessions: "" });
    setEditReportId(null);
    try {
      const { reports: loadedReports, assignments } = await fetchProgressData(application._id);
      setReports(loadedReports);
      setWeeklyAssignments(assignments);
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
      setReports([]);
      setWeeklyAssignments([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const openDocumentModal = async (application) => {
    setDocumentModal(application);
    setDocumentLoading(true);
    try {
      const { reports: loadedReports, assignments } = await fetchProgressData(application._id);
      setDocumentReports(loadedReports);
      setDocumentAssignments(assignments);
    } catch (err) {
      setDocumentReports([]);
      setDocumentAssignments([]);
      alert(err.message || "Không thể tải dữ liệu biểu mẫu.");
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleCreateReport = async () => {
    const week = Number(newReportForm.week);
    if (!Number.isInteger(week) || week < 1 || week > 12) {
      return alert("Vui lòng chọn số tuần từ 1 đến 12.");
    }
    if (!newReportForm.fromDate || !newReportForm.toDate) {
      return alert("Vui lòng nhập thời gian bắt đầu và kết thúc của tuần.");
    }
    if (new Date(newReportForm.fromDate) > new Date(newReportForm.toDate)) {
      return alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
    }
    if (!newReportForm.hoursOrSessions.trim()) {
      return alert("Vui lòng nhập số buổi hoặc số giờ thực tập trong tuần.");
    }
    if (!newReportForm.content.trim()) {
      return alert("Vui lòng nhập nội dung công việc.");
    }
    setReportSaving(true);
    try {
      const res = await axios.post(`${API}/api/weekly-reports`, {
        student: id_user,
        application: reportModal._id,
        week,
        content: newReportForm.content.trim(),
        fromDate: newReportForm.fromDate || undefined,
        toDate: newReportForm.toDate || undefined,
        hoursOrSessions: newReportForm.hoursOrSessions.trim(),
      });
      setReports((prev) => [...prev, res.data.data].sort((a, b) => a.week - b.week));
      setNewReportForm({ week: "", content: "", fromDate: "", toDate: "", hoursOrSessions: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Tạo báo cáo thất bại");
    } finally {
      setReportSaving(false);
    }
  };

  const handleUpdateReportContent = async (id) => {
    if (!editReportForm.content.trim()) {
      return alert("Vui lòng nhập nội dung công việc.");
    }
    if (!editReportForm.fromDate || !editReportForm.toDate) {
      return alert("Vui lòng nhập thời gian bắt đầu và kết thúc của tuần.");
    }
    if (new Date(editReportForm.fromDate) > new Date(editReportForm.toDate)) {
      return alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
    }
    if (!editReportForm.hoursOrSessions.trim()) {
      return alert("Vui lòng nhập số buổi hoặc số giờ thực tập trong tuần.");
    }

    setReportSaving(true);
    try {
      const res = await axios.patch(`${API}/api/weekly-reports/${id}/content`, {
        content: editReportForm.content.trim(),
        fromDate: editReportForm.fromDate || undefined,
        toDate: editReportForm.toDate || undefined,
        hoursOrSessions: editReportForm.hoursOrSessions.trim(),
      });
      setReports((prev) => prev.map((r) => (r._id === id ? res.data.data : r)));
      setEditReportId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setReportSaving(false);
    }
  };

  const beginEditReport = (report) => {
    setEditReportId(report._id);
    setEditReportForm({
      content: report.content || "",
      fromDate: toDateInputValue(report.fromDate),
      toDate: toDateInputValue(report.toDate),
      hoursOrSessions: report.hoursOrSessions || "",
    });
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Xóa báo cáo tuần này?")) return;
    try {
      await axios.delete(`${API}/api/weekly-reports/${id}`);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  // ── Xóa hồ sơ ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có muốn xóa hồ sơ này?")) return;

    try {
      await axios.delete(`${API}/api/application/${id}`);
      setApplications((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error(error);
      alert("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  // ── Mở modal sửa ────────────────────────────────────────────────────────────
  const openEdit = (item) => {
    setEditModal(item);
    setEditForm({
      fullName: item.fullName || "",
      studentCode: item.studentCode || "",
      major: item.major || "",
      classCode: item.classCode || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async () => {
    const validationError = validateInternshipForm(editForm);
    if (validationError) {
      return alert(validationError);
    }
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
        return "Đã duyệt";
      case "từ chối":
      case "rejected":
        return "Từ chối";
      default:
        return "Chờ duyệt";
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
            hồ sơ đã nộp, báo cáo tiến độ và biểu mẫu thực tập của bạn
          </p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate("/topics")}>
          <i className="bi bi-plus-circle-fill" /> Chọn đề tài để nộp hồ sơ
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
          <button style={styles.createBtn} onClick={() => navigate("/topics")}>
            <i className="bi bi-plus-circle-fill" /> Chọn đề tài để nộp hồ sơ
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
                      icon="bi-building"
                      label="Trung tâm tiếp nhận"
                      value={center.name}
                    />
                    <InfoRow
                      icon="bi-calendar-range"
                      label="Thời gian thực tập"
                      value={
                        formatDateVN(item.topic.startday || item.startDate) &&
                        formatDateVN(item.topic.endday || item.endDate)
                          ? `${formatDateVN(item.topic.startday || item.startDate)} - ${formatDateVN(item.topic.endday || item.endDate)}`
                          : "Chưa cập nhật"
                      }
                    />
                  </>
                ) : (
                  <InfoRow
                    icon="bi-journal-text"
                    label="Đề tài"
                    value={
                      <span style={{ color: "#64748b", fontStyle: "italic", fontWeight: 500 }}>
                        Hồ sơ chưa gắn đề tài
                      </span>
                    }
                  />
                )}

                {item.status === "đã duyệt" && (
                  <>
                    <div style={{ borderTop: "1px dashed #e2e8f0", margin: "8px 0" }} />
                    <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "8px" }}>
                      <div style={{ fontWeight: "700", color: "#1e3a8a", fontSize: "13px", marginBottom: "8px", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className="bi bi-patch-check-fill text-success" /> KẾT QUẢ THỰC TẬP:
                      </div>
                      <InfoRow
                        icon="bi-activity"
                        label="Tiến độ"
                        value={
                          <span style={{
                            fontWeight: "600",
                            color: item.internshipStatus === "đã hoàn thành" ? "#16a34a" : item.internshipStatus === "tạm dừng" ? "#dc2626" : "#0284c7"
                          }}>
                            {item.internshipStatus === "đã hoàn thành" ? "Đã hoàn thành" : item.internshipStatus === "tạm dừng" ? "Tạm dừng" : "Đang thực tập"}
                          </span>
                        }
                      />
                      <InfoRow
                        icon="bi-award-fill"
                        label="Điểm số"
                        value={item.score !== null && item.score !== undefined ? <strong style={{ color: "#d97706" }}>{item.score} / 10</strong> : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa chấm điểm</span>}
                      />
                      <InfoRow
                        icon="bi-chat-left-text-fill"
                        label="Nhận xét"
                        value={item.feedback || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa có nhận xét</span>}
                      />
                    </div>
                  </>
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
              {(item.cvFile ||
                item.transcriptFile ||
                item.citizenIdFrontFile ||
                item.citizenIdBackFile) && (
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
                  {item.citizenIdFrontFile && (
                    <a
                      href={getFileLink(item.citizenIdFrontFile)}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.fileLink}
                    >
                      <i className="bi bi-card-image text-primary" /> CCCD trước
                    </a>
                  )}
                  {item.citizenIdBackFile && (
                    <a
                      href={getFileLink(item.citizenIdBackFile)}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.fileLink}
                    >
                      <i className="bi bi-card-image text-primary" /> CCCD sau
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
                {item.status === "đã duyệt" && (
                  <>
                    <button
                      style={{ ...styles.actionBtn, ...styles.reportBtn }}
                      onClick={() => openReportModal(item)}
                      title="Xem và nộp báo cáo tiến độ theo tuần"
                    >
                      <i className="bi bi-clipboard-data" /> Báo cáo tiến độ
                    </button>
                    <button
                      style={{ ...styles.actionBtn, ...styles.documentBtn }}
                      onClick={() => openDocumentModal(item)}
                      title="Xuất 3 biểu mẫu Word"
                    >
                      <i className="bi bi-file-earmark-word-fill" /> Biểu mẫu
                    </button>
                  </>
                )}
                <button
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                  onClick={() => handleDelete(item._id)}
                >
                  <i className="bi bi-trash3-fill" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Sửa hồ sơ ── */}
      {editModal && (
        <ModalOverlay onClose={() => setEditModal(null)}>
          <div style={styles.editBox}>
            <div style={styles.editHeader}>
              <h4 style={{ margin: 0, color: "#083c73" }}>
                <i className="bi bi-pencil-square" /> Chỉnh sửa hồ sơ thực tập
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
                    Cán bộ hướng dẫn: <strong>{editModal.topic.lecturer?.username || "Chưa rõ"}</strong> | Trung tâm: <strong>{center.name}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Loại hồ sơ:</div>
                  <div style={{ fontSize: 14, color: "#334155", marginTop: 2, fontStyle: "italic" }}>
                    Hồ sơ chưa gắn đề tài
                  </div>
                </div>
              )}

              <h5 style={{ fontWeight: 700, color: "#083c73", borderBottom: "2px solid #f29111", paddingBottom: "5px", marginBottom: "15px" }}>
                1. Thông tin sinh viên
              </h5>
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
                  label="Mã lớp"
                  name="classCode"
                  value={editForm.classCode}
                  onChange={handleEditChange}
                />
                <FormField
                  label="Chuyên ngành"
                  name="major"
                  value={editForm.major}
                  onChange={handleEditChange}
                />
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: "12px 16px",
                  border: "1px solid #d7dee8",
                  borderRadius: 8,
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Thông tin trung tâm tiếp nhận, thời gian thực tập, điều kiện làm
                việc và kế hoạch công việc được lấy từ đề tài đã đăng ký.
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

      {documentModal && (
        <DocumentExportModal
          application={documentModal}
          weeklyAssignments={documentAssignments}
          weeklyReports={documentReports}
          loading={documentLoading}
          onClose={() => setDocumentModal(null)}
        />
      )}

      {/* ── Modal Báo cáo tiến độ ── */}
      {reportModal && (
        <ModalOverlay onClose={() => { setReportModal(null); setEditReportId(null); }}>
          <div style={{ ...styles.editBox, maxWidth: 860 }}>
            <div style={styles.editHeader}>
              <div>
                <h4 style={{ margin: 0, color: "#1e3a8a", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="bi bi-clipboard-data" /> Báo cáo tiến độ hàng tuần
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  {reportModal.fullName} — {reportModal.topic?.topicname || "Chưa gắn đề tài"}
                </p>
              </div>
              <button style={styles.closeBtn} onClick={() => { setReportModal(null); setEditReportId(null); }}>✕</button>
            </div>

            <div style={{ ...styles.editBody, maxHeight: "72vh", overflowY: "auto" }}>
              <div style={styles.assignmentReadBox}>
                <h5 style={styles.reportSectionTitle}>
                  <i className="bi bi-calendar2-week" style={{ color: "#1d4ed8" }} /> Kế hoạch giao việc
                </h5>
                {weeklyAssignments.length === 0 ? (
                  <div style={styles.assignmentEmpty}>Chưa có kế hoạch giao việc theo tuần.</div>
                ) : (
                  <div style={styles.assignmentReadList}>
                    {weeklyAssignments.map((item) => (
                      <div key={item._id || item.week} style={styles.assignmentReadItem}>
                        <span style={styles.reportWeekBadge}>Tuần {item.week}</span>
                        <span style={styles.assignmentReadContent}>{item.content}</span>
                        <span style={styles.assignmentReadHours}>{item.hoursOrSessions || "---"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form tạo báo cáo mới */}
              <div style={styles.reportCreateBox}>
                <h5 style={styles.reportSectionTitle}><i className="bi bi-plus-circle-fill" style={{ color: "#2563eb" }} /> Thêm báo cáo tuần mới</h5>
                <div style={{ display: "grid", gridTemplateColumns: "110px repeat(3, minmax(140px, 1fr))", gap: 10, alignItems: "flex-start" }}>
                  <div>
                    <label style={styles.formLabel}>Số tuần</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      style={styles.formInput}
                      placeholder="VD: 1"
                      value={newReportForm.week}
                      onChange={(e) => setNewReportForm({ ...newReportForm, week: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Từ ngày</label>
                    <input
                      type="date"
                      style={styles.formInput}
                      value={newReportForm.fromDate}
                      onChange={(e) => setNewReportForm({ ...newReportForm, fromDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Đến ngày</label>
                    <input
                      type="date"
                      style={styles.formInput}
                      value={newReportForm.toDate}
                      onChange={(e) => setNewReportForm({ ...newReportForm, toDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Số buổi / giờ</label>
                    <input
                      style={styles.formInput}
                      placeholder="VD: 6 buổi / 24 giờ"
                      value={newReportForm.hoursOrSessions}
                      onChange={(e) => setNewReportForm({ ...newReportForm, hoursOrSessions: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={styles.formLabel}>Nội dung công việc đã thực hiện</label>
                    <textarea
                      style={{ ...styles.formInput, resize: "vertical", minHeight: 80 }}
                      placeholder="Mô tả công việc đã làm trong tuần, kết quả đạt được, khó khăn gặp phải..."
                      value={newReportForm.content}
                      onChange={(e) => setNewReportForm({ ...newReportForm, content: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button
                    style={{ ...styles.actionBtn, flex: "none", padding: "9px 20px", ...styles.saveBtn }}
                    onClick={handleCreateReport}
                    disabled={reportSaving}
                  >
                    <i className="bi bi-save-fill" /> {reportSaving ? "Đang lưu..." : "Nộp báo cáo"}
                  </button>
                </div>
              </div>

              {/* Danh sách báo cáo */}
              <h5 style={{ ...styles.reportSectionTitle, marginTop: 20 }}>
                <i className="bi bi-list-check" style={{ color: "#2563eb" }} /> Lịch sử báo cáo tiến độ ({reports.length} tuần)
              </h5>

              {reportsLoading ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>Đang tải báo cáo tiến độ...</p>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0", fontStyle: "italic" }}>
                  Chưa có báo cáo tiến độ nào được ghi nhận.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reports.map((report) => (
                    <div key={report._id} style={styles.reportCard}>
                      <div style={styles.reportCardHeader}>
                        <span style={styles.reportWeekBadge}>Tuần {report.week}</span>
                        <span style={{ ...styles.reportStatusBadge, ...REPORT_STATUS_STYLE[report.status] }}>
                          {report.status}
                        </span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
                          {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div style={styles.reportMetaRow}>
                        <span>
                          <i className="bi bi-calendar-week" /> {reportDateRange(report)}
                        </span>
                        <span>
                          <i className="bi bi-clock-history" /> {report.hoursOrSessions || "Chưa nhập số buổi/giờ"}
                        </span>
                      </div>

                      {/* Nội dung báo cáo */}
                      {editReportId === report._id ? (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 10 }}>
                            <div>
                              <label style={styles.formLabel}>Từ ngày</label>
                              <input
                                type="date"
                                style={styles.formInput}
                                value={editReportForm.fromDate}
                                onChange={(e) => setEditReportForm({ ...editReportForm, fromDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={styles.formLabel}>Đến ngày</label>
                              <input
                                type="date"
                                style={styles.formInput}
                                value={editReportForm.toDate}
                                onChange={(e) => setEditReportForm({ ...editReportForm, toDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={styles.formLabel}>Số buổi / giờ</label>
                              <input
                                style={styles.formInput}
                                value={editReportForm.hoursOrSessions}
                                onChange={(e) => setEditReportForm({ ...editReportForm, hoursOrSessions: e.target.value })}
                              />
                            </div>
                          </div>
                          <textarea
                            style={{ ...styles.formInput, resize: "vertical", minHeight: 80 }}
                            value={editReportForm.content}
                            onChange={(e) => setEditReportForm({ ...editReportForm, content: e.target.value })}
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                            <button style={styles.cancelBtn} onClick={() => setEditReportId(null)}>Hủy</button>
                            <button
                              style={{ ...styles.actionBtn, flex: "none", padding: "7px 16px", ...styles.saveBtn }}
                              onClick={() => handleUpdateReportContent(report._id)}
                              disabled={reportSaving}
                            >
                              {reportSaving ? "Đang lưu..." : "Lưu"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={styles.reportContent}>{report.content}</p>
                      )}

                      {/* Nhận xét giảng viên */}
                      {report.feedback && (
                        <div style={styles.reportFeedbackBox}>
                          <span style={{ fontWeight: 700, color: "#1e40af", fontSize: 12 }}>
                            <i className="bi bi-chat-left-quote-fill me-1" /> Nhận xét giảng viên:
                          </span>
                          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#334155" }}>{report.feedback}</p>
                        </div>
                      )}

                      {/* Nút sửa/xóa (chỉ khi chưa duyệt) */}
                      {report.status !== "đã duyệt" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button
                            style={{ ...styles.actionBtn, flex: "none", padding: "5px 12px", ...styles.editBtn, fontSize: 12 }}
                            onClick={() => beginEditReport(report)}
                          >
                            <i className="bi bi-pencil-fill" /> Sửa
                          </button>
                          <button
                            style={{ ...styles.actionBtn, flex: "none", padding: "5px 12px", ...styles.deleteBtn, fontSize: 12 }}
                            onClick={() => handleDeleteReport(report._id)}
                          >
                            <i className="bi bi-trash3-fill" /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
    padding: 0,
    background: "transparent",
    minHeight: "70vh",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
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
    marginBottom: 18,
    background: "#fff",
    border: "1px solid #d7dee8",
    borderLeft: "4px solid #f29111",
    borderRadius: 8,
    padding: "18px 20px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },

  backBtn: {
    padding: "6px 14px",
    background: "#eff6ff",
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
    fontSize: 22,
    fontWeight: 800,
    color: "#083c73",
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
    background: "#083c73",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "none",
    transition: "0.2s",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 16,
    marginBottom: 18,
  },

  statsCard: {
    padding: "18px 20px",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #d7dee8",
  },

  statsLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },

  statsValue: {
    fontSize: 24,
    fontWeight: 800,
  },

  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: 8,
    border: "1px dashed #cbd5e1",
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
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    border: "1px solid #d7dee8",
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
    background: "#f8fafc",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#083c73",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
    boxShadow: "none",
  },

  cardName: {
    fontWeight: 700,
    color: "#083c73",
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
    borderRadius: 8,
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
    background: "#f8fafc",
    flexWrap: "wrap",
  },

  actionBtn: {
    flex: 1,
    minWidth: 110,
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

  reportBtn: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },

  documentBtn: {
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  pdfActionRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  pdfBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    background: "#fff",
  },

  assignmentReadBox: {
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 14,
  },

  assignmentEmpty: {
    color: "#94a3b8",
    fontSize: 13,
    fontStyle: "italic",
    padding: "8px 0",
  },

  assignmentReadList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowX: "auto",
  },

  assignmentReadItem: {
    display: "grid",
    gridTemplateColumns: "86px minmax(0, 1fr) 110px",
    gap: 10,
    alignItems: "start",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#f8fafc",
    minWidth: 520,
  },

  assignmentReadContent: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },

  assignmentReadHours: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "right",
  },

  reportCreateBox: {
    background: "#f8fafc",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: "16px 18px",
    marginBottom: 4,
  },

  reportSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#083c73",
    margin: "0 0 12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  reportCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "14px 16px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },

  reportCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  reportMetaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 10,
  },

  reportWeekBadge: {
    background: "#083c73",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 999,
  },

  reportStatusBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: 999,
  },

  reportContent: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    margin: 0,
  },

  reportFeedbackBox: {
    marginTop: 10,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    padding: "10px 12px",
  },

  saveBtn: {
    background: "#083c73",
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
    backdropFilter: "none",
  },

  confirmBox: {
    background: "#fff",
    borderRadius: 8,
    padding: "36px 32px",
    textAlign: "center",
    maxWidth: 400,
    width: "100%",
    boxShadow: "0 8px 22px rgba(15,23,42,0.08)",
  },

  editBox: {
    background: "#fff",
    borderRadius: 8,
    maxWidth: 640,
    width: "100%",
    boxShadow: "0 8px 22px rgba(15,23,42,0.08)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  editHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
    borderRadius: "8px 8px 0 0",
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
    borderRadius: "0 0 8px 8px",
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
