import { ADMIN_ROLE, USER_ROLE } from '@/lib/auth/roles';

export type MockAuthUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  imageUrl?: string;
  roles: string[];
};

export const mockAuthUsers: MockAuthUser[] = [
  {
    id: 'mock-admin-1',
    email: 'admin@gmail.com',
    password: 'Admin123!',
    name: 'Mock Admin',
    imageUrl: 'https://i.pinimg.com/736x/37/00/76/370076c26e450a99cbe76d2e4f281883.jpg',
    roles: [ADMIN_ROLE],
  },
  {
    id: 'mock-user-1',
    email: 'user@gmail.com',
    password: 'User12345!',
    name: 'Mock User',
    imageUrl: 'https://i.pinimg.com/736x/18/75/cf/1875cf70767758f5f562d5e6c793c077.jpg',
    roles: [USER_ROLE],
  },
];
