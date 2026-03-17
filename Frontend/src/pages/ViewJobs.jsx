// src/pages/ViewJobs.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadJson, saveJson, STORAGE_KEYS } from '../lib/storage';
import { apiRequest } from '../lib/api';
import { mockJobs } from '../mockData';
import '../assets/css/ViewJobs.css';

const normalizeJob = (job) => {
  if (!job) return null;

  if (job.jobid !== undefined) {
    const skills = typeof job.jobskills === 'string' ? job.jobskills : '';
    const requirements = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = job.createdAt ? new Date(job.createdAt) : null;
    const postedDate = created && !Number.isNaN(created.getTime()) ? created.toLocaleDateString() : '—';

    return {
      id: job.jobid,
      title: job.jobtittle || 'Untitled role',
      company: job.employer?.empcomname || 'Company',
      location: job.jobloc || '—',
      type: job.jobtype || '—',
      salary: job.stipend || '—',
      applyDeadline: job.applyDeadline || '',
      description: job.jobdes || '',
      requirements,
      postedDate,
      applicants: 0
    };
  }

  return job;
};

const ViewJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobsError, setJobsError] = useState('');
  const [jobsLoading, setJobsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [preselectId] = useState(() => loadJson(STORAGE_KEYS.selectedJobId, null));
  const [savedJobIds, setSavedJobIds] = useState(() => loadJson(STORAGE_KEYS.savedJobIds, []));
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState(() => ({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    note: ''
  }));
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeMeta, setResumeMeta] = useState(null);
  const [applySuccess, setApplySuccess] = useState('');
  const isClosed = (deadline) => {
    const d = (deadline || '').toString().trim();
    if (!d) return false;
    const dt = new Date(`${d}T23:59:59`);
    if (Number.isNaN(dt.getTime())) return false;
    return Date.now() > dt.getTime();
  };

  useEffect(() => {
    if (preselectId) localStorage.removeItem(STORAGE_KEYS.selectedJobId);
  }, [preselectId]);

  useEffect(() => {
    let alive = true;
    setJobsLoading(true);
    setJobsError('');

    apiRequest('/job/get')
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data.map(normalizeJob).filter(Boolean) : [];
        setJobs(list);
      })
      .catch((err) => {
        if (!alive) return;
        setJobsError(err?.message || 'Failed to load jobs from backend.');
        setJobs(mockJobs.map(normalizeJob).filter(Boolean));
      })
      .finally(() => {
        if (!alive) return;
        setJobsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!preselectId || !jobs.length) return;
    setSelectedJob(jobs.find((j) => j.id === preselectId) || null);
  }, [jobs, preselectId]);

  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location))], [jobs]);
  const types = useMemo(() => [...new Set(jobs.map((j) => j.type))], [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term);

      const matchesLocation = !filters.location || job.location === filters.location;
      const matchesType = !filters.type || job.type === filters.type;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [filters.location, filters.type, jobs, searchTerm]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.savedJobIds, savedJobIds);
  }, [savedJobIds]);

  const toggleSaved = (jobId) => {
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      return next;
    });
  };

  const openApply = async (job) => {
    setApplySuccess('');
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'jobseeker') {
      setApplySuccess('Please sign in as a job seeker to apply.');
      return;
    }
    if (!user?.jobseekerId) {
      setApplySuccess('Missing Jobseeker ID. Please re-login or register again.');
      return;
    }
    if (isClosed(job?.applyDeadline)) {
      setApplySuccess('Applications closed for this job.');
      return;
    }
    setSelectedJob(job);
    setShowApply(true);

    setApplyLoading(true);
    try {
      const profile = await apiRequest(`/jobseeker/get/${user.jobseekerId}`);
      setApplyForm({
        fullName: profile?.jobseekername || user?.name || '',
        email: profile?.jobseekeremail || user?.email || '',
        phone: '',
        skills: profile?.jobskills || '',
        note: ''
      });
      setResumeMeta(
        profile?.resumeName
          ? {
              name: profile.resumeName,
              updatedAt: profile.resumeUpdatedAt || ''
            }
          : null
      );
    } catch (err) {
      setApplyForm({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        skills: '',
        note: ''
      });
      setResumeMeta(null);
      setApplySuccess(err?.message || 'Failed to load your profile.');
    } finally {
      setApplyLoading(false);
    }
  };

  const submitApply = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!applyForm.fullName.trim() || !applyForm.email.trim()) return;
    if (!resumeMeta?.name) {
      setApplySuccess('Please upload your resume before applying.');
      return;
    }

    try {
      await apiRequest(`/application/apply/${selectedJob.id}/${user.jobseekerId}`, {
        method: 'POST',
        body: {
          status: 'APPLIED',
          applicantPhone: applyForm.phone,
          applicantSkills: applyForm.skills,
          note: applyForm.note
        }
      });
      setShowApply(false);
      setApplySuccess('Application submitted.');
    } catch (err) {
      setApplySuccess(err?.message || 'Failed to submit application.');
    }
  };

  useEffect(() => {
    if (!selectedJob?.id) return;
    let alive = true;

    apiRequest(`/application/count/job/${selectedJob.id}`)
      .then((count) => {
        if (!alive) return;
        const num = typeof count === 'number' ? count : Number(count || 0);
        setSelectedJob((prev) => {
          if (!prev || prev.id !== selectedJob.id) return prev;
          return { ...prev, applicants: Number.isFinite(num) ? num : 0 };
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [selectedJob?.id]);

  return (
    <div className="sh-page sh-jobs">
      <div className="sh-container">
        <div className="sh-jobs-head">
          <div>
            <p className="sh-eyebrow">Jobs</p>
            <h1 className="sh-title sh-h2">Find your next role</h1>
            <p className="sh-lead">
              {jobsLoading ? 'Loading jobs…' : `${filteredJobs.length} roles match your filters.`}
            </p>
            {jobsError ? <p className="sh-lead">{jobsError}</p> : null}
          </div>
          <button className="sh-btn sh-btn-ghost" onClick={() => navigate('/')}>
            Back to home
          </button>
        </div>

        <div className="sh-card sh-jobs-filters">
          <div className="sh-card-pad-sm sh-jobs-filters-inner">
            <div className="sh-field sh-jobs-search">
              <label className="sh-label" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                className="sh-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title, company, or keyword"
              />
            </div>

            <div className="sh-field">
              <label className="sh-label" htmlFor="location">
                Location
              </label>
              <select
                id="location"
                className="sh-select"
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
              >
                <option value="">All</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {types.length > 1 ? (
              <div className="sh-field">
                <label className="sh-label" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  className="sh-select"
                  value={filters.type}
                  onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="">All</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <button
              className="sh-btn sh-btn-sm sh-btn-ghost sh-jobs-clear"
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilters({ location: '', type: '' });
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="sh-jobs-grid">
          <section className="sh-card sh-jobs-list">
            <div className="sh-card-pad-sm sh-jobs-list-inner">
              {filteredJobs.length === 0 ? (
                <div className="sh-jobs-empty">
                  <p className="sh-title">No results</p>
                  <p className="sh-lead">Try a different search or clear filters.</p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <button
                      key={job.id}
                      className={`sh-jobs-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedJob(job)}
                      type="button"
                    >
                      <div className="sh-jobs-item-top">
                        <div className="sh-jobs-item-title">{job.title}</div>
                        {job.type && job.type !== '—' ? (
                          <span className="sh-badge sh-badge-primary">{job.type}</span>
                        ) : null}
                      </div>
                      <div className="sh-jobs-item-company">{job.company}</div>
                      <div className="sh-jobs-item-meta">
                        <span className="sh-badge">{job.location}</span>
                        <span className="sh-badge sh-badge-accent">{job.salary}</span>
                        <span className="sh-badge">Posted {job.postedDate}</span>
                        {job.applyDeadline ? (
                          isClosed(job.applyDeadline) ? (
                            <span className="sh-badge sh-badge-danger">Closed</span>
                          ) : (
                            <span className="sh-badge">Deadline {job.applyDeadline}</span>
                          )
                        ) : null}
                        {isSaved ? <span className="sh-badge sh-badge-success">Saved</span> : null}
                      </div>
                      <div className="sh-jobs-item-desc">{job.description}</div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <aside className="sh-card sh-jobs-details">
            <div className="sh-card-pad sh-jobs-details-inner">
              {selectedJob ? (
                <>
                  <div className="sh-jobs-details-head">
                    <div>
                      <h2 className="sh-title sh-h2">{selectedJob.title}</h2>
                      <div className="sh-jobs-details-company">{selectedJob.company}</div>
                    </div>
                    <div className="sh-jobs-details-badges">
                      <span className="sh-badge sh-badge-primary">{selectedJob.type}</span>
                      <span className="sh-badge">{selectedJob.location}</span>
                    </div>
                  </div>

                  <div className="sh-jobs-details-meta">
                    <span className="sh-badge sh-badge-accent">{selectedJob.salary}</span>
                    <span className="sh-badge">Posted {selectedJob.postedDate}</span>
                    <span className="sh-badge">{selectedJob.applicants || 0} applicants</span>
                    {selectedJob.applyDeadline ? (
                      <span className="sh-badge">
                        Deadline {selectedJob.applyDeadline} {isClosed(selectedJob.applyDeadline) ? '(closed)' : ''}
                      </span>
                    ) : null}
                  </div>

                  <div className="sh-jobs-details-section">
                    <h3 className="sh-jobs-details-title">Description</h3>
                    <p className="sh-jobs-details-text">{selectedJob.description}</p>
                  </div>

                  <div className="sh-jobs-details-section">
                    <h3 className="sh-jobs-details-title">Requirements</h3>
                    <div className="sh-jobs-reqs">
                      {(selectedJob.requirements || []).map((req) => (
                        <span key={req} className="sh-badge">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sh-jobs-details-actions">
                    <button
                      className="sh-btn sh-btn-primary"
                      type="button"
                      onClick={() => openApply(selectedJob)}
                      disabled={isClosed(selectedJob.applyDeadline)}
                    >
                      {isClosed(selectedJob.applyDeadline) ? 'Applications closed' : 'Apply now'}
                    </button>
                    <button className="sh-btn sh-btn-ghost" type="button" onClick={() => toggleSaved(selectedJob.id)}>
                      {savedJobIds.includes(selectedJob.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="sh-jobs-empty">
                  <p className="sh-title">Select a job</p>
                  <p className="sh-lead">Pick a role from the list to see details.</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {applySuccess ? (
          <div className="sh-jobs-toast" role="status">
            {applySuccess}
          </div>
        ) : null}

        {showApply && selectedJob ? (
          <div className="sh-jobs-modal" role="dialog" aria-modal="true" aria-label="Apply">
            <div className="sh-card sh-jobs-modal-card">
              <div className="sh-card-pad">
                <div className="sh-jobs-modal-head">
                  <div>
                    <p className="sh-eyebrow">Apply</p>
                    <h2 className="sh-title sh-h2">{selectedJob.title}</h2>
                    <p className="sh-lead">{selectedJob.company}</p>
                  </div>
                  <button className="sh-btn sh-btn-sm sh-btn-ghost" type="button" onClick={() => setShowApply(false)}>
                    Close
                  </button>
                </div>

                <form className="sh-jobs-apply" onSubmit={submitApply}>
                  <div className="sh-field">
                    <label className="sh-label" htmlFor="fullName">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      className="sh-input"
                      value={applyForm.fullName}
                      readOnly
                      disabled={applyLoading}
                      required
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label" htmlFor="applyEmail">
                      Email
                    </label>
                    <input
                      id="applyEmail"
                      className="sh-input"
                      type="email"
                      value={applyForm.email}
                      readOnly
                      disabled={applyLoading}
                      required
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label" htmlFor="applyPhone">
                      Phone
                    </label>
                    <input
                      id="applyPhone"
                      className="sh-input"
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91…"
                      disabled={applyLoading}
                    />
                  </div>
                  <div className="sh-field">
                    <label className="sh-label" htmlFor="applySkills">
                      Skills
                    </label>
                    <input
                      id="applySkills"
                      className="sh-input"
                      value={applyForm.skills}
                      onChange={(e) => setApplyForm((p) => ({ ...p, skills: e.target.value }))}
                      disabled={applyLoading}
                      placeholder="e.g., React, Java, SQL"
                      required
                    />
                    {!resumeMeta?.name ? (
                      <p className="sh-lead" style={{ marginTop: 8 }}>
                        No resume uploaded.{' '}
                        <button className="sh-auth-link" type="button" onClick={() => navigate('/resume')}>
                          Upload now
                        </button>
                      </p>
                    ) : (
                      <p className="sh-lead" style={{ marginTop: 8 }}>
                        Resume attached: <strong>{resumeMeta.name}</strong>
                      </p>
                    )}
                  </div>
                  <div className="sh-field">
                    <label className="sh-label" htmlFor="applyNote">
                      Note (optional)
                    </label>
                    <textarea
                      id="applyNote"
                      className="sh-textarea"
                      rows={4}
                      value={applyForm.note}
                      onChange={(e) => setApplyForm((p) => ({ ...p, note: e.target.value }))}
                      placeholder="A short message for the employer…"
                      disabled={applyLoading}
                    />
                  </div>

                  <div className="sh-jobs-apply-actions">
                    <button className="sh-btn sh-btn-primary" type="submit" disabled={applyLoading}>
                      Submit application
                    </button>
                    <button className="sh-btn sh-btn-ghost" type="button" onClick={() => setShowApply(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ViewJobs;
