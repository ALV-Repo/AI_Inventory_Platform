const BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function getSales(limit: number = 50) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}/sales?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sales");
  }

  return response.json();
}