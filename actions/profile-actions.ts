'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import {
  getKeycloakAdminAccessToken,
  getUserById,
  updateUserPasswordById,
  updateUserProfileById,
  verifyUserPassword,
} from '@/service/keycloak-admin';
import { uploadProfileImageService } from '@/service/profile-service';

type ProfileActionResult = {
  success: boolean;
  error?: string;
  imageUrl?: string;
};

type ProfileDetailsResult = ProfileActionResult & {
  profile?: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
  };
};


function revalidateProfilePaths() {
  revalidatePath('/profile');
  revalidatePath('/admin/profile');
}

async function getCurrentSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  return session.user;
}

function getFirstAttribute(attributes: Record<string, string[]> | undefined, key: string) {
  return attributes?.[key]?.[0] ?? '';
}

export async function getProfileAction(): Promise<ProfileDetailsResult> {
  try {
    const sessionUser = await getCurrentSessionUser();
    const adminToken = await getKeycloakAdminAccessToken();
    const keycloakUser = await getUserById(sessionUser.id, adminToken);
    const attributes = keycloakUser.attributes;

    return {
      success: true,
      profile: {
        firstName: keycloakUser.firstName ?? '',
        lastName: keycloakUser.lastName ?? '',
        email: keycloakUser.email ?? '',
        imageUrl: getFirstAttribute(attributes, 'imageUrl'),
        phone: getFirstAttribute(attributes, 'phoneNumber'),
        address: getFirstAttribute(attributes, 'placeofBirth'),
        dateOfBirth: getFirstAttribute(attributes, 'dateofBirth'),
        gender: getFirstAttribute(attributes, 'gender'),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load profile',
    };
  }
}

export async function updateProfileAction(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentSessionUser();

    await updateUserProfileById(user.id, {
      firstName: payload.firstName?.trim(),
      lastName: payload.lastName?.trim(),
      email: payload.email?.trim(),
      imageUrl: payload.imageUrl,
      phoneNumber: payload.phone?.trim(),
      placeofBirth: payload.address?.trim(),
      dateofBirth: payload.dateOfBirth,
      gender: payload.gender?.trim(),
    });

    revalidateProfilePaths();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update profile',
    };
  }
}

export async function updatePasswordAction(payload: {
  currentPassword?: string;
  newPassword?: string;
}): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentSessionUser();
    const username = user.username ?? user.email;

    if (!username || !payload.currentPassword || !payload.newPassword) {
      return { success: false, error: 'Please complete all password fields.' };
    }

    const isCurrentPasswordValid = await verifyUserPassword(username, payload.currentPassword);
    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    await updateUserPasswordById(user.id, payload.newPassword);

    revalidateProfilePaths();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update password',
    };
  }
}

export async function uploadProfileImageAction(formData: FormData): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentSessionUser();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return { success: false, error: 'Please select an image file.' };
    }

    const uploadResult = await uploadProfileImageService(file);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    await updateUserProfileById(user.id, {
      imageUrl: uploadResult.fileUrl,
    });

    revalidateProfilePaths();
    return { success: true, imageUrl: uploadResult.fileUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to upload profile image',
    };
  }
}
