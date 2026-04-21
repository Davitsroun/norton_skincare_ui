import type { Order } from './types';

export type AdminOrder = {
  id: string;
  customer: string;
  address: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Dispatched' | 'Completed';
  avatar: string;
};

export const mockOrderHistory: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-03-15',
    items: [
      {
        id: '1',
        productName: 'Tincture',
        quantity: 1,
        price: 1500,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&h=100&fit=crop',
      },
      {
        id: '3',
        productName: 'Gummies',
        quantity: 2,
        price: 500,
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=100&h=100&fit=crop',
      },
    ],
    total: 2500,
    status: 'completed',
    trackingNumber: 'TRK-123456',
  },
  {
    id: 'ORD-002',
    date: '2024-03-10',
    items: [
      {
        id: '4',
        productName: 'Doggy Treats',
        quantity: 1,
        price: 750,
        image: 'https://images.unsplash.com/photo-1577720643272-265e434b3620?w=100&h=100&fit=crop',
      },
    ],
    total: 750,
    status: 'shipped',
    trackingNumber: 'TRK-123457',
  },
  {
    id: 'ORD-003',
    date: '2024-03-05',
    items: [
      {
        id: '5',
        productName: 'Hemp Oil',
        quantity: 1,
        price: 1200,
        image: 'https://images.unsplash.com/photo-1583382178015-bc28e32e8f9f?w=100&h=100&fit=crop',
      },
    ],
    total: 1200,
    status: 'completed',
    trackingNumber: 'TRK-123458',
  },
  {
    id: 'ORD-004',
    date: '2024-02-28',
    items: [
      {
        id: '6',
        productName: 'Cream',
        quantity: 2,
        price: 800,
        image: 'https://images.unsplash.com/photo-1620717062813-1d29d4b2d5a1?w=100&h=100&fit=crop',
      },
    ],
    total: 1600,
    status: 'completed',
    trackingNumber: 'TRK-123459',
  },
];

export const mockAdminOrders: AdminOrder[] = [
  {
    id: '#2032',
    customer: 'Brooklyn Zoe',
    address: '302 Snyder Street, BUFFALO, NY, 05701',
    date: '31 Jul 2020',
    amount: '$64.00',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop',
  },
  {
    id: '#2033',
    customer: 'John McCormick',
    address: '1010 Wildwood Street, CALAIS, ME, 05701',
    date: '03 Aug 2020',
    amount: '$35.00',
    status: 'Dispatched',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop',
  },
  {
    id: '#2034',
    customer: 'Sandra Pugh',
    address: '3640 Thorn Street, SALE, OFT, GA, 8808',
    date: '02 Aug 2020',
    amount: '$74.00',
    status: 'Completed',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop',
  },
  {
    id: '#2035',
    customer: 'Veronica Hart',
    address: '3838 Oak Drive, DOVER, DE, 19900',
    date: '02 Aug 2020',
    amount: '$82.00',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop',
  },
];
