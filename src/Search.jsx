import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const Search = ({ data, cities, onSelect, onCitySelect, colorScale }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();

    // Search counties
    const countyResults = data
      .filter((d) => d.name.toLowerCase().includes(lowerQuery))
      .map((d) => ({ ...d, type: 'county' }))
      .slice(0, 6);

    // Search cities (exclude AK/HI - no climate data, deduplicate by city+state)
    const seenCities = new Set();
    const cityResults = (cities || [])
      .filter((c) => {
        if (c.state === 'AK' || c.state === 'HI') return false;
        const key = `${c.city}-${c.state}`;
        if (seenCities.has(key)) return false;
        seenCities.add(key);
        const cityState = `${c.city}, ${c.state}`.toLowerCase();
        const cityOnly = c.city.toLowerCase();
        return cityState.includes(lowerQuery) || cityOnly.includes(lowerQuery);
      })
      .map((c) => ({ ...c, type: 'city', name: `${c.city}, ${c.state}` }))
      .slice(0, 6);

    // Combine and sort - prioritize exact starts
    const combined = [...countyResults, ...cityResults];
    combined.sort((a, b) => {
      const aName = a.type === 'city' ? a.city.toLowerCase() : a.name.toLowerCase();
      const bName = b.type === 'city' ? b.city.toLowerCase() : b.name.toLowerCase();
      const aStarts = aName.startsWith(lowerQuery);
      const bStarts = bName.startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aName.localeCompare(bName);
    });

    return combined.slice(0, 10);
  }, [data, cities, query]);

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

  const handleSelect = (item) => {
    if (item.type === 'city') {
      onCitySelect?.(item);
    } else {
      onSelect(item);
    }
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
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search counties or cities..."
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
          {filteredResults.map((item, index) => (
            <li
              key={item.type === 'city' ? `city-${item.city}-${item.state}` : item.id}
              className={`search-result-item ${
                index === highlightedIndex ? "highlighted" : ""
              }`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {item.type === 'county' ? (
                <>
                  <span
                    className="result-risk-indicator"
                    style={{ backgroundColor: colorScale(item.total_risk) }}
                  />
                  <span className="result-name">{item.name}</span>
                  <span className="result-type county">County</span>
                </>
              ) : (
                <>
                  <span className="result-city-icon">📍</span>
                  <span className="result-name">{item.name}</span>
                  <span className="result-type city">City</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && filteredResults.length === 0 && (
        <div className="search-no-results">No results found</div>
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
  cities: PropTypes.arrayOf(
    PropTypes.shape({
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    })
  ),
  onSelect: PropTypes.func.isRequired,
  onCitySelect: PropTypes.func,
  colorScale: PropTypes.func.isRequired,
};

export default Search;
