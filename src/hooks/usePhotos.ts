import { useState, useEffect, useCallback, useRef } from 'react';
import type { Photo } from '../types/photo';
import { LoadingState } from '../types/photo';
import { photoService } from '../services/photoService';

export const usePhotos = () => {
  // ---STATE MANAGEMENT---
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [prefetchedPage, setPrefetchedPage] = useState<number | null>(null);
  const prefetchedPhotosRef = useRef<Photo[] | null>(null);
  const prefetchPromiseRef = useRef<Promise<void> | null>(null);
  const prefetchTargetRef = useRef<number | null>(null);
  const prefetchGenerationRef = useRef(0);

  const clearPrefetch = useCallback(() => {
    prefetchGenerationRef.current += 1;
    prefetchedPhotosRef.current = null;
    setPrefetchedPage(null);
    prefetchTargetRef.current = null;
    prefetchPromiseRef.current = null;
  }, []);

  const appendPhotos = useCallback((page: number, newPhotos: Photo[]) => {
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
  }, []);

  const prefetchPage = useCallback(
    (page: number, limit: number = 20) => {
      if (!hasMore) return;
      if (prefetchedPage === page || prefetchTargetRef.current === page) return;

      prefetchTargetRef.current = page;

      const generation = prefetchGenerationRef.current;

      const promise = (async () => {
        try {
          const upcomingPhotos = await photoService.getPhotos(page, limit);

          if (prefetchGenerationRef.current !== generation) {
            return;
          }

          if (upcomingPhotos.length === 0) {
            setHasMore(false);
            clearPrefetch();
            return;
          }

          prefetchedPhotosRef.current = upcomingPhotos;
          setPrefetchedPage(page);
        } catch (err) {
          clearPrefetch();
        } finally {
          if (prefetchGenerationRef.current !== generation) {
            return;
          }
          prefetchPromiseRef.current = null;
          prefetchTargetRef.current = null;
        }
      })();

      prefetchPromiseRef.current = promise;
    },
    [clearPrefetch, hasMore, prefetchedPage]
  );

  // ---LOGIC---
  const loadPhotos = useCallback(
    async (page: number, limit: number = 20) => {
      setLoadingState(LoadingState.LOADING);
      setError(null);

      try {
        const newPhotos = await photoService.getPhotos(page, limit);
        clearPrefetch();
        appendPhotos(page, newPhotos);
        if (newPhotos.length > 0) {
          prefetchPage(page + 1, limit);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        setLoadingState(LoadingState.ERROR);
      }
    },
    [appendPhotos, clearPrefetch, prefetchPage]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loadingState === LoadingState.LOADING) {
      return;
    }

    const nextPage = currentPage + 1;

    const execute = async () => {
      if (
        prefetchPromiseRef.current &&
        prefetchTargetRef.current === nextPage
      ) {
        setLoadingState(LoadingState.LOADING);
        setError(null);
        try {
          await prefetchPromiseRef.current;
        } catch (err) {
          // The prefetch promise swallows its own errors, so we ignore here
        }
      }

      if (prefetchedPage === nextPage && prefetchedPhotosRef.current) {
        appendPhotos(nextPage, prefetchedPhotosRef.current);
        clearPrefetch();
        prefetchPage(nextPage + 1, 20);
        return;
      }

      await loadPhotos(nextPage, 20); // Load 20 ảnh mỗi lần
    };

    void execute();
  }, [
    appendPhotos,
    clearPrefetch,
    currentPage,
    hasMore,
    loadPhotos,
    loadingState,
    prefetchPage,
    prefetchedPage,
  ]);

  const refresh = useCallback(() => {
    setPhotos([]);
    setCurrentPage(1);
    setHasMore(true);
    clearPrefetch();
    loadPhotos(1, 20);
  }, [clearPrefetch, loadPhotos]);

  // ---EFFECTS---
  useEffect(() => {
    loadPhotos(1, 20);
  }, []);

  useEffect(() => {
    if (!hasMore || loadingState !== LoadingState.SUCCESS) {
      return;
    }

    const nextPage = currentPage + 1;
    if (prefetchedPage === nextPage || prefetchTargetRef.current === nextPage) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const timeout = window.setTimeout(() => {
      prefetchPage(nextPage, 20);
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [
    currentPage,
    hasMore,
    loadingState,
    prefetchPage,
    prefetchedPage,
  ]);

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
