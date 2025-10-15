export const APT_CONFIG = {
  BASE_URL: 'https://picsum.photos',
  LIST_ENDPOINT: '/v2/list',
  PHOTO_ENDPOINT: '/id',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PHOTOS: 1000,
} as const;

export const ROUTES = {
  HOME: '/',
  PHOTO_DETAIL: '/photo/:id',
} as const;

export const ERROR_MESSAGES = {
  FETCH_PHOTOS_FAILED: 'Không thể tải danh sách ảnh. Vui lòng thử lại.',
  FETCH_PHOTO_DETAIL_FAILED: 'Không thể tải chi tiết ảnh. Vui lòng thử lại.',
  NO_MORE_PHOTOS: 'Bạn đã xem hết ảnh.',
  PHOTO_NOT_FOUND: 'Ảnh không tồn tại.',
} as const;
