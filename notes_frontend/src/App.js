import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/theme.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

/**
 * Root application shell for the Notes app.
 * Renders the Ocean Professional themed layout with header, sidebar, and main content area.
 */
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Apply theme to document root so CSS variables update globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`app-shell ocean-gradient`}>
      {/* Header with app title and theme toggle */}
      <Header onToggleTheme={toggleTheme} currentTheme={theme} />

      {/* Content area with sidebar and main pane */}
      <div className="app-content">
        <Sidebar />
        <main className="app-main" role="main" aria-label="Main content area">
          <h2 style={{ marginTop: 0 }}>Main</h2>
          <p className="mb-2">
            Welcome to Notes. This main area will display note reading/editing in later steps.
          </p>
          <small className="text-muted">Ocean theme is active. Current theme: {theme}</small>
        </main>
      </div>
    </div>
  );
}

export default App;
