// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../common/components/Header';
import MetricCard from '../../common/components/MetricCard';
import Sidebar from '../../common/components/Sidebar';
import { Shield } from 'lucide-react';
import '../../styles/Dashboard.css';

const Settings = () => {
  return (
    <div className="dashboard-container">
        <Sidebar />
      <Header title="Settings" icon="Settings" />

      <main className="main-content">
        <p>Settings page content will go here.</p>
      </main>
    </div>
  );
};

export default Settings;