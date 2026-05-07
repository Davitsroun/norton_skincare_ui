/**
 * Cambodia KHQR official artwork shipped under `public/KHQR - asset/`.
 * Use encoded URLs so browsers resolve paths with spaces.
 */
export const KHQR_ASSETS = {
  logoSvg: encodeURI('/KHQR - asset/KHQR Logo.svg'),
  logoPng: encodeURI('/KHQR - asset/KHQR Logo.png'),
  digitalPaymentBadge: encodeURI('/KHQR - asset/KHQR - digital payment.svg'),
  /** Decorative frame cue for compliant display */
  qrStand: encodeURI('/KHQR - asset/QR Stand for export.svg'),
  qrTag: encodeURI('/KHQR - asset/QR Tag.svg'),
  availableHere: encodeURI('/KHQR - asset/KHQR available here - logo with bg.svg'),
} as const;

/** Merchant label sent to Bakong generate-qr (must match merchant registration expectations). */
export const BAKONG_MERCHANT_DISPLAY_NAME = 'Norton Skincare';
