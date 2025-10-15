import { useEffect, useCallback, useRef, useState } from 'react';
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
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2"
      onClick={() => onClick(photo.id)}
    >
      <div className="aspect-[4/3] overflow-hidden relative bg-gray-200">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
        <img
          src={photoService.getPhotoUrl(photo.id, 500, 375)}
          alt={`Photo by ${photo.author}`}
          className={`h-full w-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {/* Overlay gradient khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6">
        <p className="truncate font-bold text-gray-800 text-lg mb-2">
          {formatAuthorName(photo.author)}
        </p>
        <p className="text-sm text-gray-500">
          {`${photo.width} × ${photo.height}`}
        </p>
      </div>
    </div>
  );
};

const LoadingIndicator = () => (
  <div className="col-span-full flex justify-center py-16">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <p className="mt-4 text-gray-600 font-medium">Đang tải thêm ảnh...</p>
      <p className="mt-1 text-sm text-gray-400">Vui lòng chờ trong giây lát</p>
    </div>
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

// Intersection Observer component để tối ưu infinite scroll
const InfiniteScrollTrigger = ({
  onLoadMore,
  hasMore,
  loading,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: '1200px 0px',
        threshold: 0,
      }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading]);

  return <div ref={triggerRef} className="h-4" />;
};

const PhotoList = () => {
  const navigate = useNavigate();
  const { photos, loadingState, error, hasMore, loadMore, refresh } =
    usePhotos();

  // Lưu scroll position khi navigate đến detail
  const handlePhotoClick = useCallback(
    (id: string) => {
      navigate(`/photo/${id}`);
    },
    [navigate]
  );

  // Tự động nạp thêm khi nội dung chưa đủ để scroll giúp giảm thời gian chờ
  useEffect(() => {
    if (loadingState === LoadingState.LOADING || !hasMore) {
      return;
    }

    const checkContentHeight = () => {
      const { scrollHeight, clientHeight } = document.documentElement;

      if (scrollHeight - clientHeight < clientHeight * 0.75) {
        loadMore();
      }
    };

    // Delay bằng requestAnimationFrame để chắc chắn layout đã cập nhật
    const frame = requestAnimationFrame(checkContentHeight);

    return () => cancelAnimationFrame(frame);
  }, [photos.length, hasMore, loadingState, loadMore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header với typography cải thiện */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            📸 Thư Viện Ảnh
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những bức ảnh đẹp từ Lorem Picsum
          </p>
        </header>

        {/* Grid layout với ít cột hơn để card lớn hơn */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Hiển thị danh sách ảnh với animation */}
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both',
              }}
            >
              <PhotoCard photo={photo} onClick={handlePhotoClick} />
            </div>
          ))}

          {/* Hiển thị trạng thái Loading */}
          {loadingState === LoadingState.LOADING && <LoadingIndicator />}

          {/* Hiển thị trạng thái Lỗi */}
          {loadingState === LoadingState.ERROR && error && (
            <ErrorDisplay message={error} onRetry={refresh} />
          )}

          {/* Infinite scroll trigger */}
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loadingState === LoadingState.LOADING}
          />
        </div>

        {/* Hiển thị thông báo khi đã hết ảnh để tải */}
        {!hasMore && photos.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-sm border border-gray-200">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-gray-600 font-medium">Bạn đã xem hết ảnh</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoList;
