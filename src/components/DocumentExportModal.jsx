import WordExportPanel from "./WordExportPanel";

const hasText = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const countFilledRows = (items = []) =>
  items.filter((item) => hasText(item?.content)).length;

export default function DocumentExportModal({
  application,
  weeklyAssignments = [],
  weeklyReports = [],
  loading = false,
  onClose,
}) {
  const assignmentCount = countFilledRows(weeklyAssignments);
  const reportCount = countFilledRows(weeklyReports);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.box} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h4 style={styles.title}>
              <i className="bi bi-file-earmark-word-fill" /> Biểu mẫu Word
            </h4>
            <p style={styles.subtitle}>
              {application?.fullName || "Sinh viên"} - {application?.studentCode || "---"}
            </p>
          </div>
          <button type="button" style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Hồ sơ</span>
              <strong style={styles.summaryValue}>
                {application?.status || "Chưa rõ"}
              </strong>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Kế hoạch giao việc</span>
              <strong style={styles.summaryValue}>{assignmentCount}/12 tuần</strong>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Báo cáo tiến độ</span>
              <strong style={styles.summaryValue}>{reportCount}/12 tuần</strong>
            </div>
          </div>

          {loading ? (
            <p style={styles.loading}>Đang tải dữ liệu biểu mẫu...</p>
          ) : (
            <WordExportPanel
              application={application}
              weeklyAssignments={weeklyAssignments}
              weeklyReports={weeklyReports}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2400,
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
    border: "1px solid #d7dee8",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "18px 22px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  title: {
    margin: 0,
    color: "#083c73",
    fontSize: 18,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: 1,
    padding: 4,
  },
  body: {
    padding: "18px 22px 22px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  summaryItem: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
    padding: "10px 12px",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: 13,
  },
  loading: {
    color: "#64748b",
    fontSize: 13,
    margin: "16px 0 0",
    textAlign: "center",
  },
};
