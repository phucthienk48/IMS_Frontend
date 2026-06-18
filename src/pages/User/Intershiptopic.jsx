import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  defaultInternshipCenter,
  fetchInternshipCenter,
} from "../../config/internshipCenter";

const API = "http://localhost:5000";
const API_BASE = `${API}/api/internship-topics`;

const initialApplyForm = (user = {}) => ({
  fullName: user.username || "",
  studentCode: "",
  classCode: "",
  major: "",
});

const initialApplyFiles = {
  cvFile: null,
  transcriptFile: null,
  citizenIdFrontFile: null,
  citizenIdBackFile: null,
};

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : date.toLocaleDateString("vi-VN");
};

const fileName = (file) => file?.name || "Chưa chọn tệp";

export default function Intershiptopic() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const studentId = user._id || user.id;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [applyTopic, setApplyTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState(() => initialApplyForm(user));
  const [applyFiles, setApplyFiles] = useState(initialApplyFiles);
  const [center, setCenter] = useState(defaultInternshipCenter);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      const items = data.data || [];
      setTopics(items);
      setSelectedTopicId((prev) => prev || items.find((item) => item.status === "open")?._id || items[0]?._id || null);
    } catch (err) {
      console.error("Lỗi tải danh sách đề tài:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchInternshipCenter(API).then(setCenter);
  }, []);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    return topics.filter((topic) => {
      const matchSearch =
        !query ||
        (topic.topicname || "").toLowerCase().includes(query) ||
        (topic.description || "").toLowerCase().includes(query) ||
        (topic.requirement || "").toLowerCase().includes(query) ||
        topic.lecturer?.username?.toLowerCase().includes(query);

      const matchStatus = statusFilter === "all" || topic.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [topics, search, statusFilter]);

  const selectedTopic =
    filteredTopics.find((topic) => topic._id === selectedTopicId) ||
    filteredTopics[0] ||
    null;

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
    setApplyForm(initialApplyForm(user));
    setApplyFiles(initialApplyFiles);
  };

  const openApplyForm = (topic) => {
    if (!studentId || user.role !== "student") {
      alert("Bạn cần đăng nhập bằng tài khoản sinh viên để nộp hồ sơ.");
      navigate("/login");
      return;
    }
    setSelectedTopicId(topic._id);
    setApplyTopic(topic);
  };

  const handleApplyChange = (event) => {
    const { name, value } = event.target;
    setApplyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFileChange = (event) => {
    const { name, files } = event.target;
    setApplyFiles((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const validateApplication = () => {
    if (!applyForm.fullName.trim()) return "Vui lòng nhập họ tên sinh viên.";
    if (!applyForm.studentCode.trim()) return "Vui lòng nhập mã số sinh viên.";
    if (!applyForm.classCode.trim()) return "Vui lòng nhập mã lớp.";
    if (!applyForm.major.trim()) return "Vui lòng nhập ngành/chuyên ngành.";
    if (!applyFiles.cvFile) return "Vui lòng tải lên CV.";
    if (!applyFiles.transcriptFile) return "Vui lòng tải lên bảng điểm.";
    if (!applyFiles.citizenIdFrontFile) return "Vui lòng tải lên ảnh CCCD mặt trước.";
    if (!applyFiles.citizenIdBackFile) return "Vui lòng tải lên ảnh CCCD mặt sau.";
    return "";
  };

  const handleSubmitApplication = async () => {
    if (!applyTopic) return;
    const validationError = validateApplication();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const [cvPath, transcriptPath, citizenIdFrontPath, citizenIdBackPath] =
        await Promise.all([
          uploadFile(applyFiles.cvFile),
          uploadFile(applyFiles.transcriptFile),
          uploadFile(applyFiles.citizenIdFrontFile),
          uploadFile(applyFiles.citizenIdBackFile),
        ]);

      await axios.post(`${API}/api/application/topic/${applyTopic._id}`, {
        ...applyForm,
        student: studentId,
        email: user.email || "",
        cvFile: cvPath,
        transcriptFile: transcriptPath,
        citizenIdFrontFile: citizenIdFrontPath,
        citizenIdBackFile: citizenIdBackPath,
      });

      alert("Nộp hồ sơ thành công. Vui lòng chờ phản hồi.");
      resetApply();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Nộp hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Đang tải danh sách đề tài...</p>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Danh sách đề tài thực tập</h2>
          <p style={styles.subtitle}>
            Chọn đề tài tại trung tâm, xem nội dung công việc và nộp hồ sơ ứng tuyển.
          </p>
        </div>
        <div style={styles.summaryGroup}>
          <Summary label="Tổng đề tài" value={topics.length} />
          <Summary label="Đang mở" value={topics.filter((topic) => topic.status === "open").length} />
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Tìm theo đề tài, nội dung công việc, cán bộ phụ trách..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="open">Đang mở</option>
          <option value="closed">Đã đóng</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      <div style={styles.layout}>
        <div style={styles.topicList}>
          <div style={styles.listHeader}>
            <strong>Đề tài phù hợp</strong>
            <span>{filteredTopics.length} kết quả</span>
          </div>

          {filteredTopics.length === 0 ? (
            <div style={styles.emptyBox}>Không tìm thấy đề tài phù hợp.</div>
          ) : (
            filteredTopics.map((topic) => (
              <button
                key={topic._id}
                type="button"
                style={{
                  ...styles.topicItem,
                  ...(selectedTopic?._id === topic._id ? styles.topicItemActive : {}),
                }}
                onClick={() => setSelectedTopicId(topic._id)}
              >
                <div style={styles.topicItemTop}>
                  <strong>{topic.topicname}</strong>
                  <span style={topic.status === "open" ? styles.badgeOpen : styles.badgeClosed}>
                    {topic.status === "open" ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>
                <div style={styles.topicMeta}>
                  <span><i className="bi bi-person" /> {topic.lecturer?.username || "Chưa rõ"}</span>
                  <span><i className="bi bi-building" /> {center.name}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div style={styles.detailPane}>
          {!selectedTopic ? (
            <div style={styles.emptyBox}>Chọn một đề tài để xem chi tiết.</div>
          ) : (
            <>
              <div style={styles.detailHeader}>
                <div>
                  <h3 style={styles.detailTitle}>{selectedTopic.topicname}</h3>
                  <p style={styles.detailSub}>
                    Cán bộ phụ trách: {selectedTopic.lecturer?.username || "Chưa rõ"}
                  </p>
                </div>
                {selectedTopic.status === "open" && (
                  <button style={styles.primaryBtn} onClick={() => openApplyForm(selectedTopic)}>
                    <i className="bi bi-send-fill" /> Nộp hồ sơ
                  </button>
                )}
              </div>

              <div style={styles.infoGrid}>
                <Info label="Trung tâm tiếp nhận" value={center.name} />
                <Info label="Cán bộ phụ trách" value={selectedTopic.lecturer?.username || "Chưa cập nhật"} />
                <Info label="Địa chỉ trung tâm" value={center.address || "Chưa cập nhật"} />
                <Info label="Thời gian thực tập" value={`${formatDate(selectedTopic.startday)} - ${formatDate(selectedTopic.endday)}`} />
                <Info label="Số ngày/tuần" value={selectedTopic.workDaysPerWeek ? `${selectedTopic.workDaysPerWeek} ngày` : "Chưa cập nhật"} />
                <Info label="Số giờ/ngày" value={selectedTopic.workHoursPerDay ? `${selectedTopic.workHoursPerDay} giờ` : "Chưa cập nhật"} />
              </div>

              <div style={styles.section}>
                <h4>Nội dung công việc</h4>
                <p>{selectedTopic.description || "Chưa cập nhật"}</p>
              </div>

              <div style={styles.section}>
                <h4>Yêu cầu thực tập</h4>
                <p>{selectedTopic.requirement || "Chưa cập nhật"}</p>
              </div>

              <div style={styles.conditionRow}>
                <span style={center.hasOffice ? styles.conditionOk : styles.conditionMuted}>
                  <i className="bi bi-door-open" /> Phòng làm việc
                </span>
                <span style={center.hasComputer ? styles.conditionOk : styles.conditionMuted}>
                  <i className="bi bi-pc-display" /> Máy tính
                </span>
              </div>

              {applyTopic?._id === selectedTopic._id && (
                <div style={styles.applyPanel}>
                  <div style={styles.applyHeader}>
                    <h4>Nộp hồ sơ ứng tuyển</h4>
                    <button type="button" style={styles.iconBtn} onClick={resetApply}>
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>

                  <div style={styles.formGrid}>
                    <Field label="Họ tên sinh viên" name="fullName" value={applyForm.fullName} onChange={handleApplyChange} />
                    <Field label="Mã số sinh viên" name="studentCode" value={applyForm.studentCode} onChange={handleApplyChange} />
                    <Field label="Mã lớp" name="classCode" value={applyForm.classCode} onChange={handleApplyChange} />
                    <Field label="Ngành/chuyên ngành" name="major" value={applyForm.major} onChange={handleApplyChange} />
                  </div>

                  <div style={styles.fileGrid}>
                    <FileField label="CV" name="cvFile" accept=".pdf,.doc,.docx" file={applyFiles.cvFile} onChange={handleApplyFileChange} />
                    <FileField label="Bảng điểm" name="transcriptFile" accept=".pdf,.jpg,.jpeg,.png" file={applyFiles.transcriptFile} onChange={handleApplyFileChange} />
                    <FileField label="CCCD mặt trước" name="citizenIdFrontFile" accept=".jpg,.jpeg,.png" file={applyFiles.citizenIdFrontFile} onChange={handleApplyFileChange} />
                    <FileField label="CCCD mặt sau" name="citizenIdBackFile" accept=".jpg,.jpeg,.png" file={applyFiles.citizenIdBackFile} onChange={handleApplyFileChange} />
                  </div>

                  <div style={styles.applyActions}>
                    <button style={styles.submitBtn} onClick={handleSubmitApplication} disabled={submitting}>
                      <i className="bi bi-check2-circle" /> {submitting ? "Đang nộp..." : "Gửi hồ sơ"}
                    </button>
                    <button style={styles.cancelBtn} onClick={resetApply} disabled={submitting}>
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div style={styles.summaryCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.infoCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <label style={styles.field}>
      <span>{label}</span>
      <input style={styles.input} name={name} value={value} onChange={onChange} />
    </label>
  );
}

function FileField({ label, name, accept, file, onChange }) {
  return (
    <label style={styles.fileField}>
      <span>{label}</span>
      <strong>{fileName(file)}</strong>
      <input
        style={styles.fileInput}
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
      />
    </label>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    padding: 0,
    background: "transparent",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderLeft: "4px solid #f29111",
    borderRadius: 8,
    padding: "18px 20px",
    marginBottom: 18,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  title: { margin: 0, color: "#083c73", fontSize: 22, fontWeight: 800 },
  subtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 14 },
  summaryGroup: { display: "flex", gap: 10, flexWrap: "wrap" },
  summaryCard: {
    minWidth: 112,
    background: "#f8fafc",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  filterBar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  searchBox: { position: "relative", flex: 1, minWidth: 260 },
  searchIcon: { position: "absolute", left: 12, top: 11, color: "#94a3b8" },
  searchInput: {
    width: "100%",
    height: 38,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "0 12px 0 36px",
    outline: "none",
    boxSizing: "border-box",
  },
  filterSelect: {
    height: 38,
    minWidth: 150,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "0 12px",
    background: "#ffffff",
  },
  input: {
    height: 38,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "0 12px",
    outline: "none",
    color: "#0f172a",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  fileInput: {
    width: "100%",
    color: "#475569",
    fontSize: 12,
  },
  layout: { display: "grid", gridTemplateColumns: "minmax(300px, 380px) minmax(0, 1fr)", gap: 18 },
  topicList: {
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "start",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 13,
  },
  topicItem: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #f1f5f9",
    background: "#ffffff",
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
  },
  topicItemActive: { background: "#eff6ff", boxShadow: "inset 4px 0 #083c73" },
  topicItemTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
  topicMeta: { display: "flex", flexDirection: "column", gap: 5, color: "#64748b", fontSize: 12, marginTop: 8 },
  badgeOpen: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  badgeClosed: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  detailPane: {
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    minWidth: 0,
  },
  detailHeader: { display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 16 },
  detailTitle: { margin: 0, color: "#083c73", fontSize: 20, fontWeight: 800 },
  detailSub: { margin: "5px 0 0", color: "#64748b", fontSize: 13 },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 8, padding: "10px 14px", background: "#083c73", color: "#ffffff", fontWeight: 700, cursor: "pointer" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 14 },
  infoCard: { border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 },
  section: { border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", marginBottom: 12 },
  conditionRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  conditionOk: { display: "inline-flex", gap: 6, alignItems: "center", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 999, padding: "5px 10px", fontSize: 12, fontWeight: 700 },
  conditionMuted: { display: "inline-flex", gap: 6, alignItems: "center", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", borderRadius: 999, padding: "5px 10px", fontSize: 12, fontWeight: 700 },
  applyPanel: { border: "1px solid #d7dee8", borderRadius: 8, padding: 16, background: "#fcfdff", marginTop: 16 },
  applyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconBtn: { width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 8, background: "#ffffff", color: "#64748b", cursor: "pointer" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6, color: "#475569", fontSize: 12, fontWeight: 700 },
  fileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginTop: 12 },
  fileField: { display: "flex", flexDirection: "column", gap: 7, border: "1px dashed #cbd5e1", borderRadius: 8, background: "#f8fafc", padding: 12, color: "#475569", fontSize: 12 },
  applyActions: { display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 14 },
  submitBtn: { border: "none", borderRadius: 8, padding: "10px 16px", background: "#15803d", color: "#ffffff", fontWeight: 700, cursor: "pointer" },
  cancelBtn: { border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 16px", background: "#ffffff", color: "#475569", fontWeight: 700, cursor: "pointer" },
  emptyBox: { color: "#94a3b8", padding: 24, textAlign: "center" },
};
