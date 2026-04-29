import React, { useState } from 'react';
import { Save, Sliders, Key } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './Settings.css';

const Settings: React.FC = () => {
  const [similarityThreshold, setSimilarityThreshold] = useState(85);
  const [contradictionThreshold, setContradictionThreshold] = useState(70);

  return (
    <div className="settings-container">
      <div className="header-block">
        <h2>Configuration & Settings</h2>
        <p className="text-secondary">Manage API connections and tweak the hallucination detection strictness.</p>
      </div>

      <div className="settings-grid">
        <Card className="settings-card">
          <div className="settings-card-header">
            <Sliders className="text-accent" />
            <h3>Detection Thresholds</h3>
          </div>
          
          <div className="setting-group">
            <div className="setting-label-row">
              <label>Semantic Similarity Threshold</label>
              <span className="slider-value">{similarityThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="50" max="100" 
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
              className="range-slider"
            />
            <p className="setting-hint">Higher values require outputs to be closer to ground truth.</p>
          </div>

          <div className="setting-group">
            <div className="setting-label-row">
              <label>Contradiction Sensitivity</label>
              <span className="slider-value">{contradictionThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="50" max="100" 
              value={contradictionThreshold}
              onChange={(e) => setContradictionThreshold(Number(e.target.value))}
              className="range-slider"
            />
            <p className="setting-hint">How aggressively logical contradictions are flagged.</p>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="settings-card-header">
            <Key className="text-accent" />
            <h3>API Keys</h3>
          </div>

          <div className="setting-group">
            <label>OpenAI API Key</label>
            <input type="password" placeholder="sk-..." className="text-input" defaultValue="sk-mocked-key-for-preview" />
          </div>

          <div className="setting-group">
            <label>Anthropic API Key</label>
            <input type="password" placeholder="sk-ant-..." className="text-input" />
          </div>

          <div className="setting-group">
            <label>Pinecone Environment</label>
            <input type="text" placeholder="us-west1-gcp" className="text-input" defaultValue="us-west1-gcp" />
          </div>
        </Card>
      </div>

      <div className="settings-actions">
        <Button size="lg" className="save-btn">
          <Save size={18} />
          Save Configurations
        </Button>
      </div>
    </div>
  );
};

export default Settings;
