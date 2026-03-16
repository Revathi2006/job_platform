// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';
import '../assets/css/Register.css';

function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('jobseeker');
  const [employerConfirmOpen, setEmployerConfirmOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedName = name.trim();
    const cleanedEmail = email.trim();

    if (!cleanedName || !cleanedEmail || !password) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }

    try {
      const registerPath =
        role === 'employer' ? '/auth/employer/register' : '/auth/jobseeker/register';

      await apiRequest(registerPath, {
        method: 'POST',
        body: { username: cleanedEmail, password }
      });

      const loginRes = await apiRequest('/auth/login', {
        method: 'POST',
        body: { username: cleanedEmail, password }
      });

      const token = loginRes?.token;
      const roleFromApi = (loginRes?.role || '').toString().toLowerCase();

      if (!token || !roleFromApi) {
        throw new Error('Registration succeeded, but login failed.');
      }

      const nextUser = {
        name: cleanedName,
        email: cleanedEmail,
        role: roleFromApi,
        token
      };

      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);

      if (roleFromApi === 'employer') {
        const created = await apiRequest('/employer/post', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { empcomname: cleanedName, empLoc: '', email: cleanedEmail }
        });
        const hydrated = { ...nextUser, employerId: created?.emid };
        localStorage.setItem('user', JSON.stringify(hydrated));
        setUser(hydrated);
      } else if (roleFromApi === 'jobseeker') {
        const created = await apiRequest('/jobseeker/post', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { jobseekername: cleanedName, jobseekeremail: cleanedEmail, jobexper: '' }
        });
        const hydrated = { ...nextUser, jobseekerId: created?.jobseekerid };
        localStorage.setItem('user', JSON.stringify(hydrated));
        setUser(hydrated);
      }

      navigate(roleFromApi === 'employer' ? '/dashboard/employer' : '/dashboard/jobseeker');
    } catch (err) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-page sh-auth sh-register">
      <div className="sh-container sh-register-grid">
        <section className="sh-card sh-register-card">
          <div className="sh-card-pad">
            <div className="sh-register-head">
              <p className="sh-eyebrow">Create account</p>
              <h1 className="sh-title sh-h2">Join SmartHire</h1>
              <p className="sh-lead">Create your account to start applying or hiring.</p>
            </div>

            <div className="sh-auth-role">
              <div className="sh-seg" role="group" aria-label="Account type">
                <button
                  type="button"
                  className="sh-seg-btn"
                  aria-pressed={role === 'jobseeker' ? 'true' : 'false'}
                  onClick={() => {
                    setEmployerConfirmOpen(false);
                    setRole('jobseeker');
                  }}
                >
                  Job seeker
                </button>
                <button
                  type="button"
                  className="sh-seg-btn"
                  aria-pressed={role === 'employer' ? 'true' : 'false'}
                  onClick={() => {
                    setRole('employer');
                    setEmployerConfirmOpen(true);
                  }}
                >
                  Employer
                </button>
              </div>
            </div>

            {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}

            <form className="sh-register-form" onSubmit={handleSubmit}>
              <div className="sh-field">
                <label className="sh-label" htmlFor="name">
                  {role === 'employer' ? 'Company name' : 'Full name'}
                </label>
                <input
                  className="sh-input"
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'employer' ? 'Acme Inc.' : 'Your name'}
                  required
                />
              </div>

              <div className="sh-field">
                <label className="sh-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="sh-input"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
                <div className="sh-register-hint">Use a strong password.</div>
              </div>

              <button className="sh-btn sh-btn-primary sh-register-submit" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </button>

              <div className="sh-register-foot">
                <span>
                  Already have an account?{' '}
                  <button className="sh-auth-link" type="button" onClick={() => navigate('/login')}>
                    Sign in
                  </button>
                </span>
                <button className="sh-btn sh-btn-ghost sh-btn-sm" type="button" onClick={() => navigate('/')}>
                  Back to home
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={employerConfirmOpen}
        title="Continue as an employer?"
        description="Employer accounts are for posting jobs and reviewing applicants. If you want to apply to jobs, choose Job seeker."
        confirmLabel="Yes, I'm an employer"
        cancelLabel="No, job seeker"
        onCancel={() => {
          setEmployerConfirmOpen(false);
          setRole('jobseeker');
        }}
        onConfirm={() => setEmployerConfirmOpen(false)}
      />
    </div>
  );
}

export default Register;
