// src/pages/Login.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';
import '../assets/css/Login.css';

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [employerConfirmOpen, setEmployerConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'jobseeker'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const ensureDomainProfile = async ({ token, role, email, name }) => {
    const authHeaders = { Authorization: `Bearer ${token}` };

    if (role === 'employer') {
      const existing = await apiRequest(`/employer/get/email/${encodeURIComponent(email)}`, { headers: authHeaders });
      if (Array.isArray(existing) && existing.length && existing[0]?.emid) {
        return { employerId: existing[0].emid };
      }
      const created = await apiRequest('/employer/post', {
        method: 'POST',
        headers: authHeaders,
        body: { empcomname: name, empLoc: '', email }
      });
      return { employerId: created?.emid };
    }

    if (role === 'jobseeker') {
      const existing = await apiRequest(`/jobseeker/get/email/${encodeURIComponent(email)}`, { headers: authHeaders });
      if (Array.isArray(existing) && existing.length && existing[0]?.jobseekerid) {
        return { jobseekerId: existing[0].jobseekerid };
      }
      const created = await apiRequest('/jobseeker/post', {
        method: 'POST',
        headers: authHeaders,
        body: { jobseekername: name, jobseekeremail: email, jobexper: '' }
      });
      return { jobseekerId: created?.jobseekerid };
    }

    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError('Please enter an email and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: { username: email, password }
      });

      const roleFromApi = (res?.role || '').toString().toLowerCase();
      if (!roleFromApi) {
        throw new Error('Login failed: missing role');
      }

      if (formData.role && roleFromApi !== formData.role) {
        throw new Error(`This account is a ${roleFromApi}. Please switch the role and try again.`);
      }

      const token = res?.token;
      if (!token) {
        throw new Error('Login failed: missing token');
      }

      const nextUser = {
        name: email.split('@')[0],
        email,
        role: roleFromApi,
        token
      };

      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);

      const ids = await ensureDomainProfile({
        token,
        role: roleFromApi,
        email,
        name: nextUser.name
      });

      const hydrated = { ...nextUser, ...ids };
      localStorage.setItem('user', JSON.stringify(hydrated));
      setUser(hydrated);

      const from = location.state?.from;
      if (typeof from === 'string' && from.startsWith('/')) {
        navigate(from);
      } else {
        navigate(roleFromApi === 'employer' ? '/dashboard/employer' : '/dashboard/jobseeker');
      }
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-page sh-auth">
      <div className="sh-container sh-auth-grid">
        <aside className="sh-auth-aside">
          <p className="sh-eyebrow">Welcome back</p>
          <h1 className="sh-title sh-h1">Pick up where you left off.</h1>
          <p className="sh-lead">
            Sign in to browse jobs, track applications, or manage candidates.
          </p>
          <div className="sh-auth-bullets">
            <div className="sh-auth-bullet">
              <span className="sh-badge sh-badge-primary">Jobs</span>
              <span>Search and save roles quickly</span>
            </div>
            <div className="sh-auth-bullet">
              <span className="sh-badge sh-badge-accent">Hiring</span>
              <span>Review candidates in one place</span>
            </div>
            <div className="sh-auth-bullet">
              <span className="sh-badge">Updates</span>
              <span>Keep a clear application timeline</span>
            </div>
          </div>
        </aside>

        <section className="sh-card sh-auth-card">
          <div className="sh-card-pad">
            <div className="sh-auth-head">
              <h2 className="sh-title sh-h2">Sign in</h2>
              <p className="sh-auth-sub">
                New here?{' '}
                <button className="sh-auth-link" type="button" onClick={() => navigate('/register')}>
                  Create an account
                </button>
              </p>
            </div>

            <div className="sh-auth-role">
              <div className="sh-seg" role="group" aria-label="Login role">
                <button
                  type="button"
                  className="sh-seg-btn"
                  aria-pressed={formData.role === 'jobseeker' ? 'true' : 'false'}
                  onClick={() => {
                    setEmployerConfirmOpen(false);
                    setFormData((p) => ({ ...p, role: 'jobseeker' }));
                  }}
                >
                  Job seeker
                </button>
                <button
                  type="button"
                  className="sh-seg-btn"
                  aria-pressed={formData.role === 'employer' ? 'true' : 'false'}
                  onClick={() => {
                    setFormData((p) => ({ ...p, role: 'employer' }));
                    setEmployerConfirmOpen(true);
                  }}
                >
                  Employer
                </button>
              </div>
            </div>

            {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}

            <form className="sh-auth-form" onSubmit={handleSubmit}>
              <div className="sh-field">
                <label className="sh-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="sh-input"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="sh-field">
                <label className="sh-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="sh-input"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="sh-auth-row">
                <label className="sh-auth-check">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>

              <button className="sh-btn sh-btn-primary sh-auth-submit" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <button className="sh-btn sh-btn-ghost sh-auth-back" type="button" onClick={() => navigate('/')}>
                Back to home
              </button>
            </form>

            <div className="sh-auth-note">
              Role controls which dashboard you land on after sign in.
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={employerConfirmOpen}
        title="Sign in as an employer?"
        description="Employer accounts land in the employer dashboard. If you're applying to jobs, switch to Job seeker."
        confirmLabel="Yes, employer"
        cancelLabel="No, job seeker"
        onCancel={() => {
          setEmployerConfirmOpen(false);
          setFormData((p) => ({ ...p, role: 'jobseeker' }));
        }}
        onConfirm={() => setEmployerConfirmOpen(false)}
      />
    </div>
  );
};

export default Login;
