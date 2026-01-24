import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const Search = ({ data, onSelect, colorScale }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return data
      .filter((d) => d.name.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);
  }, [data, query]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredResults]);

  const handleKeyDown = (e) => {
    if (!isOpen || filteredResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredResults[highlightedIndex]) {
          handleSelect(filteredResults[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (county) => {
    onSelect(county);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search counties..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            x
          </button>
        )}
      </div>

      {isOpen && filteredResults.length > 0 && (
        <ul className="search-results" ref={listRef}>
          {filteredResults.map((county, index) => (
            <li
              key={county.id}
              className={`search-result-item ${
                index === highlightedIndex ? "highlighted" : ""
              }`}
              onClick={() => handleSelect(county)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span
                className="result-risk-indicator"
                style={{ backgroundColor: colorScale(county.total_risk) }}
              />
              <span className="result-name">{county.name}</span>
              <span className="result-risk">Risk: {county.total_risk}</span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && filteredResults.length === 0 && (
        <div className="search-no-results">No counties found</div>
      )}
    </div>
  );
};

Search.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      total_risk: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  colorScale: PropTypes.func.isRequired,
};

export default Search;
