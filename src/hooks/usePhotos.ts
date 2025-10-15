import { useState, useEffect, useCallback, useRef } from 'react';
import type { Photo } from '../types/photo';
import { LoadingState } from '../types/photo';
import { photoService } from '../services/photoService';

const PHOTO_LIST_STATE_KEY = 'photoListState';
const RESTORE_FLAG_KEY = 'photoListShouldRestore';
const MEMORY_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

let memoryCache: PersistedPhotoState | null = null;

const isStateFresh = (state: PersistedPhotoState | null): state is PersistedPhotoState => {
  if (!state) {
    return false;
  }

  if (Date.now() - state.timestamp > MEMORY_CACHE_TTL) {
    return false;
  }

  return true;
};

const readMemoryState = () => {
  if (!isStateFresh(memoryCache)) {
    memoryCache = null;
    return null;
  }

  return memoryCache;
};

const writeMemoryState = (state: PersistedPhotoState) => {
  memoryCache = state;
};

const clearMemoryState = () => {
  memoryCache = null;
};

type PersistedPhotoState = {
  photos: Photo[];
  currentPage: number;
  hasMore: boolean;
  timestamp: number;
};

const readPersistedState = (): PersistedPhotoState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (sessionStorage.getItem(RESTORE_FLAG_KEY) !== 'true') {
    return null;
  }

  const storedStateRaw = sessionStorage.getItem(PHOTO_LIST_STATE_KEY);

  if (!storedStateRaw) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedStateRaw) as PersistedPhotoState;

    if (
      !Array.isArray(parsed.photos) ||
      typeof parsed.currentPage !== 'number'
    ) {
      return null;
    }

    const parsedState: PersistedPhotoState = {
      photos: parsed.photos,
      currentPage: parsed.currentPage,
      hasMore: typeof parsed.hasMore === 'boolean' ? parsed.hasMore : true,
      timestamp: parsed.timestamp ?? Date.now(),
    };

    if (!isStateFresh(parsedState)) {
      sessionStorage.removeItem(PHOTO_LIST_STATE_KEY);
      return null;
    }

    return parsedState;
  } catch {
    return null;
  }
};

export const usePhotos = () => {
  // ---STATE MANAGEMENT---
  const persistedStateRef = useRef<PersistedPhotoState | null | undefined>(
    undefined
  );

  if (persistedStateRef.current === undefined) {
    persistedStateRef.current = readMemoryState() ?? readPersistedState();
  }

  const persistedState = persistedStateRef.current ?? null;

  const [photos, setPhotos] = useState<Photo[]>(
    () => persistedState?.photos ?? []
  );
  const [loadingState, setLoadingState] = useState<LoadingState>(() =>
    persistedState ? LoadingState.SUCCESS : LoadingState.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(
    () => persistedState?.currentPage ?? 1
  );
  const [hasMore, setHasMore] = useState(() => persistedState?.hasMore ?? true);
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
        } catch {
          clearPrefetch();
        } finally {
          if (prefetchGenerationRef.current === generation) {
            prefetchPromiseRef.current = null;
            prefetchTargetRef.current = null;
          }
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
        } catch {
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
    persistedStateRef.current = null;
    clearPrefetch();
    clearMemoryState();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(PHOTO_LIST_STATE_KEY);
      sessionStorage.removeItem(RESTORE_FLAG_KEY);
      sessionStorage.removeItem('photoListScrollPosition');
    }
    loadPhotos(1, 20);
  }, [clearPrefetch, loadPhotos]);

  // ---EFFECTS---
  useEffect(() => {
    const snapshot = persistedStateRef.current;

    if (snapshot) {
      writeMemoryState(snapshot);
      if (snapshot.hasMore !== false && snapshot.photos.length > 0) {
        prefetchPage(snapshot.currentPage + 1, 20);
      }
      return;
    }

    loadPhotos(1, 20);
  }, [loadPhotos, prefetchPage]);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (loadingState !== LoadingState.SUCCESS) {
      return;
    }

    const stateToPersist: PersistedPhotoState = {
      photos,
      currentPage,
      hasMore,
      timestamp: Date.now(),
    };

    writeMemoryState(stateToPersist);

    sessionStorage.setItem(
      PHOTO_LIST_STATE_KEY,
      JSON.stringify(stateToPersist)
    );
  }, [photos, currentPage, hasMore, loadingState]);

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
