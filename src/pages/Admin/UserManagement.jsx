import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://via.placeholder.com/100?text=Avatar";
  if (avatar.startsWith("http")) return avatar;
  return `http://localhost:5000${avatar}`;
};

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "student",
      isActive: true,
    });
    setAvatarFile(null);
    setEditingUser(null);
    setShowForm(false);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return editingUser?.avatar || "";

    const formDataUpload = new FormData();
    formDataUpload.append("file", avatarFile);

    try {
      setUploading(true);
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const data = await res.json();
      const uploadedUrl = data.filePath || data.url || data.secure_url || "";

      if (!uploadedUrl) {
        throw new Error("Không nhận được đường dẫn ảnh từ server");
      }

      setAvatarFile(null);
      return uploadedUrl;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload avatar thất bại: " + err.message);
      return editingUser?.avatar || "";
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let avatarUrl = editingUser?.avatar || "";

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const url = editingUser
        ? `http://localhost:5000/api/users/${editingUser._id}`
        : "http://localhost:5000/api/users";

      const method = editingUser ? "PUT" : "POST";

      const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        avatar: avatarUrl,
        ...(formData.password && { password: formData.password }),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Thành công");
        resetForm();
        fetchUsers();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi kết nối server");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setAvatarFile(null);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Xóa thành công");
        fetchUsers();
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  if (loading)
    return <p style={{ padding: 20 }}>Đang tải danh sách user...</p>;

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    lecturer: users.filter((u) => u.role === "lecturer").length,
    student: users.filter((u) => u.role === "student").length,
    active: users.filter((u) => u.isActive).length,
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return { background: "#fee2e2", color: "#991b1b" };
      case "lecturer":
        return { background: "#fef3c7", color: "#92400e" };
      case "student":
        return { background: "#dcfce7", color: "#166534" };
      default:
        return { background: "#e5e7eb", color: "#374151" };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/admin")}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h2 style={styles.pageTitle}>
            <i className="bi bi-people-fill" style={styles.titleIcon}></i>
            QUẢN LÝ TÀI KHOẢN HỆ THỐNG
          </h2>
          <p style={styles.subTitle}>Tổng cộng {stats.total} tài khoản</p>
        </div>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #2563eb" }}>
          <span style={styles.statsLabel}>Tổng số tài khoản</span>
          <span style={{ ...styles.statsValue, color: "#2563eb" }}>
            {stats.total}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #dc2626" }}>
          <span style={styles.statsLabel}>Admin</span>
          <span style={{ ...styles.statsValue, color: "#dc2626" }}>
            {stats.admin}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #f59e0b" }}>
          <span style={styles.statsLabel}>Giảng viên</span>
          <span style={{ ...styles.statsValue, color: "#f59e0b" }}>
            {stats.lecturer}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #16a34a" }}>
          <span style={styles.statsLabel}>Sinh viên</span>
          <span style={{ ...styles.statsValue, color: "#16a34a" }}>
            {stats.student}
          </span>
        </div>
        <div style={{ ...styles.statsCard, borderTop: "4px solid #7c3aed" }}>
          <span style={styles.statsLabel}>Hoạt động</span>
          <span style={{ ...styles.statsValue, color: "#7c3aed" }}>
            {stats.active}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo username hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="lecturer">Giảng viên</option>
          <option value="student">Sinh viên</option>
        </select>

        <button style={styles.addBtn} onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-circle"></i> Thêm tài khoản
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={styles.modalBackdrop} onClick={resetForm}>
          <form
            style={styles.modal}
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
              </h3>
              <button style={styles.closeBtn} type="button" onClick={resetForm}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.avatarSection}>
                <div style={styles.avatarContainer}>
                  <img
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : getAvatarUrl(editingUser?.avatar)
                    }
                    alt="avatar"
                    style={styles.avatarImage}
                  />
                </div>
                <div style={styles.avatarUpload}>
                  <label
                    style={styles.avatarLabel}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Chọn ảnh
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    style={styles.fileInput}
                  />
                  {uploading && (
                    <p style={{ color: "#f59e0b" }}>Đang tải...</p>
                  )}
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Username</label>
                  <input
                    style={styles.input}
                    name="username"
                    placeholder="Nhập username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Mật khẩu</label>
                  <input
                    style={styles.input}
                    name="password"
                    type="password"
                    placeholder={
                      editingUser ? "Để trống nếu không đổi" : "Nhập mật khẩu"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Vai trò</label>
                  <select
                    style={styles.input}
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Sinh viên</option>
                    <option value="lecturer">Giảng viên</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <span>Kích hoạt tài khoản</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelBtn}
                type="button"
                onClick={resetForm}
              >
                <i className="bi bi-x"></i> Hủy
              </button>
              <button style={styles.saveBtn} type="submit">
                <i className="bi bi-check"></i>{" "}
                {editingUser ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div style={styles.emptyBox}>
          <i
            className="bi bi-inbox"
            style={{ fontSize: 48, color: "#cbd5e1" }}
          />
          <p style={{ marginTop: 12, color: "#64748b", fontSize: 16 }}>
            Không tìm thấy tài khoản nào.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thCenter}>Avatar</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.thCenter}>Vai trò</th>
                  <th style={styles.thCenter}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.tdCenter}>
                      <img
                        src={getAvatarUrl(u.avatar)}
                        alt="avatar"
                        style={styles.avatar}
                      />
                    </td>

                    <td style={styles.td}>
                      <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>
                        {u.username}
                      </div>
                    </td>

                    <td style={styles.td}>{u.email}</td>

                    <td style={styles.tdCenter}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getRoleBadgeStyle(u.role),
                        }}
                      >
                        {u.role === "admin"
                          ? "Admin"
                          : u.role === "lecturer"
                            ? "Giảng viên"
                            : "Sinh viên"}
                      </span>
                    </td>

                    <td style={styles.tdCenter}>
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.editBtn}
                          onClick={() => handleEdit(u)}
                          title="Sửa"
                        >
                          <i className="bi bi-pencil-square"></i> Sửa
                        </button>

                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(u._id)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage === 1 && styles.pageBtnDisabled),
              }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (page < currentPage - 2 || page > currentPage + 2) return null;

              return (
                <button
                  key={page}
                  style={{
                    ...styles.pageBtn,
                    ...(currentPage === page && styles.pageBtnActive),
                  }}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage === totalPages && styles.pageBtnDisabled),
              }}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>

            <span style={{ marginLeft: 16, color: "#64748b", fontSize: 14 }}>
              Trang {currentPage} / {totalPages}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "28px",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
    fontFamily: "'Inter', Arial, sans-serif",
  },

  header: {
    marginBottom: "28px",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px 28px",
    boxShadow: "0 10px 35px rgba(37,99,235,0.08)",
    border: "1px solid #e2e8f0",
  },

  backBtn: {
    padding: "10px 18px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "18px",
    transition: "0.25s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: 12,
    letterSpacing: "-0.5px",
  },

  titleIcon: {
    color: "#2563eb",
    fontSize: "28px",
  },

  subTitle: {
    color: "#64748b",
    fontSize: "15px",
    margin: 0,
    fontWeight: "500",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },

  statsCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    border: "1px solid #e2e8f0",
  },

  statsLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statsValue: {
    fontSize: "28px",
    fontWeight: "800",
    lineHeight: 1.2,
  },

  filterBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    border: "1px solid #e2e8f0",
    alignItems: "center",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: "250px",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "15px",
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 42px",
    borderRadius: "14px",
    border: "1px solid #dbe4f0",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
  },

  filterSelect: {
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid #dbe4f0",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
    color: "#0f172a",
    fontWeight: "500",
  },

  addBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 6px 16px rgba(34,197,94,0.25)",
    transition: "0.25s ease",
  },

  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    background: "#ffffff",
  },

  modalTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },

  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "12px",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    fontSize: "18px",
    color: "#64748b",
    transition: "0.2s ease",
  },

  modalBody: {
    padding: "24px 28px",
  },

  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
  },

  avatarContainer: {
    position: "relative",
  },

  avatarImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #dbeafe",
  },

  avatarUpload: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  avatarLabel: {
    padding: "10px 18px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "2px solid #bfdbfe",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    textAlign: "center",
    fontSize: "14px",
    transition: "0.2s ease",
  },

  fileInput: {
    display: "none",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #dbe4f0",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: "500",
    transition: "0.2s ease",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "500",
    color: "#334155",
    fontSize: "14px",
  },

  modalFooter: {
    display: "flex",
    gap: "12px",
    padding: "20px 28px",
    borderTop: "1px solid #e2e8f0",
    justifyContent: "flex-end",
  },

  cancelBtn: {
    padding: "12px 24px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "0.2s ease",
  },

  saveBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
    transition: "0.2s ease",
  },

  tableWrapper: {
    background: "#ffffff",
    borderRadius: "22px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 32px rgba(15,23,42,0.05)",
    marginBottom: "24px",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    padding: "16px",
    background: "#f8fafc",
    fontWeight: "700",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  thCenter: {
    padding: "16px",
    background: "#f8fafc",
    fontWeight: "700",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  tr: {
    transition: "0.2s ease",
    borderBottom: "1px solid #f1f5f9",
  },

  td: {
    padding: "16px",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
    background: "#fff",
  },

  tdCenter: {
    padding: "16px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "14px",
    background: "#fff",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #dbeafe",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
    textTransform: "capitalize",
  },

  actionGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },

  editBtn: {
    padding: "10px 14px",
    background: "#fbbf24",
    color: "#92400e",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s ease",
    boxShadow: "0 4px 10px rgba(251,191,36,0.2)",
  },

  deleteBtn: {
    padding: "10px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s ease",
    boxShadow: "0 4px 10px rgba(239,68,68,0.2)",
  },

  emptyBox: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "60px 20px",
    textAlign: "center",
    border: "1px dashed #cbd5e1",
    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
    marginBottom: "24px",
  },

  pagination: {
    marginTop: "28px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  pageBtn: {
    minWidth: "40px",
    height: "40px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pageBtnActive: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
    boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
  },

  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
