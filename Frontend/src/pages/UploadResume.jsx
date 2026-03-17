// src/pages/UploadResume.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest, authFetch } from '../lib/api';
import '../assets/css/UploadResume.css';

const UploadResume = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jobseekerId = user?.jobseekerId;

  const [meta, setMeta] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!jobseekerId) return;
    let alive = true;
    setError('');
    apiRequest(`/jobseeker/get/${jobseekerId}`)
      .then((profile) => {
        if (!alive) return;
        if (!profile) return;
        if (profile?.resumeName) {
          setMeta({
            name: profile.resumeName,
            size: profile.resumeSize || 0,
            type: profile.resumeType || 'unknown',
            updatedAt: profile.resumeUpdatedAt || new Date().toISOString()
          });
        } else {
          setMeta(null);
        }
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || 'Failed to load resume info.');
      });

    return () => {
      alive = false;
    };
  }, [jobseekerId]);

  useEffect(() => {
    if (!jobseekerId) return;
    let alive = true;
    apiRequest(`/application/get/jobseeker/${jobseekerId}`)
      .then((apps) => {
        if (!alive) return;
        const list = Array.isArray(apps) ? apps : [];
        const jobs = list
          .map((a) => ({
            appId: a?.appid,
            status: a?.status,
            title: a?.job?.jobtittle || 'Role',
            company: a?.job?.employer?.empcomname || 'Company',
            location: a?.job?.jobloc || '—'
          }))
          .slice(0, 5);
        setAppliedJobs(jobs);
      })
      .catch(() => {
        if (!alive) return;
        setAppliedJobs([]);
      });

    return () => {
      alive = false;
    };
  }, [jobseekerId]);

  const onPick = async (file) => {
    if (!file) return;
    if (!jobseekerId) {
      setError('Missing Jobseeker ID. Please re-login.');
      return;
    }
    if (!user?.token) {
      setError('Session expired. Please log in again.');
      return;
    }

    setError('');
    setStatus('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await authFetch(`/jobseeker/resume/${jobseekerId}`, {
        method: 'POST',
        body: fd
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Upload failed (${res.status})`);
      }

      const updated = await res.json().catch(() => null);
      const next = {
        name: updated?.resumeName || file.name,
        size: updated?.resumeSize || file.size,
        type: updated?.resumeType || file.type || 'unknown',
        updatedAt: updated?.resumeUpdatedAt || new Date().toISOString()
      };
      setMeta(next);
      setStatus('Resume uploaded.');
      setTimeout(() => setStatus(''), 1800);
    } catch (e) {
      setError(e?.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sh-page sh-resume">
      <div className="sh-container">
        <header className="sh-resume-head">
          <div>
            <p className="sh-eyebrow">Resume</p>
            <h1 className="sh-title sh-h2">Upload your resume</h1>
            <p className="sh-lead">This resume will be attached automatically when you apply for jobs.</p>
          </div>
        </header>

        <section className="sh-card">
          <div className="sh-card-pad">
            {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}
            <div className="sh-resume-drop" role="group" aria-label="Resume upload">
              <div className="sh-resume-icon" aria-hidden="true">PDF</div>
              <div className="sh-resume-copy">
                <div className="sh-resume-title">Choose a file</div>
                <div className="sh-resume-sub">Accepted: PDF, DOC, DOCX</div>
              </div>
              <label className="sh-btn sh-btn-primary sh-resume-btn" aria-disabled={uploading ? 'true' : 'false'}>
                {uploading ? 'Uploading…' : 'Select file'}
                <input
                  className="sh-resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  disabled={uploading}
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
              </label>
            </div>

            {status ? <div className="sh-resume-toast">{status}</div> : null}

            <div className="sh-resume-meta">
              <h2 className="sh-title sh-h2">Current resume</h2>
              {meta ? (
                <div className="sh-card sh-resume-meta-card">
                  <div className="sh-card-pad-sm">
                    <div className="sh-resume-meta-row">
                      <span className="sh-badge sh-badge-primary">File</span>
                      <span className="sh-resume-meta-value">{meta.name}</span>
                    </div>
                    <div className="sh-resume-meta-row">
                      <span className="sh-badge">Type</span>
                      <span className="sh-resume-meta-value">{meta.type}</span>
                    </div>
                    <div className="sh-resume-meta-row">
                      <span className="sh-badge">Size</span>
                      <span className="sh-resume-meta-value">{Math.round(meta.size / 1024)} KB</span>
                    </div>
                    <div className="sh-resume-meta-row">
                      <span className="sh-badge">Updated</span>
                      <span className="sh-resume-meta-value">{new Date(meta.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sh-resume-empty">
                  <p className="sh-title">No resume uploaded</p>
                  <p className="sh-lead">Upload a file to see it listed here.</p>
                  <button className="sh-btn sh-btn-ghost" type="button" onClick={() => navigate('/jobs')}>
                    Browse jobs
                  </button>
                </div>
              )}
            </div>

            <div className="sh-resume-meta" style={{ marginTop: 18 }}>
              <h2 className="sh-title sh-h2">Jobs linked to your profile</h2>
              {appliedJobs.length ? (
                <div className="sh-tracker-list">
                  {appliedJobs.map((j) => (
                    <div key={j.appId ?? `${j.title}-${j.company}`} className="sh-card sh-tracker-item">
                      <div className="sh-card-pad-sm sh-tracker-item-inner">
                        <div className="sh-tracker-left">
                          <div className="sh-tracker-title">{j.title}</div>
                          <div className="sh-tracker-sub">{j.company}</div>
                          <div className="sh-tracker-meta">
                            <span className="sh-badge">{j.location}</span>
                          </div>
                        </div>
                        <div className="sh-tracker-right">
                          <span className="sh-badge">{(j.status || '—').toString().replaceAll('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sh-lead" style={{ marginTop: 12 }}>
                  No applications yet. Your resume will be attached automatically when you apply.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UploadResume;
