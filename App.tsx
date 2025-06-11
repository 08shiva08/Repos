import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">React Insight Analyzer</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Home</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
          </nav>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="text-center text-gray-500 text-sm py-4">
          © {new Date().getFullYear()} React Analyzer. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
