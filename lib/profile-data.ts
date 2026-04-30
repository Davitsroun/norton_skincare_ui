export type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  imageUrl: string;
};

type ProfileUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
};

export const defaultProfileFormData: ProfileFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '+1 (555) 123-4567',
  address: 'London, United Kingdom',
  dateOfBirth: '',
  gender: '',
  imageUrl: '',
};

export function mapUserToProfileFormData(
  user: ProfileUser,
  current?: ProfileFormData
): ProfileFormData {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? current?.phone ?? defaultProfileFormData.phone,
    address: user.address ?? current?.address ?? defaultProfileFormData.address,
    dateOfBirth: user.dateOfBirth ?? current?.dateOfBirth ?? defaultProfileFormData.dateOfBirth,
    gender: user.gender ?? current?.gender ?? defaultProfileFormData.gender,
    imageUrl: user.imageUrl || current?.imageUrl || defaultProfileFormData.imageUrl,
  };
}

export function isSameProfileFormData(
  first: ProfileFormData,
  second: ProfileFormData
): boolean {
  return (
    first.firstName === second.firstName &&
    first.lastName === second.lastName &&
    first.email === second.email &&
    first.phone === second.phone &&
    first.address === second.address &&
    first.dateOfBirth === second.dateOfBirth &&
    first.gender === second.gender &&
    first.imageUrl === second.imageUrl
  );
}
