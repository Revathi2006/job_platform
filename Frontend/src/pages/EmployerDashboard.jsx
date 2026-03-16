// src/pages/EmployerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest, authFetch } from '../lib/api';
import '../assets/css/EmployerDashboard.css';

const statusTone = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'applied':
      return 'accent';
    case 'under_review':
      return 'primary';
    case 'shortlisted':
      return 'accent';
    case 'interview':
    case 'selected':
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

const EmployerDashboard = ({ user }) => {
  const employerId = user?.employerId;
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeBusy, setResumeBusy] = useState('');
  const [jobCounts, setJobCounts] = useState({});

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const [jobSort, setJobSort] = useState('newest');
  const [jobFilter, setJobFilter] = useState('all'); // all | open | closed

  // Updated: Changed 'stipend' to 'salary' to match backend entity
  const [newJob, setNewJob] = useState({
    jobtittle: '',
    jobloc: '',
    jobskills: '',
    jobtype: 'Full-time',
    salary: '',                    // ← Changed from 'stipend' to 'salary'
    applyDeadline: '',
    jobdes: ''
  });

  const parseAmount = (value) => {
    const raw = (value || '').toString();
    const m = raw.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : 0;
  };

  const isClosed = (deadline) => {
    const d = (deadline || '').toString().trim();
    if (!d) return false;
    const dt = new Date(`${d}T23:59:59`);
    if (Number.isNaN(dt.getTime())) return false;
    return Date.now() > dt.getTime();
  };

  const loadJobs = async () => {
    if (!employerId) return;
    setJobsLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/job/get/employer/${employerId}`);
      const nextJobs = Array.isArray(data) ? data : [];
      setJobs(nextJobs);

      const counts = await Promise.all(
        nextJobs.map((j) =>
          apiRequest(`/application/count/job/${j.jobid}`)
            .then((c) => ({ id: j.jobid, count: typeof c === 'number' ? c : Number(c || 0) }))
            .catch(() => ({ id: j.jobid, count: 0 }))
        )
      );

      const map = {};
      counts.forEach((x) => {
        map[x.id] = Number.isFinite(x.count) ? x.count : 0;
      });
      setJobCounts(map);
    } catch (err) {
      setError(err?.message || 'Failed to load jobs.');
      setJobs([]);
      setJobCounts({});
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId]);

  const loadApplications = async () => {
    if (!jobs.length) return;
    setAppsLoading(true);
    setError('');
    try {
      const lists = await Promise.all(
        jobs.map((j) => apiRequest(`/application/get/job/${j.jobid}`))
      );
      const flat = lists.flat().filter(Boolean);
      setApplications(flat);
    } catch (err) {
      setError(err?.message || 'Failed to load applications.');
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const updateAppStatus = async (appId, status) => {
    setError('');
    try {
      const updated = await apiRequest(`/application/update/status/${appId}`, {
        method: 'PATCH',
        body: { status }
      });
      setApplications((prev) => prev.map((a) => (a.appid === appId ? updated : a)));
    } catch (err) {
      setError(err?.message || 'Failed to update status.');
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!employerId) {
      setError('Missing Employer ID. Please re-login or register again.');
      return;
    }

    setError('');
    try {
      // Send the job data with 'salary' field (matches backend entity)
      await apiRequest(`/job/post/${employerId}`, { 
        method: 'POST', 
        body: newJob 
      });
      setShowPostJob(false);
      // Reset form with 'salary' field
      setNewJob({ 
        jobtittle: '', 
        jobloc: '', 
        jobskills: '', 
        jobtype: 'Full-time', 
        salary: '',                // ← Changed from 'stipend' to 'salary'
        applyDeadline: '', 
        jobdes: '' 
      });
      await loadJobs();
    } catch (err) {
      setError(err?.message || 'Failed to post job.');
    }
  };

  const downloadResume = async (seeker) => {
    const jobseekerId = seeker?.jobseekerid;
    if (!jobseekerId) return;
    setError('');
    setResumeBusy(String(jobseekerId));
    try {
      const res = await authFetch(`/jobseeker/resume/${jobseekerId}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Resume download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = seeker?.resumeName || 'resume';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || 'Failed to download resume.');
    } finally {
      setResumeBusy('');
    }
  };

  const stats = useMemo(() => {
    const interviewCount = applications.filter((a) => (a.status || '').toString().toUpperCase() === 'INTERVIEW').length;
    const selectedCount = applications.filter((a) => (a.status || '').toString().toUpperCase() === 'SELECTED').length;
    return [
      { label: 'Active jobs', value: jobs.length, tone: 'primary' },
      { label: 'Applications', value: applications.length, tone: 'accent' },
      { label: 'Interviews', value: interviewCount, tone: 'success' },
      { label: 'Selected', value: selectedCount, tone: 'success' }
    ];
  }, [applications, jobs.length]);

  const visibleJobs = useMemo(() => {
    const base = (jobs || []).slice();
    const filtered =
      jobFilter === 'open'
        ? base.filter((j) => !isClosed(j.applyDeadline))
        : jobFilter === 'closed'
          ? base.filter((j) => isClosed(j.applyDeadline))
          : base;

    const sorted = filtered.sort((a, b) => {
      if (jobSort === 'highest_salary') {
        // Updated: Use 'salary' field for sorting
        return parseAmount(b.salary) - parseAmount(a.salary);
      }
      if (jobSort === 'most_applicants') return (jobCounts[b.jobid] ?? 0) - (jobCounts[a.jobid] ?? 0);
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return sorted;
  }, [jobCounts, jobFilter, jobSort, jobs]);

  return (
    <div className="sh-page sh-employer">
      <div className="sh-container">
        <header className="sh-dash-head">
          <div>
            <p className="sh-eyebrow">Employer dashboard</p>
            <h1 className="sh-title sh-h2">Welcome, {user?.name || 'Employer'}</h1>
            <p className="sh-lead">Post roles, review candidates, and track progress.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="sh-btn sh-btn-primary" onClick={() => setShowPostJob((v) => !v)}>
              {showPostJob ? 'Close form' : 'Post a job'}
            </button>
          </div>
        </header>

        {error ? <div className="sh-alert sh-alert-danger">{error}</div> : null}

        <section className="sh-dash-kpis">
          {stats.map((s) => (
            <div key={s.label} className="sh-card sh-dash-kpi">
              <div className="sh-card-pad-sm">
                <div className={`sh-badge sh-badge-${s.tone}`}>{s.label}</div>
                <div className="sh-dash-kpi-value">{s.value}</div>
              </div>
            </div>
          ))}
        </section>

        {showPostJob ? (
          <section className="sh-card sh-postjob">
            <div className="sh-card-pad">
              <div className="sh-postjob-head">
                <h2 className="sh-title sh-h2">Post a new job</h2>
                <p className="sh-lead">Creates a listing for your employer ID ({employerId || '—'}).</p>
              </div>

              <form className="sh-postjob-form" onSubmit={handlePostJob}>
                <div className="sh-postjob-grid">
                  <div className="sh-field">
                    <label className="sh-label">Job title</label>
                    <input
                      className="sh-input"
                      value={newJob.jobtittle}
                      onChange={(e) => setNewJob((p) => ({ ...p, jobtittle: e.target.value }))}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label">Location</label>
                    <input
                      className="sh-input"
                      value={newJob.jobloc}
                      onChange={(e) => setNewJob((p) => ({ ...p, jobloc: e.target.value }))}
                      placeholder="e.g., New York, NY"
                      required
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label">Job type</label>
                    <select
                      className="sh-select"
                      value={newJob.jobtype}
                      onChange={(e) => setNewJob((p) => ({ ...p, jobtype: e.target.value }))}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div className="sh-field">
                    <label className="sh-label">Salary</label>
                    <input
                      className="sh-input"
                      value={newJob.salary}                    // ← Changed from newJob.stipend
                      onChange={(e) => setNewJob((p) => ({ ...p, salary: e.target.value }))}  // ← Changed
                      placeholder="e.g., ₹15,000 / month"
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label">Application deadline</label>
                    <input
                      className="sh-input"
                      type="date"
                      value={newJob.applyDeadline}
                      onChange={(e) => setNewJob((p) => ({ ...p, applyDeadline: e.target.value }))}
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label">Skills (comma separated)</label>
                    <input
                      className="sh-input"
                      value={newJob.jobskills}
                      onChange={(e) => setNewJob((p) => ({ ...p, jobskills: e.target.value }))}
                      placeholder="e.g., React, Node.js, Python"
                    />
                  </div>
                  <div className="sh-field sh-postjob-desc">
                    <label className="sh-label">Description</label>
                    <textarea
                      className="sh-textarea"
                      value={newJob.jobdes}
                      onChange={(e) => setNewJob((p) => ({ ...p, jobdes: e.target.value }))}
                      placeholder="Detailed job description..."
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="sh-postjob-actions">
                  <button type="submit" className="sh-btn sh-btn-primary">
                    Publish job
                  </button>
                  <button type="button" className="sh-btn sh-btn-ghost" onClick={() => setShowPostJob(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        ) : null}

        <section className="sh-section">
          <div className="sh-section-head">
            <h2 className="sh-title sh-h2">Active jobs</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="sh-select" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} aria-label="Filter jobs">
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              <select className="sh-select" value={jobSort} onChange={(e) => setJobSort(e.target.value)} aria-label="Sort jobs">
                <option value="newest">Newest</option>
                <option value="highest_salary">Highest salary</option>
                <option value="most_applicants">Most applicants</option>
              </select>
              <span className="sh-badge">{visibleJobs.length} listings</span>
            </div>
          </div>

          <div className="sh-dash-grid">
            {jobsLoading ? <p className="sh-lead">Loading jobs…</p> : null}
            {visibleJobs.map((job) => (
              <div key={job.jobid} className="sh-card sh-jobcard">
                <div className="sh-card-pad-sm">
                  <div className="sh-jobcard-top">
                    <div>
                      <div className="sh-jobcard-title">{job.jobtittle}</div>
                      <div className="sh-jobcard-company">{job.employer?.empcomname || user?.name || 'Your Company'}</div>
                    </div>
                    {isClosed(job.applyDeadline) ? <span className="sh-badge sh-badge-danger">Closed</span> : <span className="sh-badge sh-badge-success">Open</span>}
                  </div>
                  <div className="sh-jobcard-meta">
                    <span className="sh-badge">{job.jobloc || '—'}</span>
                    {job.jobtype ? <span className="sh-badge sh-badge-primary">{job.jobtype}</span> : null}
                    {job.salary ? <span className="sh-badge sh-badge-accent">{job.salary}</span> : null}  {/* ← Changed from job.stipend */}
                    {job.jobskills ? <span className="sh-badge sh-badge-accent">{job.jobskills}</span> : null}
                    <span className="sh-badge">{jobCounts[job.jobid] ?? 0} applicants</span>
                    {job.applyDeadline ? <span className="sh-badge">Deadline {job.applyDeadline}</span> : null}
                  </div>
                  <div className="sh-jobcard-desc">{job.jobdes}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sh-section">
          <div className="sh-section-head">
            <h2 className="sh-title sh-h2">Applications</h2>
            <button className="sh-btn sh-btn-sm sh-btn-ghost" type="button" onClick={loadApplications} disabled={appsLoading || !jobs.length}>
              {appsLoading ? 'Loading…' : 'Load applications'}
            </button>
          </div>

          <div className="sh-dash-grid sh-app-grid">
            {applications.map((app) => {
              const tone = statusTone(app.status);
              const seeker = app?.jobseeker;
              const job = app?.job;
              const skills = app?.applicantSkills || seeker?.jobskills || '—';
              const phone = app?.applicantPhone || '—';
              const note = (app?.note || '').trim();
              return (
                <div key={app.appid} className="sh-card sh-appcard">
                  <div className="sh-card-pad-sm">
                    <div className="sh-appcard-top">
                      <div className="sh-appcard-avatar" aria-hidden="true">
                        {(seeker?.jobseekername || 'A').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="sh-appcard-info">
                        <div className="sh-appcard-name">{seeker?.jobseekername || 'Applicant'}</div>
                        <div className="sh-appcard-sub">{job?.jobtittle || 'Role'}</div>
                      </div>
                      <span className={`sh-badge sh-badge-${tone}`}>{statusLabel(app.status)}</span>
                    </div>

                    <div className="sh-appcard-meta">
                      <div className="sh-appcard-line">{seeker?.jobseekeremail || '—'}</div>
                      <div className="sh-appcard-line">{seeker?.jobexper || '—'}</div>
                      <div className="sh-appcard-line">Phone: {phone}</div>
                      <div className="sh-appcard-line">Skills: {skills}</div>
                      {note ? <div className="sh-appcard-line">Note: {note}</div> : null}
                      {seeker?.resumeName ? (
                        <button
                          className="sh-btn sh-btn-sm sh-btn-ghost"
                          type="button"
                          onClick={() => downloadResume(seeker)}
                          disabled={resumeBusy === String(seeker?.jobseekerid)}
                          style={{ justifySelf: 'start' }}
                        >
                          {resumeBusy === String(seeker?.jobseekerid) ? 'Downloading…' : 'Download resume'}
                        </button>
                      ) : (
                        <div className="sh-appcard-line">Resume: —</div>
                      )}
                    </div>

                    <div className="sh-appcard-actions">
                      <button className="sh-btn sh-btn-sm sh-btn-ghost" type="button" onClick={() => updateAppStatus(app.appid, 'UNDER_REVIEW')}>
                        Under review
                      </button>
                      <button className="sh-btn sh-btn-sm sh-btn-ghost" type="button" onClick={() => updateAppStatus(app.appid, 'SHORTLISTED')}>
                        Shortlist
                      </button>
                      <button className="sh-btn sh-btn-sm sh-btn-ghost" type="button" onClick={() => updateAppStatus(app.appid, 'INTERVIEW')}>
                        Interview
                      </button>
                      <button className="sh-btn sh-btn-sm sh-btn-primary" type="button" onClick={() => updateAppStatus(app.appid, 'SELECTED')}>
                        Select
                      </button>
                      <button className="sh-btn sh-btn-sm sh-btn-danger" type="button" onClick={() => updateAppStatus(app.appid, 'REJECTED')}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployerDashboard;