// src/pages/ApplicationTracker.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import '../assets/css/ApplicationTracker.css';

const tone = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'applied':
      return 'accent';
    case 'under_review':
      return 'primary';
    case 'shortlisted':
      return 'accent';
    case 'selected':
      return 'success';
    case 'interview':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'accent';
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

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

const stageState = (current, stage) => {
  const cur = (current || '').toString().trim().toUpperCase();
  const st = (stage || '').toString().trim().toUpperCase();

  if (!STAGES.includes(cur)) return st === 'APPLIED' ? 'current' : 'todo';

  if (cur === 'REJECTED') {
    if (st === 'REJECTED') return 'current';
    if (st === 'SELECTED') return 'todo';
    const idx = STAGES.indexOf(st);
    return idx >= 0 && idx <= STAGES.indexOf('INTERVIEW') ? 'done' : 'todo';
  }

  const curIdx = STAGES.indexOf(cur);
  const stIdx = STAGES.indexOf(st);
  if (stIdx < 0) return 'todo';
  if (stIdx < curIdx) return 'done';
  if (stIdx === curIdx) return 'current';
  if (cur === 'SELECTED' && st === 'REJECTED') return 'todo';
  return 'todo';
};

const ApplicationTracker = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.jobseekerId) return;
    let alive = true;
    setLoading(true);
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
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.jobseekerId]);

  return (
    <div className="sh-page sh-tracker">
      <div className="sh-container">
        <header className="sh-tracker-head">
          <div>
            <p className="sh-eyebrow">Applications</p>
            <h1 className="sh-title sh-h2">Application tracker</h1>
            <p className="sh-lead">Track your submitted applications.</p>
          </div>
          <span className="sh-badge">{applications.length} total</span>
        </header>

        <section className="sh-card">
          <div className="sh-card-pad">
            {loading ? <p className="sh-lead">Loading…</p> : null}
            {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}

            {applications.length ? (
              <div className="sh-tracker-list">
                {applications.map((app) => {
                  const job = app?.job;
                  return (
                    <div key={app.appid ?? app.id} className="sh-card sh-tracker-item">
                      <div className="sh-card-pad-sm sh-tracker-item-inner">
                        <div className="sh-tracker-left">
                          <div className="sh-tracker-title">{job?.jobtittle || 'Role'}</div>
                          <div className="sh-tracker-sub">{job?.employer?.empcomname || 'Company'}</div>
                          <div className="sh-tracker-meta">
                            <span className="sh-badge">{job?.jobloc || '—'}</span>
                          </div>
                        </div>
                        <div className="sh-tracker-right">
                          <span className={`sh-badge sh-badge-${tone(app.status)}`}>{statusLabel(app.status)}</span>
                        </div>
                      </div>
                      <div className="sh-tracker-steps" aria-label="Application stage">
                        {STAGES.map((s) => {
                          const state = stageState(app.status, s);
                          return (
                            <div key={s} className={`sh-step sh-step-${state}`}>
                              <div className="sh-step-dot" aria-hidden="true" />
                              <div className="sh-step-label">{statusLabel(s)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sh-tracker-empty">
                <p className="sh-title">No applications yet</p>
                <p className="sh-lead">Use “Apply now” on a job to create one.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApplicationTracker;
