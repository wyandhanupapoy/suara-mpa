/**
 * Search and Filter Utilities for Aspirations
 */

/**
 * Apply search query to aspirations list
 * Searches in: title, description, category
 */
export function searchAspirations(aspirations, query) {
  if (!query || query.trim() === '') {
    return aspirations;
  }

  const lowerQuery = query.toLowerCase().trim();

  return aspirations.filter((asp) => {
    const searchFields = [
      asp.title || '',
      asp.description || '',
      asp.category || '',
      asp.trackingCode || ''
    ].map(field => field.toLowerCase());

    return searchFields.some(field => field.includes(lowerQuery));
  });
}

/**
 * Apply filters to aspirations list
 */
export function filterAspirations(aspirations, filters) {
  let filtered = [...aspirations];

  // Filter by category
  if (filters.category && filters.category !== 'Semua Kategori') {
    filtered = filtered.filter(asp => asp.category === filters.category);
  }

  // Filter by status
  if (filters.status && filters.status !== 'Semua Status') {
    filtered = filtered.filter(asp => asp.status === filters.status);
  }

  // Filter by date range (if provided)
  if (filters.startDate) {
    filtered = filtered.filter(asp => {
      const aspDate = asp.createdAt?.toDate ? asp.createdAt.toDate() : new Date(asp.createdAt);
      return aspDate >= new Date(filters.startDate);
    });
  }

  if (filters.endDate) {
    filtered = filtered.filter(asp => {
      const aspDate = asp.createdAt?.toDate ? asp.createdAt.toDate() : new Date(asp.createdAt);
      return aspDate <= new Date(filters.endDate);
    });
  }

  return filtered;
}

/**
 * Sort aspirations list
 */
export function sortAspirations(aspirations, sortBy) {
  const sorted = [...aspirations];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });

    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA - dateB;
      });

    case 'most_voted':
      return sorted.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

    default:
      return sorted;
  }
}

/**
 * Combined search, filter, and sort
 */
export function processAspirations(aspirations, { searchQuery, filters, sortBy }) {
  let processed = aspirations;

  // Apply search
  if (searchQuery) {
    processed = searchAspirations(processed, searchQuery);
  }

  // Apply filters
  if (filters) {
    processed = filterAspirations(processed, filters);
  }

  // Apply sorting
  if (sortBy) {
    processed = sortAspirations(processed, sortBy);
  }

  return processed;
}

/**
 * Paginate results
 */
export function paginateResults(items, page = 1, itemsPerPage = 10) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    items: items.slice(startIndex, endIndex),
    totalPages: Math.ceil(items.length / itemsPerPage),
    currentPage: page,
    totalItems: items.length,
    hasNextPage: endIndex < items.length,
    hasPrevPage: page > 1
  };
}

/**
 * Get search suggestions based on existing aspirations
 */
export function getSearchSuggestions(aspirations, query, maxSuggestions = 5) {
  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const suggestions = new Set();

  aspirations.forEach(asp => {
    // Get category suggestions
    if (asp.category?.toLowerCase().includes(lowerQuery)) {
      suggestions.add(asp.category);
    }

    // Get title word suggestions
    const titleWords = (asp.title || '').split(' ');
    titleWords.forEach(word => {
      if (word.toLowerCase().startsWith(lowerQuery) && word.length > 2) {
        suggestions.add(word);
      }
    });
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Highlight search term in text
 */
export function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}
