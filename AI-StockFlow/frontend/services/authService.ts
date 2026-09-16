const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user_id?: number | string;
  tenant_id?: number | string;
  full_name?: string;
  role?: string;

  // MFA support
  mfa_required?: boolean;
  mfa_token?: string;
  challenge_token?: string;
  requires_mfa?: boolean;

  [key: string]: unknown;
}

export interface MfaVerificationResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user_id?: number | string;
  tenant_id?: number | string;
  full_name?: string;
  role?: string;

  [key: string]: unknown;
}

function getErrorMessage(
  data: unknown,
  status: number
): string {
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

    if (
      typeof detail === "string" &&
      detail.trim()
    ) {
      return detail;
    }
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data
  ) {
    const message = (
      data as {
        message?: unknown;
      }
    ).message;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }
  }

  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data;
  }

  return `Request failed with status ${status}`;
}

async function parseResponse(
  response: Response
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ?? "";

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      return await response.json();
    }

    return await response.text();
  } catch {
    return null;
  }
}

function storeTokens(data: {
  access_token?: string;
  refresh_token?: string;
}) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  if (data.access_token) {
    sessionStorage.setItem(
      "sf_access",
      data.access_token
    );
  }

  if (data.refresh_token) {
    sessionStorage.setItem(
      "sf_refresh",
      data.refresh_token
    );
  } else {
    sessionStorage.removeItem(
      "sf_refresh"
    );
  }
}

function storeMfaChallenge(
  data: LoginResponse
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  /*
   * Do not keep a final authentication token
   * while the MFA challenge is incomplete.
   */
  sessionStorage.removeItem(
    "sf_access"
  );

  sessionStorage.removeItem(
    "sf_refresh"
  );

  if (data.mfa_token) {
    sessionStorage.setItem(
      "sf_mfa_token",
      data.mfa_token
    );
  } else {
    sessionStorage.removeItem(
      "sf_mfa_token"
    );
  }

  if (data.challenge_token) {
    sessionStorage.setItem(
      "sf_mfa_challenge",
      data.challenge_token
    );
  } else {
    sessionStorage.removeItem(
      "sf_mfa_challenge"
    );
  }
}

function clearMfaChallenge() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  sessionStorage.removeItem(
    "sf_mfa_token"
  );

  sessionStorage.removeItem(
    "sf_mfa_challenge"
  );
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    email
  );

  formData.append(
    "password",
    password
  );

  formData.append(
    "grant_type",
    "password"
  );

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

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        response.status
      )
    );
  }

  if (
    typeof data !== "object" ||
    data === null
  ) {
    throw new Error(
      "Backend returned an invalid login response."
    );
  }

  const loginData =
    data as LoginResponse;

  /*
   * Check whether the backend requires
   * an additional MFA verification step.
   */
  const mfaRequired =
    loginData.mfa_required === true ||
    loginData.requires_mfa === true;

  if (mfaRequired) {
    /*
     * Keep only the temporary MFA challenge.
     * The final access token is not stored until
     * MFA verification succeeds.
     */
    storeMfaChallenge(loginData);

    return loginData;
  }

  /*
   * Normal login without MFA.
   */
  if (!loginData.access_token) {
    throw new Error(
      "Backend login succeeded but no access token was returned."
    );
  }

  clearMfaChallenge();

  storeTokens(loginData);

  return loginData;
}

export async function verifyMfa(
  code: string,
  mfaToken?: string
): Promise<MfaVerificationResponse> {
  if (!code.trim()) {
    throw new Error(
      "Please enter the verification code."
    );
  }

  const cleanCode =
    code.replace(/\D/g, "");

  if (cleanCode.length !== 6) {
    throw new Error(
      "Please enter a valid 6-digit verification code."
    );
  }

  /*
   * Use the explicitly supplied token first.
   * Otherwise retrieve the temporary challenge
   * created during login.
   */
  let challengeToken =
    mfaToken?.trim();

  if (
    !challengeToken &&
    typeof window !== "undefined"
  ) {
    challengeToken =
      sessionStorage.getItem(
        "sf_mfa_token"
      ) ??
      sessionStorage.getItem(
        "sf_mfa_challenge"
      ) ??
      undefined;
  }

  const payload: {
    code: string;
    mfa_token?: string;
    challenge_token?: string;
  } = {
    code: cleanCode,
  };

  if (challengeToken) {
    payload.mfa_token =
      challengeToken;
  }

  let response: Response;

  try {
    response = await fetch(
      `${BASE_URL}/auth/mfa/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to backend. Make sure FastAPI is running on port 8000."
    );
  }

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        response.status
      )
    );
  }

  if (
    typeof data !== "object" ||
    data === null
  ) {
    throw new Error(
      "Backend returned an invalid MFA response."
    );
  }

  const verificationData =
    data as MfaVerificationResponse;

  if (
    !verificationData.access_token
  ) {
    throw new Error(
      "MFA verification succeeded but no access token was returned."
    );
  }

  /*
   * MFA has now completed successfully.
   * Store the final authentication tokens.
   */
  storeTokens(
    verificationData
  );

  /*
   * Temporary MFA credentials are no longer
   * required after successful verification.
   */
  clearMfaChallenge();

  return verificationData;
}

export function getAccessToken(): string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return sessionStorage.getItem(
    "sf_access"
  );
}

export function getRefreshToken(): string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return sessionStorage.getItem(
    "sf_refresh"
  );
}

export function clearAuthTokens(): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  sessionStorage.removeItem(
    "sf_access"
  );

  sessionStorage.removeItem(
    "sf_refresh"
  );

  clearMfaChallenge();
}