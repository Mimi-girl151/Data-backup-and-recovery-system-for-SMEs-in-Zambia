import apiClient from './client';

export const filesApi = {
  /**
   * Get storage statistics for dashboard
   * @returns {Promise} Storage stats (total files, storage used, last backup, recent files)
   */
  getStorageStats: async () => {
    const response = await apiClient.get('/files/stats');
    return response.data;
  },

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
   * Upload a complete file with encryption
   * @param {File} file - File to upload
   * @param {string} encryptionPassword - Password for encryption
   * @param {function} onProgress - Progress callback
   * @returns {Promise} Upload response
   */
  uploadFile: async (file, encryptionPassword, onProgress) => {
    // Import crypto functions dynamically
    const { encryptFile } = await import('../crypto/aes-gcm');
    const { calculateChecksum } = await import('../crypto/chunker');
    
    // Calculate checksum
    const checksum = await calculateChecksum(file);
    
    // Encrypt the file
    const { encryptedData, iv } = await encryptFile(file, encryptionPassword);
    
    // Convert IV to base64
    const ivBase64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
    
    // Upload as single chunk (for simplicity)
    const chunkBlob = new Blob([encryptedData]);
    
    // Directly call uploadChunk using filesApi reference
    const response = await filesApi.uploadChunk(
      chunkBlob,
      file.name,
      ivBase64,
      0,
      1,
      checksum,
      file.size,
      file.type
    );
    
    if (onProgress) onProgress(100);
    
    return response;
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

// Export individual functions for convenience
export const getStorageStats = filesApi.getStorageStats;
export const uploadChunk = filesApi.uploadChunk;
export const uploadFile = filesApi.uploadFile;
export const listFiles = filesApi.listFiles;
export const getDownloadInfo = filesApi.getDownloadInfo;
export const deleteFile = filesApi.deleteFile;

export default filesApi;