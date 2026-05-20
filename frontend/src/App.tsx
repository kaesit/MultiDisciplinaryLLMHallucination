import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './views/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Analysis from './views/dashboard/Analysis';
import Experiment from './views/dashboard/Experiment';
import ModelResults from './views/dashboard/ModelResults';
import Research from './views/dashboard/Research';
import Settings from './views/dashboard/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="analysis" replace />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="experiment" element={<Experiment />} />
              <Route path="results" element={<ModelResults />} />
              <Route path="research" element={<Research />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
