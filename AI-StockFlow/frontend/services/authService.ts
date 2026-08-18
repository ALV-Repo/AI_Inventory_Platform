const BASE_URL = "http://127.0.0.1:8000/api/v1";

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

  console.log("LOGIN URL:", `${BASE_URL}/auth/login`);
  console.log("LOGIN EMAIL:", email);

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });
  } catch (error) {
    console.error("BACKEND CONNECTION ERROR:", error);

    throw new Error(
      "Cannot connect to backend. Make sure FastAPI is running on port 8000."
    );
  }

  console.log("LOGIN STATUS:", response.status);

  const contentType = response.headers.get("content-type") || "";

  let data: any;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  console.log("LOGIN RESPONSE:", data);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.detail || data.message || JSON.stringify(data)
        : data || `Login failed with status ${response.status}`;

    throw new Error(message);
  }

  if (!data?.access_token) {
    throw new Error("Backend login succeeded but no access token was returned.");
  }

  return data;
}