import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import QueryRunner from "./components/QueryRunner";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";
import Footer from "./components/Footer";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/query" element={<QueryRunner />} />
        </Routes>
      </Router>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
