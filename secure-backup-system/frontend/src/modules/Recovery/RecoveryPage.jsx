import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function RecoveryPage() {
  const { user } = useAuthStore();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Backup', icon: '💾', path: '/backup' },
    { label: 'Recovery', icon: '🔄', path: '/recovery', active: true },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  useEffect(() => {
    // Mock data - replace with API call later
    const mockFiles = [
      { id: 1, name: 'Q1-Report.pdf', size: 2400000, date: '2026-04-06T08:22:00Z', type: 'pdf' },
      { id: 2, name: 'client-contracts.zip', size: 15800000, date: '2026-04-05T14:10:00Z', type: 'zip' },
      { id: 3, name: 'database-export.sql', size: 890000, date: '2026-04-04T11:55:00Z', type: 'sql' },
      { id: 4, name: 'payroll-march.xlsx', size: 340000, date: '2026-04-03T09:30:00Z', type: 'xlsx' },
    ];
    
    setTimeout(() => {
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleRestore = async (file) => {
    setRestoring(file.id);
    setTimeout(() => {
      alert(`Restoring: ${file.name}\nThis will download the decrypted file.`);
      setRestoring(null);
    }, 1500);
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
            <div className="overflow-x-auto">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="db-loading-cell">
                        <div className="db-spinner" />
                        Loading files...
                      </td>
                    </tr>
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="db-empty-cell">
                        No backup files found. Go to Backup to upload files.
                      </td>
                    </tr>
                  ) : (
                    files.map((file) => (
                      <tr key={file.id}>
                        <td>
                          <div className="db-file-info">
                            <span className="db-file-icon">📄</span>
                            <span>{file.name}</span>
                          </div>
                        </td>
                        <td>{formatBytes(file.size)}</td>
                        <td>{formatDate(file.date)}</td>
                        <td>
                          <button
                            onClick={() => handleRestore(file)}
                            disabled={restoring === file.id}
                            className="db-restore-btn"
                          >
                            {restoring === file.id ? 'Restoring...' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="db-section">
            <h3 className="db-section-title">Restore Notice</h3>
            <p className="db-section-text">
              Files are encrypted with your password. You will need your encryption key to decrypt restored files.
            </p>
          </div>
        </div>
      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  
  :root {
    --deep: #1a2730;
    --ember: #a63e1b;
    --ember-l: #c8521f;
    --ember-glow: rgba(166,62,27,0.3);
    --surface: #1f2f3a;
    --surface2: #243642;
    --surface3: #2a3d4a;
    --border: rgba(166,62,27,0.2);
    --border2: rgba(255,255,255,0.06);
    --text: #e8ddd4;
    --muted: #8a9ba8;
    --white: #f0ece8;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

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

  @keyframes gridMove {
    to {
      background-position: 40px 40px;
    }
  }

  /* Sidebar */
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

  .db-sidebar--open {
    width: 230px;
  }

  .db-sidebar--closed {
    width: 60px;
  }

  .db-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 14px;
    border-bottom: 1px solid var(--border);
    min-height: 68px;
  }

  .db-vault-icon {
    font-size: 28px;
  }

  .db-logo-name {
    display: block;
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--white);
    letter-spacing: 1px;
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
    transition: background 0.2s, color 0.2s;
    white-space: nowrap;
    text-decoration: none;
  }

  .db-nav-item:hover {
    background: rgba(166, 62, 27, 0.12);
    color: var(--white);
  }

  .db-nav-item--active {
    background: rgba(166, 62, 27, 0.2);
    color: var(--ember-l);
    border-left: 2px solid var(--ember);
  }

  .db-nav-icon {
    flex-shrink: 0;
    font-size: 18px;
  }

  .db-nav-label {
    overflow: hidden;
  }

  .db-sidebar-footer {
    padding: 12px 10px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
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
    flex-shrink: 0;
  }

  .db-user-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .db-user-role {
    font-size: 10px;
    color: var(--muted);
    white-space: nowrap;
  }

  /* Main Content */
  .db-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  .db-header {
    padding: 18px 28px;
    border-bottom: 1px solid var(--border2);
    background: rgba(26, 39, 48, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .db-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .db-toggle-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 7px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    font-size: 16px;
  }

  .db-toggle-btn:hover {
    color: var(--white);
  }

  .db-page-title {
    font-family: 'Cinzel', serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--white);
  }

  .db-page-sub {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
  }

  .db-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .db-enc-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(39, 126, 82, 0.12);
    border: 1px solid rgba(39, 126, 82, 0.3);
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

  .db-section-title {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--white);
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .db-section-text {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
  }

  /* Table Styles */
  .db-table {
    width: 100%;
    border-collapse: collapse;
  }

  .db-table th {
    text-align: left;
    padding: 12px 16px;
    color: var(--muted);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 1px;
    border-bottom: 1px solid var(--border);
  }

  .db-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border2);
    color: var(--text);
    font-size: 13px;
  }

  .db-table tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .db-file-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .db-file-icon {
    font-size: 20px;
  }

  .db-restore-btn {
    padding: 6px 16px;
    background: rgba(166, 62, 27, 0.15);
    border: 1px solid var(--border);
    border-radius: 5px;
    font-size: 11px;
    color: var(--ember-l);
    cursor: pointer;
    transition: all 0.2s;
  }

  .db-restore-btn:hover:not(:disabled) {
    background: rgba(166, 62, 27, 0.3);
    transform: translateY(-1px);
  }

  .db-restore-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .db-loading-cell, .db-empty-cell {
    text-align: center;
    padding: 40px !important;
    color: var(--muted);
  }

  .db-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-top-color: var(--ember);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 680px) {
    .db-sidebar {
      display: none;
    }
    .db-content {
      padding: 16px;
    }
  }
`;