import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, ShieldAlert, Loader2, Cpu, Activity, Database } from 'lucide-react';
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
    { id: 1, sender: 'ai', text: 'System ready. Mistral 7B & DL Classification Model initialized. Please begin your adversarial test scenario.' }
  ]);
  const [hallucinationProb, setHallucinationProb] = useState(0);
  const [hallucinationClass, setHallucinationClass] = useState<string>('Standby');
  const [detectionLogs, setDetectionLogs] = useState<{type: string, message: string}[]>([
    { type: 'info', message: 'Waiting for interaction...' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const newUserMsg: Message = { id: Date.now(), sender: 'user', text: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    setDetectionLogs([{ type: 'info', message: 'Generating response via Mistral (Ollama)...' }]);

    try {
      // 1. Get Chat Response
      const chatPayload = {
        messages: messages.concat(newUserMsg).map(m => ({
          role: m.sender === 'ai' ? 'assistant' : 'user',
          content: m.text
        })),
        model_name: "mistral"
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
      setDetectionLogs([{ type: 'info', message: 'Analyzing response with Deep Learning .h5 Model...' }]);
      
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
      const prob = Math.round(predictData.confidence * 100);
      setHallucinationProb(prob);
      setHallucinationClass(predictData.hallucination_type);

      const logs = [];
      const isHallucination = predictData.hallucination_score > 0.5;
      
      if (isHallucination) {
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
      setDetectionLogs([{ type: 'danger', message: 'API connection error. Ensure backend is running and packages are installed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isDanger = hallucinationProb > 60 && hallucinationClass !== 'none' && hallucinationClass !== 'Standby' && !['yok', 'dogru', '0'].includes(hallucinationClass.toLowerCase());
  const probColor = isDanger ? '#ff4757' : '#2ed573';

  return (
    <div className="experiment-container">
      <div className="chat-section glass-panel">
        <div className="chat-header">
          <div className="header-title">
            <Cpu className="title-icon" />
            <h2>Adversarial Interface</h2>
          </div>
          <div className="model-badges">
            <span className="model-indicator mistral"><Database size={14}/> Mistral</span>
            <span className="model-indicator dl-model"><Activity size={14}/> DL .h5 Model</span>
          </div>
        </div>
        
        <div className="chat-window">
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
                  <div className="dot-typing"></div>
                  Generating...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
            <button type="submit" className="send-btn" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>

      <div className="analysis-section">
        <div className="live-analysis-card glass-panel">
          <div className="card-header">
            <h3>Live Telemetry</h3>
            <ShieldAlert className={`shield-icon ${isDanger ? 'pulse-danger' : 'glow-success'}`} />
          </div>
          
          <div className="probability-meter">
            <span className="prob-label">
              {hallucinationClass === 'Standby' 
                ? "Awaiting Input..." 
                : (!isDanger ? "Factual Confidence (No Hallucination)" : "Hallucination Confidence")}
            </span>
            <div className="prob-value" style={{ color: probColor, textShadow: `0 0 20px ${probColor}80` }}>
              {hallucinationProb}%
            </div>
            <div className="meter-wrapper">
              <div className="meter-bar">
                <div 
                  className="meter-fill" 
                  style={{ 
                    width: `${hallucinationProb}%`,
                    background: `linear-gradient(90deg, transparent, ${probColor})`,
                    boxShadow: `0 0 15px ${probColor}`
                  }}
                ></div>
              </div>
            </div>
            
            <div className={`class-badge ${isDanger ? 'danger' : 'safe'}`}>
              Class: {hallucinationClass.toUpperCase()}
            </div>
          </div>

          <div className="detection-logs">
            <h4><Activity size={16} /> Real-time Flags</h4>
            <ul className="log-list">
              {detectionLogs.map((log, i) => (
                <li key={i} className={`log-item ${log.type} fade-in`}>
                  <div className="log-icon">
                    {log.type === 'danger' ? <AlertTriangle size={14} /> : 
                     log.type === 'success' ? <ShieldAlert size={14} /> :
                     <Activity size={14} />}
                  </div>
                  <span>{log.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiment;
