import { createUser } from '@/service/keycloak-admin';

export type AuthActionResult = {
  success: boolean;
  error?: string;
  status?: number;
};

export type RegisterServicePayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
};

export type VerifyPasswordResetOtpPayload = {
  email?: string;
  otp?: string;
};

export type ConfirmPasswordResetPayload = {
  email?: string;
  resetToken?: string;
  password?: string;
};

type VerifyPasswordResetResult = AuthActionResult & {
  resetToken?: string;
};

const passwordResetBaseUrl =
  process.env.KEYCLOAK_PASSWORD_RESET_OTP_URL ??
  'http://localhost:8081/realms/rest-api/custom-otp/password-reset';

async function readJson<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}

export const registerService = async ({
  email,
  firstName,
  lastName,
  password,
}: RegisterServicePayload): Promise<AuthActionResult> => {
  if (!email || !firstName || !lastName || !password) {
    return {
      success: false,
      error: 'Missing required fields',
      status: 400,
    };
  }

  const response = await createUser({
    username: email,
    email,
    firstName,
    lastName,
    password,
  });

  if (!response.ok) {
    if (response.status === 409) {
      return {
        success: false,
        error: 'An account with this email already exists.',
        status: 409,
      };
    }

    const responseText = await response.text().catch(() => '');
    console.error('Keycloak register failed', {
      status: response.status,
      responseText,
    });

    return {
      success: false,
      error: 'Unable to create user',
      status: response.status,
    };
  }

  return { success: true };
};

export const requestPasswordResetService = async (
  email?: string
): Promise<AuthActionResult> => {
  if (!email) {
    return {
      success: false,
      error: 'Email is required',
      status: 400,
    };
  }

  const response = await fetch(`${passwordResetBaseUrl}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
    cache: 'no-store',
    body: JSON.stringify({ email }),
  });

  const result = await readJson<{ success?: boolean; error?: string }>(response);
  if (!response.ok || !result?.success) {
    return {
      success: false,
      error: result?.error ?? 'Unable to send OTP. Please try again.',
      status: response.status,
    };
  }

  return { success: true };
};

export const verifyPasswordResetOtpService = async ({
  email,
  otp,
}: VerifyPasswordResetOtpPayload): Promise<VerifyPasswordResetResult> => {
  if (!email || !otp) {
    return {
      success: false,
      error: 'Email and OTP are required',
      status: 400,
    };
  }

  const response = await fetch(`${passwordResetBaseUrl}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
    cache: 'no-store',
    body: JSON.stringify({ email, otp }),
  });

  const result = await readJson<{ success?: boolean; error?: string; resetToken?: string }>(response);
  if (!response.ok || !result?.success || !result.resetToken) {
    return {
      success: false,
      error: result?.error ?? 'Invalid or expired OTP',
      status: response.status,
    };
  }

  return {
    success: true,
    resetToken: result.resetToken,
  };
};

export const confirmPasswordResetService = async ({
  email,
  resetToken,
  password,
}: ConfirmPasswordResetPayload): Promise<AuthActionResult> => {
  if (!email || !resetToken || !password) {
    return {
      success: false,
      error: 'Email, reset token, and password are required',
      status: 400,
    };
  }

  const response = await fetch(`${passwordResetBaseUrl}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
    cache: 'no-store',
    body: JSON.stringify({ email, resetToken, password }),
  });

  const result = await readJson<{ success?: boolean; error?: string }>(response);
  if (!response.ok || !result?.success) {
    return {
      success: false,
      error: result?.error ?? 'Unable to reset password',
      status: response.status,
    };
  }

  return { success: true };
};
