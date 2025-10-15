import axios from 'axios';
import { APT_CONFIG } from '../constants/api';
import { ERROR_MESSAGES } from '../constants/api';
import type { Photo, PhotoDetail } from '../types/photo';

class PhotoService {
  private baseURL = APT_CONFIG.BASE_URL;

  /**
   * Get list photos with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of photos per page (default: 20)
   * @returns Promise with photo data and pagination info
   */

  async getPhotos(
    page: number = 1,
    limit: number = APT_CONFIG.DEFAULT_PAGE_SIZE
  ): Promise<Photo[]> {
    try {
      const response = await axios.get<Photo[]>(
        `${this.baseURL}${APT_CONFIG.LIST_ENDPOINT}`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw new Error(ERROR_MESSAGES.FETCH_PHOTOS_FAILED);
    }
  }

  /**
   * Get photo details by ID
   * @param id - Photo ID
   * @returns Promise with photo data
   */
  async getPhotoById(id: string): Promise<PhotoDetail> {
    try {
      const response = await axios.get<PhotoDetail>(
        `${this.baseURL}${APT_CONFIG.PHOTO_ENDPOINT}/${id}/info`
      );
      return {
        ...response.data,
        title: `Photo by ${response.data.author}`,
        description: `A beautiful photo captured by ${response.data.author}. Dimensions: ${response.data.width}x${response.data.height}px.`,
      };
    } catch (error) {
      console.error(`Error fetching photo ${id}:`, error);
      throw new Error(ERROR_MESSAGES.FETCH_PHOTO_DETAIL_FAILED);
    }
  }

  /**
   * Get optimized image URL for different sizes
   * @param id - Photo ID
   * @param width - Desired width
   * @param height - Desired height (optional)
   * @returns Optimized image URL
   */
  getPhotoUrl(id: string, width: number = 300, height: number = 300): string {
    return `${this.baseURL}${APT_CONFIG.PHOTO_ENDPOINT}/${id}/${width}/${height}`;
  }
}

export const photoService = new PhotoService();
