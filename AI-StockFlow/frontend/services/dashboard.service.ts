const BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function getDashboardSummary(days: number = 30) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${BASE_URL}/dashboard/summary?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return response.json();
}