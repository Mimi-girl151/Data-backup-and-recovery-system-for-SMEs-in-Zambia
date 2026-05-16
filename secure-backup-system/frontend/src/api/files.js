import apiClient from './client';

export const filesApi = {
  getStorageStats: async () => {
    const response = await apiClient.get('/api/files/stats');
    return response.data;
  },

  uploadChunk: async (chunk, originalName, iv, salt, chunkIndex, totalChunks, checksum, fileSize, mimeType) => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('original_name', originalName);
    formData.append('iv', iv);
    formData.append('salt', salt);
    formData.append('chunk_index', chunkIndex.toString());
    formData.append('total_chunks', totalChunks.toString());
    formData.append('checksum', checksum);
    formData.append('file_size', fileSize.toString());
    formData.append('mime_type', mimeType);
    
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadFile: async (file, encryptionPassword, customFileName, onProgress) => {
    const { encryptFile } = await import('../crypto/aes-gcm');
    const { calculateChecksum } = await import('../crypto/chunker');
    
    const checksum = await calculateChecksum(file);
    const { encryptedData, iv, salt } = await encryptFile(file, encryptionPassword);
    
    const ivBase64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
    const saltBase64 = btoa(String.fromCharCode(...new Uint8Array(salt)));
    
    const chunkBlob = new Blob([encryptedData]);
    
    const finalFileName = customFileName && customFileName.trim() !== '' ? customFileName : file.name;
    
    const response = await filesApi.uploadChunk(
      chunkBlob,
      finalFileName,
      ivBase64,
      saltBase64,
      0,
      1,
      checksum,
      file.size,
      file.type
    );
    
    if (onProgress) onProgress(100);
    
    return response;
  },

  listFiles: async (skip = 0, limit = 50) => {
    const response = await apiClient.get('/api/files/list', {
      params: { skip, limit },
    });
    return response.data;
  },

  getDownloadInfo: async (fileId) => {
    const response = await apiClient.get(`/api/files/${fileId}/download`);
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await apiClient.delete(`/api/files/${fileId}`);
    return response.data;
  },
};

export const getStorageStats = filesApi.getStorageStats;
export const uploadChunk = filesApi.uploadChunk;
export const uploadFile = filesApi.uploadFile;
export const listFiles = filesApi.listFiles;
export const getDownloadInfo = filesApi.getDownloadInfo;
export const deleteFile = filesApi.deleteFile;

export default filesApi;