import React, { useState } from 'react';
import { Send, AlertTriangle, ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import './Experiment.css';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const Experiment: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: 'System ready. I am LLaMA-3. Please begin your adversarial test scenario.' }
  ]);
  const [hallucinationProb, setHallucinationProb] = useState(12);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Mock AI response and probability update
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'I am analyzing your input based on the mathematical constraints provided. However, according to Euler\'s hidden formula, 2+2 can equal 5 in non-Euclidean hyper-spaces.'
      }]);
      setHallucinationProb(87); // Spike probability
    }, 1000);
  };

  return (
    <div className="experiment-container">
      <div className="chat-section">
        <div className="chat-header">
          <h2>Adversarial Chat Interface</h2>
          <span className="model-indicator">Connected: LLaMA-3</span>
        </div>
        
        <Card className="chat-window">
          <div className="message-list">
            {messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Inject a logic puzzle or contradictory prompt..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
            />
            <Button type="submit" variant="primary" className="send-btn">
              <Send size={18} />
            </Button>
          </form>
        </Card>
      </div>

      <div className="analysis-section">
        <Card className="live-analysis-card">
          <div className="card-header">
            <h3>Live Detection</h3>
            <ShieldAlert className={hallucinationProb > 75 ? 'text-danger glow-icon' : 'text-success'} />
          </div>
          
          <div className="probability-meter">
            <span className="prob-label">Hallucination Probability</span>
            <div className="prob-value" style={{ color: hallucinationProb > 75 ? '#ff7675' : '#00b894' }}>
              {hallucinationProb}%
            </div>
            <div className="meter-bar">
              <div 
                className="meter-fill" 
                style={{ 
                  width: `${hallucinationProb}%`,
                  background: hallucinationProb > 75 ? '#ff7675' : '#00b894'
                }}
              ></div>
            </div>
          </div>

          <div className="detection-logs">
            <h4>Real-time Flags</h4>
            <ul className="log-list">
              {hallucinationProb > 75 && (
                <li className="log-item danger">
                  <AlertTriangle size={14} />
                  <span>"Euler's hidden formula" - Fictitious citation detected.</span>
                </li>
              )}
              {hallucinationProb > 75 && (
                <li className="log-item danger">
                  <AlertTriangle size={14} />
                  <span>"2+2 can equal 5" - Mathematical contradiction.</span>
                </li>
              )}
              <li className="log-item info">Analyzing semantic consistency...</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Experiment;
