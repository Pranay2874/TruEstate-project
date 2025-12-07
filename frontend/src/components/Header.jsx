import React from 'react';
import '../styles/Header.css';

const Header = ({ user, onSearch }) => {
    // Debounce search to avoid too many API calls
    const handleChange = (e) => {
        const value = e.target.value;
        // Simple debounce could be done here, but for now just pass value
        // Ideally use a timeout ref, but relying on App's state handling or existing debouncing if any. 
        // Given existing App.jsx just sets state directly, let's add a small timeout here or just pass it.
        // Let's pass it directly for responsiveness, and let the user decide if they want debounce.
        // Actually, for better UX, let's delay it slightly.
        if (onSearch) onSearch(value);
    };

    // Debouncing implementation
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (onSearch) onSearch(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, onSearch]);

    return (
        <header className="top-header">
            <div className="search-container-top">
                <i className="search-icon">🔍</i>
                <input
                    type="text"
                    placeholder="Name, Phone no."
                    className="search-input-top"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="user-profile">
                <div className="avatar">P</div>
                <span className="username">{user || 'User'}</span>
            </div>
        </header>
    );
};

export default Header;
