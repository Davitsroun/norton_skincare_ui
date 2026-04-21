export type AdminUser = {
  id: number;
  name: string;
  email: string;
  joined: string;
  orders: number;
  status: 'Active' | 'Inactive';
  role: 'Customer' | 'Moderator' | 'Admin';
  avatar: string;
};

export type AdminProduct = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: 'Active' | 'Low Stock';
  image: string;
};

export const mockAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    joined: '01 Jan 2023',
    orders: 12,
    status: 'Active',
    role: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    joined: '15 Feb 2023',
    orders: 8,
    status: 'Active',
    role: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike@example.com',
    joined: '22 Mar 2023',
    orders: 0,
    status: 'Inactive',
    role: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
  },
];

export const mockAdminProducts: AdminProduct[] = [
  {
    id: 1,
    name: 'Premium CBD Oil',
    sku: 'CBD-001',
    category: 'Oils',
    price: '$49.99',
    stock: 150,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=80&h=80&fit=crop',
  },
  {
    id: 2,
    name: 'Hemp Tea',
    sku: 'HEMP-TEA',
    category: 'Beverages',
    price: '$19.99',
    stock: 320,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1597318736231-81ad71381e39?w=80&h=80&fit=crop',
  },
  {
    id: 3,
    name: 'CBD Capsules',
    sku: 'CBD-CAP',
    category: 'Supplements',
    price: '$39.99',
    stock: 45,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=80&h=80&fit=crop',
  },
];
