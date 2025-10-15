import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '../types/photo';
import { LoadingState } from '../types/photo';
import { photoService } from '../services/photoService';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPhotos = useCallback(async (page: number, limit: number = 20) => {
    setLoadingState(LoadingState.LOADING);
    setError(null);

    try {
      const newPhotos = await photoService.getPhotos(page, limit);
      
      if (newPhotos.length === 0) {
        setHasMore(false);
        setLoadingState(LoadingState.SUCCESS);
        return;
      }

      setPhotos((prevPhotos) =>
        page === 1 ? newPhotos : [...prevPhotos, ...newPhotos]
      );
      setCurrentPage(page);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingState === LoadingState.LOADING) {
      return;
    }

    loadPhotos(currentPage + 1, 20);
  }, [hasMore, loadingState, currentPage, loadPhotos]);

  const refresh = useCallback(() => {
    setPhotos([]);
    setCurrentPage(0);
    setHasMore(true);
    loadPhotos(1, 20);
  }, [loadPhotos]);

  // Load initial page
  useEffect(() => {
    loadPhotos(1, 20);
  }, [loadPhotos]);

  return {
    photos,
    loadingState,
    error,
    hasMore,
    loadMore,
    refresh,
    currentPage,
  };
};
