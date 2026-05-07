/** Values expected by POST/PUT `/api/v1/payment-profiles` */
export type DeliveryOptionApi = 'PICKUP' | 'DELIVERY';

export type PaymentProfileUpsertBody = {
  deliveryOption: DeliveryOptionApi;
  fullName: string;
  contactNumber: string;
  deliveryAddress: string | null;
};
