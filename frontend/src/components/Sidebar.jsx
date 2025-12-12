import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/App.css'; // Ensure we have styles

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'Library', path: '/library', icon: '📚' },
        { name: 'Planner', path: '/planner', icon: '📅' },
        { name: 'Shopping List', path: '/shopping-list', icon: '🛒' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>SAPOR</h2>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
