export const defaultInternshipCenter = {
  name: "Trung tâm Công nghệ Phần mềm Đại học Cần Thơ (CUSC)",
  address: "Khu III, Trường Đại học Cần Thơ, 01 Lý Tự Trọng, TP. Cần Thơ",
  phone: "",
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

export default defaultInternshipCenter;
