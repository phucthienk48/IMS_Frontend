const API = "http://localhost:5000";
const MAX_WEEKS = 12;

export const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

export const createEmptyAssignmentRows = () =>
  Array.from({ length: MAX_WEEKS }, (_, index) => ({
    week: index + 1,
    fromDate: "",
    toDate: "",
    content: "",
    hoursOrSessions: "",
  }));

export const buildAssignmentRows = (assignments = []) => {
  const rows = createEmptyAssignmentRows();
  assignments.forEach((assignment) => {
    const index = Number(assignment.week) - 1;
    if (index < 0 || index >= MAX_WEEKS) return;
    rows[index] = {
      week: Number(assignment.week),
      fromDate: toDateInputValue(assignment.fromDate),
      toDate: toDateInputValue(assignment.toDate),
      content: assignment.content || "",
      hoursOrSessions: assignment.hoursOrSessions || "",
    };
  });
  return rows;
};

export const fetchWeeklyAssignments = async (applicationId) => {
  const response = await fetch(
    `${API}/api/weekly-assignments/application/${applicationId}`,
  );
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "Không thể tải kế hoạch giao việc.");
  }

  const data = await response.json();
  return data.data || [];
};

export const saveWeeklyAssignments = async (applicationId, rows) => {
  const items = rows
    .map((row) => ({
      week: Number(row.week),
      fromDate: row.fromDate || undefined,
      toDate: row.toDate || undefined,
      content: String(row.content || "").trim(),
      hoursOrSessions: String(row.hoursOrSessions || "").trim(),
    }))
    .filter((row) => row.content);

  const response = await fetch(
    `${API}/api/weekly-assignments/application/${applicationId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Không thể lưu kế hoạch giao việc.");
  }

  return data.data || [];
};
