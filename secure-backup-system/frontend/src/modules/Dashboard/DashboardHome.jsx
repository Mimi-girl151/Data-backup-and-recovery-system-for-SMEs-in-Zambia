import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats } from '../../api/dashboard';

export default function DashboardHome() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {
        // fallback demo data if API isn't wired yet
        setStats({
          total_files: 24,
          storage_used_bytes: 1_540_000_000,
          storage_limit_bytes: 5_000_000_000,
          last_backup: '2026-04-06T08:22:00Z',
          recent_files: [
            { id: 1, original_filename: 'Q1-Report.pdf', size: 2400000, created_at: '2026-04-06T08:22:00Z' },
            { id: 2, original_filename: 'client-contracts.zip', size: 15800000, created_at: '2026-04-05T14:10:00Z' },
            { id: 3, original_filename: 'database-export.sql', size: 890000, created_at: '2026-04-04T11:55:00Z' },
            { id: 4, original_filename: 'payroll-march.xlsx', size: 340000, created_at: '2026-04-03T09:30:00Z' },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatBytes = (b) => {
    if (b >= 1e9) return (b / 1e9).toFixed(1) + ' GB';
    if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB';
    if (b >= 1e3) return (b / 1e3).toFixed(1) + ' KB';
    return b + ' B';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const storagePercent = stats
    ? Math.min(100, Math.round((stats.storage_used_bytes / stats.storage_limit_bytes) * 100))
    : 0;

  const navItems = [
    { label: 'Dashboard', icon: <HomeIcon />, path: '/dashboard', active: true },
    { label: 'Backup', icon: <UploadIcon />, path: '/backup' },
    { label: 'Recovery', icon: <DownloadIcon />, path: '/recovery' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <div className="db-root">
      <div className="db-grid" />

      {/* ── SIDEBAR ── */}
      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : 'db-sidebar--closed'}`}>
        {/* Logo */}
        <div className="db-logo">
          <VaultIcon />
          {sidebarOpen && (
            <div>
              <span className="db-logo-name">VaultGuard</span>
              <span className="db-logo-sub">Secure Backup</span>
            </div>
          )}
        </div>

        {/* Nav */}
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

        {/* Storage mini-bar */}
        {sidebarOpen && stats && (
          <div className="db-storage-mini">
            <div className="db-storage-mini-label">
              <span>Storage</span>
              <span>{formatBytes(stats.storage_used_bytes)} / {formatBytes(stats.storage_limit_bytes)}</span>
            </div>
            <div className="db-storage-bar">
              <div
                className="db-storage-fill"
                style={{ width: `${storagePercent}%`, background: storagePercent > 80 ? '#e74c3c' : '#a63e1b' }}
              />
            </div>
          </div>
        )}

        {/* User + logout */}
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
          <button className="db-logout-btn" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="db-main">
        {/* Header */}
        <header className="db-header">
          <div className="db-header-left">
            <button className="db-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </button>
            <div>
              <h1 className="db-page-title">Dashboard</h1>
              <p className="db-page-sub">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}</p>
            </div>
          </div>
          <div className="db-header-right">
            <div className="db-enc-badge">
              <ShieldIcon />
              <span>AES-256 Encrypted</span>
            </div>
            <Link to="/backup" className="db-backup-btn">
              <UploadIcon />
              New Backup
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="db-content">
          {loading ? (
            <div className="db-loading">
              <div className="db-loading-ring" />
              <p>Loading your vault...</p>
            </div>
          ) : (
            <>
              {/* Stats grid */}
              <div className="db-stats-grid">
                <StatCard
                  icon={<FilesIcon />}
                  label="Total Files"
                  value={stats?.total_files ?? 0}
                  sub="backed up files"
                  color="#a63e1b"
                />
                <StatCard
                  icon={<StorageIcon />}
                  label="Storage Used"
                  value={formatBytes(stats?.storage_used_bytes ?? 0)}
                  sub={`of ${formatBytes(stats?.storage_limit_bytes ?? 0)} total`}
                  color="#c8521f"
                />
                <StatCard
                  icon={<ClockIcon />}
                  label="Last Backup"
                  value={stats?.last_backup ? new Date(stats.last_backup).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—'}
                  sub={stats?.last_backup ? new Date(stats.last_backup).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : 'No backups yet'}
                  color="#8a6a3a"
                />
                <StatCard
                  icon={<ShieldIcon />}
                  label="Encryption"
                  value="AES-256"
                  sub="GCM mode, client-side"
                  color="#2e7d52"
                />
              </div>

              {/* Storage bar */}
              <div className="db-section">
                <div className="db-section-header">
                  <h2 className="db-section-title">Storage Overview</h2>
                  <span className="db-section-badge">{storagePercent}% used</span>
                </div>
                <div className="db-storage-full">
                  <div className="db-storage-bar db-storage-bar--lg">
                    <div
                      className="db-storage-fill db-storage-fill--anim"
                      style={{
                        width: `${storagePercent}%`,
                        background: storagePercent > 80
                          ? 'linear-gradient(90deg,#c0392b,#e74c3c)'
                          : 'linear-gradient(90deg,#a63e1b,#c8521f)',
                      }}
                    />
                  </div>
                  <div className="db-storage-labels">
                    <span>{formatBytes(stats?.storage_used_bytes ?? 0)} used</span>
                    <span>{formatBytes((stats?.storage_limit_bytes ?? 0) - (stats?.storage_used_bytes ?? 0))} free</span>
                  </div>
                </div>
              </div>

              {/* Recent backups */}
              <div className="db-section">
                <div className="db-section-header">
                  <h2 className="db-section-title">Recent Backups</h2>
                  <Link to="/recovery" className="db-view-all">View all →</Link>
                </div>

                {stats?.recent_files?.length > 0 ? (
                  <div className="db-file-list">
                    {stats.recent_files.map((file) => (
                      <div key={file.id} className="db-file-row">
                        <div className="db-file-icon-wrap">
                          <FileIcon ext={file.original_filename.split('.').pop()} />
                        </div>
                        <div className="db-file-info">
                          <p className="db-file-name">{file.original_filename}</p>
                          <p className="db-file-meta">{formatBytes(file.size)} · {formatDate(file.created_at)}</p>
                        </div>
                        <div className="db-file-enc">
                          <span className="db-enc-tag">🔒 encrypted</span>
                        </div>
                        <Link to="/recovery" className="db-restore-btn">Restore</Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="db-empty">
                    <p>No backups yet. <Link to="/backup" className="db-link">Upload your first file →</Link></p>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="db-section">
                <h2 className="db-section-title" style={{ marginBottom: '14px' }}>Quick Actions</h2>
                <div className="db-actions-grid">
                  <Link to="/backup" className="db-action-card">
                    <UploadIcon />
                    <span className="db-action-label">Backup Files</span>
                    <span className="db-action-sub">Encrypt & upload</span>
                  </Link>
                  <Link to="/recovery" className="db-action-card">
                    <DownloadIcon />
                    <span className="db-action-label">Restore Files</span>
                    <span className="db-action-sub">Decrypt & download</span>
                  </Link>
                  <Link to="/settings" className="db-action-card">
                    <SettingsIcon />
                    <span className="db-action-label">Settings</span>
                    <span className="db-action-sub">Account & security</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style>{styles}</style>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
      <div>
        <p className="db-stat-label">{label}</p>
        <p className="db-stat-value">{value}</p>
        <p className="db-stat-sub">{sub}</p>
      </div>
    </div>
  );
}

/* ── File icon with extension color ── */
function FileIcon({ ext }) {
  const colors = { pdf: '#e74c3c', zip: '#f39c12', sql: '#3498db', xlsx: '#27ae60', docx: '#2980b9', png: '#9b59b6', jpg: '#9b59b6' };
  const color = colors[ext?.toLowerCase()] || '#8a9ba8';
  return (
    <div style={{ width: 36, height: 36, borderRadius: 6, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    </div>
  );
}

/* ── Icons ── */
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
function LogoutIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ShieldIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function FilesIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function StorageIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>; }
function ClockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  :root {
    --deep:#1a2730; --ember:#a63e1b; --ember-l:#c8521f;
    --surface:#1f2f3a; --surface2:#243642; --surface3:#2a3d4a;
    --border:rgba(166,62,27,0.2); --border2:rgba(255,255,255,0.06);
    --text:#e8ddd4; --muted:#8a9ba8; --white:#f0ece8;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  a{text-decoration:none;}

  .db-root { display:flex; width:100vw; height:100vh; background:var(--deep); font-family:'Jost',sans-serif; color:var(--text); overflow:hidden; position:relative; }
  .db-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(166,62,27,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(166,62,27,0.04) 1px,transparent 1px); background-size:40px 40px; animation:gridMove 25s linear infinite; pointer-events:none; }
  @keyframes gridMove { to{background-position:40px 40px;} }

  /* SIDEBAR */
  .db-sidebar {
    position:relative; z-index:10; background:var(--surface);
    border-right:1px solid var(--border);
    display:flex; flex-direction:column;
    transition:width .3s ease; flex-shrink:0; overflow:hidden;
  }
  .db-sidebar--open  { width:230px; }
  .db-sidebar--closed { width:60px; }

  .db-logo {
    display:flex; align-items:center; gap:10px;
    padding:20px 14px; border-bottom:1px solid var(--border);
    min-height:68px;
  }
  .db-logo-name { display:block; font-family:'Cinzel',serif; font-size:14px; font-weight:700; color:var(--white); letter-spacing:1px; white-space:nowrap; }
  .db-logo-sub  { display:block; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--ember-l); white-space:nowrap; }

  .db-nav { flex:1; padding:14px 8px; display:flex; flex-direction:column; gap:4px; }
  .db-nav-item {
    display:flex; align-items:center; gap:12px;
    padding:10px 10px; border-radius:6px;
    color:var(--muted); font-size:13px; font-weight:500;
    transition:background .2s,color .2s; white-space:nowrap;
  }
  .db-nav-item:hover { background:rgba(166,62,27,0.12); color:var(--white); }
  .db-nav-item--active { background:rgba(166,62,27,0.2); color:var(--ember-l); border-left:2px solid var(--ember); }
  .db-nav-icon { flex-shrink:0; display:flex; }
  .db-nav-label { overflow:hidden; }

  .db-storage-mini { padding:12px 14px; border-top:1px solid var(--border); }
  .db-storage-mini-label { display:flex; justify-content:space-between; font-size:10px; color:var(--muted); margin-bottom:6px; }
  .db-storage-bar { height:4px; background:rgba(166,62,27,0.15); border-radius:2px; overflow:hidden; }
  .db-storage-fill { height:100%; border-radius:2px; transition:width .8s ease; }

  .db-sidebar-footer {
    padding:12px 10px; border-top:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between; gap:8px;
  }
  .db-user-info { display:flex; align-items:center; gap:9px; overflow:hidden; }
  .db-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--ember),var(--ember-l)); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
  .db-user-name { font-size:12px; font-weight:600; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .db-user-role { font-size:10px; color:var(--muted); white-space:nowrap; }
  .db-logout-btn { background:none; border:1px solid var(--border); border-radius:6px; padding:7px; color:var(--muted); cursor:pointer; display:flex; align-items:center; transition:color .2s,border-color .2s; flex-shrink:0; }
  .db-logout-btn:hover { color:#e74c3c; border-color:rgba(231,76,60,0.4); }

  /* MAIN */
  .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative; z-index:2; }

  .db-header {
    padding:18px 28px; border-bottom:1px solid var(--border2);
    background:rgba(26,39,48,0.8); backdrop-filter:blur(10px);
    display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .db-header-left { display:flex; align-items:center; gap:14px; }
  .db-toggle-btn { background:none; border:1px solid var(--border); border-radius:6px; padding:7px; color:var(--muted); cursor:pointer; display:flex; align-items:center; transition:color .2s; }
  .db-toggle-btn:hover { color:var(--white); }
  .db-page-title { font-family:'Cinzel',serif; font-size:20px; font-weight:600; color:var(--white); }
  .db-page-sub { font-size:12px; color:var(--muted); margin-top:2px; }

  .db-header-right { display:flex; align-items:center; gap:12px; }
  .db-enc-badge {
    display:flex; align-items:center; gap:6px;
    padding:6px 12px; background:rgba(39,126,82,0.12);
    border:1px solid rgba(39,126,82,0.3); border-radius:20px;
    font-size:11px; color:#52c788;
  }
  .db-backup-btn {
    display:flex; align-items:center; gap:7px;
    padding:9px 16px; background:linear-gradient(135deg,var(--ember),var(--ember-l));
    border:none; border-radius:6px; color:var(--white);
    font-size:12px; font-weight:600; font-family:'Jost',sans-serif;
    cursor:pointer; transition:opacity .2s,transform .2s;
  }
  .db-backup-btn:hover { opacity:.9; transform:translateY(-1px); }

  .db-content { flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:22px; }

  /* LOADING */
  .db-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:16px; color:var(--muted); }
  .db-loading-ring { width:40px; height:40px; border:3px solid rgba(166,62,27,0.2); border-top-color:var(--ember); border-radius:50%; animation:spin .8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg);} }

  /* STATS */
  .db-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .db-stat-card {
    background:var(--surface); border:1px solid var(--border2);
    border-radius:10px; padding:18px; display:flex; gap:14px; align-items:flex-start;
    transition:border-color .2s,transform .2s;
  }
  .db-stat-card:hover { border-color:var(--border); transform:translateY(-2px); }
  .db-stat-icon { width:42px; height:42px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .db-stat-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
  .db-stat-value { font-family:'Cinzel',serif; font-size:20px; font-weight:700; color:var(--white); }
  .db-stat-sub { font-size:11px; color:var(--muted); margin-top:2px; }

  /* SECTIONS */
  .db-section { background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:20px; }
  .db-section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .db-section-title { font-family:'Cinzel',serif; font-size:14px; font-weight:600; color:var(--white); letter-spacing:1px; }
  .db-section-badge { font-size:11px; color:var(--ember-l); background:rgba(166,62,27,0.12); padding:3px 10px; border-radius:20px; }
  .db-view-all { font-size:12px; color:var(--ember-l); transition:color .2s; }
  .db-view-all:hover { color:var(--white); }

  /* STORAGE BAR */
  .db-storage-full { }
  .db-storage-bar--lg { height:8px; background:rgba(166,62,27,0.12); border-radius:4px; overflow:hidden; margin-bottom:8px; }
  .db-storage-fill--anim { height:100%; border-radius:4px; animation:fillIn 1s ease forwards; }
  @keyframes fillIn { from{width:0;} }
  .db-storage-labels { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); }

  /* FILE LIST */
  .db-file-list { display:flex; flex-direction:column; gap:2px; }
  .db-file-row {
    display:flex; align-items:center; gap:14px;
    padding:11px 12px; border-radius:7px;
    transition:background .2s;
  }
  .db-file-row:hover { background:rgba(255,255,255,0.04); }
  .db-file-icon-wrap { flex-shrink:0; }
  .db-file-info { flex:1; overflow:hidden; }
  .db-file-name { font-size:13px; font-weight:500; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .db-file-meta { font-size:11px; color:var(--muted); margin-top:2px; }
  .db-file-enc { }
  .db-enc-tag { font-size:10px; color:#52c788; background:rgba(39,126,82,0.12); padding:3px 8px; border-radius:10px; }
  .db-restore-btn {
    padding:6px 14px; background:rgba(166,62,27,0.15); border:1px solid var(--border);
    border-radius:5px; font-size:11px; color:var(--ember-l);
    cursor:pointer; transition:background .2s; white-space:nowrap;
  }
  .db-restore-btn:hover { background:rgba(166,62,27,0.3); }

  /* ACTIONS */
  .db-actions-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .db-action-card {
    background:rgba(255,255,255,0.03); border:1px solid var(--border2);
    border-radius:10px; padding:20px 16px;
    display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;
    color:var(--muted); transition:background .2s,border-color .2s,color .2s;
  }
  .db-action-card:hover { background:rgba(166,62,27,0.1); border-color:var(--border); color:var(--white); }
  .db-action-label { font-size:13px; font-weight:600; color:var(--white); }
  .db-action-sub { font-size:11px; }

  .db-empty { text-align:center; padding:30px; color:var(--muted); font-size:13px; }
  .db-link { color:var(--ember-l); }

  @media(max-width:900px){
    .db-stats-grid { grid-template-columns:repeat(2,1fr); }
    .db-actions-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:600px){
    .db-sidebar { display:none; }
    .db-content { padding:16px; }
    .db-stats-grid { grid-template-columns:1fr 1fr; }
  }
`;

