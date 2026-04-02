import apiClient from './client';

export const filesApi = {
  /**
   * Upload a file chunk
   * @param {File} chunk - File chunk to upload
   * @param {string} originalName - Original filename
   * @param {string} iv - Initialization vector as base64
   * @param {number} chunkIndex - Index of this chunk
   * @param {number} totalChunks - Total number of chunks
   * @param {string} checksum - File checksum
   * @param {number} fileSize - Total file size
   * @param {string} mimeType - File MIME type
   * @returns {Promise} Upload response
   */
  uploadChunk: async (chunk, originalName, iv, chunkIndex, totalChunks, checksum, fileSize, mimeType) => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('original_name', originalName);
    formData.append('iv', iv);
    formData.append('chunk_index', chunkIndex.toString());
    formData.append('total_chunks', totalChunks.toString());
    formData.append('checksum', checksum);
    formData.append('file_size', fileSize.toString());
    formData.append('mime_type', mimeType);
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * List all files for the current user
   * @param {number} skip - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise<Array>} List of files
   */
  listFiles: async (skip = 0, limit = 50) => {
    const response = await apiClient.get('/files/list', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get download information for a file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Download info with presigned URLs
   */
  getDownloadInfo: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}/download`);
    return response.data;
  },

  /**
   * Delete a file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Delete response
   */
  deleteFile: async (fileId) => {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  },
};