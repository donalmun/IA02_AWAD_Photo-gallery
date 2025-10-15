export interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export interface PhotoDetail extends Photo {
  title?: string;
  description?: string;
}

export const LoadingState = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type LoadingState = (typeof LoadingState)[keyof typeof LoadingState];
