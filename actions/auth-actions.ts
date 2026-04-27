'use server';

import {
  confirmPasswordResetService,
  registerService,
  requestPasswordResetService,
  verifyPasswordResetOtpService,
  type AuthActionResult,
  type ConfirmPasswordResetPayload,
  type RegisterServicePayload,
  type VerifyPasswordResetOtpPayload,
} from '@/service/auth-service';

export const registerAction = async (
  payload: RegisterServicePayload = {}
): Promise<AuthActionResult> => {
  const { email, firstName, lastName, password } = payload;

  const result = await registerService({
    email,
    firstName,
    lastName,
    password,
  });

  return result;
};

export const requestPasswordResetAction = async (
  payload: { email?: string } = {}
): Promise<AuthActionResult> => {
  const { email } = payload;

  const result = await requestPasswordResetService(email);

  return result;
};

export const verifyPasswordResetOtpAction = async (
  payload: VerifyPasswordResetOtpPayload = {}
) => {
  const { email, otp } = payload;

  const result = await verifyPasswordResetOtpService({
    email,
    otp,
  });

  return result;
};

export const confirmPasswordResetAction = async (
  payload: ConfirmPasswordResetPayload = {}
): Promise<AuthActionResult> => {
  const { email, resetToken, password } = payload;

  const result = await confirmPasswordResetService({
    email,
    resetToken,
    password,
  });

  return result;
};
