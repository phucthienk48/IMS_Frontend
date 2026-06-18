import { useEffect, useState } from "react";
import {
  defaultInternshipCenter,
  fetchInternshipCenter,
  updateInternshipCenter,
} from "../../config/internshipCenter";

const API = "http://localhost:5000";

export default function AdminInternshipCenter() {
  const [form, setForm] = useState(defaultInternshipCenter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInternshipCenter(API)
      .then((data) => setForm({ ...defaultInternshipCenter, ...data }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên trung tâm thực tập.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateInternshipCenter(form, API);
      setForm({ ...defaultInternshipCenter, ...updated });
      alert("Đã cập nhật trung tâm thực tập.");
    } catch (error) {
      alert(error.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Đang tải cấu hình trung tâm...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.titleBadge}>
            <i className="bi bi-building-gear" />
            <span>Cấu hình hệ thống</span>
          </div>
          <h2 style={styles.title}>Trung tâm thực tập</h2>
          <p style={styles.subtitle}>
            Thông tin này được dùng khi sinh viên nộp hồ sơ, xem đề tài và xuất biểu mẫu Word.
          </p>
        </div>
      </div>

      <form style={styles.formCard} onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <Field
            label="Tên trung tâm"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Field
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
            <span>Địa chỉ</span>
            <textarea
              style={{ ...styles.input, minHeight: 92, resize: "vertical" }}
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </label>
        </div>

        <div style={styles.toggleGrid}>
          <Toggle
            label="Có nơi làm việc"
            name="hasOffice"
            checked={form.hasOffice}
            onChange={handleChange}
          />
          <Toggle
            label="Có máy tính"
            name="hasComputer"
            checked={form.hasComputer}
            onChange={handleChange}
          />
        </div>

        <div style={styles.footer}>
          <button type="submit" style={styles.saveBtn} disabled={saving}>
            <i className="bi bi-save-fill" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <label style={styles.field}>
      <span>{label}</span>
      <input
        style={styles.input}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        required={required}
      />
    </label>
  );
}

function Toggle({ label, name, checked, onChange }) {
  return (
    <label style={styles.toggleCard}>
      <input
        type="checkbox"
        name={name}
        checked={Boolean(checked)}
        onChange={onChange}
        style={styles.checkbox}
      />
      <span>{label}</span>
    </label>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  loading: {
    color: "#64748b",
    padding: 20,
  },
  header: {
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderLeft: "4px solid #f29111",
    borderRadius: 8,
    padding: "22px 24px",
    marginBottom: 20,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
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
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    margin: 0,
    color: "#083c73",
    fontWeight: 800,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #d7dee8",
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    overflow: "hidden",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    padding: 24,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none",
    color: "#0f172a",
    background: "#ffffff",
    boxSizing: "border-box",
    fontSize: 14,
  },
  toggleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    padding: "0 24px 24px",
  },
  toggleCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #d7dee8",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: "#083c73",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid #f1f5f9",
    background: "#f8fafc",
    padding: "16px 24px",
  },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    background: "#083c73",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
};
