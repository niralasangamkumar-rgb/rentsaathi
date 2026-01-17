import { useState } from 'react';

export default function SearchBar({ onSearch, value, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(e);
    } else {
      setSearchTerm(newValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchValue = value !== undefined ? value : searchTerm;
    onSearch(searchValue);
  };

  const displayValue = value !== undefined ? value : searchTerm;

  return (
    <form onSubmit={handleSubmit} className="w-full" data-testid="search-form">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="Search by location, property type..."
          className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
          style={{
            color: '#000000',
            backgroundColor: '#ffffff',
            caretColor: '#000000'
          }}
          data-testid="search-input"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          data-testid="search-btn"
        >
          Search
        </button>
      </div>
    </form>
  );
}
