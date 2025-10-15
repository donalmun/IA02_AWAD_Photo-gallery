import {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
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
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-500 ${
            imageLoaded || imageError ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 motion-safe:animate-pulse" />
        </div>
        {!imageError ? (
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
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 5a2 2 0 012-2h3.28a2 2 0 011.519.698l1.44 1.604A2 2 0 0012.759 6H19a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 13l2.5 2.5L14.5 11l3.5 3.5"
              />
            </svg>
            <span className="text-sm font-medium">Không thể tải ảnh</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
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

const SkeletonPhotoCard = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
    <div className="p-6 space-y-3">
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      <div className="h-3 w-1/2 rounded bg-gray-200"></div>
    </div>
  </div>
);

const LoadingIndicator = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="animate-fade-in-up"
        style={{
          animationDelay: `${index * 0.08}s`,
          animationFillMode: 'both',
        }}
      >
        <SkeletonPhotoCard />
      </div>
    ))}
  </>
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

  const handlePhotoClick = useCallback(
    (id: string) => {
      navigate(`/photo/${id}`);
    },
    [navigate]
  );

  const isLoading = loadingState === LoadingState.LOADING;
  const isInitialLoad = isLoading && photos.length === 0;
  const skeletonCount = 6;

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
          {photos.map((photo) => (
            <div
              key={photo.id}
              className=""
              style={{
                animationDelay: undefined,
                animationFillMode: undefined,
              }}
            >
              <PhotoCard photo={photo} onClick={handlePhotoClick} />
            </div>
          ))}

          {/* Chỉ hiển thị skeleton cho lần tải đầu để tránh nhấp nháy */}
          {isInitialLoad && <LoadingIndicator count={skeletonCount} />}

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
