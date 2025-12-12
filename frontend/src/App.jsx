import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MealLibrary from './components/MealLibrary';
import Planner from './components/Planner';
import ShoppingList from './components/ShoppingList';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<MealLibrary />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
