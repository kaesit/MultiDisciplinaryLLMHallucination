import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, MessageSquare, Table2, Database, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <NavLink 
          to="/dashboard/analysis" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <BarChart2 className="sidebar-icon" />
          <span>Analysis</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/experiment" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <MessageSquare className="sidebar-icon" />
          <span>Experiment</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/results" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Table2 className="sidebar-icon" />
          <span>Model Results</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/research" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Database className="sidebar-icon" />
          <span>Research</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard/settings" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Settings className="sidebar-icon" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
