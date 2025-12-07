import React from 'react';
import '../styles/Header.css';
import SearchIcon from '../icons/SearchIcon';

const Header = ({ user, onSearch }) => {
    // Debounce search
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
                <i className="search-icon"><SearchIcon /></i>
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
