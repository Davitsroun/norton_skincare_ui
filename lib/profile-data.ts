export type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  imageUrl: string;
};

type ProfileUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

export const defaultProfileFormData: ProfileFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '+1 (555) 123-4567',
  address: 'London, United Kingdom',
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
    phone: current?.phone || defaultProfileFormData.phone,
    address: current?.address || defaultProfileFormData.address,
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
    first.imageUrl === second.imageUrl
  );
}
