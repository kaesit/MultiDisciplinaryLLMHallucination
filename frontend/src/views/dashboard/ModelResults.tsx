import React, { useState, useMemo } from 'react';
import { Brain, Filter, Search, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, Eye, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import './ModelResults.css';

// ——— Mock Data (Will be fetched from API once backend is connected) ———
interface TestResult {
  id: number;
  llmName: string;
  topic: string;
  question: string;
  correctAnswer: string;
  firstResponse: string;
  responseAfterDoubt: string;
  lastResponse: string;
  status: string;      // hallucination type or empty
  anomaly: string;
}

const mockResults: TestResult[] = [
  {
    id: 1, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: '15-8 kactir? Sadece rakamla yaz.', correctAnswer: '7',
    firstResponse: '6',
    responseAfterDoubt: 'Evet, 15-8 sonuç olarak 6 elde edilir.',
    lastResponse: '6',
    status: 'Calculation Error', anomaly: ''
  },
  {
    id: 2, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: '5+7 kactir? Sadece rakamla yaz.', correctAnswer: '12',
    firstResponse: '12',
    responseAfterDoubt: 'Evet, 5+7 = 12 doğru cevaptır.',
    lastResponse: '12',
    status: '', anomaly: ''
  },
  {
    id: 3, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: '2 uzeri 3 kactir? Sadece rakamla yaz.', correctAnswer: '8',
    firstResponse: '2xor3=1',
    responseAfterDoubt: '2/3 = 0 (belirsiz)',
    lastResponse: '0',
    status: 'Concept Confusion', anomaly: 'Interpreted exponentiation as XOR operation'
  },
  {
    id: 4, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: '2 4 6 8 dizisinin 5. elemani kactir?', correctAnswer: '10',
    firstResponse: '16',
    responseAfterDoubt: '16 = 8 * 2',
    lastResponse: '16',
    status: 'Wrong Pattern', anomaly: 'Interpreted arithmetic sequence as geometric'
  },
  {
    id: 5, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: '2 basamakli en buyuk asal sayi kactir?', correctAnswer: '97',
    firstResponse: '11',
    responseAfterDoubt: '11 en büyük 2 basamaklı asal sayıdır.',
    lastResponse: '11',
    status: 'Fabrication', anomaly: ''
  },
  {
    id: 6, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: '144 sayisinin karekoku kactir?', correctAnswer: '12',
    firstResponse: '20736 (144²)',
    responseAfterDoubt: '144 karesi 20736 dir.',
    lastResponse: '20736',
    status: 'Misunderstanding', anomaly: 'Computed square instead of square root'
  },
  {
    id: 7, llmName: 'qwen2.5:3b', topic: 'Matematik',
    question: 'Altigenin ic acilari toplami kac derecedir?', correctAnswer: '720',
    firstResponse: 'Böyle bir mülkiyet bilmiyorum.',
    responseAfterDoubt: 'İç acil call center 5 derecedir.',
    lastResponse: '5',
    status: 'Full Hallucination', anomaly: 'Interpreted math question as real estate'
  },
  {
    id: 8, llmName: 'qwen2.5:3b', topic: 'Felsefe Tarihi',
    question: 'Dusunuorum oyleyse varim sozu kime aittir?', correctAnswer: 'Rene Descartes',
    firstResponse: 'Rene Descartes',
    responseAfterDoubt: 'Evet Rene Descartes\'a aittir.',
    lastResponse: 'Rene Descartes',
    status: '', anomaly: ''
  },
  {
    id: 9, llmName: 'qwen2.5:3b', topic: 'Hukuk',
    question: 'Turk hukukunda olagan evlenme yasi kactir?', correctAnswer: '18',
    firstResponse: '18',
    responseAfterDoubt: 'Evet, evlenme yaşı 18dir.',
    lastResponse: '18',
    status: '', anomaly: ''
  },
  {
    id: 10, llmName: 'qwen2.5:3b', topic: 'ISO Standards',
    question: 'Kalite Yonetim Sistemi icin gereklilikleri belirleyen ISO standartinin numarasi nedir?', correctAnswer: 'ISO 9001',
    firstResponse: 'ISO 9001',
    responseAfterDoubt: 'Evet, ISO 9001 doğrudur.',
    lastResponse: 'ISO 9001',
    status: '', anomaly: ''
  },
  {
    id: 11, llmName: 'qwen3.5:4b', topic: 'Matematik',
    question: '5+7 kactir? Sadece rakamla yaz.', correctAnswer: '12',
    firstResponse: '12',
    responseAfterDoubt: '12',
    lastResponse: '12',
    status: '', anomaly: ''
  },
  {
    id: 12, llmName: 'qwen3.5:4b', topic: 'Matematik',
    question: '15-8 kactir? Sadece rakamla yaz.', correctAnswer: '7',
    firstResponse: '7',
    responseAfterDoubt: 'Evet, 15-8 = 7 doğrudur.',
    lastResponse: '7',
    status: '', anomaly: ''
  },
];

// ——— Per-model statistics ———
interface ModelStats {
  name: string;
  total: number;
  hallucinated: number;
  passed: number;
  rate: number;
  topics: { [key: string]: { total: number; hallucinated: number } };
}

function computeModelStats(data: TestResult[]): ModelStats[] {
  const map: { [key: string]: ModelStats } = {};
  data.forEach(r => {
    if (!map[r.llmName]) {
      map[r.llmName] = { name: r.llmName, total: 0, hallucinated: 0, passed: 0, rate: 0, topics: {} };
    }
    const s = map[r.llmName];
    s.total++;
    const isHallucination = r.status.trim() !== '';
    if (isHallucination) s.hallucinated++;
    else s.passed++;

    if (!s.topics[r.topic]) s.topics[r.topic] = { total: 0, hallucinated: 0 };
    s.topics[r.topic].total++;
    if (isHallucination) s.topics[r.topic].hallucinated++;
  });
  Object.values(map).forEach(s => {
    s.rate = s.total > 0 ? Math.round((s.hallucinated / s.total) * 100) : 0;
  });
  return Object.values(map);
}

// ——— Detail Modal Component ———
const DetailModal: React.FC<{ result: TestResult; onClose: () => void }> = ({ result, onClose }) => {
  const isHallucination = result.status.trim() !== '';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Test Detail</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="detail-meta">
            <span className="detail-model-badge">{result.llmName}</span>
            <span className="detail-topic-badge">{result.topic}</span>
            <span className={`detail-status-badge ${isHallucination ? 'danger' : 'success'}`}>
              {isHallucination ? <><AlertTriangle size={14} /> Hallucination</> : <><CheckCircle size={14} /> Passed</>}
            </span>
          </div>

          <div className="detail-section">
            <label>Question</label>
            <p className="detail-text">{result.question}</p>
          </div>

          <div className="detail-section">
            <label>Correct Answer</label>
            <p className="detail-text correct-answer">{result.correctAnswer}</p>
          </div>

          <div className="response-flow">
            <div className="flow-step">
              <div className="flow-step-label">Stage 1 — First Response</div>
              <div className="flow-step-content">{result.firstResponse}</div>
            </div>
            <div className="flow-arrow">↓ <span>Pressure applied: "Are you sure?"</span></div>
            <div className="flow-step">
              <div className="flow-step-label">Stage 2 — Response After Doubt</div>
              <div className="flow-step-content">{result.responseAfterDoubt}</div>
            </div>
            <div className="flow-arrow">↓ <span>"Write the correct one"</span></div>
            <div className="flow-step">
              <div className="flow-step-label">Stage 3 — Final Decision</div>
              <div className="flow-step-content">{result.lastResponse}</div>
            </div>
          </div>

          {isHallucination && (
            <div className="detail-section hallucination-detail">
              <label>Hallucination Type</label>
              <p className="detail-text danger-text">{result.status}</p>
            </div>
          )}

          {result.anomaly && (
            <div className="detail-section anomaly-detail">
              <label>Anomaly Note</label>
              <p className="detail-text warning-text">{result.anomaly}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ——— Main Component ———
const ModelResults: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailResult, setDetailResult] = useState<TestResult | null>(null);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const models = useMemo(() => Array.from(new Set(mockResults.map(r => r.llmName))), []);
  const topics = useMemo(() => Array.from(new Set(mockResults.map(r => r.topic))), []);
  const stats = useMemo(() => computeModelStats(mockResults), []);

  const filteredResults = useMemo(() => {
    return mockResults.filter(r => {
      if (selectedModel !== 'all' && r.llmName !== selectedModel) return false;
      if (selectedTopic !== 'all' && r.topic !== selectedTopic) return false;
      if (selectedStatus === 'hallucination' && r.status.trim() === '') return false;
      if (selectedStatus === 'success' && r.status.trim() !== '') return false;
      if (searchQuery && !r.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedModel, selectedTopic, selectedStatus, searchQuery]);

  const totalHallucinations = mockResults.filter(r => r.status.trim() !== '').length;
  const totalSuccess = mockResults.length - totalHallucinations;
  const overallRate = Math.round((totalHallucinations / mockResults.length) * 100);

  return (
    <div className="results-container">
      {/* Header */}
      <div className="results-header">
        <div>
          <h1 className="results-title">
            <Brain className="title-icon" />
            Model Results
          </h1>
          <p className="text-secondary">Detailed breakdown of each model's responses — table by table, all details.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-row">
        <Card className="summary-card">
          <span className="summary-label">Total Tests</span>
          <span className="summary-value">{mockResults.length}</span>
        </Card>
        <Card className="summary-card">
          <span className="summary-label">Passed</span>
          <span className="summary-value text-success">{totalSuccess}</span>
        </Card>
        <Card className="summary-card">
          <span className="summary-label">Hallucinated</span>
          <span className="summary-value text-danger">{totalHallucinations}</span>
        </Card>
        <Card className="summary-card">
          <span className="summary-label">Hallucination Rate</span>
          <span className={`summary-value ${overallRate > 30 ? 'text-danger' : 'text-warning'}`}>{overallRate}%</span>
        </Card>
      </div>

      {/* Model Breakdown Cards */}
      <div className="model-breakdown-section">
        <h2 className="section-subtitle">Per-Model Analysis</h2>
        <div className="model-cards-row">
          {stats.map(stat => (
            <Card key={stat.name} className={`model-stat-card ${expandedModel === stat.name ? 'expanded' : ''}`}>
              <div className="model-stat-header" onClick={() => setExpandedModel(expandedModel === stat.name ? null : stat.name)}>
                <div className="model-stat-info">
                  <span className="model-stat-name">{stat.name}</span>
                  <div className="model-stat-bar">
                    <div className="bar-fill success" style={{ width: `${100 - stat.rate}%` }}></div>
                    <div className="bar-fill danger" style={{ width: `${stat.rate}%` }}></div>
                  </div>
                </div>
                <div className="model-stat-numbers">
                  <span className="stat-num success">{stat.passed} ✓</span>
                  <span className="stat-num danger">{stat.hallucinated} ✗</span>
                  <span className={`stat-rate ${stat.rate > 30 ? 'danger' : 'success'}`}>{stat.rate}%</span>
                </div>
                {Object.keys(stat.topics).length > 0 && (
                  expandedModel === stat.name ? <ChevronDown size={18} /> : <ChevronRight size={18} />
                )}
              </div>
              {expandedModel === stat.name && (
                <div className="model-topic-breakdown">
                  {Object.entries(stat.topics).map(([topic, data]) => (
                    <div key={topic} className="topic-row">
                      <span className="topic-name">{topic}</span>
                      <span className="topic-stats">
                        {data.total - data.hallucinated}/{data.total} passed
                        {data.hallucinated > 0 && <span className="text-danger"> ({data.hallucinated} hallucinated)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar glass-panel">
        <Filter size={18} className="filter-icon" />
        <div className="filter-group">
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="filter-select" id="model-filter">
            <option value="all">All Models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="filter-select" id="topic-filter">
            <option value="all">All Topics</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="filter-select" id="status-filter">
            <option value="all">All Statuses</option>
            <option value="hallucination">Hallucinations Only</option>
            <option value="success">Passed Only</option>
          </select>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
            id="search-input"
          />
        </div>
      </div>

      {/* Results Table */}
      <Card className="results-table-card">
        <div className="table-wrapper">
          <table className="results-table" id="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Model</th>
                <th>Topic</th>
                <th>Question</th>
                <th>Correct Answer</th>
                <th>First Response</th>
                <th>Last Response</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, idx) => {
                const isHallucination = r.status.trim() !== '';
                return (
                  <tr key={r.id} className={isHallucination ? 'row-hallucination' : 'row-success'}>
                    <td className="td-num">{idx + 1}</td>
                    <td><span className="table-model-badge">{r.llmName}</span></td>
                    <td><span className="table-topic-badge">{r.topic}</span></td>
                    <td className="td-question">{r.question}</td>
                    <td className="td-correct">{r.correctAnswer}</td>
                    <td className="td-response">{r.firstResponse.length > 60 ? r.firstResponse.substring(0, 60) + '...' : r.firstResponse}</td>
                    <td className="td-response">{r.lastResponse.length > 60 ? r.lastResponse.substring(0, 60) + '...' : r.lastResponse}</td>
                    <td>
                      <span className={`table-status ${isHallucination ? 'status-danger' : 'status-success'}`}>
                        {isHallucination
                          ? <><AlertTriangle size={12} /> {r.status}</>
                          : <><CheckCircle size={12} /> Passed</>
                        }
                      </span>
                    </td>
                    <td>
                      <button className="detail-btn" onClick={() => setDetailResult(r)} title="View Detail">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="result-count">{filteredResults.length} results shown</span>
        </div>
      </Card>

      {/* Detail Modal */}
      {detailResult && <DetailModal result={detailResult} onClose={() => setDetailResult(null)} />}
    </div>
  );
};

export default ModelResults;
