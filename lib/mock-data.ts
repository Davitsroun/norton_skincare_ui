export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  badge?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'completed' | 'pending' | 'shipped' | 'cancelled';
  trackingNumber?: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tincture',
    price: 1500,
    image: 'https://i.pinimg.com/1200x/13/e8/71/13e871f73bbde2eec2b583fb7edfe813.jpg',
    rating: 5,
    reviews: 128,
    category: 'tinctures',
    description: 'Premium quality CBD tincture with natural ingredients',
    badge: 'BEST SELLER',
  },
  {
    id: '2',
    name: 'Softgel',
    price: 750,
    originalPrice: 900,
    image: 'https://i.pinimg.com/1200x/46/71/3b/46713b68c9df59486a09312d58bd3eb1.jpg',
    rating: 4.5,
    reviews: 95,
    category: 'softgels',
    description: 'Easy-to-use CBD softgel capsules',
    badge: '-20%',
  },
  {
    id: '3',
    name: 'Gummies',
    price: 500,
    image: 'https://i.pinimg.com/1200x/18/12/89/181289d535af2826faae5c479830a1f2.jpg',
    rating: 5,
    reviews: 234,
    category: 'gummies',
    description: 'Delicious CBD gummies with natural flavors',
  },
  {
    id: '4',
    name: 'Doggy Treats',
    price: 750,
    image: 'https://i.pinimg.com/736x/57/74/ea/5774eacb4dc7463d830757886366153f.jpg',
    rating: 5,
    reviews: 156,
    category: 'pet-treats',
    description: 'Premium CBD treats for your furry friends',
  },
  {
    id: '5',
    name: 'Hemp Oil',
    price: 1200,
    originalPrice: 1500,
    image: 'https://i.pinimg.com/736x/44/94/2b/44942be6b6831d312f55e72f04d06687.jpg',
    rating: 4.8,
    reviews: 89,
    category: 'oils',
    description: 'Pure hemp oil for daily wellness',
    badge: '-20%',
  },
  {
    id: '6',
    name: 'Cream',
    price: 800,
    image: 'https://images.unsplash.com/photo-1620717062813-1d29d4b2d5a1?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 112,
    category: 'creams',
    description: 'Soothing CBD cream for topical use',
  },
  {
    id: '7',
    name: 'Balm',
    price: 600,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 76,
    category: 'balms',
    description: 'Therapeutic CBD balm for muscle relief',
  },
  {
    id: '8',
    name: 'Capsules',
    price: 900,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5f74f282a?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 203,
    category: 'capsules',
    description: 'Full-spectrum CBD capsules for optimal wellness',
  },
];

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

export const testimonials = [
  {
    id: '1',
    author: 'Sarah Johnson',
    role: 'Wellness Enthusiast',
    content: 'Amazing products with incredible quality. Highly recommend!',
    rating: 5,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: '2',
    author: 'Michael Chen',
    role: 'Health Coach',
    content: 'The best CBD products I have tried. Great service too!',
    rating: 5,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    id: '3',
    author: 'Emma Wilson',
    role: 'Fitness Coach',
    content: 'Natural, effective, and reliable. Worth every penny.',
    rating: 5,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  },
];
