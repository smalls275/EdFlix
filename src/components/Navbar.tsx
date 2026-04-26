'use client';

import { useState } from 'react';
import { Search, Film, X } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Navbar({ onSearch, searchQuery }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent px-4 md:px-12 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Film className="w-8 h-8 text-edflix-red" />
        <h1 className="text-2xl md:text-3xl font-bold text-edflix-red tracking-tight">
          EdFlix
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {searchOpen ? (
          <div className="flex items-center bg-black/80 border border-white/30 rounded px-3 py-1.5 animate-in">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search titles, genres, tags..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none w-48 md:w-72 placeholder:text-gray-500"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                onSearch('');
              }}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="text-white hover:text-edflix-red transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>
    </nav>
  );
}
