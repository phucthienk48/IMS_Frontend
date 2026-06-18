export const defaultInternshipCenter = {
  name: "Trung tâm Công nghệ Phần mềm Đại học Cần Thơ (CUSC)",
  address: "Khu III, Trường Đại học Cần Thơ, 01 Lý Tự Trọng, TP. Cần Thơ",
  phone: "",
  email: "",
  hasOffice: true,
  hasComputer: true,
};

export const fetchInternshipCenter = async (apiBase = "http://localhost:5000") => {
  try {
    const response = await fetch(`${apiBase}/api/internship-center`);
    const data = await response.json();
    return data.data || defaultInternshipCenter;
  } catch {
    return defaultInternshipCenter;
  }
};

export const updateInternshipCenter = async (
  payload,
  apiBase = "http://localhost:5000",
) => {
  const response = await fetch(`${apiBase}/api/internship-center`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể cập nhật trung tâm thực tập");
  }
  return data.data || defaultInternshipCenter;
};

export default defaultInternshipCenter;
