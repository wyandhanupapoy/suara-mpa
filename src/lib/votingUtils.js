/**
 * Voting System Utilities
 * IP-based duplicate prevention for voting
 */

/**
 * Hash IP address for privacy
 */
export const hashIP = (ip) => {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Get user's IP address
 */
export const getUserIP = async () => {
  try {
    const response = await fetch('/api/get-ip');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
};

/**
 * Check if user has already voted
 */
export const hasUserVoted = async (aspirationId, db, appId) => {
  try {
    const ip = await getUserIP();
    const ipHash = hashIP(ip);
    
    // Check in Firestore (or localStorage for demo)
    const storageKey = `vote_${aspirationId}_${ipHash}`;
    const hasVoted = localStorage.getItem(storageKey);
    
    return hasVoted === 'true';
  } catch (error) {
    console.error('Error checking vote:', error);
    return false;
  }
};

/**
 * Record vote
 */
export const recordVote = async (aspirationId, db, appId) => {
  try {
    const ip = await getUserIP();
    const ipHash = hashIP(ip);
    
    // Save to localStorage (can be migrated to Firestore)
    const storageKey = `vote_${aspirationId}_${ipHash}`;
    localStorage.setItem(storageKey, 'true');
    
    return { success: true };
  } catch (error) {
    console.error('Error recording vote:', error);
    return { success: false, error };
  }
};

/**
 * Remove vote
 */
export const removeVote = async (aspirationId, db, appId) => {
  try {
    const ip = await getUserIP();
    const ipHash = hashIP(ip);
    
    const storageKey = `vote_${aspirationId}_${ipHash}`;
    localStorage.removeItem(storageKey);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing vote:', error);
    return { success: false, error };
  }
};

/**
 * Get vote statistics for aspiration
 */
export const getVoteStats = (aspiration) => {
  return {
    voteCount: aspiration.voteCount || 0,
    rank: aspiration.voteRank || null,
    trending: (aspiration.voteCount || 0) > 5 && isRecent(aspiration.created_at)
  };
};

/**
 * Check if aspiration is recent (last 7 days)
 */
const isRecent = (timestamp) => {
  if (!timestamp) return false;
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  
  return diffDays <= 7;
};

/**
 * Sort aspirations by votes
 */
export const sortByVotes = (aspirations) => {
  return [...aspirations].sort((a, b) => {
    const votesA = a.voteCount || 0;
    const votesB = b.voteCount || 0;
    
    if (votesB !== votesA) {
      return votesB - votesA;
    }
    
    // If votes are equal, sort by date
    const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
    const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
    return dateB - dateA;
  });
};

/**
 * Get trending aspirations
 */
export const getTrendingAspirations = (aspirations, limit = 5) => {
  const trending = aspirations.filter(asp => {
    const stats = getVoteStats(asp);
    return stats.trending;
  });
  
  return sortByVotes(trending).slice(0, limit);
};

/**
 * Get top voted aspirations (all time)
 */
export const getTopVoted = (aspirations, limit = 10) => {
  return sortByVotes(aspirations).slice(0, limit);
};
