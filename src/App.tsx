// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import About from './components/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UserPrompting from './components/UserPrompting';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              <Pricing />
              <About />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/user-prompting" element={<UserPrompting />} />
          <Route path="/email-assistant" element={<UserPrompting />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;