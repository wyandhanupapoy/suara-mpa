'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, TrendingUp } from 'lucide-react';
import { hasUserVoted, recordVote, removeVote, getVoteStats } from '@/lib/votingUtils';

export default function VoteButton({ aspiration, onVoteChange, db, appId, size = 'md' }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(aspiration.voteCount || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user has already voted
  useEffect(() => {
    const checkVote = async () => {
      const voted = await hasUserVoted(aspiration.id, db, appId);
      setHasVoted(voted);
      setIsChecking(false);
    };
    
    checkVote();
  }, [aspiration.id, db, appId]);

  // Update vote count when prop changes
  useEffect(() => {
    setVoteCount(aspiration.voteCount || 0);
  }, [aspiration.voteCount]);

  const handleVote = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (hasVoted) {
        // Remove vote
        await removeVote(aspiration.id, db, appId);
        setHasVoted(false);
        setVoteCount(prev => Math.max(0, prev - 1));
        
        // Notify parent component
        if (onVoteChange) {
          onVoteChange(aspiration.id, -1);
        }
      } else {
        // Add vote
        await recordVote(aspiration.id, db, appId);
        setHasVoted(true);
        setVoteCount(prev => prev + 1);
        
        // Notify parent component
        if (onVoteChange) {
          onVoteChange(aspiration.id, 1);
        }
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert('Gagal melakukan vote');
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = getVoteStats({ ...aspiration, voteCount });
  
  // Size variants
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-xs',
      icon: 'w-3.5 h-3.5',
      count: 'text-xs'
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4',
      count: 'text-sm'
    },
    lg: {
      button: 'px-5 py-2.5 text-base',
      icon: 'w-5 h-5',
      count: 'text-base'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (isChecking) {
    return (
      <div className={`${currentSize.button} rounded-lg bg-gray-100 animate-pulse`}>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVote}
        disabled={isProcessing}
        className={`
          ${currentSize.button}
          ${hasVoted 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
          }
          font-bold rounded-lg transition-all
          flex items-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
        `}
        title={hasVoted ? 'Remove your vote' : 'Vote for this aspiration'}
      >
        <ThumbsUp 
          className={`${currentSize.icon} ${hasVoted ? 'fill-current' : ''}`} 
        />
        <span className={currentSize.count}>
          {voteCount}
        </span>
      </button>
      
      {/* Trending Badge */}
      {stats.trending && (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
          <TrendingUp className="w-3 h-3" />
          Trending
        </div>
      )}
    </div>
  );
}
