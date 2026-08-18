const BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function getPurchaseOrders() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}/purchase-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch purchase orders");
  }

  return response.json();
}

export async function getPurchaseOrderSummary() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}/purchase-orders/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch purchase order summary");
  }

  return response.json();
}