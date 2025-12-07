import React from 'react';
import '../styles/Sidebar.css';
import LogoIcon from '../icons/LogoIcon';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="logo-section">
                <div className="logo-icon"><LogoIcon /></div>
                <span className="logo-text">TruEstate</span>
            </div>

            <nav className="nav-menu">
                <div className="nav-item">Dashboard</div>
                <div className="nav-item">Nexus</div>
                <div className="nav-item active">Intake</div>

                <div className="nav-section-title">Services</div>
                <div className="nav-item sub-item">Pre-active</div>
                <div className="nav-item sub-item">Active</div>
                <div className="nav-item sub-item">Blocked</div>
                <div className="nav-item sub-item">Closed</div>

                <div className="nav-section-title">Invoices</div>
                <div className="nav-item sub-item">Proforma Invoices</div>
                <div className="nav-item sub-item">Final Invoices</div>
            </nav>
        </aside>
    );
};

export default Sidebar;
