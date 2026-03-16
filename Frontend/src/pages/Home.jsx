// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import '../assets/css/Home.css';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [topJobs, setTopJobs] = useState([]);

  const heroTitle = useMemo(() => {
    if (user?.role === 'employer') return 'Welcome back, employer';
    if (user?.role === 'jobseeker') return 'Welcome back, job seeker';
    return 'Hire faster. Get hired faster.';
  }, [user?.role]);

  useEffect(() => {
    let alive = true;
    apiRequest('/job/get')
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        const sorted = list
          .slice()
          .sort((a, b) => {
            const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          })
          .slice(0, 3)
          .map((j) => ({
            id: j.jobid,
            title: j.jobtittle || 'Role',
            meta: `${j.jobloc || '—'} · ${j.jobtype || '—'}`,
            pay: j.stipend || '—'
          }));
        setTopJobs(sorted);
      })
      .catch(() => {
        if (!alive) return;
        setTopJobs([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const stats = [
    { number: 'Fast', label: 'Apply flow' },
    { number: 'Clear', label: 'Stage tracking' },
    { number: 'Secure', label: 'Role based access' },
    { number: 'Modern', label: 'Responsive UI' }
  ];

  const features = [
    {
      title: 'For job seekers',
      description: 'Apply with profile + resume, then track every stage.',
      cta: 'Browse jobs',
      onClick: () => navigate('/jobs'),
      tone: 'primary'
    },
    {
      title: 'For employers',
      description: 'Post jobs, review applicants, update status, and notify automatically.',
      cta: user?.role === 'employer' ? 'Open dashboard' : 'Create employer account',
      onClick: () => navigate(user?.role === 'employer' ? '/dashboard/employer' : '/register'),
      tone: 'accent'
    },
    {
      title: 'Simple tracking',
      description: 'Applied → Under review → Shortlisted → Interview → Selected/Rejected.',
      cta: user ? 'View tracker' : 'Get started',
      onClick: () => navigate(user ? '/applications' : '/register'),
      tone: 'ghost'
    }
  ];

  return (
    <div className="sh-page sh-home">
      <div className="sh-container">
        <section className="sh-hero">
          <div className="sh-hero-left">
            <p className="sh-eyebrow">SmartHire</p>
            <h1 className="sh-title sh-h1">{heroTitle}</h1>
            <p className="sh-lead">Find openings, apply confidently, and stay updated — without confusion.</p>

            <div className="sh-home-actions">
              <button className="sh-btn sh-btn-primary" onClick={() => navigate('/jobs')}>
                Browse jobs
              </button>
              <button className="sh-btn sh-btn-ghost" onClick={() => navigate(user ? (user?.role === 'employer' ? '/dashboard/employer' : '/dashboard/jobseeker') : '/register')}>
                {user ? 'Go to dashboard' : 'Create account'}
              </button>
            </div>

            <div className="sh-home-stats">
              {stats.map((s) => (
                <div key={s.label} className="sh-home-stat">
                  <div className="sh-home-stat-num">{s.number}</div>
                  <div className="sh-home-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sh-hero-right">
            <div className="sh-card sh-home-preview">
              <div className="sh-home-preview-top">
                <div>
                  <p className="sh-eyebrow">Latest</p>
                  <h2 className="sh-title sh-h2">Top roles</h2>
                </div>
                <span className="sh-badge sh-badge-primary">New</span>
              </div>

              <div className="sh-home-preview-list">
                {topJobs.length ? (
                  topJobs.map((j) => (
                    <div key={j.id} className="sh-home-preview-item">
                      <div>
                        <div className="sh-home-role">{j.title}</div>
                        <div className="sh-home-meta">{j.meta}</div>
                      </div>
                      <span className="sh-badge sh-badge-accent">{j.pay}</span>
                    </div>
                  ))
                ) : (
                  <div className="sh-home-preview-item">
                    <div>
                      <div className="sh-home-role">No jobs yet</div>
                      <div className="sh-home-meta">Post a job to see it here</div>
                    </div>
                    <span className="sh-badge">—</span>
                  </div>
                )}
              </div>

              <div className="sh-home-preview-cta">
                <button className="sh-btn sh-btn-sm sh-btn-primary" onClick={() => navigate('/jobs')}>
                  Explore jobs
                </button>
                <button className="sh-btn sh-btn-sm sh-btn-ghost" onClick={() => navigate(user?.role === 'employer' ? '/dashboard/employer' : '/register')}>
                  Post a job
                </button>
              </div>
            </div>

            <div className="sh-home-glow" aria-hidden="true" />
          </div>
        </section>

        <section className="sh-home-features">
          <div className="sh-home-features-head">
            <p className="sh-eyebrow">How it works</p>
            <h2 className="sh-title sh-h2">Clear, professional workflow</h2>
            <p className="sh-lead">Built for a real job platform experience.</p>
          </div>

          <div className="sh-home-feature-grid">
            {features.map((f) => (
              <div key={f.title} className={`sh-card sh-home-feature sh-home-feature-${f.tone}`}>
                <div className="sh-card-pad-sm">
                  <h3 className="sh-home-feature-title">{f.title}</h3>
                  <p className="sh-home-feature-desc">{f.description}</p>
                  <button className="sh-btn sh-btn-sm sh-btn-ghost" onClick={f.onClick}>
                    {f.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

