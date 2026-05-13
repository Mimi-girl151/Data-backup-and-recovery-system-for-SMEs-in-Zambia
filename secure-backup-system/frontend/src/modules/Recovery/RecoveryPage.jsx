import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { filesApi } from '../../api/files';
import { decryptFile } from '../../crypto/aes-gcm';

export default function RecoveryPage() {
  const { user } = useAuthStore();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [message, setMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [showDecryptInput, setShowDecryptInput] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentFileInfo, setCurrentFileInfo] = useState(null);

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Backup', icon: '💾', path: '/backup' },
    { label: 'Recovery', icon: '🔄', path: '/recovery', active: true },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await filesApi.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      setMessage({ type: 'error', text: 'Failed to load files. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    setShowDecryptInput(file.id);
    setDecryptPassword('');
    setMessage(null);
    setCurrentFileInfo(file);
  };

  const performDownload = async (file) => {
    if (!decryptPassword || decryptPassword.length < 4) {
      setMessage({ type: 'error', text: 'Please enter the decryption password (min 4 characters).' });
      return;
    }

    setDownloading(file.id);
    setMessage(null);
    setDownloadProgress(0);

    try {
      // Step 1: Get download info with presigned URLs and salt
      const downloadInfo = await filesApi.getDownloadInfo(file.id);
      
      // Step 2: Download encrypted file from the first presigned URL
      setDownloadProgress(10);
      
      const response = await fetch(downloadInfo.presigned_urls[0]);
      const encryptedData = await response.arrayBuffer();
      
      setDownloadProgress(50);
      
      // Step 3: Convert stored IV from base64 to Uint8Array
      const iv = Uint8Array.from(atob(downloadInfo.iv), c => c.charCodeAt(0));
      
      // Step 4: Convert stored SALT from base64 to Uint8Array (CRITICAL FIX!)
      const salt = Uint8Array.from(atob(downloadInfo.salt), c => c.charCodeAt(0));
      
      setDownloadProgress(70);
      
      // Step 5: Decrypt the file using the stored salt
      const decryptedData = await decryptFile(encryptedData, decryptPassword, iv, salt);
      
      setDownloadProgress(90);
      
      // Step 6: Create download link and trigger browser download
      const blob = new Blob([decryptedData], { type: file.mime_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadProgress(100);
      setMessage({ type: 'success', text: `File "${file.original_filename}" downloaded and decrypted successfully!` });
      setShowDecryptInput(null);
      setDecryptPassword('');
      
      setTimeout(() => setDownloadProgress(0), 2000);
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Check if it's a decryption error (wrong password)
      if (error.message.includes('decrypt') || error.name === 'OperationError') {
        setMessage({ type: 'error', text: 'Decryption failed: Incorrect password or corrupted file.' });
      } else {
        setMessage({ type: 'error', text: 'Download failed. Please try again.' });
      }
    } finally {
      setDownloading(null);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
    return bytes + ' Bytes';
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="db-root">
      <div className="db-grid" />

      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : 'db-sidebar--closed'}`}>
        <div className="db-logo">
          <div className="db-vault-icon">🔐</div>
          {sidebarOpen && (
            <div>
              <span className="db-logo-name">VaultGuard</span>
              <span className="db-logo-sub">Secure Backup</span>
            </div>
          )}
        </div>

        <nav className="db-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`db-nav-item ${item.active ? 'db-nav-item--active' : ''}`}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="db-nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          {sidebarOpen && (
            <div className="db-user-info">
              <div className="db-avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <p className="db-user-name">{user?.full_name || 'User'}</p>
                <p className="db-user-role">{user?.role || 'Standard User'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="db-main">
        <header className="db-header">
          <div className="db-header-left">
            <button className="db-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div>
              <h1 className="db-page-title">Recovery</h1>
              <p className="db-page-sub">Restore your backed up files</p>
            </div>
          </div>
          <div className="db-header-right">
            <div className="db-enc-badge">
              🛡️
              <span>AES-256 Encrypted</span>
            </div>
          </div>
        </header>

        <div className="db-content">
          <div className="db-section">
            <div className="db-section-header">
              <h2 className="db-section-title">Your Backed Up Files</h2>
              <button onClick={loadFiles} className="db-refresh-btn" disabled={loading}>
                🔄
              </button>
            </div>

            {loading ? (
              <div className="db-loading">
                <div className="db-spinner" />
                <p>Loading your files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="db-empty">
                <p>No backups found. Go to <Link to="/backup" className="db-link">Backup</Link> to upload your first file.</p>
              </div>
            ) : (
              <div className="db-file-list">
                {files.map((file) => (
                  <div key={file.id} className="db-file-row">
                    <div className="db-file-icon">📄</div>
                    <div className="db-file-info">
                      <p className="db-file-name">{file.original_filename}</p>
                      <p className="db-file-meta">{formatBytes(file.file_size)} · {formatDate(file.created_at)}</p>
                    </div>
                    <div className="db-file-action">
                      {showDecryptInput === file.id ? (
                        <div className="db-decrypt-input">
                          <input
                            type="password"
                            placeholder="Encryption password"
                            value={decryptPassword}
                            onChange={(e) => setDecryptPassword(e.target.value)}
                            className="db-password-small"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && performDownload(file)}
                          />
                          <button
                            onClick={() => performDownload(file)}
                            disabled={downloading === file.id}
                            className="db-confirm-btn"
                            title="Confirm"
                          >
                            {downloading === file.id ? '⏳' : '✅'}
                          </button>
                          <button
                            onClick={() => {
                              setShowDecryptInput(null);
                              setDecryptPassword('');
                            }}
                            className="db-cancel-btn"
                            title="Cancel"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloading === file.id}
                          className="db-restore-btn"
                        >
                          {downloading === file.id ? '⏳ Downloading...' : '🔓 Restore'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Bar */}
            {downloading && currentFileInfo && downloadProgress > 0 && (
              <div className="db-progress-section">
                <div className="db-progress-header">
                  <span>Decrypting: {currentFileInfo.original_filename}</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="db-progress-bar">
                  <div 
                    className="db-progress-fill"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`db-message db-message--${message.type}`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}
          </div>

          <div className="db-section">
            <h3 className="db-section-title">Restore Notice</h3>
            <p className="db-section-text">
              Files are encrypted with the password you provided during backup.
              You will need that exact password to decrypt and restore each file.
            </p>
            <p className="db-section-text db-mt-2">
              ⚠️ The server never stores your encryption password. If you lose it, 
              the file cannot be recovered.
            </p>
          </div>
        </div>
      </main>

      <style>{dashboardStyles}</style>
    </div>
  );
}

const dashboardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  
  :root {
    --deep: #1a2730;
    --ember: #a63e1b;
    --ember-l: #c8521f;
    --surface: #1f2f3a;
    --surface2: #243642;
    --border: rgba(166,62,27,0.2);
    --border2: rgba(255,255,255,0.06);
    --text: #e8ddd4;
    --muted: #8a9ba8;
    --white: #f0ece8;
    --success: #27ae60;
    --danger: #e74c3c;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  a { text-decoration: none; }

  .db-root {
    display: flex;
    width: 100vw;
    height: 100vh;
    background: var(--deep);
    font-family: 'Jost', sans-serif;
    color: var(--text);
    overflow: hidden;
    position: relative;
  }

  .db-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(166,62,27,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(166,62,27,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 25s linear infinite;
    pointer-events: none;
  }

  @keyframes gridMove { to { background-position: 40px 40px; } }

  .db-sidebar {
    position: relative;
    z-index: 10;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    flex-shrink: 0;
    overflow: hidden;
  }

  .db-sidebar--open { width: 230px; }
  .db-sidebar--closed { width: 60px; }

  .db-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 14px;
    border-bottom: 1px solid var(--border);
    min-height: 68px;
  }

  .db-vault-icon { font-size: 28px; }
  .db-logo-name {
    display: block;
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--white);
    white-space: nowrap;
  }
  .db-logo-sub {
    display: block;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ember-l);
    white-space: nowrap;
  }

  .db-nav {
    flex: 1;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .db-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 10px;
    border-radius: 6px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
    text-decoration: none;
  }
  .db-nav-item:hover { background: rgba(166,62,27,0.12); color: var(--white); }
  .db-nav-item--active {
    background: rgba(166,62,27,0.2);
    color: var(--ember-l);
    border-left: 2px solid var(--ember);
  }
  .db-nav-icon { font-size: 18px; }

  .db-sidebar-footer {
    padding: 12px 10px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .db-user-info {
    display: flex;
    align-items: center;
    gap: 9px;
    overflow: hidden;
  }

  .db-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--ember), var(--ember-l));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
  }

  .db-user-name { font-size: 12px; font-weight: 600; color: var(--white); white-space: nowrap; }
  .db-user-role { font-size: 10px; color: var(--muted); white-space: nowrap; }

  .db-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2;
  }

  .db-header {
    padding: 18px 28px;
    border-bottom: 1px solid var(--border2);
    background: rgba(26,39,48,0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .db-header-left { display: flex; align-items: center; gap: 14px; }
  .db-toggle-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 7px;
    color: var(--muted);
    cursor: pointer;
    font-size: 16px;
  }
  .db-toggle-btn:hover { color: var(--white); }
  .db-page-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 600; color: var(--white); }
  .db-page-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .db-header-right { display: flex; align-items: center; gap: 12px; }
  .db-enc-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(39,126,82,0.12);
    border: 1px solid rgba(39,126,82,0.3);
    border-radius: 20px;
    font-size: 11px;
    color: #52c788;
  }

  .db-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .db-section {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 20px;
  }

  .db-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .db-section-title {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--white);
    letter-spacing: 1px;
  }

  .db-refresh-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--muted);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .db-refresh-btn:hover { color: var(--white); border-color: var(--ember); }

  .db-file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db-file-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    transition: background 0.2s;
  }
  .db-file-row:hover { background: rgba(255, 255, 255, 0.05); }

  .db-file-icon { font-size: 24px; }
  .db-file-info { flex: 1; }
  .db-file-name { font-size: 14px; font-weight: 500; color: var(--white); }
  .db-file-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .db-restore-btn {
    padding: 6px 16px;
    background: rgba(166,62,27,0.15);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    color: var(--ember-l);
    cursor: pointer;
    transition: all 0.2s;
  }
  .db-restore-btn:hover:not(:disabled) {
    background: rgba(166,62,27,0.3);
    transform: translateY(-1px);
  }
  .db-restore-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .db-decrypt-input {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .db-password-small {
    padding: 6px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--white);
    font-size: 12px;
    width: 140px;
    outline: none;
  }
  .db-password-small:focus { border-color: var(--ember); }

  .db-confirm-btn, .db-cancel-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 8px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }
  .db-confirm-btn {
    background: rgba(39,174,96,0.15);
    border-color: rgba(39,174,96,0.3);
    color: var(--success);
  }
  .db-confirm-btn:hover:not(:disabled) { background: rgba(39,174,96,0.25); }
  .db-cancel-btn {
    background: rgba(231,76,60,0.15);
    border-color: rgba(231,76,60,0.3);
    color: var(--danger);
  }
  .db-cancel-btn:hover { background: rgba(231,76,60,0.25); }
  .db-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .db-progress-section { margin-top: 16px; }
  .db-progress-header {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .db-progress-bar {
    height: 4px;
    background: rgba(166,62,27,0.15);
    border-radius: 4px;
    overflow: hidden;
  }
  .db-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--ember), var(--ember-l));
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .db-message {
    margin-top: 16px;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
  }
  .db-message--success {
    background: rgba(39,174,96,0.1);
    border: 1px solid rgba(39,174,96,0.3);
    color: var(--success);
  }
  .db-message--error {
    background: rgba(231,76,60,0.1);
    border: 1px solid rgba(231,76,60,0.3);
    color: var(--danger);
  }

  .db-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 12px;
    color: var(--muted);
  }

  .db-spinner {
    width: 30px;
    height: 30px;
    border: 2px solid var(--border);
    border-top-color: var(--ember);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  .db-empty {
    text-align: center;
    padding: 40px;
    color: var(--muted);
  }

  .db-link {
    color: var(--ember-l);
    text-decoration: none;
  }
  .db-link:hover { text-decoration: underline; }

  .db-mt-2 { margin-top: 8px; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 680px) {
    .db-sidebar { display: none; }
    .db-content { padding: 16px; }
    .db-file-row { flex-wrap: wrap; }
    .db-file-action { width: 100%; margin-top: 8px; }
  }
`;