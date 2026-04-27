import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { filesApi } from '../../api/files';

export default function BackupPage() {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { label: 'Backup', icon: <UploadIcon />, path: '/backup', active: true },
    { label: 'Recovery', icon: <DownloadIcon />, path: '/recovery' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(null);
      setShowPasswordInput(true);
      setEncryptionPassword('');
      setShowPassword(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }

    if (!encryptionPassword || encryptionPassword.length < 4) {
      setMessage({ type: 'error', text: 'Please enter an encryption password (min 4 characters).' });
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage(null);

    try {
      const response = await filesApi.uploadFile(
        selectedFile,
        encryptionPassword,
        (p) => setProgress(p)
      );
      
      setMessage({ type: 'success', text: `File "${selectedFile.name}" uploaded successfully!` });
      setSelectedFile(null);
      setShowPasswordInput(false);
      setEncryptionPassword('');
      
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.detail || 'Upload failed. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
    return bytes + ' Bytes';
  };

  return (
    <div className="db-root">
      <div className="db-grid" />

      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : 'db-sidebar--closed'}`}>
        <div className="db-logo">
          <VaultIcon />
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
              <MenuIcon />
            </button>
            <div>
              <h1 className="db-page-title">Backup Files</h1>
              <p className="db-page-sub">Upload and encrypt your files securely</p>
            </div>
          </div>
          <div className="db-header-right">
            <div className="db-enc-badge">
              <ShieldIcon />
              <span>AES-256 Encrypted</span>
            </div>
          </div>
        </header>

        <div className="db-content">
          <div className="db-section">
            {/* File Selection */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-ember transition-colors cursor-pointer">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="text-5xl mb-3">📁</div>
                <p className="text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </p>
                <p className="text-muted text-sm">
                  {selectedFile 
                    ? formatBytes(selectedFile.size)
                    : 'Maximum file size: 2GB'}
                </p>
              </label>
            </div>

            {/* Encryption Password Input with Show/Hide Toggle */}
            {showPasswordInput && selectedFile && !uploading && (
              <div className="mt-4 p-4 bg-surface2 rounded-lg border border-border">
                <label className="block text-sm font-medium text-white mb-2">
                  Encryption Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:border-ember pr-10" style={{ backgroundColor: "#1a2730", color: "#f0ece8", border: "1px solid rgba(166,62,27,0.2)" }}
                    placeholder="Enter a password to encrypt this file"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">
                  ⚠️ This password will be needed to decrypt the file. Store it safely!
                </p>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted mb-1">
                  <span>Encrypting and uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-ember rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploading && showPasswordInput && (
              <button
                onClick={handleUpload}
                disabled={!encryptionPassword || encryptionPassword.length < 4}
                className="mt-4 w-full py-3 bg-gradient-to-r from-ember to-ember-l text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔒 Encrypt & Upload
              </button>
            )}
          </div>

          <div className="db-section">
            <h3 className="text-white font-medium mb-2">Security Notice</h3>
            <p className="text-muted text-sm">
              Your files are encrypted with AES-256-GCM <strong>before</strong> they leave your browser.
              The encryption key is derived from your password using PBKDF2 (100,000 iterations).
              The server never sees your unencrypted data or your encryption password.
            </p>
          </div>
        </div>
      </main>

      <style>{dashboardStyles}</style>
    </div>
  );
}

// Icons
function VaultIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" style={{ flexShrink: 0 }}>
      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#a63e1b" strokeWidth="2.5"/>
      <circle cx="32" cy="32" r="12" stroke="#c8521f" strokeWidth="2"/>
      <circle cx="32" cy="32" r="6" stroke="#a63e1b" strokeWidth="2"/>
      <circle cx="32" cy="32" r="3" fill="#a63e1b"/>
      <rect x="54" y="29" width="5" height="6" rx="1" fill="#c8521f"/>
    </svg>
  );
}
function HomeIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function UploadIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function DownloadIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>; }
function SettingsIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ShieldIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }

const dashboardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  :root {
    --deep:#1a2730; --ember:#a63e1b; --ember-l:#c8521f;
    --surface:#1f2f3a; --surface2:#243642;
    --border:rgba(166,62,27,0.2); --text:#e8ddd4; --muted:#8a9ba8; --white:#f0ece8;
  }
  .db-root { display:flex; width:100vw; height:100vh; background:var(--deep); font-family:'Jost',sans-serif; color:var(--text); overflow:hidden; position:relative; }
  .db-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(166,62,27,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(166,62,27,0.04) 1px,transparent 1px); background-size:40px 40px; animation:gridMove 25s linear infinite; pointer-events:none; }
  @keyframes gridMove { to{background-position:40px 40px;} }
  .db-sidebar { position:relative; z-index:10; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; transition:width .3s ease; flex-shrink:0; overflow:hidden; }
  .db-sidebar--open { width:230px; }
  .db-sidebar--closed { width:60px; }
  .db-logo { display:flex; align-items:center; gap:10px; padding:20px 14px; border-bottom:1px solid var(--border); min-height:68px; }
  .db-logo-name { display:block; font-family:'Cinzel',serif; font-size:14px; font-weight:700; color:var(--white); letter-spacing:1px; white-space:nowrap; }
  .db-logo-sub { display:block; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--ember-l); white-space:nowrap; }
  .db-nav { flex:1; padding:14px 8px; display:flex; flex-direction:column; gap:4px; }
  .db-nav-item { display:flex; align-items:center; gap:12px; padding:10px 10px; border-radius:6px; color:var(--muted); font-size:13px; font-weight:500; transition:background .2s,color .2s; white-space:nowrap; }
  .db-nav-item:hover { background:rgba(166,62,27,0.12); color:var(--white); }
  .db-nav-item--active { background:rgba(166,62,27,0.2); color:var(--ember-l); border-left:2px solid var(--ember); }
  .db-nav-icon { flex-shrink:0; display:flex; }
  .db-sidebar-footer { padding:12px 10px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .db-user-info { display:flex; align-items:center; gap:9px; overflow:hidden; }
  .db-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--ember),var(--ember-l)); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
  .db-user-name { font-size:12px; font-weight:600; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .db-user-role { font-size:10px; color:var(--muted); white-space:nowrap; }
  .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative; z-index:2; }
  .db-header { padding:18px 28px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(26,39,48,0.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .db-header-left { display:flex; align-items:center; gap:14px; }
  .db-toggle-btn { background:none; border:1px solid var(--border); border-radius:6px; padding:7px; color:var(--muted); cursor:pointer; display:flex; align-items:center; transition:color .2s; }
  .db-toggle-btn:hover { color:var(--white); }
  .db-page-title { font-family:'Cinzel',serif; font-size:20px; font-weight:600; color:var(--white); }
  .db-page-sub { font-size:12px; color:var(--muted); margin-top:2px; }
  .db-header-right { display:flex; align-items:center; gap:12px; }
  .db-enc-badge { display:flex; align-items:center; gap:6px; padding:6px 12px; background:rgba(39,126,82,0.12); border:1px solid rgba(39,126,82,0.3); border-radius:20px; font-size:11px; color:#52c788; }
  .db-content { flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:22px; }
  .db-section { background:var(--surface); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:20px; }
  @media(max-width:680px){ .db-sidebar { display:none; } .db-content { padding:16px; } }
`;