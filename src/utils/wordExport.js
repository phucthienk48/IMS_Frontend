const API = "http://localhost:5000";

const getFileName = (response, fallback) => {
  const disposition = response.headers.get("content-disposition") || "";
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }

  const normalMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (normalMatch) {
    return normalMatch[1];
  }

  return fallback;
};

const downloadWord = async (type, application, fallback) => {
  const applicationId = application?._id || application?.id;
  if (!applicationId) {
    alert("Không tìm thấy mã hồ sơ để xuất file Word.");
    return;
  }

  const response = await fetch(`${API}/api/word-export/${type}/${applicationId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không thể xuất file Word.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getFileName(response, fallback);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPhieuNhanSVWord = (application) =>
  downloadWord("phieu-nhan", application, "Phieu-nhan-sinh-vien.doc").catch(
    (error) => alert(error.message),
  );

export const exportPhieuGiaoViecWord = (application) =>
  downloadWord("giao-viec", application, "M-TT-01-Phieu-giao-viec.doc").catch(
    (error) => alert(error.message),
  );

export const exportPhieuTheoDoiWord = (application) =>
  downloadWord("theo-doi", application, "M-TT-02-Phieu-theo-doi.doc").catch(
    (error) => alert(error.message),
  );

export const exportPhieuDanhGiaWord = (application) =>
  downloadWord("danh-gia", application, "M-TT-03-Phieu-danh-gia-co-quan.doc").catch(
    (error) => alert(error.message),
  );
