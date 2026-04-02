import React, { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { filesApi } from '../../api/files';
import { encryptFile, generateSalt } from '../../crypto/aes-gcm';
import { sliceFile, calculateChecksum } from '../../crypto/chunker';
import Button from '../../components/Common/Button';

const UploadArea = () => {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setCurrentFile(file);
    setError(null);
    setSuccess(null);
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Get user password (in production, prompt user)
      // For MVP, we'll use a derived password from user's email + secret
      // In real implementation, you should prompt user for encryption password
      const encryptionPassword = prompt(
        'Enter encryption password for this file (remember it for decryption):',
        user?.email?.split('@')[0] || 'default'
      );
      
      if (!encryptionPassword) {
        throw new Error('Encryption password is required');
      }
      
      // Calculate checksum for integrity
      const checksum = await calculateChecksum(file);
      
      // Generate salt for key derivation
      const salt = generateSalt();
      
      // Encrypt the entire file first (for demo purposes)
      // In production, you'd encrypt each chunk individually
      const { encryptedData, iv } = await encryptFile(file, encryptionPassword);
      
      // Convert IV to base64 for storage
      const ivBase64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
      
      // Prepare chunks
      const chunkSize = 1024 * 1024; // 1MB
      const totalChunks = Math.ceil(encryptedData.byteLength / chunkSize);
      
      // Upload each chunk
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, encryptedData.byteLength);
        const chunkData = encryptedData.slice(start, end);
        const chunkBlob = new Blob([chunkData]);
        
        await filesApi.uploadChunk(
          chunkBlob,
          file.name,
          ivBase64,
          i,
          totalChunks,
          checksum,
          file.size,
          file.type
        );
        
        setProgress(((i + 1) / totalChunks) * 100);
      }
      
      setSuccess(`File "${file.name}" uploaded successfully!`);
      setCurrentFile(null);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    }
  }, [user]);
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Backup Files</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Uploading: {currentFile?.name}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer block ${isUploading ? 'opacity-50' : ''}`}
        >
          <div className="text-5xl mb-3">📁</div>
          <p className="text-slate-600 mb-1">
            {isUploading ? 'Uploading...' : 'Click to select a file'}
          </p>
          <p className="text-sm text-slate-400">
            Files will be encrypted before upload using AES-256-GCM
          </p>
        </label>
      </div>
      
      <p className="text-xs text-slate-400 mt-4 text-center">
        Your files are encrypted client-side. The server never sees your unencrypted data.
      </p>
    </div>
  );
};

export default UploadArea;