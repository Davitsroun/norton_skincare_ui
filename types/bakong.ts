export type BakongGenerateQrRequest = {
  currency: string;
  amount: number;
  merchantName: string;
};

export type BakongGetQrImageRequest = {
  qr: string;
};

export type BakongCheckTransactionRequest = {
  md5: string;
};
