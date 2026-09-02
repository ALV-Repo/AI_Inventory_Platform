const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user_id?: number | string;
  tenant_id?: number | string;
  full_name?: string;
  role?: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);
  formData.append("grant_type", "password");

  let response: Response;

  try {
    response = await fetch(
      `${BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "detail" in data
        ? String(
            (
              data as {
                detail?: unknown;
              }
            ).detail
          )
        : typeof data === "object" &&
          data !== null &&
          "message" in data
        ? String(
            (
              data as {
                message?: unknown;
              }
            ).message
          )
        : typeof data === "string" &&
          data
        ? data
        : `Login failed with status ${response.status}`;

    throw new Error(message);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("access_token" in data) ||
    !data.access_token
  ) {
    throw new Error(
      "Backend login succeeded but no access token was returned."
    );
  }

  const loginData =
    data as LoginResponse;

  /*
   * Store only authentication tokens.
   * Use sessionStorage instead of localStorage.
   */
  if (
    typeof window !== "undefined"
  ) {
    sessionStorage.setItem(
      "sf_access",
      loginData.access_token
    );

    if (loginData.refresh_token) {
      sessionStorage.setItem(
        "sf_refresh",
        loginData.refresh_token
      );
    } else {
      sessionStorage.removeItem(
        "sf_refresh"
      );
    }
  }

  return loginData;
}