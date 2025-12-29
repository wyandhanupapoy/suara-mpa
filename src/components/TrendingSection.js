'use client';

import React from 'react';
import { TrendingUp, ThumbsUp, Flame } from 'lucide-react';
import { getTrendingAspirations, sortByVotes } from '@/lib/votingUtils';
import VoteButton from './VoteButton';

export default function TrendingSection({ aspirations, onVoteChange, db, appId }) {
  const trendingAspirations = getTrendingAspirations(aspirations, 5);

  if (trendingAspirations.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 border-orange-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">🔥 Trending Now</h3>
          <p className="text-xs text-slate-500">Aspirasi paling populer minggu ini</p>
        </div>
      </div>

      <div className="space-y-3">
        {trendingAspirations.map((aspiration, index) => (
          <div
            key={aspiration.id}
            className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:border-orange-300 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 line-clamp-2 mb-1">
                {aspiration.title}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 bg-white rounded-full border border-orange-200">
                  {aspiration.category}
                </span>
                <span>#{aspiration.tracking_code}</span>
              </div>
            </div>

            <VoteButton
              aspiration={aspiration}
              onVoteChange={onVoteChange}
              db={db}
              appId={appId}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
