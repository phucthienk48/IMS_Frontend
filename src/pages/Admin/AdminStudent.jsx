import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function AdminStudent() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [evaluatingApp, setEvaluatingApp] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    internshipStatus: "đang thực tập",
    score: "",
    feedback: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Nhật ký thực tập ──
  const [viewReportApp, setViewReportApp] = useState(null);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({});
  const [feedbackSaving, setFeedbackSaving] = useState({});
  const [assignTopicForm, setAssignTopicForm] = useState({});
  const [assigningTopic, setAssigningTopic] = useState({});
  const [viewingDetailApp, setViewingDetailApp] = useState(null);

  const openDetailModal = (app) => {
    setViewingDetailApp(app);
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API}/api/application`);
      const data = await res.json();
      const sanitizedApplications = (data.data || []).filter((app) => {
        if (!app) return false;
        if (app.isDeleted === true) return false;
        if (app.deleted === true) return false;
        if (app.deletedAt) return false;
        return true;
      });
      setApplications(sanitizedApplications);
    } catch (err) {
      console.error("Lỗi lấy danh sách sinh viên thực tập (admin):", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API}/api/internship-topics`);
      const data = await res.json();
      setTopics(data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách đề tài (admin):", err);
      setTopics([]);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchTopics();
  }, []);

  // Dành cho admin: hiển thị tất cả sinh viên đã được duyệt
  const adminStudents = applications.filter((app) => {
    if (!app || app.isDeleted || app.deleted || app.deletedAt) return false;
    if (app.status !== "đã duyệt") return false;
    return true;
  });

  const studentsWithoutTopic = applications.filter((app) => {
    if (!app || app.isDeleted || app.deleted || app.deletedAt) return false;
    if (app.status !== "đã duyệt") return false;
    return !app.topic;
  });

  const adminTopics = topics;

  const filteredStudents = adminStudents.filter((student) => {
    // Exclude students who don't have an assigned topic — they should appear only
    // in the separate "studentsWithoutTopic" table below.
    if (!student.topic) return false;
    const matchSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      (student.topic?.topicname || "").toLowerCase().includes(search.toLowerCase()) ||
      student.major.toLowerCase().includes(search.toLowerCase());

    const studentIntStatus = student.internshipStatus || "đang thực tập";
    const matchStatus = statusFilter === "all" || studentIntStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  const stats = {
    total: adminStudents.length,
    interning: adminStudents.filter((s) => (s.internshipStatus || "đang thực tập") === "đang thực tập").length,
    completed: adminStudents.filter((s) => s.internshipStatus === "đã hoàn thành").length,
    averageScore: (() => {
      const gradedStudents = adminStudents.filter((s) => s.score !== null && s.score !== undefined);
      if (gradedStudents.length === 0) return "---";
      const totalScore = gradedStudents.reduce((acc, s) => acc + s.score, 0);
      return (totalScore / gradedStudents.length).toFixed(1);
    })(),
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "600",
      display: "inline-block",
      textAlign: "center",
      textTransform: "capitalize",
    };
    switch (status) {
      case "đã hoàn thành":
        return { ...base, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
      case "tạm dừng":
        return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
      case "đang thực tập":
      default:
        return { ...base, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "đã hoàn thành":
        return "Đã hoàn thành";
      case "tạm dừng":
        return "Tạm dừng";
      case "đang thực tập":
      default:
        return "Đang thực tập";
    }
  };

  const openEvaluationModal = (app) => {
    setEvaluatingApp(app);
    setEvaluationForm({
      internshipStatus: app.internshipStatus || "đang thực tập",
      score: app.score !== null && app.score !== undefined ? app.score.toString() : "",
      feedback: app.feedback || "",
    });
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    if (!evaluatingApp) return;

    const scoreNum = evaluationForm.score !== "" ? parseFloat(evaluationForm.score) : null;
    if (scoreNum !== null && (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10)) {
      alert("Điểm số phải là số thực nằm trong khoảng từ 0 đến 10");
      return;
    }

    if (!window.confirm('Xác nhận lưu kết quả đánh giá cho sinh viên này?')) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/application/${evaluatingApp._id}/evaluation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          internshipStatus: evaluationForm.internshipStatus,
          score: scoreNum,
          feedback: evaluationForm.feedback,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Đánh giá sinh viên thành công!");
        setEvaluatingApp(null);
        fetchApplications();
      } else {
        alert(data.message || "Đánh giá thất bại");
      }
    } catch (err) {
      console.error("Lỗi gửi đánh giá lên server (admin):", err);
      alert("Có lỗi xảy ra khi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // ── Nhật ký thực tập ──
  const openReportView = async (app) => {
    setViewReportApp(app);
    setWeeklyLoading(true);
    try {
      const applicationId = app?._id || app?.id;
      if (!applicationId) {
        throw new Error("Không tìm thấy mã hồ sơ để tải nhật ký.");
      }

      const res = await fetch(`${API}/api/weekly-reports/application/${applicationId}`);
      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload.message || "Không thể tải nhật ký thực tập.");
      }
      const data = await res.json();
      const rpts = data.data || [];
      setWeeklyReports(rpts);
      const init = {};
      rpts.forEach((r) => { init[r._id] = { feedback: r.feedback || "", status: r.status }; });
      setFeedbackForm(init);
    } catch (err) {
      console.error("Lỗi tải nhật ký (admin):", err);
      setWeeklyReports([]);
      setFeedbackForm({});
      alert(err.message || "Không thể tải nhật ký thực tập");
    } finally {
      setWeeklyLoading(false);
    }
  };

  const handleSaveFeedback = async (reportId) => {
    const { feedback, status } = feedbackForm[reportId] || {};
    setFeedbackSaving((prev) => ({ ...prev, [reportId]: true }));
    try {
      const res = await fetch(`${API}/api/weekly-reports/${reportId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setWeeklyReports((prev) => prev.map((r) => (r._id === reportId ? data.data : r)));
        alert("Đã lưu nhận xét thành công!");
      } else {
        alert(data.message || "Lưu thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setFeedbackSaving((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleAssignTopic = async (applicationId) => {
    const topicId = assignTopicForm[applicationId];
    if (!topicId) {
      alert("Vui lòng chọn đề tài trước khi gán.");
      return;
    }
    if (!window.confirm('Xác nhận gán đề tài cho sinh viên này?')) return;

    setAssigningTopic((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const res = await fetch(`${API}/api/application/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicId }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("Gán đề tài cho sinh viên thành công!");
        setAssignTopicForm((prev) => ({ ...prev, [applicationId]: "" }));
        fetchApplications();
      } else {
        alert(data.message || "Gán đề tài thất bại");
      }
    } catch (err) {
      console.error("Lỗi gán đề tài (admin):", err);
      alert("Có lỗi xảy ra khi kết nối server");
    } finally {
      setAssigningTopic((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  if (loading)
    return <p style={{ padding: 20 }}>⏳ Đang tải danh sách sinh viên thực tập...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/admin")}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h2 style={styles.pageTitle}>
            <i className="bi bi-people-fill" style={styles.titleIcon}></i>
            DANH SÁCH SINH VIÊN
          </h2>
          <p style={styles.subTitle}>
            Xem danh sách, theo dõi tiến độ và đánh giá kết quả thực tập (Admin)
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #2563eb" }}>
          <span style={styles.statsLabel}>Tổng số sinh viên</span>
          <span style={{ ...styles.statsValue, color: "#2563eb" }}>{stats.total}</span>
        </div>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #0369a1" }}>
          <span style={styles.statsLabel}>Đang thực tập</span>
          <span style={{ ...styles.statsValue, color: "#0369a1" }}>{stats.interning}</span>
        </div>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #16a34a" }}>
          <span style={styles.statsLabel}>Đã hoàn thành</span>
          <span style={{ ...styles.statsValue, color: "#16a34a" }}>{stats.completed}</span>
        </div>
        <div style={{ ...styles.statsCard, borderLeft: "5px solid #f59e0b" }}>
          <span style={styles.statsLabel}>Điểm trung bình</span>
          <span style={{ ...styles.statsValue, color: "#f59e0b" }}>{stats.averageScore}</span>
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo tên, MSSV, ngành học, đề tài..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả tiến độ</option>
          <option value="đang thực tập">Đang thực tập</option>
          <option value="đã hoàn thành">Đã hoàn thành</option>
          <option value="tạm dừng">Tạm dừng</option>
        </select>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Thông tin sinh viên</th>
              <th style={styles.th}>Ngành & Khóa</th>
              <th style={styles.th}>Đề tài thực tập</th>
              <th style={styles.thCenter}>Tài liệu</th>
              <th style={styles.thCenter}>Tiến độ thực tập</th>
              <th style={styles.thCenter}>Điểm số</th>
              <th style={styles.th}>Đánh giá & Nhận xét</th>
              <th style={styles.thCenter}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...styles.td, textAlign: "center", padding: 40, color: "#64748b" }}>
                  <i className="bi bi-inbox" style={{ fontSize: 32, display: "block", marginBottom: 8, color: "#cbd5e1" }}></i>
                  Không tìm thấy sinh viên phù hợp.
                </td>
              </tr>
            ) : (
              filteredStudents.map((app) => (
                <tr key={app._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>{app.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2 }}>MSSV: {app.studentCode}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}><i className="bi bi-telephone-fill me-1"></i> {app.sdt}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{app.major}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2 }}>Khóa: {app.course}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}><i className="bi bi-envelope-fill me-1"></i> {app.email}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "600", color: "#334155" }}>{app.topic?.topicname || "Đề tài tự do"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2 }}>Vị trí: {app.topic?.position || "---"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Bộ môn: {app.topic?.department || "---"}</div>
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
                          <i className="bi bi-file-earmark-pdf-fill text-danger"></i> CV
                        </a>
                      )}
                      {app.transcriptFile && (
                        <a
                          href={`http://localhost:5000${app.transcriptFile}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.fileLink}
                        >
                          <i className="bi bi-file-earmark-spreadsheet-fill text-success"></i> Điểm
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={getStatusBadgeStyle(app.internshipStatus || "đang thực tập")}>
                      {getStatusLabel(app.internshipStatus || "đang thực tập")}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    {app.score !== null && app.score !== undefined ? (
                      <span style={styles.scoreBadge}>{app.score} / 10</span>
                    ) : (
                      <span style={styles.noScore}>Chưa có</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.feedbackContainer}>
                      {app.feedback ? (
                        <p style={styles.feedbackText}>{app.feedback}</p>
                      ) : (
                        <span style={styles.noFeedback}>Chưa có nhận xét</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.tdCenter}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                      {(!app.topic || !app.topic._id) ? (
                        // If no topic, allow quick assign inline
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <select
                            style={{ ...styles.formInput, minWidth: 180 }}
                            value={assignTopicForm[app._id] || ""}
                            onChange={(e) =>
                              setAssignTopicForm((prev) => ({ ...prev, [app._id]: e.target.value }))
                            }
                          >
                            <option value="">-- Chọn đề tài --</option>
                            {adminTopics.map((topic) => (
                              <option key={topic._id} value={topic._id}>
                                {topic.topicname}
                              </option>
                            ))}
                          </select>
                          <button
                            style={styles.assignTopicBtn}
                            onClick={() => handleAssignTopic(app._id)}
                            disabled={assigningTopic[app._id]}
                          >
                            {assigningTopic[app._id] ? "Đang gán..." : "Gán"}
                          </button>
                        </div>
                      ) : (
                        // If has topic, show actions
                        <>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={styles.evaluateBtn}
                              onClick={() => openEvaluationModal(app)}
                              title={(!app.cvFile && !app.transcriptFile) ? "Không thể đánh giá: thiếu hồ sơ" : "Đánh giá & Cho điểm sinh viên"}
                              disabled={saving || (!app.cvFile && !app.transcriptFile)}
                            >
                              <i className="bi bi-pencil-square me-1"></i> Đánh giá
                            </button>

                            <button
                              style={styles.viewReportBtn}
                              onClick={() => openReportView(app)}
                              title="Xem và nhận xét nhật ký tuần"
                            >
                              <i className="bi bi-journal-text me-1"></i> Nhật ký
                            </button>
                          </div>
                          <button
                            style={{ ...styles.evaluateBtn, background: '#64748b', borderColor: '#94a3b8', marginTop: 6 }}
                            onClick={() => openDetailModal(app)}
                            title="Xem chi tiết hồ sơ sinh viên"
                          >
                            <i className="bi bi-info-circle me-1"></i> Chi tiết
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ ...styles.tableWrapper, marginTop: 20 }}>
        <div style={styles.untopicHeader}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#334155" }}>
            <i className="bi bi-person-exclamation me-2"></i>
            Sinh viên chưa có đề tài
          </h3>
          <span style={styles.untopicCount}>{studentsWithoutTopic.length} sinh viên</span>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Thông tin sinh viên</th>
              <th style={styles.th}>Ngành & Khóa</th>
              <th style={styles.th}>Liên hệ</th>
              <th style={styles.thCenter}>Hồ sơ</th>
              <th style={styles.th}>Ghi chú</th>
              <th style={styles.thCenter}>Gán đề tài</th>
            </tr>
          </thead>
          <tbody>
            {studentsWithoutTopic.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ ...styles.td, textAlign: "center", padding: 28, color: "#64748b" }}>
                  Hiện chưa có sinh viên nào ở trạng thái đã duyệt nhưng chưa có đề tài.
                </td>
              </tr>
            ) : (
              studentsWithoutTopic.map((app) => (
                <tr key={app._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>{app.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2 }}>MSSV: {app.studentCode}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{app.major}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2 }}>Khóa: {app.course}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      <i className="bi bi-envelope-fill me-1"></i> {app.email}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 4 }}>
                      <i className="bi bi-telephone-fill me-1"></i> {app.sdt}
                    </div>
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
                          <i className="bi bi-file-earmark-pdf-fill text-danger"></i> CV
                        </a>
                      )}
                      {app.transcriptFile && (
                        <a
                          href={`http://localhost:5000${app.transcriptFile}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.fileLink}
                        >
                          <i className="bi bi-file-earmark-spreadsheet-fill text-success"></i> Điểm
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {app.note || "Chưa có ghi chú"}
                  </td>
                  <td style={styles.tdCenter}>
                    {adminTopics.length === 0 ? (
                      <span style={styles.noScore}>Chưa có đề tài để gán</span>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 210 }}>
                        <select
                          style={styles.formInput}
                          value={assignTopicForm[app._id] || ""}
                          onChange={(e) =>
                            setAssignTopicForm((prev) => ({
                              ...prev,
                              [app._id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Chọn đề tài --</option>
                          {adminTopics.map((topic) => (
                            <option key={topic._id} value={topic._id}>
                              {topic.topicname}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          style={styles.assignTopicBtn}
                          onClick={() => handleAssignTopic(app._id)}
                          disabled={assigningTopic[app._id]}
                        >
                          {assigningTopic[app._id] ? "Đang gán..." : "Gán đề tài"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {evaluatingApp && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, color: "#1e3a8a", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bi bi-patch-check-fill text-primary"></i> ĐÁNH GIÁ THỰC TẬP SINH
              </h4>
              <button style={styles.closeBtn} onClick={() => setEvaluatingApp(null)}>✕</button>
            </div>

            <form onSubmit={handleEvaluationSubmit}>
              <div style={styles.modalBody}>
                <div style={styles.studentQuickInfo}>
                  <div>Sinh viên: <strong>{evaluatingApp.fullName}</strong></div>
                  <div>MSSV: <strong>{evaluatingApp.studentCode}</strong></div>
                  <div>Đề tài: <strong>{evaluatingApp.topic?.topicname}</strong></div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Trạng thái thực tập <span style={{ color: "red" }}>*</span></label>
                  <select
                    style={styles.formInput}
                    value={evaluationForm.internshipStatus}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, internshipStatus: e.target.value })}
                    required
                  >
                    <option value="đang thực tập">Đang thực tập</option>
                    <option value="đã hoàn thành">Đã hoàn thành</option>
                    <option value="tạm dừng">Tạm dừng</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Điểm thực tập (Thang điểm 10)</label>
                  <input
                    type="number"
                    style={styles.formInput}
                    placeholder="Nhập điểm số (ví dụ: 8.5) hoặc để trống"
                    min="0"
                    max="10"
                    step="0.1"
                    value={evaluationForm.score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, score: e.target.value })}
                  />
                  <small style={{ color: "#64748b", marginTop: 4, display: "block" }}>
                    Nhập điểm số từ 0.0 đến 10.0. Để trống nếu chưa muốn chấm điểm.
                  </small>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Nhận xét / Đánh giá</label>
                  <textarea
                    style={styles.formTextarea}
                    rows={4}
                    placeholder="Nhập nhận xét chi tiết về tinh thần làm việc, kết quả hoàn thành công việc của sinh viên thực tập..."
                    value={evaluationForm.feedback}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, feedback: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.modalCancelBtn}
                  onClick={() => setEvaluatingApp(null)}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={styles.modalSaveBtn}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu kết quả"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDetailApp && (
        <div style={styles.modalOverlay} onClick={() => setViewingDetailApp(null)}>
          <div style={{ ...styles.modalBox, maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, color: "#1e3a8a" }}>
                <i className="bi bi-person-lines-fill me-2"></i> CHI TIẾT HỒ SƠ
              </h4>
              <button style={styles.closeBtn} onClick={() => setViewingDetailApp(null)}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{viewingDetailApp.fullName}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>MSSV: {viewingDetailApp.studentCode}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Ngành</div>
                  <div style={{ color: '#64748b' }}>{viewingDetailApp.major}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Khóa</div>
                  <div style={{ color: '#64748b' }}>{viewingDetailApp.course}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Email</div>
                  <div style={{ color: '#64748b' }}>{viewingDetailApp.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>SĐT</div>
                  <div style={{ color: '#64748b' }}>{viewingDetailApp.sdt}</div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Đề tài</div>
                <div style={{ color: '#64748b' }}>{viewingDetailApp.topic?.topicname || '---'}</div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Ghi chú</div>
                <div style={{ color: '#64748b' }}>{viewingDetailApp.note || 'Không có'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewReportApp && (
        <div style={styles.modalOverlay} onClick={() => setViewReportApp(null)}>
          <div
            style={{ ...styles.modalBox, maxWidth: 680, maxHeight: "88vh", display: "flex", flexDirection: "column", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h4 style={{ margin: 0, color: "#1e3a8a", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="bi bi-journal-text"></i> NHẬT KÝ THỰC TẬP HÀNG TUẦN
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  Sinh viên: <strong>{viewReportApp.fullName}</strong> &mdash; {viewReportApp.topic?.topicname || "Hồ sơ tự do"}
                </p>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewReportApp(null)}>✕</button>
            </div>

            <div style={{ padding: "20px 24px", overflowY: "auto" }}>
              {weeklyLoading ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 30 }}>⏳ Đang tải nhật ký...</p>
              ) : weeklyReports.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "30px 0", fontStyle: "italic" }}>
                  <i className="bi bi-inbox" style={{ fontSize: 32, display: "block", marginBottom: 8 }}></i>
                  Sinh viên chưa nộp nhật ký nào.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {weeklyReports.map((report) => {
                    const fb = feedbackForm[report._id] || { feedback: report.feedback || "", status: report.status };
                    const isSaving = feedbackSaving[report._id];
                    const statusStyle = {
                      "chờ duyệt": { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
                      "đã duyệt": { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
                      "cần chỉnh sửa": { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
                    }[report.status] || {};
                    return (
                      <div key={report._id} style={styles.reportViewCard}>
                        <div style={styles.reportViewHeader}>
                          <span style={styles.weekLabel}>Tuần {report.week}</span>
                          <span style={{ ...styles.reportStatusPill, ...statusStyle }}>{report.status}</span>
                          <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
                            {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                            <i className="bi bi-person-fill me-1"></i> Nội dung sinh viên:
                          </p>
                          <p style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            {report.content}
                          </p>
                        </div>

                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 16px" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>
                            <i className="bi bi-chat-left-quote-fill me-1"></i> Nhận xét của Admin:
                          </p>
                          <textarea
                            style={{ ...styles.formTextarea, background: "#fff", marginBottom: 10, minHeight: 70 }}
                            placeholder="Nhập nhận xét cho tuần này..."
                            value={fb.feedback}
                            onChange={(e) => setFeedbackForm((prev) => ({ ...prev, [report._id]: { ...fb, feedback: e.target.value } }))}
                          />
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <select
                              style={{ ...styles.formInput, flex: 1, minWidth: 140 }}
                              value={fb.status}
                              onChange={(e) => setFeedbackForm((prev) => ({ ...prev, [report._id]: { ...fb, status: e.target.value } }))}
                            >
                              <option value="chờ duyệt">Chờ duyệt</option>
                              <option value="đã duyệt">Đã duyệt</option>
                              <option value="cần chỉnh sửa">Cần chỉnh sửa</option>
                            </select>
                            <button
                              style={styles.modalSaveBtn}
                              onClick={() => handleSaveFeedback(report._id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Đang lưu..." : "Lưu nhận xét"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reuse styles from lecturer page to keep consistent look
const styles = {
  container: {
    minHeight: "85vh",
    padding: "24px",
    background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
    fontFamily: "'Inter', Arial, sans-serif",
  },
  header: {
    marginBottom: "24px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 8px 30px rgba(37,99,235,0.06)",
    border: "1px solid #e2e8f0",
  },
  backBtn: {
    padding: "8px 14px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "14px",
    transition: "0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    letterSpacing: "-0.5px",
  },
  titleIcon: { color: "#f59e0b", fontSize: "26px" },
  subTitle: { color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  statsCard: { background: "#ffffff", padding: "18px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid #e2e8f0" },
  statsLabel: { fontSize: "13px", color: "#64748b", fontWeight: "600" },
  statsValue: { fontSize: "28px", fontWeight: "800", lineHeight: 1.2 },
  filterBar: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", background: "#ffffff", padding: "16px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(15,23,42,0.03)", border: "1px solid #e2e8f0" },
  searchBox: { position: "relative", display: "flex", alignItems: "center", flex: 1, minWidth: "260px" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "14px", color: "#94a3b8" },
  searchInput: { width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "1px solid #dbe4f0", fontSize: "13px", outline: "none", background: "#f8fafc", color: "#0f172a" },
  filterSelect: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #dbe4f0", fontSize: "13px", background: "#f8fafc", outline: "none", minWidth: "180px", color: "#0f172a", fontWeight: "500" },
  tableWrapper: { background: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,0.04)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "1050px" },
  th: { padding: "14px 16px", background: "#f8fafc", fontWeight: 600, color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: "13px" },
  thCenter: { padding: "14px 16px", background: "#f8fafc", fontWeight: 600, color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", textAlign: "center", fontSize: "13px" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" },
  td: { padding: "14px 16px", color: "#334155", fontSize: "13px", verticalAlign: "middle" },
  tdCenter: { padding: "14px 16px", textAlign: "center", verticalAlign: "middle", fontSize: "13px" },
  fileLink: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", fontSize: "11px", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" },
  scoreBadge: { background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", fontSize: "13px" },
  noScore: { color: "#94a3b8", fontStyle: "italic" },
  feedbackContainer: { maxWidth: "240px" },
  feedbackText: { margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" },
  noFeedback: { color: "#94a3b8", fontStyle: "italic", fontSize: "12px" },
  evaluateBtn: { padding: "8px 14px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#ffffff", fontSize: "12px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 4px rgba(37,99,235,0.15)", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 4 },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  modalBox: { width: "100%", maxWidth: "500px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 20px 50px rgba(15,23,42,0.15)", overflow: "hidden", animation: "modalFadeIn 0.3s ease-out" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  closeBtn: { border: "none", background: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer", transition: "color 0.2s" },
  modalBody: { padding: "24px" },
  studentQuickInfo: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", fontSize: "13px", color: "#1e40af", display: "flex", flexDirection: "column", gap: "6px" },
  formGroup: { marginBottom: "18px" },
  formLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" },
  formInput: { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" },
  formTextarea: { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "vertical" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "12px", padding: "18px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" },
  modalCancelBtn: { padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  modalSaveBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#16a34a", color: "#ffffff", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 4px rgba(22,163,74,0.15)" },
  viewReportBtn: { padding: "7px 12px", borderRadius: "8px", border: "none", background: "#f0fdf4", color: "#15803d", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1px solid #bbf7d0", display: "inline-flex", alignItems: "center", gap: 4 },
  assignTopicBtn: { padding: "8px 12px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.25)" },
  untopicHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  untopicCount: { background: "#e2e8f0", color: "#475569", padding: "6px 10px", borderRadius: "999px", fontSize: 12, fontWeight: 700 },
  reportViewCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  reportViewHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  weekLabel: { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "3px 12px", borderRadius: 999 },
  reportStatusPill: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 },
};
