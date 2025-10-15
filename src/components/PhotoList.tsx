import { useEffect, useCallback } from 'react';
import { usePhotos } from '../hooks/usePhotos';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '../types/photo';
import { photoService } from '../services/photoService';
import { formatAuthorName } from '../utils/helpers';
import type { Photo } from '../types/photo';

const PhotoCard = ({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick: (id: string) => void;
}) => (
  <div
    className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
    onClick={() => onClick(photo.id)}
  >
    <div className="aspect-square overflow-hidden">
      <img
        src={photoService.getPhotoUrl(photo.id, 400, 400)}
        alt={`Photo by ${photo.author}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div className="p-4">
      <p className="truncate font-semibold text-gray-800">
        {formatAuthorName(photo.author)}
      </p>
      <p className="text-sm text-gray-500">{`${photo.width} x ${photo.height}`}</p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="col-span-full flex justify-center py-8">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
  </div>
);

const ErrorDisplay = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="col-span-full text-center">
    <p className="mb-4 text-red-600">{message}</p>
    <button
      onClick={onRetry}
      className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
    >
      Thử lại
    </button>
  </div>
);

const PhotoList = () => {
  const navigate = useNavigate();
  const { photos, loadingState, error, hasMore, loadMore, refresh } =
    usePhotos();

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500 &&
      hasMore &&
      loadingState !== LoadingState.LOADING
    ) {
      loadMore();
    }
  }, [hasMore, loadingState, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Thư Viện Ảnh</h1>
        <p className="text-gray-600">
          Khám phá những bức ảnh đẹp từ Lorem Picsum
        </p>
      </header>

      {/* Dàn layout dạng lưới, tự động điều chỉnh số cột theo kích thước màn hình */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* Hiển thị danh sách ảnh */}
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={(id) => navigate(`/photo/${id}`)}
          />
        ))}

        {/* Hiển thị trạng thái Loading */}
        {loadingState === LoadingState.LOADING && <LoadingIndicator />}

        {/* Hiển thị trạng thái Lỗi */}
        {loadingState === LoadingState.ERROR && error && (
          <ErrorDisplay message={error} onRetry={refresh} />
        )}
      </div>

      {/* Hiển thị thông báo khi đã hết ảnh để tải */}
      {!hasMore && photos.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Bạn đã xem hết ảnh.</p>
        </div>
      )}
    </div>
  );
};

export default PhotoList;
