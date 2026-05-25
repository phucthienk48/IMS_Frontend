import { useEffect, useState } from "react";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
    isActive: true,
  });

  /* FETCH USERS */
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();

      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* HANDLE FORM */
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

  /* UPLOAD AVATAR */
  const uploadAvatar = async () => {
    if (!avatarFile) return editingUser?.avatar || "";

    const formDataUpload = new FormData();
    formDataUpload.append("image", avatarFile);

    try {
      setUploading(true);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      return data.url || data.secure_url || "";
    } catch (err) {
      alert("Upload avatar thất bại");
      return editingUser?.avatar || "";
    } finally {
      setUploading(false);
    }
  };

  /* CREATE / UPDATE */
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

      alert(data.message || "Thành công");

      resetForm();
      fetchUsers();
    } catch {
      alert("Có lỗi xảy ra");
    }
  };

  /* EDIT */
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

  /* DELETE */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      fetchUsers();
    } catch {
      alert("Xóa thất bại");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>⏳ Đang tải...</p>;

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>
        <i className="bi bi-people-fill" style={styles.titleIcon}></i>
        QUẢN LÝ TÀI KHOẢN
      </h2>

      <button style={styles.addBtn} onClick={() => setShowForm(true)}>
        + Thêm user
      </button>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <i className="bi bi-search" style={styles.searchIcon}></i>

          <input
            style={styles.searchInput}
            placeholder="Tìm username hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả role</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
        </select>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3>{editingUser ? "Cập nhật user" : "Thêm user mới"}</h3>

          <div style={{ marginBottom: 12 }}>
            <label>Avatar</label>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : editingUser?.avatar || "/images/default-avatar.png"
                }
                alt="avatar"
                style={{ width: 50, height: 50, borderRadius: "50%" }}
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
            </div>

            {uploading && <small>⏳ Đang upload ảnh...</small>}
          </div>

          <input
            style={styles.input}
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder={editingUser ? "Mật khẩu mới (nếu đổi)" : "Mật khẩu"}
            value={formData.password}
            onChange={handleChange}
            required={!editingUser}
          />

          <select
            style={styles.input}
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="admin">Admin</option>
          </select>

          <label style={{ display: "flex", gap: 6 }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Kích hoạt tài khoản
          </label>

          <div style={{ marginTop: 12 }}>
            <button style={styles.saveBtn} type="submit">
              Lưu
            </button>

            <button
              style={styles.cancelBtn}
              type="button"
              onClick={resetForm}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thCenter}>Avatar</th>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Email</th>
            <th style={styles.thCenter}>Role</th>
            <th style={styles.thCenter}>Status</th>
            <th style={styles.thCenter}>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {currentUsers.map((u) => (
            <tr key={u._id} style={styles.tr}>
              <td style={styles.tdCenter}>
                <img
                  src={u.avatar || "/images/default-avatar.png"}
                  alt="avatar"
                  style={styles.avatar}
                />
              </td>

              <td style={styles.td}>{u.username}</td>
              <td style={styles.td}>{u.email}</td>

              <td style={styles.tdCenter}>
                <span
                  style={{
                    ...styles.roleBadge,
                    background:
                      u.role === "admin"
                        ? "#fee2e2"
                        : u.role === "lecturer"
                        ? "#fef3c7"
                        : "#dcfce7",
                    color:
                      u.role === "admin"
                        ? "#991b1b"
                        : u.role === "lecturer"
                        ? "#92400e"
                        : "#166534",
                  }}
                >
                  {u.role}
                </span>
              </td>

              <td style={styles.tdCenter}>
                <span
                  style={{
                    ...styles.roleBadge,
                    background: u.isActive ? "#dcfce7" : "#e5e7eb",
                    color: u.isActive ? "#166534" : "#374151",
                  }}
                >
                  {u.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td style={styles.tdCenter}>
                <div style={styles.actionGroup}>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(u)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Sửa
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(u._id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button
          style={{
            ...styles.pageBtn,
            ...(currentPage === 1 && styles.pageBtnDisabled),
          }}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          ⬅
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;

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
        >
          ➡
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    background: "#f4f6f8",
    minHeight: "100vh",
  },

  pageTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 26,
    fontWeight: 700,
    padding: "12px 18px",
    background: "#eff6ff",
    color: "#1e40af",
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
    textTransform: "uppercase",
  },

  titleIcon: {
    fontSize: 30,
    color: "#3b82f6",
  },

  addBtn: {
    padding: "8px 18px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 16,
  },

  form: {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: 14,
  },

  saveBtn: {
    background: "#007bff",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  cancelBtn: {
    background: "#6c757d",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginLeft: 8,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.15)",
    border: "1px solid #dbeafe",
  },

  th: {
    padding: "14px 12px",
    background: "#eff6ff",
    fontWeight: 600,
    color: "#1e3a8a",
    borderBottom: "2px solid #bfdbfe",
    textAlign: "left",
    fontSize: 14,
  },

  thCenter: {
    padding: "14px 12px",
    background: "#eff6ff",
    fontWeight: 600,
    color: "#1e3a8a",
    borderBottom: "2px solid #bfdbfe",
    textAlign: "center",
    fontSize: 14,
  },

  tr: {
    transition: "all 0.2s",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e0f2fe",
    color: "#1f2937",
    fontSize: 14,
  },

  tdCenter: {
    padding: "12px",
    borderBottom: "1px solid #e0f2fe",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 14,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },

  roleBadge: {
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    textTransform: "capitalize",
    display: "inline-block",
  },

  actionGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
  },

  editBtn: {
    background: "#facc15",
    border: "none",
    borderRadius: 8,
    padding: "6px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  filterBar: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: 10,
    fontSize: 16,
    color: "#6b7280",
  },

  searchInput: {
    padding: "8px 12px 8px 32px",
    borderRadius: 6,
    border: "1px solid #ddd",
    minWidth: 220,
  },

  filterSelect: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #ddd",
  },

  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  pageBtn: {
    minWidth: 36,
    height: 36,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #dbeafe",
    background: "#ffffff",
    color: "#1e3a8a",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s ease",
  },

  pageBtnActive: {
    background: "#2563eb",
    color: "#fff",
    border: "1px solid #2563eb",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
  },

  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};