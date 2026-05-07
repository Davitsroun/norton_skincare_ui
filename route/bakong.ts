import { apiBaseUrl } from '@/constant/baseurl';

const root = `${apiBaseUrl.baseUrl}/api/v1/bakong`;

export const bakongRoute = {
  generateQr: () => `${root}/generate-qr`,
  getQrImage: () => `${root}/get-qr-image`,
  checkTransaction: () => `${root}/check-transaction`,
};
