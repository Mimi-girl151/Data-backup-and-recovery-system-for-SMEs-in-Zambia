import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  // Separate state variables for clarity
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const strength = (() => {
    const v = password;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^a-zA-Z0-9]/.test(v)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#c0392b', '#e67e22', '#f1c40f', '#27ae60'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // LOG 1: What the user entered
    console.log('========== REGISTRATION DEBUG ==========');
    console.log('LOG 1 - Form field values:');
    console.log('  fullName (from Full Name input):', fullName);
    console.log('  email (from Email input):', email);
    console.log('  password (from Password input):', password);
    console.log('=========================================');
    
    // Validation
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      console.log('ERROR: Missing fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      console.log('ERROR: Password too short');
      return;
    }
    if (!agreed) {
      setError('Please acknowledge the encryption notice.');
      console.log('ERROR: Checkbox not agreed');
      return;
    }
    
    // LOG 2: What we are about to send to register function
    console.log('LOG 2 - Calling register() with parameters (order matters!):');
    console.log('  Parameter 1 (fullName):', fullName);
    console.log('  Parameter 2 (email):', email);
    console.log('  Parameter 3 (password):', password);
    console.log('=========================================');
    
    setLoading(true);
    try {
      const result = await register(fullName, email, password);
      
      // LOG 3: What came back from register function
      console.log('LOG 3 - Register result:', result);
      
      if (result.success) {
        console.log('SUCCESS: Registration worked, redirecting to /login');
        navigate('/login');
      } else {
        console.log('ERROR: Registration failed, result.error:', result.error);
        if (typeof result.error === 'object') {
          const errorMsg = result.error?.detail?.[0]?.msg || 'Registration failed';
          setError(errorMsg);
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      // LOG 4: Catch any errors
      console.log('LOG 4 - Exception caught:');
      console.log('  err:', err);
      console.log('  err.response:', err.response);
      console.log('  err.response?.data:', err.response?.data);
      console.log('  err.response?.data?.detail:', err.response?.data?.detail);
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail[0]?.msg || 'Validation failed');
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vg-root">
      <div className="vg-grid" />
      <div className="vg-orb vg-orb1" />
      <div className="vg-orb vg-orb2" />

      <div className="vg-scene">
        <div className="vg-left">
          <div className="vg-ring-wrap">
            <div className="vg-ring-spin" />
            <div className="vg-ring-inner" />
            <VaultIcon />
          </div>

          <div className="vg-brand-block">
            <h1 className="vg-brand-name">VaultGuard</h1>
            <p className="vg-brand-sub">Secure Backup System</p>
          </div>

          <p className="vg-brand-desc">
            Files encrypted before they leave your hands. Zero-knowledge security for SMEs.
          </p>

          <ul className="vg-features">
            {[
              'AES-256 client-side encryption',
              'Zero plaintext stored on server',
              'HTTPS / TLS 1.3 in transit',
              'Role-based access control',
              'Powered by MinIO object storage',
            ].map((f) => (
              <li key={f} className="vg-feat">
                <span className="vg-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="vg-divider" />

        <div className="vg-right">
          <div className="vg-card">
            <div className="vg-tabs">
              <Link to="/login" className="vg-tab">Sign In</Link>
              <button className="vg-tab vg-tab--active">Register</button>
            </div>

            <div className="vg-form-header">
              <h2 className="vg-form-title">Create account</h2>
              <p className="vg-form-sub">Start securing your files today.</p>
            </div>

            <form onSubmit={handleSubmit} className="vg-form" noValidate>
              {/* Full Name Input */}
              <div className="vg-field">
                <label className="vg-label">Full Name</label>
                <div className="vg-input-wrap">
                  <UserIcon />
                  <input
                    className="vg-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      console.log('Full Name input changed:', e.target.value);
                      setFullName(e.target.value);
                    }}
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="vg-field">
                <label className="vg-label">Email Address</label>
                <div className="vg-input-wrap">
                  <EmailIcon />
                  <input
                    className="vg-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      console.log('Email input changed:', e.target.value);
                      setEmail(e.target.value);
                    }}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="vg-field">
                <label className="vg-label">Password</label>
                <div className="vg-input-wrap">
                  <LockIcon />
                  <input
                    className="vg-input vg-input--pad-r"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      console.log('Password input changed:', e.target.value);
                      setPassword(e.target.value);
                    }}
                    placeholder="Min 8 chars, mixed case + numbers"
                    autoComplete="new-password"
                  />
                  <button type="button" className="vg-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {password && (
                  <div className="vg-strength">
                    <div className="vg-sbar">
                      {[1,2,3,4].map((i) => (
                        <div
                          key={i}
                          className="vg-seg"
                          style={{ background: i <= strength ? strengthColor : 'rgba(166,62,27,0.15)' }}
                        />
                      ))}
                    </div>
                    <span className="vg-slabel" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Role notice */}
              <div className="vg-notice">
                <InfoIcon />
                <span>
                  New accounts receive <strong style={{ color: '#c8521f' }}>Standard User</strong> role.
                  Contact your admin for elevated access.
                </span>
              </div>

              {/* Agree checkbox */}
              <label className="vg-chkrow">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { 
                    console.log('Checkbox changed:', e.target.checked);
                    setAgreed(e.target.checked); 
                    setError(''); 
                  }}
                  className="vg-chk-hidden"
                />
                <span className="vg-chkbox">
                  {agreed && <CheckIcon />}
                </span>
                <span>I understand files are encrypted with my password as the AES-256 key source.</span>
              </label>

              {error && <p className="vg-error">{error}</p>}

              <button type="submit" className="vg-cta" disabled={loading}>
                {loading ? (
                  <span className="vg-cta-inner">
                    <span className="vg-spinner" /> CREATING VAULT...
                  </span>
                ) : (
                  'CREATE VAULT ACCOUNT'
                )}
              </button>
            </form>

            <p className="vg-switch-text">
              Already have an account?{' '}
              <Link to="/login" className="vg-link">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

/* ── Icons ── */
function VaultIcon() {
  return (
    <svg className="vg-vault-svg" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#a63e1b" strokeWidth="2" />
      <circle cx="32" cy="32" r="13" stroke="#c8521f" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="7" stroke="#a63e1b" strokeWidth="1.5" />
      <line x1="32" y1="19" x2="32" y2="25" stroke="#c8521f" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="39" x2="32" y2="45" stroke="#c8521f" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="32" x2="25" y2="32" stroke="#c8521f" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="39" y1="32" x2="45" y2="32" stroke="#c8521f" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#a63e1b" />
      <rect x="5" y="17" width="4" height="6" rx="1" fill="#a63e1b" opacity=".5" />
      <rect x="5" y="41" width="4" height="6" rx="1" fill="#a63e1b" opacity=".5" />
      <rect x="54" y="29" width="5" height="6" rx="1" fill="#c8521f" />
    </svg>
  );
}
function UserIcon() { return <svg className="vg-ficon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function EmailIcon() { return <svg className="vg-ficon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function LockIcon() { return <svg className="vg-ficon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function EyeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function InfoIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a63e1b" strokeWidth="2" style={{flexShrink:0,marginTop:'1px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function CheckIcon() { return <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>; }

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  :root {
    --deep:#1a2730; --ember:#a63e1b; --ember-l:#c8521f;
    --ember-glow:rgba(166,62,27,0.3); --surface:#1f2f3a;
    --border:rgba(166,62,27,0.25); --text:#e8ddd4; --muted:#8a9ba8; --white:#f0ece8;
  }
  .vg-root { position:relative; width:100vw; height:100vh; background:var(--deep); overflow:hidden; font-family:'Jost',sans-serif; color:var(--text); }
  .vg-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(166,62,27,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(166,62,27,0.06) 1px,transparent 1px); background-size:40px 40px; animation:gridMove 20s linear infinite; pointer-events:none; }
  @keyframes gridMove { to { background-position:40px 40px; } }
  .vg-orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:orbPulse 7s ease-in-out infinite; }
  .vg-orb1 { width:360px; height:360px; background:rgba(166,62,27,0.12); top:-80px; right:-60px; }
  .vg-orb2 { width:260px; height:260px; background:rgba(26,39,48,0.9); bottom:-50px; left:-40px; animation-delay:3.5s; }
  @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:.8;} 50%{transform:scale(1.1);opacity:1;} }
  .vg-scene { position:relative; z-index:2; display:flex; width:100%; height:100vh; align-items:stretch; }
  .vg-left { width:42%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 36px; gap:18px; border-right:1px solid rgba(166,62,27,0.2); }
  .vg-ring-wrap { position:relative; width:150px; height:150px; display:flex; align-items:center; justify-content:center; }
  .vg-ring-spin { position:absolute; inset:0; border-radius:50%; border:1.5px solid transparent; border-top-color:#a63e1b; animation:ringSpin 8s linear infinite; }
  .vg-ring-inner { position:absolute; inset:14px; border-radius:50%; border:1px solid rgba(166,62,27,0.25); }
  @keyframes ringSpin { to { transform:rotate(360deg); } }
  .vg-vault-svg { width:62px; height:62px; position:relative; z-index:2; }
  .vg-brand-block { text-align:center; }
  .vg-brand-name { font-family:'Cinzel',serif; font-size:30px; font-weight:700; letter-spacing:3px; color:var(--white); text-shadow:0 0 28px var(--ember-glow); }
  .vg-brand-sub { font-size:9px; letter-spacing:4px; text-transform:uppercase; color:var(--ember-l); margin-top:5px; }
  .vg-brand-desc { font-size:12px; color:var(--muted); text-align:center; line-height:1.75; max-width:220px; font-weight:300; }
  .vg-features { list-style:none; padding:0; margin:0; width:100%; max-width:230px; display:flex; flex-direction:column; gap:10px; }
  .vg-feat { display:flex; align-items:center; gap:9px; font-size:12px; color:var(--muted); }
  .vg-dot { width:5px; height:5px; border-radius:50%; background:var(--ember); flex-shrink:0; box-shadow:0 0 5px var(--ember); }
  .vg-divider { width:1px; background:linear-gradient(to bottom,transparent,rgba(166,62,27,0.5) 20%,rgba(166,62,27,0.5) 80%,transparent); margin:8% 0; }
  .vg-right { width:58%; display:flex; align-items:center; justify-content:center; padding:40px; overflow-y:auto; }
  .vg-card { width:100%; max-width:380px; }
  .vg-tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:28px; }
  .vg-tab { flex:1; background:none; border:none; border-bottom:2px solid transparent; font-family:'Cinzel',serif; font-size:12px; letter-spacing:2px; color:var(--muted); padding:12px 0; cursor:pointer; text-decoration:none; text-align:center; transition:color .25s,border-color .25s; margin-bottom:-1px; display:block; }
  .vg-tab:hover { color:var(--ember-l); }
  .vg-tab--active { color:var(--ember-l) !important; border-bottom-color:var(--ember) !important; }
  .vg-form-header { margin-bottom:20px; }
  .vg-form-title { font-family:'Cinzel',serif; font-size:22px; font-weight:600; color:var(--white); }
  .vg-form-sub { font-size:12px; color:var(--muted); margin-top:4px; font-weight:300; }
  .vg-form { display:flex; flex-direction:column; gap:14px; }
  .vg-field { display:flex; flex-direction:column; gap:5px; }
  .vg-label { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:var(--muted); font-weight:500; }
  .vg-input-wrap { position:relative; }
  .vg-ficon { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; color:var(--muted); pointer-events:none; transition:color .2s; }
  .vg-input-wrap:focus-within .vg-ficon { color:var(--ember-l); }
  .vg-input { width:100%; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:11px 14px 11px 38px; color:var(--white); font-family:'Jost',sans-serif; font-size:14px; outline:none; transition:border-color .25s,box-shadow .25s; }
  .vg-input--pad-r { padding-right:40px; }
  .vg-input::placeholder { color:rgba(138,155,168,0.4); font-size:13px; }
  .vg-input:focus { border-color:var(--ember); box-shadow:0 0 0 3px var(--ember-glow); }
  .vg-eye { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--muted); cursor:pointer; padding:0; display:flex; align-items:center; transition:color .2s; }
  .vg-eye:hover { color:var(--ember-l); }
  .vg-strength { display:flex; align-items:center; gap:8px; margin-top:5px; }
  .vg-sbar { display:flex; gap:3px; flex:1; }
  .vg-seg { flex:1; height:2px; border-radius:2px; transition:background .3s; }
  .vg-slabel { font-size:10px; font-weight:500; min-width:36px; }
  .vg-notice { display:flex; align-items:flex-start; gap:8px; padding:9px 12px; background:rgba(166,62,27,0.08); border:1px solid rgba(166,62,27,0.2); border-radius:6px; font-size:11px; color:var(--muted); line-height:1.5; }
  .vg-chkrow { display:flex; align-items:flex-start; gap:9px; font-size:11px; color:var(--muted); cursor:pointer; }
  .vg-chk-hidden { display:none; }
  .vg-chkbox { width:15px; height:15px; flex-shrink:0; margin-top:1px; border:1px solid rgba(166,62,27,0.35); border-radius:3px; background:var(--surface); display:flex; align-items:center; justify-content:center; transition:background .2s; }
  .vg-chkrow input:checked ~ .vg-chkbox, .vg-chkbox:has(svg) { background:var(--ember); border-color:var(--ember); }
  .vg-error { font-size:12px; color:#e74c3c; background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); border-radius:5px; padding:9px 12px; }
  .vg-cta { width:100%; padding:13px; background:linear-gradient(135deg,var(--ember) 0%,var(--ember-l) 100%); border:none; border-radius:6px; color:var(--white); font-family:'Cinzel',serif; font-size:12px; letter-spacing:3px; font-weight:600; cursor:pointer; transition:transform .2s,box-shadow .2s,opacity .2s; margin-top:4px; }
  .vg-cta:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 22px rgba(166,62,27,0.4); }
  .vg-cta:disabled { opacity:.7; cursor:not-allowed; }
  .vg-cta-inner { display:flex; align-items:center; justify-content:center; gap:8px; }
  .vg-spinner { width:12px; height:12px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:ringSpin .6s linear infinite; }
  .vg-switch-text { text-align:center; margin-top:18px; font-size:12px; color:var(--muted); }
  .vg-link { color:var(--ember-l); font-size:12px; background:none; border:none; cursor:pointer; font-family:'Jost',sans-serif; text-decoration:none; transition:color .2s; }
  .vg-link:hover { color:var(--white); text-decoration:underline; }
  @media(max-width:680px){ .vg-left,.vg-divider{display:none;} .vg-right{width:100%;padding:28px;} }
`;