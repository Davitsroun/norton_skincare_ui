/** Shared pagination block for `items` + `paginationResponse` lists. */
export type AdminPaginationResponse = {
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

export type AdminDashboardSummary = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  growthRatePercent: number;
  ordersDeltaPercent: number;
  usersDeltaPercent: number;
};

export type AdminRevenueChartPoint = {
  periodStart: string;
  revenue: number;
};

/** Row for recent orders + admin order table. */
export type AdminOrderRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  placedAt: string;
  totalAmount: number;
  currency: string;
  status: string;
  avatarUrl?: string | null;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  orderCount: number;
  status: string;
  role: string;
  avatarUrl?: string | null;
};

export type AdminProductRow = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  /** Primary image URL from admin API */
  image?: string | null;
  /** Legacy / alternate JSON field */
  imageUrl?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  /** When backend sends a display label */
  category?: string | null;
};

export type AdminProductUpsertBody = {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  image?: string | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
};

export type AdminStatisticsOverview = {
  totalUsers?: number;
  totalProducts?: number;
  totalOrders?: number;
};

export type AdminPatchOrderStatusBody = {
  status: string;
  trackingNumber?: string | null;
};

export type AdminCategoryOption = {
  id: string;
  name: string;
};
