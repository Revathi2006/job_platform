// src/pages/ProfileSettings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import '../assets/css/ProfileSettings.css';

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const role = (user?.role || '').toString().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: '',
    experience: '',
    skills: ''
  });

  const isEmployer = role === 'employer';
  const isJobseeker = role === 'jobseeker';

  const title = useMemo(() => {
    if (isEmployer) return 'Company profile';
    if (isJobseeker) return 'Job seeker profile';
    return 'Profile settings';
  }, [isEmployer, isJobseeker]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      setError('');
      setStatus('');

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (isEmployer) {
          const email = (user.email || '').trim();
          let employerId = user.employerId;
          let profile = null;

          if (employerId) {
            profile = await apiRequest(`/employer/get/${employerId}`);
          } else if (email) {
            const matches = await apiRequest(`/employer/get/email/${encodeURIComponent(email)}`);
            if (Array.isArray(matches) && matches.length && matches[0]?.emid) {
              employerId = matches[0].emid;
              setUser((prev) => ({ ...prev, employerId }));
              profile = await apiRequest(`/employer/get/${employerId}`);
            }
          }

          if (cancelled) return;
          setForm((prev) => ({
            ...prev,
            name: profile?.empcomname ?? prev.name ?? '',
            email: email || prev.email || '',
            location: profile?.empLoc ?? ''
          }));
        } else if (isJobseeker) {
          const email = (user.email || '').trim();
          let jobseekerId = user.jobseekerId;
          let profile = null;

          if (jobseekerId) {
            profile = await apiRequest(`/jobseeker/get/${jobseekerId}`);
          } else if (email) {
            const matches = await apiRequest(`/jobseeker/get/email/${encodeURIComponent(email)}`);
            if (Array.isArray(matches) && matches.length && matches[0]?.jobseekerid) {
              jobseekerId = matches[0].jobseekerid;
              setUser((prev) => ({ ...prev, jobseekerId }));
              profile = await apiRequest(`/jobseeker/get/${jobseekerId}`);
            }
          }

          if (cancelled) return;
          setForm((prev) => ({
            ...prev,
            name: profile?.jobseekername ?? prev.name ?? '',
            email: email || prev.email || '',
            experience: profile?.jobexper ?? '',
            skills: profile?.jobskills ?? ''
          }));
        } else {
          if (cancelled) return;
          setForm((prev) => ({
            ...prev,
            name: user?.name || prev.name || '',
            email: user?.email || prev.email || ''
          }));
        }
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isEmployer, isJobseeker, setUser, user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    const cleanedName = (form.name || '').trim();
    const cleanedEmail = (user?.email || form.email || '').trim();

    if (!cleanedName || !cleanedEmail) {
      setError('Please fill the required fields.');
      return;
    }

    setSaving(true);
    try {
      if (isEmployer) {
        const employerId = user?.employerId;
        if (!employerId) throw new Error('Missing employer id.');

        await apiRequest(`/employer/update/${employerId}`, {
          method: 'PUT',
          body: {
            empcomname: cleanedName,
            empLoc: (form.location || '').trim(),
            email: cleanedEmail
          }
        });
      } else if (isJobseeker) {
        const jobseekerId = user?.jobseekerId;
        if (!jobseekerId) throw new Error('Missing jobseeker id.');

        await apiRequest(`/jobseeker/update/${jobseekerId}`, {
          method: 'PUT',
          body: {
            jobseekername: cleanedName,
            jobseekeremail: cleanedEmail,
            jobexper: (form.experience || '').trim(),
            jobskills: (form.skills || '').trim()
          }
        });
      }

      setUser((prev) => ({ ...prev, name: cleanedName, email: cleanedEmail }));
      setStatus('Saved.');
      setTimeout(() => setStatus(''), 1600);
    } catch (e) {
      setError(e?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sh-page sh-settings">
      <div className="sh-container">
        <header className="sh-settings-head">
          <div>
            <p className="sh-eyebrow">Settings</p>
            <h1 className="sh-title sh-h2">{title}</h1>
            <p className="sh-lead">Update your profile information.</p>
          </div>
          <span className="sh-badge">{user?.role || 'user'}</span>
        </header>

        <section className="sh-card">
          <div className="sh-card-pad">
            {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}
            <form className="sh-settings-form" onSubmit={onSubmit}>
              <div className="sh-field">
                <label className="sh-label" htmlFor="name">
                  {isEmployer ? 'Company name' : 'Name'}
                </label>
                <input
                  id="name"
                  className="sh-input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  disabled={loading || saving}
                  required
                />
              </div>

              <div className="sh-field">
                <label className="sh-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="sh-input"
                  type="email"
                  value={form.email}
                  readOnly
                  disabled
                />
              </div>

              {isEmployer ? (
                <div className="sh-field">
                  <label className="sh-label" htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    className="sh-input"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    disabled={loading || saving}
                    placeholder="e.g., Chennai"
                  />
                </div>
              ) : null}

              {isJobseeker ? (
                <div className="sh-field">
                  <label className="sh-label" htmlFor="experience">
                    Experience
                  </label>
                  <input
                    id="experience"
                    className="sh-input"
                    value={form.experience}
                    onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                    disabled={loading || saving}
                    placeholder="e.g., 1 year"
                  />
                </div>
              ) : null}

              {isJobseeker ? (
                <div className="sh-field">
                  <label className="sh-label" htmlFor="skills">
                    Skills
                  </label>
                  <input
                    id="skills"
                    className="sh-input"
                    value={form.skills}
                    onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
                    disabled={loading || saving}
                    placeholder="e.g., React, Java, SQL"
                  />
                </div>
              ) : null}

              <div className="sh-settings-actions">
                <button className="sh-btn sh-btn-primary" type="submit" disabled={loading || saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {status ? <span className="sh-settings-status">{status}</span> : null}
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
