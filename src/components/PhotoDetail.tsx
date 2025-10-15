import { useCallback } from 'react';
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

  const handleBackToGallery = useCallback(() => {
    let historyIndex = 0;

    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('photoListScrollPosition')) {
        sessionStorage.setItem('photoListScrollPosition', '0');
      }
      sessionStorage.setItem('photoListShouldRestore', 'true');
      historyIndex = window.history.state?.idx ?? 0;
    }

    if (historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate('/photos', { state: { from: 'photo-detail' } });
  }, [navigate]);

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
        onBack={handleBackToGallery}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Nút quay lại với design cải thiện */}
        <button
          onClick={handleBackToGallery}
          className="mb-8 flex items-center rounded-xl bg-white px-6 py-3 text-gray-700 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:bg-gray-50 hover:scale-105"
        >
          <svg
            className="mr-3 h-5 w-5"
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
          <span className="font-medium">Quay lại Thư viện</span>
        </button>

        {/* Layout chính với design cải thiện */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl md:grid md:grid-cols-3 animate-fade-in-up">
          {/* Cột hình ảnh */}
          <div className="md:col-span-2">
            <img
              src={photoService.getPhotoUrl(photo.id, 800, 600)}
              alt={`Photo by ${photo.author}`}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Cột thông tin chi tiết */}
          <div className="p-8 md:col-span-1">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 leading-tight">
              {photo.title}
            </h1>
            <p className="mb-6 text-gray-600">
              bởi{' '}
              <span className="font-semibold text-gray-800">
                {formatAuthorName(photo.author)}
              </span>
            </p>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                  Mô tả
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {photo.description}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                  Kích thước
                </h3>
                <p className="text-gray-600">{`${photo.width} × ${photo.height} pixels`}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                  Photo ID
                </h3>
                <p className="font-mono text-sm text-gray-500">{photo.id}</p>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="mt-8">
              <a
                href={photo.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-center text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
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
