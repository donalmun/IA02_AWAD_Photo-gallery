import { useParams, useNavigate } from 'react-router-dom';
import { usePhotoDetail } from '../hooks/usePhotoDetail';
import { LoadingState } from '../types/photo';
import { formatAuthorName } from '../utils/helpers';
import { photoService } from '../services/photoService';

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
  </div>
);

const FullPageError = ({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) => (
  <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="mb-4 text-3xl font-bold text-gray-800">Đã xảy ra lỗi</h1>
    <p className="mb-6 text-red-600">{message}</p>
    <button
      onClick={onBack}
      className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
    >
      Quay lại
    </button>
  </div>
);

const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { photo, loadingState, error } = usePhotoDetail(id);

  if (
    loadingState === LoadingState.LOADING ||
    loadingState === LoadingState.IDLE
  ) {
    return <FullPageLoader />;
  }

  if (loadingState === LoadingState.ERROR || !photo) {
    return (
      <FullPageError
        message={error || 'Không tìm thấy ảnh này.'}
        onBack={() => navigate('/')}
      />
    );
  }
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)} // Quay lại trang trước đó trong lịch sử duyệt web
          className="mb-6 flex items-center rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition-colors hover:bg-gray-200"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại Thư viện
        </button>

        {/* Layout chính */}
        <div className="overflow-hidden rounded-lg bg-white shadow-lg md:grid md:grid-cols-3">
          {/* Cột hình ảnh */}
          <div className="md:col-span-2">
            <img
              src={photoService.getPhotoUrl(photo.id, 800, 600)}
              alt={`Photo by ${photo.author}`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Cột thông tin chi tiết */}
          <div className="p-6 md:col-span-1">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {photo.title}
            </h1>
            <p className="mb-4 text-sm text-gray-500">
              bởi{' '}
              <span className="font-semibold">
                {formatAuthorName(photo.author)}
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Mô tả</h3>
                <p className="text-gray-600">{photo.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Kích thước</h3>
                <p className="text-gray-600">{`${photo.width} x ${photo.height} pixels`}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Photo ID</h3>
                <p className="font-mono text-sm text-gray-500">{photo.id}</p>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="mt-6">
              <a
                href={photo.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-white transition-colors hover:bg-blue-700"
              >
                Tải ảnh gốc
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
