import React from 'react';
import '../styles/Header.css';
import SearchIcon from '../icons/SearchIcon';

const Header = ({ user, onSearch }) => {
    const [query, setQuery] = React.useState('');

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (onSearch) onSearch(query);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, onSearch]);

    return (
        <header className="top-header">
            <div className="search-container-top">
                <i className="search-icon"><SearchIcon /></i>
                <input
                    type="text"
                    placeholder="Name, Phone no."
                    className="search-input-top"
                    onChange={(e) => setQuery(e.target.value)}
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
