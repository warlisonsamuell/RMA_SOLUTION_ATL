import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import RMAForm from './pages/RegisterRMA/RegisterRMA';
import SignUp from './pages/SignUp/SignUp';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
        <a href="#">
          <img src={require('../src/logo.png')} alt="Logo" className="logo" />
        </a>
          <h1>Sistema de Gerenciamento de RMA</h1>
          <nav className="App-nav">
            <Link to="/">Login</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/rma">Registrar RMA</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rma" element={<RMAForm />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;