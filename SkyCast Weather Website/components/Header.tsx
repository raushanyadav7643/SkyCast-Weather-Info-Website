
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sun, Moon, RefreshCcw, Loader2 } from 'lucide-react';
import { TempUnit } from '../types';
import { fetchCitySuggestions, CitySuggestion } from '../services/weatherService';

interface HeaderProps {
  onSearch: (city: string, coords?: { lat: number, lon: number }) => void;
  onLocation: () => void;
  onUnitToggle: () => void;
  onThemeToggle: () => void;
  onRefresh: () => void;
  unit: TempUnit;
  theme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, onLocation, onUnitToggle, onThemeToggle, onRefresh, unit, theme 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const results = await fetchCitySuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const cityName = `${suggestion.name}${suggestion.state ? `, ${suggestion.state}` : ''}`;
    setQuery(suggestion.name);
    onSearch(cityName, { lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
  };

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 mb-4 glass rounded-3xl transition-all relative z-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
          <Sun className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-300 dark:to-purple-300">
          SkyCast
        </h1>
      </div>

      <div className="relative w-full md:max-w-md flex-grow" ref={dropdownRef}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="Search village, city, or block..."
            className="w-full pl-12 pr-12 py-3 bg-white/10 dark:bg-[#11678c] border border-white/20 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-400 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400/70"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
          )}
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-[#0f4c68]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <ul className="py-2">
              {suggestions.map((item, index) => (
                <li 
                  key={`${item.lat}-${item.lon}-${index}`}
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-3 hover:bg-blue-500/10 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-800 dark:text-white font-semibold">{item.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.state ? `${item.state}, ` : ''}{item.country}</span>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onLocation}
          title="Use my location"
          className="p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 rounded-xl transition-colors border border-white/10"
        >
          <MapPin className="text-blue-500 dark:text-blue-100 w-5 h-5" />
        </button>
        <button
          onClick={onRefresh}
          title="Refresh data"
          className="p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 rounded-xl transition-colors border border-white/10"
        >
          <RefreshCcw className="text-green-500 dark:text-green-400 w-5 h-5" />
        </button>
        <button
          onClick={onUnitToggle}
          className="px-4 py-2 font-bold bg-white/10 dark:bg-black/20 rounded-xl transition-colors border border-white/10 text-gray-800 dark:text-white hover:bg-white/20"
        >
          {unit === TempUnit.CELSIUS ? '°C' : '°F'}
        </button>
        <button
          onClick={onThemeToggle}
          className="p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 rounded-xl transition-colors border border-white/10"
        >
          {theme === 'light' ? <Moon className="text-purple-600 w-5 h-5" /> : <Sun className="text-yellow-400 w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
