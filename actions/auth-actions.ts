'use server';

import { revalidatePath } from 'next/cache';
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

const revalidateAuthPaths = (...paths: string[]) => {
  paths.forEach((path) => revalidatePath(path));
};

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

  revalidateAuthPaths('/register', '/login', '/');

  return result;
};

export const requestPasswordResetAction = async (
  payload: { email?: string } = {}
): Promise<AuthActionResult> => {
  const { email } = payload;

  const result = await requestPasswordResetService(email);

  revalidateAuthPaths('/forgot-password');

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

  revalidateAuthPaths('/forgot-password');

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

  revalidateAuthPaths('/forgot-password', '/login', '/');

  return result;
};
