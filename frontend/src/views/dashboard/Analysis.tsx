import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Database, Server } from 'lucide-react';
import Card from '../../components/ui/Card';
import './Analysis.css';

const chartData = [
  { name: 'Jan', llama: 12, gpt: 8, gemini: 15 },
  { name: 'Feb', llama: 10, gpt: 7, gemini: 13 },
  { name: 'Mar', llama: 14, gpt: 6, gemini: 11 },
  { name: 'Apr', llama: 9, gpt: 5, gemini: 8 },
  { name: 'May', llama: 8, gpt: 4, gemini: 7 },
  { name: 'Jun', llama: 6, gpt: 3, gemini: 5 },
];

const recentTests = [
  { id: 'T-809', model: 'LLaMA 3', domain: 'Mathematics', type: 'Calculation Error', status: 'Detected', time: '10 mins ago' },
  { id: 'T-808', model: 'GPT-4', domain: 'Law', type: 'Fake Citation', status: 'Safe', time: '1 hour ago' },
  { id: 'T-807', model: 'Gemini', domain: 'Code', type: 'Vulnerability', status: 'Detected', time: '3 hours ago' },
  { id: 'T-806', model: 'Mistral', domain: 'Standards', type: 'Inconsistent', status: 'Detected', time: '5 hours ago' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Overview</h1>
          <p className="text-secondary">Real-time hallucination tracking across all integrated models.</p>
        </div>
        <div className="db-status">
          <Database className="status-icon" size={16} />
          <span>DB: Ready for Sync</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <Card className="metric-card">
          <div className="metric-icon-wrap bg-primary-dim"><Server className="text-primary" /></div>
          <div className="metric-info">
            <span className="metric-title">Total Tests Run</span>
            <span className="metric-value-lg">12,450</span>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-icon-wrap bg-danger-dim"><AlertTriangle className="text-danger" /></div>
          <div className="metric-info">
            <span className="metric-title">Hallucination Rate</span>
            <span className="metric-value-lg text-danger">8.4%</span>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-icon-wrap bg-success-dim"><CheckCircle className="text-success" /></div>
          <div className="metric-info">
            <span className="metric-title">Verified Accuracy</span>
            <span className="metric-value-lg text-success">91.6%</span>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        {/* Chart Section */}
        <Card className="chart-card">
          <h3 className="card-title">Hallucination Trend by Model (%)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="llama" name="LLaMA 3" stroke="var(--accent-primary)" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="gpt" name="GPT-4" stroke="var(--accent-secondary)" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="gemini" name="Gemini" stroke="#fdcb6e" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Table Section */}
        <Card className="table-card">
          <h3 className="card-title">Recent Detections</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Model</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.id}</td>
                    <td><span className="model-badge">{test.model}</span></td>
                    <td>{test.domain}</td>
                    <td>
                      <span className={`status-badge ${test.status === 'Detected' ? 'status-danger' : 'status-success'}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="text-muted">{test.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
