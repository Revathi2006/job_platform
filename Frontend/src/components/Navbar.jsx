// src/components/Navbar.jsx
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/Navbar.css';

const Navbar = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardPage = useMemo(() => {
    return user?.role === 'employer' ? '/dashboard/employer' : '/dashboard/jobseeker';
  }, [user?.role]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNavigation = (to) => {
    navigate(to);
    setIsMenuOpen(false);
  };

  const initials = (user?.name || 'U').trim().slice(0, 1).toUpperCase();

  return (
    <header className="sh-nav">
      <div className="sh-container sh-nav-inner">
        <div className="sh-brand" onClick={() => handleNavigation('/')} role="button" tabIndex={0}>
          <div className="sh-mark" aria-hidden="true">SH</div>
          <div className="sh-brand-name">
            <strong>SmartHire</strong>
            <span>Jobs, hiring, faster</span>
          </div>
        </div>

        <button
          className="sh-menu-toggle"
          data-open={isMenuOpen ? 'true' : 'false'}
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen ? 'true' : 'false'}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="sh-nav-actions" data-open={isMenuOpen ? 'true' : 'false'} aria-label="Primary">
          <button
            className="sh-nav-link"
            onClick={() => handleNavigation('/')}
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            Home
          </button>
          <button
            className="sh-nav-link"
            onClick={() => handleNavigation('/jobs')}
            aria-current={location.pathname === '/jobs' ? 'page' : undefined}
          >
            Jobs
          </button>

          {user ? (
            <>
              <button
                className="sh-nav-link"
                onClick={() => handleNavigation(dashboardPage)}
                aria-current={location.pathname === dashboardPage ? 'page' : undefined}
              >
                Dashboard
              </button>
              {user?.role === 'jobseeker' ? (
                <>
                  <button
                    className="sh-nav-link"
                    onClick={() => handleNavigation('/applications')}
                    aria-current={location.pathname === '/applications' ? 'page' : undefined}
                  >
                    Tracker
                  </button>
                  <button
                    className="sh-nav-link"
                    onClick={() => handleNavigation('/settings')}
                    aria-current={location.pathname === '/settings' ? 'page' : undefined}
                  >
                    Settings
                  </button>
                </>
              ) : null}
              <div className="sh-user-pill" aria-label="Signed in user">
                <span className="sh-avatar" aria-hidden="true">{initials}</span>
                <span className="sh-user-name">{user.name}</span>
              </div>
              <button className="sh-btn sh-btn-sm sh-btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="sh-nav-link"
                onClick={() => handleNavigation('/login')}
                aria-current={location.pathname === '/login' ? 'page' : undefined}
              >
                Login
              </button>
              <button className="sh-btn sh-btn-sm sh-btn-primary" onClick={() => handleNavigation('/register')}>
                Create Account
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
