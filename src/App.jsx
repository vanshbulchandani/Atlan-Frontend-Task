import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import QueryRunner from "./components/QueryRunner";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/query" element={<QueryRunner />} />
      </Routes>
    </Router>
  );
}

export default App;
