import { fetchWeeklyAssignments } from "./weeklyAssignments";

const API = "http://localhost:5000";

export const fetchWeeklyReports = async (applicationId) => {
  const response = await fetch(`${API}/api/weekly-reports/application/${applicationId}`);
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "Không thể tải báo cáo tiến độ.");
  }

  const data = await response.json();
  return data.data || [];
};

export const fetchProgressData = async (applicationId) => {
  const [reports, assignments] = await Promise.all([
    fetchWeeklyReports(applicationId),
    fetchWeeklyAssignments(applicationId),
  ]);

  return { reports, assignments };
};
