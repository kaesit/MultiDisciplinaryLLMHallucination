import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="navbar-container">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <Activity className="brand-icon" />
          <span className="brand-text">MultiDisciplinary <span className="text-gradient">LLM Hallucination</span></span>
        </Link>

        <nav className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="navbar-actions">
          {location.pathname !== '/dashboard' && (
            <Link to="/dashboard">
              <Button variant="primary" size="sm">Launch App</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
