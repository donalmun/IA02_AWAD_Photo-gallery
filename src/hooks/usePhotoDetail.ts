import { useState, useEffect } from 'react';
import type { PhotoDetail } from '../types/photo';
import { LoadingState } from '../types/photo';
import { photoService } from '../services/photoService';

export const usePhotoDetail = (photoId: string | undefined) => {
  // --- STATE MANAGEMENT ---
  const [photo, setPhoto] = useState<PhotoDetail | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.IDLE
  );
  const [error, setError] = useState<string | null>(null);

  // --- SIDE EFFECTS ---

  useEffect(() => {
    // Không làm gì nếu không có ID.
    if (!photoId) {
      setLoadingState(LoadingState.IDLE);
      return;
    }

    const fetchPhoto = async () => {
      setLoadingState(LoadingState.LOADING);
      setError(null);
      try {
        const data = await photoService.getPhotoById(photoId);
        setPhoto(data);
        setLoadingState(LoadingState.SUCCESS);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        setLoadingState(LoadingState.ERROR);
      }
    };

    fetchPhoto();
  }, [photoId]);

  return { photo, loadingState, error };
};
