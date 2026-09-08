const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export interface DashboardSummary {
  revenue_today?: number;
  revenue_30_days?: number;
  gross_margin?: number;
  gross_profit?: number;
  stock_value?: number;
  total_skus?: number;
  needs_reorder?: number;
  out_of_stock?: number;

  [key: string]: unknown;
}

export async function getDashboardSummary(
  days: number = 30
): Promise<DashboardSummary> {
  const token =
    localStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Authentication required. Please log in again."
    );
  }

  const response = await fetch(
    `${BASE_URL}/dashboard/summary?days=${days}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },

      cache: "no-store",
    }
  );

  const contentType =
    response.headers.get(
      "content-type"
    ) ?? "";

  let data: unknown = null;

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    } else if (
      typeof data === "object" &&
      data !== null
    ) {
      const body = data as {
        detail?: unknown;
        message?: unknown;
      };

      if (body.detail) {
        message = String(
          body.detail
        );
      } else if (
        body.message
      ) {
        message = String(
          body.message
        );
      }
    }

    throw new Error(message);
  }

  return data as DashboardSummary;
}

export { BASE_URL };