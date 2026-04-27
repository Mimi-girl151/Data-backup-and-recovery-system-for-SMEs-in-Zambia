import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Backup', icon: '💾', path: '/backup' },
    { label: 'Recovery', icon: '🔄', path: '/recovery' },
    { label: 'Settings', icon: '⚙️', path: '/settings', active: true },
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to change password';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested. Contact support.');
    }
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
              <h1 className="db-page-title">Settings</h1>
              <p className="db-page-sub">Manage your account and security settings</p>
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
          {/* Profile Section */}
          <div className="db-section">
            <h2 className="db-section-title">Profile Information</h2>
            <div className="db-profile-field">
              <label className="db-label">Full Name</label>
              <div className="db-value">{user?.full_name || 'Not set'}</div>
            </div>
            <div className="db-profile-field">
              <label className="db-label">Email Address</label>
              <div className="db-value">{user?.email}</div>
            </div>
            <div className="db-profile-field">
              <label className="db-label">Role</label>
              <div className="db-value db-capitalize">{user?.role || 'User'}</div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="db-section">
            <h2 className="db-section-title">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="db-form">
              <div className="db-form-field">
                <label className="db-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="db-input"
                  required
                />
              </div>
              <div className="db-form-field">
                <label className="db-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="db-input"
                  required
                />
              </div>
              <div className="db-form-field">
                <label className="db-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="db-input"
                  required
                />
              </div>
              {message && (
                <div className={`db-message db-message--${message.type}`}>
                  {message.text}
                </div>
              )}
              <button type="submit" className="db-btn db-btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="db-section db-section-danger">
            <h2 className="db-section-title db-text-danger">Danger Zone</h2>
            <p className="db-section-text db-mb-3">
              Once you delete your account, all your backed up files will be permanently removed.
            </p>
            <button onClick={handleDeleteAccount} className="db-btn db-btn-danger">
              Delete Account
            </button>
          </div>

          {/* Logout Section */}
          <div className="db-section">
            <h2 className="db-section-title">Session</h2>
            <button onClick={logout} className="db-btn db-btn-secondary">
              Sign Out
            </button>
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
    --surface: #1f2f3a;
    --surface2: #243642;
    --border: rgba(166,62,27,0.2);
    --border2: rgba(255,255,255,0.06);
    --text: #e8ddd4;
    --muted: #8a9ba8;
    --white: #f0ece8;
    --danger: #e74c3c;
    --success: #27ae60;
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
    to { background-position: 40px 40px; }
  }

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
  .db-nav-item:hover {
    background: rgba(166, 62, 27, 0.12);
    color: var(--white);
  }
  .db-nav-item--active {
    background: rgba(166, 62, 27, 0.2);
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

  .db-user-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--white);
    white-space: nowrap;
  }
  .db-user-role {
    font-size: 10px;
    color: var(--muted);
    white-space: nowrap;
  }

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
    background: rgba(26, 39, 48, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    font-size: 16px;
  }
  .db-toggle-btn:hover { color: var(--white); }

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

  .db-section-danger {
    border-color: rgba(231, 76, 60, 0.3);
  }

  .db-section-title {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--white);
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .db-section-text {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
  }

  .db-profile-field {
    margin-bottom: 16px;
  }

  .db-label {
    display: block;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .db-value {
    padding: 8px 0;
    color: var(--white);
    font-size: 14px;
    border-bottom: 1px solid var(--border2);
  }

  .db-capitalize {
    text-transform: capitalize;
  }

  .db-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .db-form-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .db-input {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 14px;
    color: var(--white);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .db-input:focus {
    border-color: var(--ember);
  }

  .db-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .db-btn-primary {
    background: linear-gradient(135deg, var(--ember), var(--ember-l));
    color: white;
  }
  .db-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }
  .db-btn-secondary {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .db-btn-secondary:hover {
    background: var(--surface3);
  }
  .db-btn-danger {
    background: rgba(231, 76, 60, 0.15);
    border: 1px solid rgba(231, 76, 60, 0.5);
    color: var(--danger);
  }
  .db-btn-danger:hover {
    background: rgba(231, 76, 60, 0.25);
  }
  .db-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .db-message {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 13px;
  }
  .db-message--success {
    background: rgba(39, 174, 96, 0.1);
    border: 1px solid rgba(39, 174, 96, 0.3);
    color: var(--success);
  }
  .db-message--error {
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid rgba(231, 76, 60, 0.3);
    color: var(--danger);
  }

  .db-text-danger {
    color: var(--danger) !important;
  }

  .db-mb-3 {
    margin-bottom: 12px;
  }

  @media (max-width: 680px) {
    .db-sidebar { display: none; }
    .db-content { padding: 16px; }
  }
`;