import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://via.placeholder.com/150?text=Avatar";
  if (avatar.startsWith("http")) return avatar;
  return `http://localhost:5000${avatar}`;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const userId = user?._id || user?.id;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    setFormData({
      username: userData.username || "",
      email: userData.email || "",
    });
    setLoading(false);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return user?.avatar || "";

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
      return user?.avatar || "";
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      let avatarUrl = user?.avatar || "";

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          avatar: avatarUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = {
          ...user,
          username: formData.username,
          email: formData.email,
          avatar: avatarUrl,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Cập nhật hồ sơ thành công");
        setEditMode(false);
      } else {
        alert(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi cập nhật hồ sơ");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đổi mật khẩu thành công");
        setChangePasswordMode(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>⏳ Đang tải hồ sơ...</p>;

  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left"></i> Quay lại
        </button>
        <h2 style={styles.pageTitle}>
          <i className="bi bi-person-circle" style={styles.titleIcon}></i>
          HỒ SƠ NGƯỜI DÙNG
        </h2>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.avatarSection}>
          <img
            src={getAvatarUrl(user.avatar)}
            alt="avatar"
            style={styles.avatar}
          />
          <div style={styles.userInfo}>
            <h3 style={styles.username}>{user.username}</h3>
            <p style={styles.email}>{user.email}</p>
            <span
              style={{ ...styles.roleBadge, ...getRoleBadgeStyle(user.role) }}
            >
              {user.role === "admin"
                ? "Admin"
                : user.role === "lecturer"
                  ? "Giảng viên"
                  : "Sinh viên"}
            </span>
          </div>
        </div>

        {!editMode && !changePasswordMode && (
          <div style={styles.actionButtons}>
            <button style={styles.editBtn} onClick={() => setEditMode(true)}>
              <i className="bi bi-pencil-square"></i> Chỉnh sửa hồ sơ
            </button>
            <button
              style={styles.passwordBtn}
              onClick={() => setChangePasswordMode(true)}
            >
              <i className="bi bi-key"></i> Đổi mật khẩu
            </button>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Đăng xuất
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      {editMode && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Chỉnh sửa hồ sơ</h3>
          <form onSubmit={handleUpdateProfile}>
            <div style={styles.avatarUploadSection}>
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : getAvatarUrl(user.avatar)
                }
                alt="avatar"
                style={styles.avatarPreview}
              />
              <div style={styles.uploadControls}>
                <label
                  style={styles.uploadLabel}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn ảnh mới
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  style={styles.fileInput}
                />
                {uploading && (
                  <p style={{ color: "#f59e0b" }}>⏳ Đang tải...</p>
                )}
                {avatarFile && (
                  <p style={{ color: "#16a34a", fontSize: "13px" }}>
                    ✓ {avatarFile.name}
                  </p>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={styles.formButtons}>
              <button
                style={styles.cancelBtn}
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setAvatarFile(null);
                  setFormData({
                    username: user.username || "",
                    email: user.email || "",
                  });
                }}
              >
                <i className="bi bi-x"></i> Hủy
              </button>
              <button style={styles.saveBtn} type="submit">
                <i className="bi bi-check"></i> Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Form */}
      {changePasswordMode && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Đổi mật khẩu</h3>
          <form onSubmit={handleChangePassword}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu mới</label>
              <input
                style={styles.input}
                name="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Xác nhận mật khẩu</label>
              <input
                style={styles.input}
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div style={styles.formButtons}>
              <button
                style={styles.cancelBtn}
                type="button"
                onClick={() => {
                  setChangePasswordMode(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                <i className="bi bi-x"></i> Hủy
              </button>
              <button style={styles.saveBtn} type="submit">
                <i className="bi bi-check"></i> Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

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

  profileCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "32px",
    boxShadow: "0 12px 32px rgba(15,23,42,0.05)",
    border: "1px solid #e2e8f0",
    marginBottom: "28px",
  },

  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #dbeafe",
    boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
  },

  userInfo: {
    flex: 1,
  },

  username: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
  },

  email: {
    margin: "0 0 12px 0",
    fontSize: "15px",
    color: "#64748b",
  },

  roleBadge: {
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-block",
    textTransform: "capitalize",
  },

  actionButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  editBtn: {
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
    gap: 8,
    boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
    transition: "0.2s ease",
  },

  passwordBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 6px 16px rgba(217,119,6,0.25)",
    transition: "0.2s ease",
  },

  logoutBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 6px 16px rgba(239,68,68,0.25)",
    transition: "0.2s ease",
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 12px 32px rgba(15,23,42,0.05)",
    border: "1px solid #e2e8f0",
  },

  formTitle: {
    margin: "0 0 24px 0",
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },

  avatarUploadSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
  },

  avatarPreview: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #dbeafe",
  },

  uploadControls: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  uploadLabel: {
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

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
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

  formButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
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
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 6px 16px rgba(34,197,94,0.25)",
    transition: "0.2s ease",
  },
};
