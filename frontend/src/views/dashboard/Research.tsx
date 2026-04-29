import React from 'react';
import { Database, FileText, Server, Code, Scale } from 'lucide-react';
import Card from '../../components/ui/Card';
import './Research.css';

const Research: React.FC = () => {
  return (
    <div className="research-container">
      <div className="header-block">
        <h2>Datasets & Storage Architecture</h2>
        <p className="text-secondary">Overview of the ground-truth databases and validation sets used across different domains.</p>
      </div>

      <div className="research-grid">
        <div className="datasets-column">
          <h3 className="section-title">Reference Datasets</h3>
          
          <Card className="dataset-card">
            <div className="ds-icon bg-purple"><Code size={20} /></div>
            <div className="ds-info">
              <h4>HumanEval & MBPP</h4>
              <p>Used for verifying coding tasks and logic. Contains hundreds of programming problems with verifiable unit tests.</p>
            </div>
          </Card>

          <Card className="dataset-card">
            <div className="ds-icon bg-blue"><FileText size={20} /></div>
            <div className="ds-info">
              <h4>IEEE & EU Regulations</h4>
              <p>Standardized documents mapped into a vector database for Retrieval-Augmented Generation (RAG) cross-checking.</p>
            </div>
          </Card>

          <Card className="dataset-card">
            <div className="ds-icon bg-orange"><Scale size={20} /></div>
            <div className="ds-info">
              <h4>Legal Precedents DB</h4>
              <p>A curated database of authentic legal cases and philosophical texts to identify fake citations and misattributions.</p>
            </div>
          </Card>
        </div>

        <div className="storage-column">
          <h3 className="section-title">Storage & Pipeline</h3>
          
          <Card className="architecture-card" glow>
            <div className="arch-flow">
              <div className="arch-node">
                <Database className="text-primary" />
                <span>Vector DB (FAISS/Pinecone)</span>
                <small>Ground Truth Embeddings</small>
              </div>
              <div className="arch-connector"></div>
              <div className="arch-node">
                <Server className="text-secondary" />
                <span>Evaluation Engine</span>
                <small>Similarity & Contradiction Check</small>
              </div>
              <div className="arch-connector"></div>
              <div className="arch-node">
                <FileText className="text-success" />
                <span>PostgreSQL DB</span>
                <small>Test Logs & Analytics</small>
              </div>
            </div>
            <div className="arch-desc">
              <p>
                Incoming AI responses are embedded and checked against the Vector DB for semantic accuracy. 
                Any deviations beyond the threshold are flagged, categorized by the Evaluation Engine, and stored permanently in the relational database.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Research;
