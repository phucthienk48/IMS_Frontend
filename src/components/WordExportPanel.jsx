import { useState } from "react";
import {
  exportPhieuGiaoViecWord,
  exportPhieuNhanSVWord,
  exportPhieuTheoDoiWord,
} from "../utils/wordExport";

const hasText = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const countFilledRows = (items = []) =>
  items.filter((item) => hasText(item?.content)).length;

export default function WordExportPanel({
  application,
  weeklyAssignments = [],
  weeklyReports = [],
}) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const assignmentCount = countFilledRows(weeklyAssignments);
  const reportCount = countFilledRows(weeklyReports);

  const exportItems = [
    {
      key: "phieu-nhan",
      icon: "bi-file-earmark-check-fill",
      label: "Phiếu tiếp nhận",
      meta: "Hồ sơ thực tập",
      color: "#166534",
      background: "#f0fdf4",
      border: "#bbf7d0",
      action: exportPhieuNhanSVWord,
    },
    {
      key: "giao-viec",
      icon: "bi-calendar2-week-fill",
      label: "Phiếu giao việc",
      meta: `${assignmentCount}/12 tuần`,
      color: "#1d4ed8",
      background: "#eff6ff",
      border: "#bfdbfe",
      action: exportPhieuGiaoViecWord,
      blocked: assignmentCount === 0,
      blockedMessage:
        "Vui lòng lập kế hoạch giao việc theo tuần trước khi xuất phiếu giao việc.",
    },
    {
      key: "theo-doi",
      icon: "bi-journal-check",
      label: "Phiếu theo dõi",
      meta: `${reportCount}/12 báo cáo`,
      color: "#c2410c",
      background: "#fff7ed",
      border: "#fed7aa",
      action: exportPhieuTheoDoiWord,
      blocked: reportCount === 0,
      blockedMessage:
        "Vui lòng có ít nhất một báo cáo tiến độ trước khi xuất phiếu theo dõi.",
    },
  ];

  const handleExport = (item) => {
    if (!application?._id && !application?.id) {
      alert("Không tìm thấy mã hồ sơ để xuất file Word.");
      return;
    }

    if (item.blocked) {
      alert(item.blockedMessage);
      return;
    }

    item.action(application);
  };

  return (
    <section style={styles.panel} aria-label="Xuất biểu mẫu Word">
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <i className="bi bi-file-earmark-word-fill" style={styles.titleIcon} />
          <span style={styles.title}>Xuất biểu mẫu Word</span>
        </div>
        <span style={styles.badge}>3 mẫu</span>
      </div>

      <div style={styles.actions}>
        {exportItems.map((item) => {
          const isHovered = hoveredKey === item.key;
          const isActive = activeKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              style={{
                ...styles.button,
                color: item.color,
                background: item.background,
                borderColor: isHovered && !item.blocked ? item.color : item.border,
                opacity: item.blocked ? 0.68 : 1,
                transform: item.blocked
                  ? "none"
                  : isActive
                    ? "scale(0.95)"
                    : isHovered
                      ? "scale(1.02)"
                      : "scale(1)",
                boxShadow: isHovered && !item.blocked
                  ? "0 4px 12px rgba(0,0,0,0.06)"
                  : "none",
                filter: isHovered && !item.blocked ? "brightness(0.97)" : "none",
              }}
              onMouseEnter={() => !item.blocked && setHoveredKey(item.key)}
              onMouseLeave={() => {
                setHoveredKey(null);
                setActiveKey(null);
              }}
              onMouseDown={() => !item.blocked && setActiveKey(item.key)}
              onMouseUp={() => setActiveKey(null)}
              onClick={() => handleExport(item)}
              title={item.blocked ? item.blockedMessage : item.label}
            >
              <i className={`bi ${item.icon}`} style={styles.buttonIcon} />
              <span style={styles.buttonText}>{item.label}</span>
              <span style={styles.meta}>{item.meta}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  panel: {
    border: "1px solid #d7dee8",
    background: "#ffffff",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  titleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  titleIcon: {
    color: "#083c73",
    fontSize: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 800,
    color: "#083c73",
  },
  badge: {
    border: "1px solid #d7dee8",
    color: "#475569",
    background: "#f8fafc",
    borderRadius: 999,
    padding: "3px 9px",
    fontSize: 11,
    fontWeight: 700,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 10,
  },
  button: {
    minHeight: 54,
    border: "1px solid",
    borderRadius: 8,
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "18px 1fr",
    columnGap: 8,
    rowGap: 2,
    alignItems: "center",
    padding: "8px 10px",
    textAlign: "left",
    transition: "all 0.2s ease-in-out",
  },
  buttonIcon: {
    gridRow: "1 / span 2",
    fontSize: 16,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  meta: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.2,
  },
};
