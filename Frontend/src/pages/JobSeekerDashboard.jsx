// src/pages/JobSeekerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { loadJson, saveJson, STORAGE_KEYS } from '../lib/storage';
import '../assets/css/JobSeekerDashboard.css';

const appTone = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'applied':
      return 'accent';
    case 'under_review':
      return 'primary';
    case 'shortlisted':
      return 'accent';
    case 'interview':
      return 'success';
    case 'selected':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'ghost';
  }
};

const statusLabel = (status) => {
  const key = (status || '').toString().trim().toUpperCase();
  switch (key) {
    case 'APPLIED':
      return 'Applied';
    case 'UNDER_REVIEW':
      return 'Under Review';
    case 'SHORTLISTED':
      return 'Shortlisted';
    case 'INTERVIEW':
      return 'Interview';
    case 'SELECTED':
      return 'Selected';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status || '—';
  }
};

const normalizeJob = (job) => {
  if (!job) return null;
  if (job.jobid !== undefined) {
    const created = job.createdAt ? new Date(job.createdAt) : null;
    const postedDate = created && !Number.isNaN(created.getTime()) ? created.toLocaleDateString() : '—';

    return {
      id: job.jobid,
      title: job.jobtittle || 'Untitled role',
      company: job.employer?.empcomname || 'Company',
      location: job.jobloc || '—',
      type: job.jobtype || '—',
      salary: job.salary || '—',
      description: job.jobdes || '',
      postedDate,
      applyDeadline: job.applyDeadline || ''
    };
  }
  return job;
};

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');

  const [savedJobIds, setSavedJobIds] = useState(() => loadJson(STORAGE_KEYS.savedJobIds, []));

  useEffect(() => {
    saveJson(STORAGE_KEYS.savedJobIds, savedJobIds);
  }, [savedJobIds]);

  useEffect(() => {
    let alive = true;
    setLoadingJobs(true);
    setError('');

    apiRequest('/job/get')
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data.map(normalizeJob).filter(Boolean) : [];
        setRecommendedJobs(list);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'Failed to load jobs.');
        setRecommendedJobs([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingJobs(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.jobseekerId) return;
    let alive = true;
    setLoadingApps(true);
    setError('');

    apiRequest(`/application/get/jobseeker/${user.jobseekerId}`)
      .then((data) => {
        if (!alive) return;
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'Failed to load applications.');
        setApplications([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingApps(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.jobseekerId]);

  const stats = useMemo(() => {
    const interviewCount = applications.filter((a) => (a.status || '').toLowerCase() === 'interview').length;
    return [
      { label: 'Applications', value: applications.length, tone: 'primary' },
      { label: 'Interviews', value: interviewCount, tone: 'success' },
      { label: 'Saved jobs', value: savedJobIds.length, tone: 'accent' },
      { label: 'Profile views', value: 45, tone: 'ghost' }
    ];
  }, [applications, savedJobIds.length]);

  const toggleSaved = (jobId) => {
    setSavedJobIds((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
  };

  const goApply = (jobId) => {
    saveJson(STORAGE_KEYS.selectedJobId, jobId);
    navigate('/jobs');
  };

  return (
    <div className="sh-page sh-jobseeker">
      <div className="sh-container">
        <header className="sh-js-head">
          <div className="sh-js-head-left">
            <p className="sh-eyebrow">Job seeker dashboard</p>
            <h1 className="sh-title sh-h2">Welcome, {user?.name || 'Job Seeker'}</h1>
            <p className="sh-lead">Your next role is a few good clicks away.</p>
          </div>
        </header>

        {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}

        <section className="sh-js-kpis">
          {stats.map((s) => (
            <div key={s.label} className="sh-card sh-js-kpi">
              <div className="sh-card-pad-sm">
                <span className={`sh-badge ${s.tone === 'ghost' ? '' : `sh-badge-${s.tone}`}`}>{s.label}</span>
                <div className="sh-js-kpi-value">{s.value}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="sh-js-actions">
          <button className="sh-btn sh-btn-primary" type="button" onClick={() => navigate('/jobs')}>
            Find jobs
          </button>
          <button className="sh-btn sh-btn-ghost" type="button" onClick={() => navigate('/resume')}>
            Upload resume
          </button>
          <button className="sh-btn sh-btn-ghost" type="button" onClick={() => navigate('/settings')}>
            Profile settings
          </button>
          <button className="sh-btn sh-btn-ghost" type="button" onClick={() => navigate('/applications')}>
            Application tracker
          </button>
        </section>

        <section className="sh-section">
          <div className="sh-section-head">
            <h2 className="sh-title sh-h2">Recommended for you</h2>
            <span className="sh-badge">{recommendedJobs.length} roles</span>
          </div>

          {loadingJobs ? <p className="sh-lead">Loading jobs…</p> : null}

          <div className="sh-js-jobs">
            {recommendedJobs.slice(0, 3).map((job) => (
              <div key={job.id} className="sh-card sh-js-job">
                <div className="sh-card-pad-sm">
                  <div className="sh-js-job-top">
                    <div>
                      <div className="sh-js-job-title">{job.title}</div>
                      <div className="sh-js-job-company">{job.company}</div>
                    </div>
                  </div>
                  <div className="sh-js-job-meta">
                    <span className="sh-badge">{job.location}</span>
                    {savedJobIds.includes(job.id) ? <span className="sh-badge sh-badge-success">Saved</span> : null}
                  </div>
                  <div className="sh-js-job-desc">{job.description}</div>
                  <div className="sh-js-job-foot">
                    <button className="sh-btn sh-btn-sm sh-btn-primary" type="button" onClick={() => goApply(job.id)}>
                      Quick apply
                    </button>
                    <button className="sh-btn sh-btn-sm sh-btn-ghost" type="button" onClick={() => toggleSaved(job.id)}>
                      {savedJobIds.includes(job.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sh-section">
          <div className="sh-section-head">
            <h2 className="sh-title sh-h2">Your applications</h2>
            <span className="sh-badge">{applications.length}</span>
          </div>

          {loadingApps ? <p className="sh-lead">Loading applications…</p> : null}

          {applications.length ? (
            <div className="sh-js-timeline">
              {applications.map((app) => {
                const job = app?.job;
                const toneClass = appTone(app.status);
                const badgeClass = toneClass === 'ghost' ? 'sh-badge' : `sh-badge sh-badge-${toneClass}`;
                return (
                  <div key={app.appid ?? app.id} className="sh-card sh-js-tl-item">
                    <div className="sh-card-pad-sm sh-js-tl-inner">
                      <div className="sh-js-tl-left">
                        <span className={badgeClass}>{statusLabel(app.status)}</span>
                        <div className="sh-js-tl-title">{job?.jobtittle || 'Role'}</div>
                        <div className="sh-js-tl-sub">{job?.employer?.empcomname || 'Company'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="sh-card">
              <div className="sh-card-pad sh-js-empty">
                <h3 className="sh-title">No applications yet</h3>
                <p className="sh-lead">Browse jobs and start applying.</p>
                <button className="sh-btn sh-btn-primary" type="button" onClick={() => navigate('/jobs')}>
                  Browse jobs
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;