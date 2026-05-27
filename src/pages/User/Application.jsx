import { useEffect, useState } from "react";
import axios from "axios";


export default function Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const id_user = user?.id || user?._id;

  useEffect(() => {
    if (id_user) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [id_user]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/application/user/${id_user}`
      );

      setApplications(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xóa hồ sơ
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa hồ sơ này không?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/application/${id}`
      );

      setApplications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      alert("Xóa hồ sơ thành công");
    } catch (error) {
      console.error(error);
      alert("Xóa thất bại");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "đã duyệt":
        return "bg-success text-white";
      case "rejected":
      case "từ chối":
        return "bg-danger text-white";
      default:
        return "bg-warning text-dark";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        
        <h2 className="fw-bold m-0">Hồ sơ của tôi</h2>
      </div>

      {applications.length === 0 ? (
        <div className="alert alert-info">
          Bạn chưa có hồ sơ nào.
        </div>
      ) : (
        <div className="row">
          {applications.map((item) => (
            <div className="col-md-6 col-lg-4 mb-4" key={item._id}>
              <div className="card shadow border-0 h-100 rounded-4">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-dark">
                      {item.fullName || "Ứng viên"}
                    </h5>

                    <span
                      className={`badge ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status || "pending"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <strong>Mã số sinh viên:</strong>{" "}
                    {item.studentCode || "---"}
                  </div>

                  <div className="mb-2">
                    <strong>Email:</strong> {item.email || "---"}
                  </div>

                  <div className="mb-2">
                    <strong>Số điện thoại:</strong>{" "}
                    {item.sdt || "---"}
                  </div>

                  <div className="mb-2">
                    <strong>Chuyên ngành:</strong>{" "}
                    {item.major || "---"}
                  </div>

                  <div className="mb-2">
                    <strong>Khóa học:</strong>{" "}
                    {item.course || "---"}
                  </div>

                  {item.note && (
                    <div className="mb-2">
                      <strong>Ghi chú:</strong> {item.note}
                    </div>
                  )}

                  <div className="mb-2 d-flex gap-2">
                    {item.cvFile && (
                      <a
                        href={`http://localhost:5000${item.cvFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                      >
                        CV
                      </a>
                    )}
                    {item.transcriptFile && (
                      <a
                        href={`http://localhost:5000${item.transcriptFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                      >
                        Bảng điểm
                      </a>
                    )}
                  </div>

                  <div className="mb-3">
                    <strong>Ngày tạo:</strong>{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "---"}
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-warning flex-fill d-flex align-items-center justify-content-center gap-2">
                      
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2"
                    >
                      
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
