const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("sf_access")
      : null;

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to backend. Make sure FastAPI is running on port 8000."
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

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
    if (response.status === 401) {
      sessionStorage.removeItem("sf_access");
      sessionStorage.removeItem("sf_refresh");
    }

    let message =
      `Request failed with status ${response.status}`;

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data
    ) {
      const detail = (
        data as {
          detail?: unknown;
        }
      ).detail;

      message =
        typeof detail === "string"
          ? detail
          : JSON.stringify(
              detail,
              null,
              2
            );
    } else if (
      typeof data === "object" &&
      data !== null &&
      "message" in data
    ) {
      const apiMessage = (
        data as {
          message?: unknown;
        }
      ).message;

      message =
        typeof apiMessage === "string"
          ? apiMessage
          : JSON.stringify(
              apiMessage,
              null,
              2
            );
    } else if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    }

    throw new Error(message);
  }

  return data as T;
}

export { BASE_URL };