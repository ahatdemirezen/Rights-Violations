import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative flex items-center">
      <FaSearch className="absolute left-3 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder} // Dinamik placeholder
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-gray-300 rounded-full p-2 pl-10 outline-none focus:border-[#FF6F61] focus:shadow-md focus:shadow-blue-200 bg-gray-50"
      />
    </div>
  );
};

export default SearchBar;