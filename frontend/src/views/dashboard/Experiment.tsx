import React, { useState } from 'react';
import { Send, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: 'System ready. I am an LLM Model. Please begin your adversarial test scenario.' }
  ]);
  const [hallucinationProb, setHallucinationProb] = useState(0);
  const [detectionLogs, setDetectionLogs] = useState<{type: string, message: string}[]>([
    { type: 'info', message: 'Waiting for interaction...' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const newUserMsg: Message = { id: Date.now(), sender: 'user', text: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    setDetectionLogs([{ type: 'info', message: 'Generating response via API...' }]);

    try {
      // 1. Get Chat Response
      const chatPayload = {
        messages: messages.concat(newUserMsg).map(m => ({
          role: m.sender === 'ai' ? 'assistant' : 'user',
          content: m.text
        })),
        model_name: "qwen3.5:4b" // Or whichever model is being tested
      };

      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload)
      });
      
      if (!chatRes.ok) throw new Error('Chat API failed');
      const chatData = await chatRes.json();
      const aiResponseText = chatData.response;

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText
      }]);

      // 2. Evaluate for Hallucinations
      setDetectionLogs([{ type: 'info', message: 'Analyzing response for hallucinations...' }]);
      
      const predictRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiResponseText,
          domain: 'general'
        })
      });

      if (!predictRes.ok) throw new Error('Prediction API failed');
      const predictData = await predictRes.json();

      // Update UI with real prediction data
      const prob = Math.round(predictData.hallucination_score * 100);
      setHallucinationProb(prob);

      const logs = [];
      if (prob > 75) {
        logs.push({ type: 'danger', message: `Type: ${predictData.hallucination_type}` });
        logs.push({ type: 'danger', message: `Reasoning: ${predictData.details}` });
      } else {
        logs.push({ type: 'success', message: 'Response seems factual and consistent.' });
        if (predictData.details && predictData.details !== "No details provided.") {
            logs.push({ type: 'info', message: predictData.details });
        }
      }
      setDetectionLogs(logs);

    } catch (error) {
      console.error(error);
      setDetectionLogs([{ type: 'danger', message: 'API connection error. Ensure backend is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="experiment-container">
      <div className="chat-section">
        <div className="chat-header">
          <h2>Adversarial Chat Interface</h2>
          <span className="model-indicator">Connected: Evaluator Model</span>
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
            {isLoading && (
              <div className="message-wrapper ai">
                <div className="message-bubble ai typing-indicator">
                  <Loader2 className="spin" size={16} /> Generating...
                </div>
              </div>
            )}
          </div>
          
          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Inject a logic puzzle or contradictory prompt..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" className="send-btn" disabled={isLoading}>
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
              {detectionLogs.map((log, i) => (
                <li key={i} className={`log-item ${log.type}`}>
                  {log.type === 'danger' && <AlertTriangle size={14} />}
                  <span>{log.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Experiment;
