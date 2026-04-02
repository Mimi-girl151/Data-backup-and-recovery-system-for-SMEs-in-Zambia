/**
 * AES-256-GCM encryption/decryption using Web Crypto API
 */

// Convert string to ArrayBuffer
const stringToArrayBuffer = (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derive encryption key from password using PBKDF2
 * @param {string} password - User's password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} Derived key
 */
export const deriveKey = async (password, salt) => {
  const passwordBuffer = stringToArrayBuffer(password);
  
  // Import password as key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive key using PBKDF2
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  return key;
};

/**
 * Generate random salt
 * @returns {Uint8Array} Random salt (16 bytes)
 */
export const generateSalt = () => {
  return window.crypto.getRandomValues(new Uint8Array(16));
};

/**
 * Generate random initialization vector
 * @returns {Uint8Array} Random IV (12 bytes for GCM)
 */
export const generateIV = () => {
  return window.crypto.getRandomValues(new Uint8Array(12));
};

/**
 * Encrypt data using AES-256-GCM
 * @param {CryptoKey} key - Encryption key
 * @param {ArrayBuffer} data - Data to encrypt
 * @returns {Promise<{ciphertext: ArrayBuffer, iv: Uint8Array}>}
 */
export const encryptData = async (key, data) => {
  const iv = generateIV();
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );
  
  return {
    ciphertext: encrypted,
    iv: iv,
  };
};

/**
 * Decrypt data using AES-256-GCM
 * @param {CryptoKey} key - Decryption key
 * @param {ArrayBuffer} ciphertext - Encrypted data
 * @param {Uint8Array} iv - Initialization vector
 * @returns {Promise<ArrayBuffer>} Decrypted data
 */
export const decryptData = async (key, ciphertext, iv) => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );
  
  return decrypted;
};

/**
 * Encrypt a file using password
 * @param {File} file - File to encrypt
 * @param {string} password - User's password
 * @returns {Promise<{encryptedData: ArrayBuffer, iv: Uint8Array, salt: Uint8Array}>}
 */
export const encryptFile = async (file, password) => {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  
  const fileBuffer = await file.arrayBuffer();
  const { ciphertext, iv } = await encryptData(key, fileBuffer);
  
  return {
    encryptedData: ciphertext,
    iv: iv,
    salt: salt,
  };
};

/**
 * Decrypt a file using password
 * @param {ArrayBuffer} encryptedData - Encrypted file data
 * @param {string} password - User's password
 * @param {Uint8Array} iv - Initialization vector
 * @param {Uint8Array} salt - Salt used for key derivation
 * @returns {Promise<ArrayBuffer>} Decrypted file data
 */
export const decryptFile = async (encryptedData, password, iv, salt) => {
  const key = await deriveKey(password, salt);
  const decryptedData = await decryptData(key, encryptedData, iv);
  return decryptedData;
};