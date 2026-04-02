/**
 * File chunking utilities for large files
 */

const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB

/**
 * Slice a file into chunks
 * @param {File} file - File to slice
 * @param {number} chunkSize - Size of each chunk in bytes
 * @returns {AsyncGenerator<Blob>} Generator yielding file chunks
 */
export async function* sliceFile(file, chunkSize = DEFAULT_CHUNK_SIZE) {
  let offset = 0;
  let chunkIndex = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    yield {
      chunk,
      index: chunkIndex,
      totalChunks: Math.ceil(file.size / chunkSize),
    };
    offset += chunkSize;
    chunkIndex++;
  }
}

/**
 * Calculate SHA-256 checksum of a file
 * @param {File} file - File to hash
 * @returns {Promise<string>} Hex checksum
 */
export const calculateChecksum = async (file) => {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Get total chunks for a file
 * @param {number} fileSize - Size of the file in bytes
 * @param {number} chunkSize - Size of each chunk in bytes
 * @returns {number} Number of chunks
 */
export const getTotalChunks = (fileSize, chunkSize = DEFAULT_CHUNK_SIZE) => {
  return Math.ceil(fileSize / chunkSize);
};

/**
 * Merge chunks into a single Blob
 * @param {Array<Blob>} chunks - Array of file chunks
 * @param {string} type - MIME type of the merged file
 * @returns {Blob} Merged file blob
 */
export const mergeChunks = (chunks, type = 'application/octet-stream') => {
  return new Blob(chunks, { type });
};