import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, LineChart, Scale, Code } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-content">
          <div className="badge">v1.0 is Live</div>
          <h1 className="hero-title">
            Detect LLM Hallucinations <br />
            Across <span className="text-gradient">Multiple Disciplines</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive evaluation tool ensuring accuracy in Mathematics, UI/UX, International Standards, Law, and Software Development. Don't let AI fabricate confidence.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard">
              <Button size="lg" className="glow-btn">Access Dashboard</Button>
            </Link>
            <Button variant="secondary" size="lg">Read Documentation</Button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="abstract-shape shape-1"></div>
          <div className="abstract-shape shape-2"></div>
          <Card glow className="hero-card">
            <div className="hero-card-header">
              <Shield className="hero-card-icon" />
              <span>Real-time Monitoring</span>
            </div>
            <div className="hero-card-metrics">
              <div className="metric">
                <span className="metric-label">LLaMA 3</span>
                <div className="metric-bar"><div className="fill" style={{width: '92%'}}></div></div>
                <span className="metric-value text-safe">92% Reliable</span>
              </div>
              <div className="metric">
                <span className="metric-label">GPT-4</span>
                <div className="metric-bar"><div className="fill" style={{width: '95%'}}></div></div>
                <span className="metric-value text-safe">95% Reliable</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Domains Section */}
      <section className="domains-section container">
        <div className="section-header">
          <h2>Supported Domains</h2>
          <p>We systematically verify AI outputs against ground-truth references in critical fields.</p>
        </div>
        <div className="domains-grid">
          <Card className="domain-card">
            <div className="domain-icon-wrapper"><LineChart /></div>
            <h3>Mathematics</h3>
            <p>Detection of calculation errors and logical inconsistencies in complex mathematical proofs.</p>
          </Card>
          <Card className="domain-card">
            <div className="domain-icon-wrapper"><Code /></div>
            <h3>UI/UX & Code</h3>
            <p>Verification of UI implementations and code security vulnerabilities using HumanEval.</p>
          </Card>
          <Card className="domain-card">
            <div className="domain-icon-wrapper"><Shield /></div>
            <h3>Standards</h3>
            <p>Cross-referencing outputs with IEEE and EU regulations to prevent non-compliant assertions.</p>
          </Card>
          <Card className="domain-card">
            <div className="domain-icon-wrapper"><Scale /></div>
            <h3>Law & Philosophy</h3>
            <p>Identifying fake citations, non-existent legal precedents, and philosophical hallucinations.</p>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="workflow-section container">
        <div className="section-header">
          <h2>How Aegis Works</h2>
        </div>
        <div className="workflow-steps">
          <div className="step">
            <div className="step-number">01</div>
            <h4>Scenario Generation</h4>
            <p>Creating domain-specific edge-cases.</p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h4>Model Execution</h4>
            <p>Processing via local (Ollama) or API models.</p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h4>Cross-Verification</h4>
            <p>Analyzing outputs against verified databases.</p>
          </div>
          <div className="step">
            <div className="step-number">04</div>
            <h4>Reporting</h4>
            <p>Categorizing fabrications and inconsistencies.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
