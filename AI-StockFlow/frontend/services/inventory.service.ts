const BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function getProducts() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}/inventory/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getStockMovements() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}/inventory/movements`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch stock movements");
  }

  return response.json();
}