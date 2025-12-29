'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Reply, 
  Trash2, 
  Flag,
  User,
  Shield
} from 'lucide-react';

export default function CommentsSection({ 
  aspiration, 
  currentUser, 
  isAdmin = false,
  db, 
  appId 
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments from localStorage (demo - can migrate to Firestore)
  useEffect(() => {
    const storageKey = `comments_${aspiration.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setComments(JSON.parse(saved));
    }
  }, [aspiration.id]);

  const saveComments = (newComments) => {
    const storageKey = `comments_${aspiration.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newComments));
    setComments(newComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      alert('Comment tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);

    try {
      const comment = {
        id: Date.now(),
        content: newComment,
        authorName: currentUser?.displayName || 'Anonymous',
        authorEmail: currentUser?.email || null,
        isAdmin: isAdmin,
        createdAt: new Date().toISOString(),
        parentId: replyingTo,
        isModerated: false,
        reports: 0
      };

      // Add to comments
      saveComments([...comments, comment]);
      
      // Reset form
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Comment error:', error);
      alert('Gagal mengirim comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (confirm('Hapus comment ini?')) {
      // Also delete all replies
      const updated = comments.filter(c => 
        c.id !== commentId && c.parentId !== commentId
      );
      saveComments(updated);
    }
  };

  const handleReportComment = (commentId) => {
    if (confirm('Laporkan comment ini sebagai tidak pantas?')) {
      const updated = comments.map(c =>
        c.id === commentId 
          ? { ...c, reports: (c.reports || 0) + 1 }
          : c
      );
      saveComments(updated);
      alert('Comment telah dilaporkan ke moderator');
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Organize comments into threads
  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  const CommentCard = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {comment.isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {comment.authorName}
                </span>
                {comment.isAdmin && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isReply && (
              <button
                onClick={() => handleReply(comment.id)}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4 text-blue-600" />
              </button>
            )}
            {(isAdmin || comment.authorEmail === currentUser?.email) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
            {!isAdmin && comment.authorEmail !== currentUser?.email && (
              <button
                onClick={() => handleReportComment(comment.id)}
                className="p-1 hover:bg-yellow-100 rounded transition-colors"
                title="Report"
              >
                <Flag className="w-4 h-4 text-yellow-600" />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-700 whitespace-pre-wrap">
          {comment.content}
        </p>

        {comment.reports > 0 && isAdmin && (
          <div className="mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded flex items-center gap-1">
            <Flag className="w-3 h-3" />
            {comment.reports} laporan
          </div>
        )}
      </div>

      {/* Replies */}
      {getReplies(comment.id).map(reply => (
        <CommentCard key={reply.id} comment={reply} isReply={true} />
      ))}

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-8 mt-2">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <div className="text-xs text-blue-700 font-bold mb-2">
              Membalas {comment.authorName}
            </div>
            <textarea
              valu e={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis balasan..."
              rows={3}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={isSubmitting}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white 
                         text-xs font-bold rounded-lg transition-all flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Kirim
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 
                         text-xs font-bold rounded-lg transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h4 className="font-black text-slate-900">
          Diskusi ({comments.length})
        </h4>
      </div>

      {/* New Comment Form (top-level only) */}
      {!replyingTo && (
        <div className="glass-card p-4 rounded-xl">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar Anda..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-slate-500">
              Komentar Anda akan terlihat publik
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                       font-bold rounded-lg transition-all flex items-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Kirim Komentar
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevelComments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
