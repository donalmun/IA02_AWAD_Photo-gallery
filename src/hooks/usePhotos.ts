import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '../types/photo';
import { LoadingState } from '../types/photo';
import { photoService } from '../services/photoService';
import { APT_CONFIG } from '../constants/api';

export const usePhotos = () => {
  // ---STATE MANAGEMENT---
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ---LOGIC---
  const loadPhotos = useCallback(
    async (page: number) => {
      if (loadingState === LoadingState.LOADING) return;
      setLoadingState(LoadingState.LOADING);
      setError(null);

      try {
        const newPhotos = await photoService.getPhotos(page);
        if (newPhotos.length === 0) {
          setHasMore(false);
        } else {
          setPhotos((prevPhotos) =>
            page === 1 ? newPhotos : [...prevPhotos, ...newPhotos]
          );
          setCurrentPage(page);
        }
        setLoadingState(LoadingState.SUCCESS);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        setLoadingState(LoadingState.ERROR);
      }
    },
    [loadingState]
  );

  const loadMore = useCallback(() => {
    if (hasMore && loadingState !== LoadingState.LOADING) {
      loadPhotos(currentPage + 1);
    }
  }, [hasMore, loadingState, currentPage, loadPhotos]);

  const refresh = useCallback(() => {
    setPhotos([]);
    setCurrentPage(1);
    setHasMore(true);
    loadPhotos(1);
  }, [loadPhotos]);

  // ---EFFECTS---
  useEffect(() => {
    loadPhotos(1);
  }, []);

  return { photos, loadingState, error, hasMore, loadMore, refresh };
};
