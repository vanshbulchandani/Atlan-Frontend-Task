import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className={`landing-page ${darkMode ? "dark-mode" : ""}`}>
      <nav className="nav-bar">
        <div className="logo">SQL Query Runner</div>
        <div className="nav-buttons">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
          <Link to="/query" className="launch-button">
            Launch App
          </Link>
        </div>
      </nav>

      <div className="hero-section">
        <h1>Run SQL Queries with Ease</h1>
        <p>
          A powerful, user-friendly SQL query runner with predefined queries,
          <br />
          favorites, and execution history.
        </p>
        <Link to="/query" className="get-started-button">
          Get Started
        </Link>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Predefined Queries</h3>
            <p>Access a library of common SQL queries for quick execution</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Favorites</h3>
            <p>Save your frequently used queries for easy access</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Execution</h3>
            <p>Run queries and get results in milliseconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Results Export</h3>
            <p>Export query results to CSV for further analysis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌓</div>
            <h3>Dark Mode</h3>
            <p>Switch between light and dark themes for comfortable viewing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
