'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  'Semua Kategori',
  'Akademik',
  'Organisasi', 
  'Fasilitas',
  'Kebijakan',
  'Lainnya'
];

const STATUSES = [
  'Semua Status',
  'Pending',
  'Diproses',
  'Selesai',
  'Ditolak'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'most_voted', label: 'Paling Banyak Vote' }
];

export default function FilterPanel({ onFilterChange, showVoting = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'Semua Kategori',
    status: 'Semua Status',
    sortBy: 'newest'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFilterChange) {
      // Convert to API-friendly format
      const apiFilters = {
        category: newFilters.category === 'Semua Kategori' ? null : newFilters.category,
        status: newFilters.status === 'Semua Status' ? null : newFilters.status,
        sortBy: newFilters.sortBy
      };
      onFilterChange(apiFilters);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: 'Semua Kategori',
      status: 'Semua Status',
      sortBy: 'newest'
    };
    setFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange({ category: null, status: null, sortBy: 'newest' });
    }
  };

  const hasActiveFilters = filters.category !== 'Semua Kategori' || 
                          filters.status !== 'Semua Status' ||
                          filters.sortBy !== 'newest';

  return (
    <div className="w-full">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 
                 bg-white border border-gray-200 rounded-xl shadow-sm
                 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Filter & Urutkan</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              Aktif
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Content */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'} lg:block
        mt-4 lg:mt-0 p-4 lg:p-0 bg-white lg:bg-transparent border lg:border-0 
        border-gray-200 rounded-xl
      `}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white cursor-pointer"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urutkan
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white cursor-pointer"
            >
              {SORT_OPTIONS
                .filter(opt => showVoting || opt.value !== 'most_voted')
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))
              }
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 
                         hover:text-gray-900 hover:bg-gray-100 rounded-lg
                         transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filter aktif:</span>
            {filters.category !== 'Semua Kategori' && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full
                           flex items-center gap-1">
                {filters.category}
                <button
                  onClick={() => handleFilterChange('category', 'Semua Kategori')}
                  className="hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status !== 'Semua Status' && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full
                           flex items-center gap-1">
                {filters.status}
                <button
                  onClick={() => handleFilterChange('status', 'Semua Status')}
                  className="hover:bg-green-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
